import session from 'express-session';
import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import {
  AlbumDeezerBasic,
  AlbumDeezerBasicSchema,
  AnyDeezerEntityBasic,
  ArtistaDeezerBasic,
  ArtistaDeezerBasicSchema,
  BranoDeezerBasic,
  BranoDeezerBasicSchema,
  GenereDeezerBasic,
  GenereDeezerBasicSchema,
  GenereDeezerSemplificato,
  GenereDeezerSemplificatoSchema,
  GenericDeezerEntityBasic,
  GenericDeezerEntityBasicSchema
} from './deezer_types';
import {
  AlbumDb,
  ArtistaDb,
  GenereDb,
  BranoDb,
  DbEntity,
  Durata,
  AssocBranoArtistaDb,
  AssocAlbumGenereDb,
  DbEntitySchema
} from './db_types';
import {
  DeezerEntityAPIConfig,
  DeezerEntityAPIsConfig,
  DeezerEntityTableName
} from './types';
import z, { ZodIntersection, ZodObject } from 'zod';
import dotenv from "dotenv";
import { isValidDeezerObject, makeDeezerApiCall, uploadPhoto } from './functions';
import { upsertEntitaDeezer } from './upserts';

// Extend express-session to include user property
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      first_name: string;
      surname: string;
      email: string;
    };
  }
}

import { dbTablesAndColumns } from "./get_db_tables_and_columns";

// Decidi quale file .env usare in base a NODE_ENV
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: envFile });

const dbConfig = {
  host: process.env.HOST || "localhost",
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "5vhpS8!2xxS88s4rbT8m7j",
  database: process.env.DATABASE || "mixto",
  dateStrings: true
};


export async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

//FUNZIONI DELLE CHIAMATE API ESPORTATE

// ====== LOGIN ======
export async function postLogin(req: import("express").Request, res: import("express").Response) {
  const { username, password } = req.body;
  try {
    const con = await getConnection();
    const [rows] = await con.execute(
      "SELECT * FROM Utente WHERE username = ?",
      [username]
    );
    const utenti = rows as any[];
    await con.end();
    if (utenti.length === 0) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }
    const user = utenti[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }
    req.session.user = {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      surname: user.surname,
      email: user.email,
    };
    res.json({ message: "Login effettuato", user: req.session.user });
  } catch (err) {
    res.status(500).json({ error: "Errore durante il login" });
  }
}

//DA QUI IN GIU, LE FUNZIONI GIA ADATTATE A TYPESCRIPT

export async function deleteEntity(req: import("express").Request, res: import("express").Response, tableName: string) {
  const id = req.params.id;
  const con = await getConnection();
  try {
    await con.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    await con.end();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Errore nell'eliminazione dell'entità" });
  }
}

function relationIsManyToOne(table1: string, table2: string): boolean {
  const columns = dbTablesAndColumns[table1];
  if (columns === undefined) {
    return false;
  }
  for (const column of columns) {
    if (column.startsWith(`id_${table2}`)) {
      return true;
    }
  }
  return false;
}

function relationIsOneToMany(table1: string, table2: string): boolean {
  const columns = dbTablesAndColumns[table2];
  if (columns === undefined) {
    return false;
  }
  for (const column of columns) {
    if (column.startsWith(`id_${table1}`)) {
      return true;
    }
  }
  return false;
}

function relationIsManyToMany(table1: string, table2: string): boolean {
  return `${table1}_${table2}` in dbTablesAndColumns || `${table2}_${table1}` in dbTablesAndColumns;
}

function dbResultIsValid(res: import("express").Response, array: boolean, entity: any, schema: ZodObject<any>, tableName: string): boolean {
  if (!array) {
    if (!schema.safeParse(entity).success) {
      //Passaggio necessario perchè i valori null del db sono undefined per gli schemi zod
      res.status(500).json({ error: `Entità associata ${tableName} non valida`, details: schema.safeParse(entity).error });
      return false;
    }
  } else {
    let index = 0;
    for (const singleObj of entity) {
      //Passaggio necessario perchè i valori null del db sono undefined per gli schemi zod
      if (!schema.safeParse(singleObj).success) {
        res.status(500).json({ error: `Entità associata ${tableName} non valida alla posizione ${index}`, details: schema.safeParse(singleObj).error });
        return false;
      }
      index++;
    }
  }
  return true;
}


