import session from 'express-session';
import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import mysql, { Query } from "mysql2/promise";
import {
  AlbumDeezerBasic,
  ArtistaDeezerBasic,
  BranoDeezerBasic,
  GenereDeezerBasic,
  GenericDeezerEntityBasic,
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
  DbEntitySchema,
  UtenteDb
} from './db_types';
import {
  DeezerEntityAPIConfig,
  DeezerEntityAPIsConfig,
  DeezerEntityTableName
} from './types';
import z, { ZodIntersection, ZodObject } from 'zod';
import { isValidDeezerObject, makeDeezerApiCall } from './functions';
import { upsertEntitaDeezer } from './upserts';
import { dbTablesAndColumns } from "./get_db_tables_and_columns";
import logger from './logger';

// Extend express-session to include user property
declare module 'express-session' {
  interface SessionData {
    user: UtenteDb | undefined;
  }
}

// Decidi quale file .env usare in base a NODE_ENV

const dbConfig = {
  host: process.env.HOST || "localhost",
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "5vhpS8!2xxS88s4rbT8m7j",
  database: process.env.DATABASE || "mixto",
  dateStrings: true
};


export async function getConnection() {
  console.log("Connecting to database...");
  console.log(dbConfig);
  return await mysql.createConnection(dbConfig);
}

export async function logout(req: import("express").Request, res: import("express").Response) {
  if (req.session.user) {
    req.session.user = undefined;
    res.status(200).json({});
  } else {
    res.status(400).json({ error: "Sessione non trovata" });
  }
}