//TODO: testare questa funzione per capire se funziona
export async function getEntityWithAssociations(
  req: import("express").Request,
  res: import("express").Response,

  config: {
    mainTableName: string,
    mainTableColumns: string[],
    mainTableSchema: ZodObject<any>,
    otherTables: {
      tableName: string,
      columns: string[],
      schema: ZodObject<any>
    }[]
  }
) {
  const id = req.params.id;
  const con = await getConnection();
  try {
    //ESEGUI LA QUERY DI SELECT SULLA TABELLA PRINCIPALE
    const mainTableCols = config.mainTableColumns.map(col => `${config.mainTableName}.${col}`).join(", ");
    const [mainRows] = await con.execute(
      `SELECT ${mainTableCols} FROM ${config.mainTableName} WHERE ${config.mainTableName}.id = ?`,
      [id]
    );
    const mainEntity = (mainRows as any[])[0];
    if (!dbResultIsValid(res, false, mainEntity, config.mainTableSchema, config.mainTableName)) {
      console.log("Questa entità non ha passato la validazione di zod:");
      console.log(mainEntity);
      return;
    }
    //PER OGNI TABELLA ASSOCIATA, ESEGUI LA QUERY DI SELECT
    for (const assoc of config.otherTables) {
      if (`include_${assoc.tableName}` in req.query) {
        //in base al nome della tabella, cerca di capire il tipo di relazione leggendo dbTablesAndColumns
        if (relationIsManyToMany(config.mainTableName, assoc.tableName)) {
          //RELAZIONE MOLTI A MOLTI
          const tableCols = assoc.columns.map(col => `${assoc.tableName}.${col}`).join(", ");
          const middleTableName = `${config.mainTableName}_${assoc.tableName}` in dbTablesAndColumns ? `${config.mainTableName}_${assoc.tableName}` : `${assoc.tableName}_${config.mainTableName}`;
          const [rows] = await con.execute(
            `SELECT ${tableCols}
          FROM ${assoc.tableName}
          JOIN ${middleTableName} ON ${assoc.tableName}.id = ${middleTableName}.id_${assoc.tableName}
          WHERE ${middleTableName}.id_${config.mainTableName} = ?`,
            [id]
          );
          if (!dbResultIsValid(res, true, rows, assoc.schema, assoc.tableName)) {
            console.log("Questa entità non ha passato la validazione di zod:");
            console.log(rows);
            return;
          }
          mainEntity[assoc.tableName] = rows;
        } else if (relationIsManyToOne(config.mainTableName, assoc.tableName)) {
          const columns = dbTablesAndColumns[config.mainTableName];
          if (columns !== undefined) {
            for (const column of columns) {
              if (column.startsWith(`id_${assoc.tableName}`)) {
                const [rows] = await con.execute(
                  `SELECT ${assoc.columns.map(col => `${assoc.tableName}.${col}`).join(", ")}
                FROM ${assoc.tableName}
                WHERE ${assoc.tableName}.id = ?`,
                  [mainEntity[column]]
                );
                const row = (rows as any[])[0];
                if (!dbResultIsValid(res, false, row, assoc.schema, assoc.tableName)) {
                  console.log("Questa entità non ha passato la validazione di zod:");
                  console.log(row);
                  return;
                }
                mainEntity[assoc.tableName + column.substring((`id_${assoc.tableName}`).length)] = row;
              }
            }
          } else {
            res.status(500).json({ error: `Manca la tabella ${config.mainTableName} nel db!` });
          }
        } else if (relationIsOneToMany(config.mainTableName, assoc.tableName)) {
          const columns = dbTablesAndColumns[assoc.tableName];
          if (columns !== undefined) {
            for (const column of columns) {
              if (column.startsWith(`id_${config.mainTableName}`)) {
                const [rows] = await con.execute(
                  `SELECT ${assoc.columns.map(col => `${assoc.tableName}.${col}`).join(", ")}
                FROM ${assoc.tableName}
                WHERE ${column} = ?`,
                  [mainEntity.id]
                );
                if (!dbResultIsValid(res, true, rows, assoc.schema, assoc.tableName)) {
                  console.log("Questa entità non ha passato la validazione di zod:");
                  console.log(rows);
                  return;
                }
                mainEntity[assoc.tableName + column.substring((`id_${config.mainTableName}`).length)] = rows;
              }
            }
          } else {
            res.status(500).json({ error: `Manca la tabella ${config.mainTableName} nel db!` });
          }
        } else {
          res.status(500).json({ error: `Non è stato possibile riconoscere il tipo di relazione tra ${config.mainTableName} e ${assoc.tableName}` });
          return;
        }
      }
    }
    res.json(mainEntity);
  } catch (err) {
    console.log("Ecco l'errore !");
    console.log(err);
    res.status(500).json({ error: "Errore in una delle query", details: err });
  } finally {
    await con.end();
  }
}

//TODO: testare questa funzione per capire se funziona
export async function getFilteredEntitiesList(
  req: import("express").Request,
  res: import("express").Response,

  config: {
    mainTableName: string,
    mainTableColumns: string[],
    mainTableSchema: ZodObject<any>,
    filters: {
      table: string,
      column: string,
      value: string | number,
      joinColumnSuffix?: string //se la colonna di join non è id_[table], specificare il suffisso qui
    }[]
  }
) {
  let selectStatement = `SELECT ${config.mainTableColumns.map(col => `${config.mainTableName}.${col}`).join(", ")}\nFROM ${config.mainTableName}\n`;
  let whereStatement = config.filters.length == 0 ? "" : `WHERE ${config.filters.map((filter, i) => `${filter.table}_${i}.${filter.column} = ${filter.value}`).join(" AND ")}`;
  let joins = "";
  for (const [i, filter] of config.filters.entries()) {
    //console.log("Vorrei mettere il JOIN!!");
    if (relationIsManyToMany(config.mainTableName, filter.table)) {
      const middleTableName = `${config.mainTableName}_${filter.table}` in dbTablesAndColumns ? `${config.mainTableName}_${filter.table}` : `${filter.table}_${config.mainTableName}`;
      joins += `JOIN ${middleTableName} AS ${middleTableName}_${i} ON ${config.mainTableName}.id = ${middleTableName}_${i}.id_${config.mainTableName}\n`;
      joins += `JOIN ${filter.table} AS ${filter.table}_${i} ON ${filter.table}_${i}.id = ${middleTableName}_${i}.id_${filter.table}\n`;
      //console.log("Ho messo il JOIN!!");
    } else if (relationIsManyToOne(config.mainTableName, filter.table)) {
      joins += `JOIN ${filter.table} AS ${filter.table}_${i} ON ${filter.table}_${i}.id = ${config.mainTableName}.id_${filter.table}${filter.joinColumnSuffix ? `_${filter.joinColumnSuffix}` : ""}\n`;
      //console.log("Ho messo il JOIN!!");
    } else if (relationIsOneToMany(config.mainTableName, filter.table)) {
      joins += `JOIN ${filter.table} AS ${filter.table}_${i} ON ${filter.table}_${i}.id_${config.mainTableName}${filter.joinColumnSuffix ? `_${filter.joinColumnSuffix}` : ""} = ${config.mainTableName}.id\n`;
      //console.log("Ho messo il JOIN!!");
    }
  }
  const finalQuery = selectStatement + joins + whereStatement;
  const con = await getConnection();
  try {
    const [rows] = await con.execute(finalQuery);
    //PROBLEMA: ogni tanto config.mainTableSchema è undefined
    if (!dbResultIsValid(res, true, rows, config.mainTableSchema, config.mainTableName)) {
      return;
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nella query", details: err });
  } finally {
    await con.end();
  }
}

export async function postEntity(
  req: import("express").Request,
  res: import("express").Response,

  config: {
    mainTableName: string,
    mainTableSchema: ZodObject<any>,
    mainTableNewRowValues: Record<string, string | number>,
    assocTablesAndIds: Record<string, number[]>, //es. { "Genere": [1, 2, 3], "Artista": [4, 5] } per associare l'entità appena creata con i generi 1, 2, 3 e gli artisti 4, 5
  }) {
  try {
    const { mainTableName, mainTableNewRowValues, assocTablesAndIds } = config;
    if ("id" in mainTableNewRowValues) {
      res.status(400).json({ error: "L'inserimento dell'id per l'entità non è consentito" });
      return;
    }
    if (!dbResultIsValid(res, false, { ...mainTableNewRowValues, id: 1 /* Numero qualsiasi*/ }, config.mainTableSchema, mainTableName)) {
      return;
    }
    const con = await getConnection();
    // 1. Inserisci la nuova riga nella tabella principale
    const columns = Object.keys(mainTableNewRowValues).join(", ");
    const placeholders = Object.keys(mainTableNewRowValues).map(() => "?").join(", ");
    const values = Object.values(mainTableNewRowValues);
    const [result] = await con.execute(
      `INSERT INTO ${mainTableName} (${columns}) VALUES (${placeholders})`,
      values
    );
    // 2. Recupera l'id della nuova riga
    const insertId = (result as mysql.ResultSetHeader).insertId;
    // 3. Inserisci le associazioni nelle tabelle di join
    for (const assocTable in assocTablesAndIds) {
      if (assocTablesAndIds[assocTable] !== undefined) {
        const ids = assocTablesAndIds[assocTable];
        // Nome tabella di join (in ordine alfabetico, separato da _)
        const joinTable = mainTableName + "_" + assocTable in dbTablesAndColumns ? mainTableName + "_" + assocTable : assocTable + "_" + mainTableName;
        if (!(joinTable in dbTablesAndColumns)) {
          res.status(500).json({ error: `Tabella di join ${joinTable} non trovata nel database` });
          return;
        }
        // Chiave esterna per la tabella principale e associata
        const mainKey = `id_${mainTableName.toLowerCase()}`;
        const assocKey = `id_${assocTable.toLowerCase()}`;
        for (const assocId of ids) {
          await con.execute(
            `INSERT INTO ${joinTable} (${mainKey}, ${assocKey}) VALUES (?, ?)`,
            [insertId, assocId]
          );
        }
      }
    }
    await con.end();
    // 4. Risposta con id della nuova entità
    res.json({ id: insertId });
  } catch (err) {
    res.status(500).json({ error: "Errore nella creazione dell'entità", details: err });
  }
}

export async function putEntity(
  req: import("express").Request,
  res: import("express").Response,

  config: {
    mainTableName: string,
    mainTableNewRowValues: Record<string, string | number>,
    mainTableSchema: ZodObject<any>,
    deleteOldAssociationsFirst: boolean, //se true, elimina tutte le associazioni vecchie prima di inserire le nuove
    assocTablesAndIds: Record<string, number[]>, //es. { "Genere": [1, 2, 3], "Artista": [4, 5] } per associare l'entità appena creata con i generi 1, 2, 3 e gli artisti 4, 5
  }) {
  try {
    const { mainTableName, mainTableNewRowValues, assocTablesAndIds } = config;
    if ("id" in mainTableNewRowValues) {
      res.status(400).json({ error: "L'aggiornamento dell'id dell'entità non è consentito" });
      return;
    }
    if (!dbResultIsValid(res, false, { ...mainTableNewRowValues, id: 1 /* Numero qualsiasi*/ }, config.mainTableSchema, mainTableName)) {
      return;
    }
    const con = await getConnection();
    // 1. Aggiorna la  riga nella tabella principale
    const values = Object.values(mainTableNewRowValues);
    const columnsAndPlaceholders = Object.keys(mainTableNewRowValues).map(col => `${col} = ?`).join(", ");
    const [result] = await con.execute(
      `UPDATE ${mainTableName} SET ${columnsAndPlaceholders} WHERE id = ?`,
      [...values, mainTableNewRowValues.id]
    );
    if ((result as mysql.ResultSetHeader).affectedRows === 0) {
      res.status(404).json({ error: "Entità non trovata" });
      return;
    }
    // 2. Inserisci le associazioni nelle tabelle di join (eliminando prima le vecchie se richiesto)
    for (const assocTable in assocTablesAndIds) {
      if (assocTablesAndIds[assocTable] !== undefined) {
        const ids = assocTablesAndIds[assocTable];
        // Nome tabella di join (in ordine alfabetico, separato da _)
        const joinTable = mainTableName + "_" + assocTable in dbTablesAndColumns ? mainTableName + "_" + assocTable : assocTable + "_" + mainTableName;
        if (!(joinTable in dbTablesAndColumns)) {
          res.status(500).json({ error: `Tabella di join ${joinTable} non trovata nel database` });
          return;
        }
        if (!config.deleteOldAssociationsFirst) {
          // Elimina tutte le associazioni vecchie
          await con.execute(
            `DELETE FROM ${joinTable} WHERE id_${mainTableName.toLowerCase()} = ?`,
            [mainTableNewRowValues.id]
          );
        }
        // Chiave esterna per la tabella principale e associata
        const mainKey = `id_${mainTableName.toLowerCase()}`;
        const assocKey = `id_${assocTable.toLowerCase()}`;
        for (const assocId of ids) {
          await con.execute(
            `INSERT IGNORE INTO ${joinTable} (${mainKey}, ${assocKey}) VALUES (?, ?)`,
            [req.params.id, assocId]
          );
        }
      }
    }
    await con.end();
    // 4. Risposta con id della nuova entità
    res.status(200).json();
  } catch (err) {
    res.status(500).json({ error: "Errore nella creazione dell'entità", details: err });
  }
}



function fromSecondsToTime(seconds: number): Durata {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` as Durata;
}

// Overloads for type-safe mapping from Deezer entity to DB entity
function fromDeezerEntityToDbEntity(entity: GenericDeezerEntityBasic, tableName: string, param: string): DbEntity {
  switch (tableName) {
    case "Artista":
      return { id: entity.id, nome: (entity as ArtistaDeezerBasic).name } as ArtistaDb;
    case "Album":
      return { id: entity.id, titolo: (entity as AlbumDeezerBasic).title, data_uscita: (entity as AlbumDeezerBasic).release_date !== undefined ? (entity as AlbumDeezerBasic).release_date : null } as AlbumDb;
    case "Genere":
      return { id: entity.id, nome: (entity as GenereDeezerBasic).name } as GenereDb;
    case "Brano":
      const brano = entity as BranoDeezerBasic;
      const album = brano.album;
      if (album !== undefined) {
        return {
          id: brano.id,
          titolo: brano.title,
          durata: fromSecondsToTime(brano.duration),
          id_album: album.id
        } as BranoDb;
      } else {
        return {
          id: brano.id,
          titolo: brano.title,
          durata: fromSecondsToTime(brano.duration),
          id_album: Number(param)
        } as BranoDb;
      }
    default:
      throw new Error("Tabella non supportata");
  }
}

function getPicturesFolder(tableName: DeezerEntityTableName): string {
  switch (tableName) {
    case "Artista":
      return "artisti_pictures";
    case "Album":
      return "album_pictures";
    case "Genere":
      return "generi_pictures";
    case "Brano":
      return ""; //I brani non hanno immagini
    default:
      throw new Error("Tabella non supportata");
  }
}


async function upsertAssociations(tableName: "album_genere" | "brano_artista", associations: AssocAlbumGenereDb[] | AssocBranoArtistaDb[]) {
  //Questa funzione deve eseguire l'upsert di tutte le associazioni passate in associations, sulla tabella album_genere o brano_artista
  //Per ogni associazione, se non esiste, va inserita
  //Se esiste già, non va fatto nulla (non ci sono altri campi da aggiornare)
  if (associations[0] !== undefined) {
    const con = await getConnection();
    await con.beginTransaction();
    try {
      for (let assoc of associations) {
        if (tableName === "album_genere") {
          assoc = assoc as AssocAlbumGenereDb;
          const [rows] = await con.execute(
            `SELECT * FROM ${tableName} WHERE id_album = ? AND id_genere = ?`,
            [assoc.id_album, assoc.id_genere]
          );
          if ((rows as any[]).length === 0) {
            await con.execute(
              `INSERT INTO ${tableName} (id_album, id_genere) VALUES (?, ?)`,
              [assoc.id_album, assoc.id_genere]
            );
          }
        } else if (tableName === "brano_artista") {
          assoc = assoc as AssocBranoArtistaDb;
          const [rows] = await con.execute(
            `SELECT * FROM ${tableName} WHERE id_brano = ? AND id_artista = ?`,
            [assoc.id_brano, assoc.id_artista]
          );
          if ((rows as any[]).length === 0) {
            await con.execute(
              `INSERT INTO ${tableName} (id_brano, id_artista) VALUES (?, ?)`,
              [assoc.id_brano, assoc.id_artista]
            );
          }
        }
      }
      await con.commit();
    } catch (error) {
      await con.rollback();
      throw error;
    } finally {
      await con.end();
    }
  }
}
async function deleteOldAssociations(tableName: "album_genere" | "brano_artista", associations: AssocAlbumGenereDb[] | AssocBranoArtistaDb[]) {
  //Se tableName è album_genere:
  //Per ogni association dentro associations, la funzione deve eliminare tutte le righe della tabella album_genere dove id_album è uguale a association.id_album
  //Se tableName è brano_artista:
  //Per ogni association dentro associations, la funzione deve eliminare tutte le righe della tabella brano_artista dove id_brano è uguale a association.id_brano
  if (associations[0] !== undefined) {
    const con = await getConnection();
    await con.beginTransaction();
    try {
      for (let assoc of associations) {
        if (tableName === "album_genere") {
          assoc = assoc as AssocAlbumGenereDb;
          await con.execute(
            `DELETE FROM ${tableName} WHERE id_album = ?`,
            [assoc.id_album]
          );
        } else if (tableName === "brano_artista") {
          assoc = assoc as AssocBranoArtistaDb;
          await con.execute(
            `DELETE FROM ${tableName} WHERE id_brano = ?`,
            [assoc.id_brano]
          );
        }
      }
      await con.commit();
    } catch (error) {
      await con.rollback();
      throw error;
    } finally {
      await con.end();
    }
  }
}

//FUNZIONE GIA ADATTATA A TYPESCRIPT
export async function deezerEntityApi(
  req: import("express").Request,
  res: import("express").Response,
  apisConfig: DeezerEntityAPIConfig
) {
  const paramName = apisConfig.paramName; //nome del parametro di ricerca
  //CONTROLLO CHE I PARAMETRI query, limit e index SIANO STATI PASSATI E SIANO VALIDI
  const param = typeof req.query[paramName] === "string" ? req.query[paramName] : undefined;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const index = typeof req.query.index === "string" ? Number(req.query.index) : undefined;
  if (!param || limit === undefined || index === undefined || isNaN(limit) || isNaN(index)) {
    return res.status(400).json({ error: 'Parametri "' + paramName + '", "limit" e "index" obbligatori e devono essere validi' });
  }
  try {
    //FAI LA CHIAMATA API A DEEZER E OTTIENI LA RISPOSTA
    const response = await apisConfig.deezerAPICallback(res, param, limit.toString(), index.toString());
    if (response === -1) {
      return; //Errore già gestito in makeDeezerApiCall
    }
    //PER OGNI OGGETTO RESTITUITO DA DEEZER, VALIDAZIONE, UPSERT SUL DB E CARICAMENTO FOTO (SE PREVISTO)
    for (const entityConfig of apisConfig.entities) {
      const entityObjects: GenericDeezerEntityBasic[] = entityConfig.getEntityObjectsFromResponse(response);
      const con = await getConnection();
      for (const obj of entityObjects) {
        if (!isValidDeezerObject(res, obj, entityConfig.deezerEntitySchema)) {
          return;
        }
        await upsertEntitaDeezer(con, fromDeezerEntityToDbEntity(obj, entityConfig.tableName, param), entityConfig.tableName);
        await uploadPhoto(getPicturesFolder(entityConfig.tableName), obj);
      }
      await con.end();
    }
    //E ORA OCCUPATI DELLE ASSOCIAZIONI (SE PREVISTE)
    if (apisConfig.association) {
      const associations = apisConfig.association.getAssociationsFromResponse(response);
      if (apisConfig.association.deleteOldAssociations) {
        await deleteOldAssociations(apisConfig.association.tableName, associations);
      }
      await upsertAssociations(apisConfig.association.tableName, associations);
    }
    for (const entityConfig of apisConfig.entities) {
      if (entityConfig.showEntityInResponse) {
        const mainEntityObjects: GenericDeezerEntityBasic[] = entityConfig.getEntityObjectsFromResponse(response);
        res.json(mainEntityObjects.map((obj) => { return fromDeezerEntityToDbEntity(obj, entityConfig.tableName, param) }));
        break;
      }
    }
  } catch (err) {
    res.status(500).json({ error: "Errore su questa Api legata a Deezer" });
  }
}