// ====== LOGIN ======
export async function postLogin(req: import("express").Request, res: import("express").Response) {
  const { username, password } = req.body;
  try {
    const con = await getConnection();
    const [rows] = await con.execute(
      "SELECT * FROM Utente WHERE username = ?",
      [username]
    );
    const utenti = rows as UtenteDb[];
    await con.end();
    if (utenti[0] === undefined) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }
    const user = utenti[0];
    const match = await bcrypt.compare(password, user.password as string /* Qui lo posso fare perchè, se l'utente proviene da questa query, la password c'è sicuramente*/);
    if (!match) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }
    req.session.user = {
      id: user.id,
      username: user.username,
      nome: user.nome,
      cognome: user.cognome,
      password: ""
    };
    res.json(req.session.user);
  } catch (err) {
    logger.error('Login error', {
      username,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    res.status(500).json({ error: "Errore durante il login" });
  }
}

async function blockUnauthorizedUser(req: import("express").Request, res: import("express").Response, tableName: string, newRowValues?: Record<string, string | number>): Promise<boolean> {
  if (req.session.user === undefined) {
    res.status(401).json({ error: "Utente non loggato" });
    return true;
  }
  if (newRowValues) {
    for (const col in newRowValues) {
      if (col.startsWith("id_utente") && newRowValues[col] !== req.session.user.id) {
        res.status(400).json({ error: "Operazione non permessa su entità di altri utenti" });
        return true;
      }
    }
  }
  const con = await getConnection();
  if (req.params.id !== undefined /* Undefined per POST*/) {
    try {
      const [rows] = await con.execute(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [req.params.id]
      );
      const entities = rows as any[];
      if (entities.length === 0) {
        res.status(404).json({ error: "Entità non trovata" });
        await con.end();
        return true;
      } else {
        const entity = entities[0];
        for (const col in entity) {
          if (col.startsWith("id_utente") && entity[col] !== req.session.user.id) {
            res.status(400).json({ error: "Operazione non permessa su entità di altri utenti" });
            await con.end();
            return true;
          }
        }
      }
      await con.end();
    } catch (err) {
      logger.error('Database error during entity retrieval', {
        tableName,
        entityId: req.params.id,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      res.status(500).json({ error: "Errore durante il recupero dell'entità" });
      return true;
    }
  }
  return false;
}

export async function deleteEntity(req: import("express").Request, res: import("express").Response, tableName: string) {
  const id = req.params.id;
  const con = await getConnection();
  if (await blockUnauthorizedUser(req, res, tableName, undefined)) {
    //Risposta già inviata dalla funzione, non serve inviarla qui
    return;
  }
  try {
    await con.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    await con.end();
    res.sendStatus(204);
  } catch (err) {
    logger.error('Entity deletion error', {
      tableName,
      entityId: id,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    res.status(500).json({ error: "Errore nell'eliminazione dell'entità" });
  }
}

function relationIsManyToOne(table1: string, table2: string): boolean {
  const columns = dbTablesAndColumns[table1];
  if (columns === undefined) {
    return false;
  }
  for (const column of columns) {
    if (!table2.includes("_")) {
      //La tabella è una tabella di entità normale
      if (column.startsWith(`id_${table2}`)) {
        return true;
      }
    } else {
      //La tabella è usata per formare relazioni molti a molti
      const parts = table2.split("_");
      if (parts.length === 2 && (column.startsWith(`id_${parts[0]}`) || column.startsWith(`id_${parts[1]}`))) {
        return true;
      }
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
    if (!table1.includes("_")) {
      //La tabella è una tabella di entità normale
      if (column.startsWith(`id_${table1}`)) {
        return true;
      }
    } else {
      //La tabella è usata per formare relazioni molti a molti
      const parts = table1.split("_");
      if (parts.length === 2 && (column.startsWith(`id_${parts[0]}`) || column.startsWith(`id_${parts[1]}`))) {
        return true;
      }
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
    if ((mainRows as any[]).length === 0) {
      res.status(404).json({ error: `Entità ${config.mainTableName} con id ${id} non trovata` });
      return;
    }
    const mainEntity = (mainRows as any[])[0];
    if (!dbResultIsValid(res, false, mainEntity, config.mainTableSchema, config.mainTableName)) {
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
    logger.error('Database query error in getEntityWithAssociations', {
      mainTableName: config.mainTableName,
      entityId: req.params.id,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    res.status(500).json({ error: "Errore in una delle query" });
  } finally {
    await con.end();
  }
}


type QueryJoin = {
  joinedTableName: string,
  joinColumnSuffix?: string //se la colonna di join non è id_[table], specificare il suffisso qui (join con la colonna id_[table]_[suffix])
  columns: string[],
  schema: ZodObject<any> | undefined
}

type QueryFilter = {
  joinedTableName: string | undefined, //Se undefined, il filtro è applicato alla tabella principale
  joinColumnSuffix?: string //se la colonna di join non è id_[table], specificare il suffisso qui (join con la colonna id_[table]_[suffix])
  joinedTableColumnToCheckValueIn: string, //è la colonna della tabella joinata (o della tabella principale se joinedTableName è undefined) su cui applicare il filtro
  operator?: "LIKE" | "=" | "IN" | "IS",
  value: string | number
}

function getSqlOperatorString(operator?: "LIKE" | "=" | "IN" | "IS"): string {
  switch (operator) {
    case "LIKE":
      return "LIKE";
    case "=":
      return "=";
    case "IN":
      return "IN";
    case "IS":
      return "IS";
    default:
      return "=";
  }
}

export async function getFilteredEntitiesList(
  req: import("express").Request,
  res: import("express").Response,

  config: {
    mainTableName: string,
    mainTableColumns: string[],
    selectCustomColumns?: string[], //es. ["COUNT(*) AS total_count"]
    customGroupBys?: string[], //es. ["column1", "column2"]
    mainTableSchema: ZodObject<any> | undefined,
    filtersAndJoins: (QueryFilter | QueryJoin)[]
    orderBys?: string[] //es. ["column1 ASC", "column2 DESC"]
  }
) {
  let mainTableColumns: string[] = config.mainTableColumns.map(col => `${config.mainTableName}.${col}`);
  let selectCustomColumns: string[] = config.selectCustomColumns ? config.selectCustomColumns : [];
  let jsonArrayAggColumns: string[] = [];
  for (const [i, queryJoin] of config.filtersAndJoins.entries()) {
    if (!("value" in queryJoin)) {
      //Se non è un filtro, allora metti la tabella nel risultato della query
      jsonArrayAggColumns.push(`JSON_ARRAYAGG(JSON_OBJECT(${queryJoin.columns.map(col => `'${col}', ${queryJoin.joinedTableName}_${i}.${col}`).join(", ")})) AS ${queryJoin.joinedTableName}${queryJoin.joinColumnSuffix ? `_${queryJoin.joinColumnSuffix}` : ""}_array`);
    }
  }
  let allColumns = selectCustomColumns.concat(mainTableColumns, jsonArrayAggColumns).join(", ");
  let selectStatement = `SELECT ${allColumns}\nFROM ${config.mainTableName}\n`;
  let queryFilters = config.filtersAndJoins.filter(queryFilter => "value" in queryFilter); //Se è presente la proprietà value, allora è un filtro, altrimenti è un join
  let whereStatement = config.filtersAndJoins.length == 0 ? "" : `WHERE ${queryFilters.map((queryFilter, i) => `${queryFilter.joinedTableName !== undefined ? `${queryFilter.joinedTableName}_${i}` : config.mainTableName}.${queryFilter.joinedTableColumnToCheckValueIn} ${getSqlOperatorString("operator" in queryFilter ? queryFilter.operator : undefined)} ${queryFilter.value}`).join(" AND ")}\n`;
  let allGroupBys = config.customGroupBys ? config.customGroupBys : [config.mainTableName + ".id"];
  let groupByStatement = allGroupBys.length > 0 ? `GROUP BY ${allGroupBys.join(", ")}\n` : "";
  let orderByStatement = config.orderBys && config.orderBys.length > 0 ? `ORDER BY ${config.orderBys.join(", ")}\n` : "";
  //Uso index al posto di offset per allinearmi con le API legate a Deezer
  let limitOffset = `${req.query.limit ? `LIMIT ${req.query.limit}` : ""} ${req.query.index ? `OFFSET ${req.query.index}` : ""}`;
  let joins = "";
  for (const [i, filter] of config.filtersAndJoins.entries()) {
    if (filter.joinedTableName !== undefined) { //Senza la proprietà table, non c'è da fare il join perchè il filtro è sulla tabella principale
      if (relationIsManyToMany(config.mainTableName, filter.joinedTableName)) {
        const middleTableName = `${config.mainTableName}_${filter.joinedTableName}` in dbTablesAndColumns ? `${config.mainTableName}_${filter.joinedTableName}` : `${filter.joinedTableName}_${config.mainTableName}`;
        joins += `LEFT JOIN ${middleTableName} AS ${middleTableName}_${i} ON ${config.mainTableName}.id = ${middleTableName}_${i}.id_${config.mainTableName}\n`;
        joins += `LEFT JOIN ${filter.joinedTableName} AS ${filter.joinedTableName}_${i} ON ${filter.joinedTableName}_${i}.id = ${middleTableName}_${i}.id_${filter.joinedTableName}\n`;
      } else if (relationIsManyToOne(config.mainTableName, filter.joinedTableName)) {
        joins += `LEFT JOIN ${filter.joinedTableName} AS ${filter.joinedTableName}_${i} ON ${filter.joinedTableName}_${i}.id = ${config.mainTableName}.id_${filter.joinedTableName}${filter.joinColumnSuffix ? `_${filter.joinColumnSuffix}` : ""}\n`;
      } else if (relationIsOneToMany(config.mainTableName, filter.joinedTableName)) {
        joins += `LEFT JOIN ${filter.joinedTableName} AS ${filter.joinedTableName}_${i} ON ${filter.joinedTableName}_${i}.id_${config.mainTableName}${filter.joinColumnSuffix ? `_${filter.joinColumnSuffix}` : ""} = ${config.mainTableName}.id\n`;
      }
    }
  }
  const finalQuery = selectStatement + joins + whereStatement + groupByStatement + orderByStatement + limitOffset;
  const con = await getConnection();
  console.log(finalQuery);
  try {
    const [rows] = await con.execute(finalQuery);
    for (let row of (rows as any[])) {
      if (config.mainTableSchema !== undefined && !dbResultIsValid(res, false, row, config.mainTableSchema, config.mainTableName)) {
        return;
      }
      for (const queryJoin of config.filtersAndJoins) {
        if (!("value" in queryJoin)) {
          let keyName = `${queryJoin.joinedTableName}${queryJoin.joinColumnSuffix ? `_${queryJoin.joinColumnSuffix}` : ""}_array`;
          if (keyName in row) {
            if (queryJoin.schema !== undefined && !dbResultIsValid(res, true, row[keyName], queryJoin.schema, keyName)) {
              return;
            }
          }
        }
      }
    }
    res.json(rows);
  } catch (err) {
    logger.error('Database query error in getFilteredEntitiesList', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    res.status(500).json({ error: "Errore nella query" });
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
    bypassBlockUnauthorizedUser?: boolean //se true, non viene chiamata la funzione blockUnauthorizedUser (utile per entità che non hanno id_utente, come Genere, Artista, ecc.)
  }) {
  if (!config.bypassBlockUnauthorizedUser && await blockUnauthorizedUser(req, res, config.mainTableName, config.mainTableNewRowValues)) {
    //Risposta già inviata dalla funzione, non serve inviarla qui
    return;
  }
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
    //1.5 Se si verifica l'errore di chiave duplicata, rispondi con 400
    if ((result as mysql.ResultSetHeader).affectedRows === 0) {
      res.status(400).json({ error: "Chiave duplicata" });
      return;
    }
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
    logger.error('Entity creation error', {
      tableName: config.mainTableName,
      newRowValues: config.mainTableNewRowValues,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    res.status(500).json({ error: "Errore nella creazione dell'entità" });
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
  if (await blockUnauthorizedUser(req, res, config.mainTableName, config.mainTableNewRowValues)) {
    //Risposta già inviata dalla funzione, non serve inviarla qui
    return;
  }
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
      [...values, req.params.id]
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
        if (config.deleteOldAssociationsFirst) {
          // Elimina tutte le associazioni vecchie
          await con.execute(
            `DELETE FROM ${joinTable} WHERE id_${mainTableName.toLowerCase()} = ?`,
            [req.params.id]
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
    res.status(200).json();
  } catch (err) {
    logger.error('Entity update error', {
      tableName: config.mainTableName,
      entityId: req.params.id,
      newRowValues: config.mainTableNewRowValues,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    res.status(500).json({ error: "Errore nell'aggiornamento dell'entità" });
  }
}

export async function getBraniEsistentiPreferiti(req: import("express").Request, res: import("express").Response) {
  //Questa API risponde con true se nella tabella del db brano_utente esiste una riga con id utente e id brano uguali a quelli specificati, altrimenti restituisce false
  const id_utente = req.query.utente;
  const id_brano = req.query.brano;
  if (typeof id_utente !== "string" || typeof id_brano !== "string" || isNaN(Number(id_utente)) || isNaN(Number(id_brano))) {
    res.status(401).json({ error: "I parametri utente e brano sono obbligatori e devono essere numerici" });
    return;
  }
  const con = await getConnection();
  try {
    const [rows] = await con.execute(
      `SELECT * FROM brano_utente WHERE id_utente = ? AND id_brano = ?`,
      [id_utente, id_brano]
    );
    await con.end();
    res.json((rows as any[]).length > 0);
  }
  catch (err) {
    logger.error('Error checking favorite tracks', {
      userId: id_utente,
      trackId: id_brano,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    res.status(500).json({ error: "Errore nel recupero dei brani preferiti" });
  }
}



function fromSecondsToTime(seconds: number): Durata {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` as Durata;
}

// Overloads for type-safe mapping from Deezer entity to DB entity
//TODO: modificare
function fromDeezerEntityToDbEntity(entity: GenericDeezerEntityBasic, tableName: string, param: string): DbEntity {
  let pictureUrl: string | null;
  if ("picture_big" in entity || "cover_big" in entity || "picture" in entity) {
    pictureUrl = "picture_big" in entity ? entity.picture_big : "cover_big" in entity ? entity.cover_big : entity.picture;
  } else {
    //Nessuna immagine da caricare
    pictureUrl = null;
  }
  switch (tableName) {
    case "Artista":
      return { id: entity.id, nome: (entity as ArtistaDeezerBasic).name, url_immagine: pictureUrl } as ArtistaDb;
    case "Album":
      return { id: entity.id, titolo: (entity as AlbumDeezerBasic).title, data_uscita: (entity as AlbumDeezerBasic).release_date !== undefined ? (entity as AlbumDeezerBasic).release_date : null, url_immagine: pictureUrl } as AlbumDb;
    case "Genere":
      return { id: entity.id, nome: (entity as GenereDeezerBasic).name, url_immagine: pictureUrl } as GenereDb;
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
              `INSERT IGNORE INTO ${tableName} (id_album, id_genere) VALUES (?, ?)`,
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
              `INSERT IGNORE INTO ${tableName} (id_brano, id_artista) VALUES (?, ?)`,
              [assoc.id_brano, assoc.id_artista]
            );
          }
        }
      }
      await con.commit();
    } catch (error) {
      logger.error('Database transaction error in upsertAssociations', {
        tableName,
        associationsCount: associations.length,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
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
      logger.error('Database transaction error in deleteOldAssociations', {
        tableName,
        associationsCount: associations.length,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      await con.rollback();
      throw error;
    } finally {
      await con.end();
    }
  }
}

async function updateDeezerApiCalls(key: string, value: string): Promise<void> {
  //Usare il database mixto_api_calls e la tabella deezer_api_calls con le colonne url (stringa, chiave primaria) e date (stringa)
  const con = await getConnection();
  const [rows] = await con.execute(
    `SELECT * FROM mixto_api_calls.deezer_api_calls WHERE url = ?`,
    [key]
  );
  if ((rows as any[]).length > 0) {
    await con.execute(
      `UPDATE mixto_api_calls.deezer_api_calls SET date = ? WHERE url = ?`,
      [value, key]
    );
  } else {
    await con.execute(
      `INSERT IGNORE INTO mixto_api_calls.deezer_api_calls (url, date) VALUES (?, ?)`,
      [key, value]
    );
  }
  con.end();
}

async function getDeezerApiCalls(key: string): Promise<string | undefined> {
  const con = await getConnection();
  const [rows] = await con.execute(
    `SELECT date FROM mixto_api_calls.deezer_api_calls WHERE url = ?`,
    [key]
  );
  con.end();
  return (rows as any[]).length > 0 ? (rows as any[])[0].date : undefined;
}

//FUNZIONE GIA ADATTATA A TYPESCRIPT
export async function deezerEntityApi(
  req: import("express").Request,
  res: import("express").Response,
  apisConfig: DeezerEntityAPIConfig
) {
  if (process.env.NODE_ENV !== "test" && apisConfig.maxOneCallPerDay === true && await getDeezerApiCalls(req.originalUrl) == new Date().toISOString().split('T')[0] as string) {
    res.status(200).json({ error: "API già chiamata oggi. Il risultato di questa richiesta è già stato memorizzato. Potrà essere aggiornato domani" });
    return;
  }
  const paramName = apisConfig.paramName; //nome del parametro di ricerca
  //CONTROLLO CHE I PARAMETRI query, limit e index SIANO STATI PASSATI E SIANO VALIDI
  const param = typeof req.query[paramName] === "string" ? req.query[paramName] : undefined;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const index = typeof req.query.index === "string" ? Number(req.query.index) : undefined;
  if (!param || (apisConfig.pagination !== false && (limit === undefined || index === undefined || isNaN(limit) || isNaN(index)))) {
    return res.status(400).json({ error: 'Parametri "' + paramName + '", "limit" e "index" obbligatori e devono essere validi' });
  }
  try {
    //FAI LA CHIAMATA API A DEEZER E OTTIENI LA RISPOSTA
    const response = await apisConfig.deezerAPICallback(res, param, limit, index);
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
        if (process.env.NODE_ENV !== "test" && apisConfig.maxOneCallPerDay === true) {
          //Questa API non è ancora stata chiamata oggi, quindi aggiorna il file
          await updateDeezerApiCalls(req.originalUrl, new Date().toISOString().split('T')[0] as string);
        }
        break;
      }
    }
  } catch (err) {
    logger.error('Deezer API integration error', {
      apiConfig: apisConfig,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    res.status(500).json({ error: "Errore su questa Api legata a Deezer" });
  }
}


