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
  GenereDeezerBasic, 
  GenereDeezerBasicSchema, 
  GenericDeezerEntityBasic, 
  GenericDeezerEntityBasicSchema 
} from './deezer_types';
import { 
  AlbumDb, 
  ArtistaDb, 
  GenereDb, 
  DbEntity 
} from './db_types';
import { 
  DeezerEntityAPIConfig, 
  DeezerEntityAPIsConfig 
} from './types';
import { ZodIntersection, ZodObject } from 'zod';
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

// Decidi quale file .env usare in base a NODE_ENV
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: envFile });

const dbConfig = {
  host: process.env.HOST || "localhost",
  user: process.env.USER || "root",
  password: process.env.PASSWORD || "5vhpS8!2xxS88s4rbT8m7j",
  database: process.env.DATABASE || "mixto",
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

// ====== CRUD UTENTE ======
export async function getUtenti(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  const [rows] = await con.execute("SELECT * FROM Utente");
  await con.end();
  res.json(rows);
}

export async function getUtente(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  const [rows] = await con.execute("SELECT * FROM Utente WHERE id = ?", [
    req.params.id,
  ]);
  await con.end();
  const utenti = rows as any[];
  res.json(utenti[0]);
}

export async function postUtente(req: import("express").Request, res: import("express").Response) {
  const { username, first_name, surname, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const con = await getConnection();
    const [result] = await con.execute(
      "INSERT INTO Utente (username, first_name, surname, password) VALUES (?, ?, ?, ?)",
      [username, first_name, surname, hashedPassword]
    );
    await con.end();
    res.json({ id: (result as mysql.ResultSetHeader).insertId });
  } catch (err) {
    res.status(500).json({ error: "Errore nella creazione utente" });
  }
}

export async function putUtente(req: import("express").Request, res: import("express").Response) {
  const { username, first_name, surname, password } = req.body;
  const con = await getConnection();
  await con.execute(
    "UPDATE Utente SET username=?, first_name=?, surname=?, password=? WHERE id=?",
    [username, first_name, surname, password, req.params.id]
  );
  await con.end();
  res.sendStatus(204);
}

export async function deleteUtente(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  await con.execute("DELETE FROM Utente WHERE id=?", [req.params.id]);
  await con.end();
  res.sendStatus(204);
}

// ====== CRUD PASSAGGIO ======
export async function getPassaggi(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  const [rows] = await con.execute("SELECT * FROM Passaggio");
  await con.end();
  res.json(rows);
}

export async function getPassaggio(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  const [rows] = await con.execute("SELECT * FROM Passaggio WHERE id = ?", [
    req.params.id,
  ]);
  await con.end();
  res.json((rows as any[])[0]);
}

export async function postPassaggio(req: import("express").Request, res: import("express").Response) {
  const { testo, inizio, fine, id_utente, id_brano_1, id_brano_2 } = req.body;
  const con = await getConnection();
  const [result] = await con.execute(
    "INSERT INTO Passaggio (testo, inizio, fine, id_utente, id_brano_1, id_brano_2) VALUES (?, ?, ?, ?, ?, ?)",
    [testo, inizio, fine, id_utente, id_brano_1, id_brano_2]
  );
  await con.end();
  res.json({ id: (result as mysql.ResultSetHeader).insertId });
}

export async function putPassaggio(req: import("express").Request, res: import("express").Response) {
  const { testo, inizio, fine, id_utente, id_brano_1, id_brano_2 } = req.body;
  const con = await getConnection();
  await con.execute(
    "UPDATE Passaggio SET testo=?, inizio=?, fine=?, id_utente=?, id_brano_1=?, id_brano_2=? WHERE id=?",
    [testo, inizio, fine, id_utente, id_brano_1, id_brano_2, req.params.id]
  );
  await con.end();
  res.sendStatus(204);
}

export async function deletePassaggio(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  await con.execute("DELETE FROM Passaggio WHERE id=?", [req.params.id]);
  await con.end();
  res.sendStatus(204);
}

// ====== CRUD COMMENTO ======
export async function getCommenti(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  const [rows] = await con.execute("SELECT * FROM Commento");
  await con.end();
  res.json(rows);
}

export async function getCommento(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  const [rows] = await con.execute("SELECT * FROM Commento WHERE id = ?", [
    req.params.id,
  ]);
  await con.end();
  res.json(((rows as any[]))[0]);
}

export async function postCommento(req: import("express").Request, res: import("express").Response) {
  const { testo, id_utente, id_passaggio, id_commento_padre } = req.body;
  const con = await getConnection();
  const [result] = await con.execute(
    "INSERT INTO Commento (testo, id_utente, id_passaggio, id_commento_padre) VALUES (?, ?, ?, ?)",
    [testo, id_utente, id_passaggio, id_commento_padre]
  );
  await con.end();
  res.json({ id: (result as mysql.ResultSetHeader).insertId });
}

export async function putCommento(req: import("express").Request, res: import("express").Response) {
  const { testo, id_utente, id_passaggio, id_commento_padre } = req.body;
  const con = await getConnection();
  await con.execute(
    "UPDATE Commento SET testo=?, id_utente=?, id_passaggio=?, id_commento_padre=? WHERE id=?",
    [testo, id_utente, id_passaggio, id_commento_padre, req.params.id]
  );
  await con.end();
  res.sendStatus(204);
}

export async function deleteCommento(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  await con.execute("DELETE FROM Commento WHERE id=?", [req.params.id]);
  await con.end();
  res.sendStatus(204);
}

// ====== CRUD VALUTAZIONE ======
export async function getValutazioni(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  const [rows] = await con.execute("SELECT * FROM Valutazione");
  await con.end();
  res.json(rows);
}

export async function getValutazione(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  const [rows] = await con.execute("SELECT * FROM Valutazione WHERE id = ?", [
    req.params.id,
  ]);
  await con.end();
  res.json(((rows as any[]))[0]);
}

export async function postValutazione(req: import("express").Request, res: import("express").Response) {
  const { voto, id_utente, id_passaggio } = req.body;
  const con = await getConnection();
  const [result] = await con.execute(
    "INSERT INTO Valutazione (voto, id_utente, id_passaggio) VALUES (?, ?, ?)",
    [voto, id_utente, id_passaggio]
  );
  await con.end();
  res.json({ id: (result as mysql.ResultSetHeader).insertId });
}

export async function putValutazione(req: import("express").Request, res: import("express").Response) {
  const { voto, id_utente, id_passaggio } = req.body;
  const con = await getConnection();
  await con.execute(
    "UPDATE Valutazione SET voto=?, id_utente=?, id_passaggio=? WHERE id=?",
    [voto, id_utente, id_passaggio, req.params.id]
  );
  await con.end();
  res.sendStatus(204);
}

export async function deleteValutazione(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  await con.execute("DELETE FROM Valutazione WHERE id=?", [req.params.id]);
  await con.end();
  res.sendStatus(204);
}

// ====== CREATE VISUALIZZAZIONE ======
export async function postVisualizzazione(req: import("express").Request, res: import("express").Response) {
  const { id_utente, id_passaggio } = req.body;
  const con = await getConnection();
  const [result] = await con.execute(
    "INSERT INTO Visualizzazione (id_utente, id_passaggio) VALUES (?, ?)",
    [id_utente, id_passaggio]
  );
  await con.end();
  res.json({ id: (result as mysql.ResultSetHeader).insertId });
}

function getPagination(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  return { pageSize, offset };
}

// ====== PASSAGGI CORRELATI ======
export async function getBranoPassaggi(req: import("express").Request, res: import("express").Response) {
  if (typeof req.query.page !== "string" || typeof req.query.pageSize !== "string" || isNaN(parseInt(req.query.page)) || isNaN(parseInt(req.query.pageSize))) {
    return res.status(400).json({ error: "Parametri di paginazione non validi" });
  }
  const { pageSize, offset } = getPagination(parseInt(req.query.page), parseInt(req.query.pageSize));
  const con = await getConnection();
  const [rows] = await con.execute(
    "SELECT * FROM Passaggio WHERE id_brano_1 = ? OR id_brano_2 = ? LIMIT ? OFFSET ?",
    [req.params.id, req.params.id, pageSize, offset]
  );
  await con.end();
  res.json(rows);
}

export async function getAlbumPassaggi(req: import("express").Request, res: import("express").Response) {
  if (typeof req.query.page !== "string" || typeof req.query.pageSize !== "string" || isNaN(parseInt(req.query.page)) || isNaN(parseInt(req.query.pageSize))) {
    return res.status(400).json({ error: "Parametri di paginazione non validi" });
  }
  const { pageSize, offset } = getPagination(parseInt(req.query.page), parseInt(req.query.pageSize));
  const con = await getConnection();
  const [rows] = await con.execute(
    `SELECT p.* FROM Passaggio p
         LEFT JOIN Brano b1 ON p.id_brano_1 = b1.id
         LEFT JOIN Brano b2 ON p.id_brano_2 = b2.id
         WHERE b1.id_album = ? OR b2.id_album = ?
         LIMIT ? OFFSET ?`,
    [req.params.id, req.params.id, pageSize, offset]
  );
  await con.end();
  res.json(rows);
}

export async function getArtistaPassaggi(req: import("express").Request, res: import("express").Response) {
  if (typeof req.query.page !== "string" || typeof req.query.pageSize !== "string" || isNaN(parseInt(req.query.page)) || isNaN(parseInt(req.query.pageSize))) {
    return res.status(400).json({ error: "Parametri di paginazione non validi" });
  }
  const { pageSize, offset } = getPagination(parseInt(req.query.page), parseInt(req.query.pageSize));
  const con = await getConnection();
  const [rows] = await con.execute(
    `SELECT p.* FROM Passaggio p
         LEFT JOIN Brano b1 ON p.id_brano_1 = b1.id
         LEFT JOIN Brano b2 ON p.id_brano_2 = b2.id
         LEFT JOIN Album_Artista aa1 ON b1.id_album = aa1.id_album
         LEFT JOIN Album_Artista aa2 ON b2.id_album = aa2.id_album
         WHERE aa1.id_artista = ? OR aa2.id_artista = ?
         LIMIT ? OFFSET ?`,
    [req.params.id, req.params.id, pageSize, offset]
  );
  await con.end();
  res.json(rows);
}

export async function getUtentePassaggi(req: import("express").Request, res: import("express").Response) {
  const con = await getConnection();
  const [rows] = await con.execute(
    "SELECT * FROM Passaggio WHERE id_utente = ?",
    [req.params.id]
  );
  await con.end();
  res.json(rows);
}
// Configurazione del database

export async function getScaletta(req: import("express").Request, res: import("express").Response) {
  try {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Scaletta WHERE id = ?", [
      req.params.id,
    ]);
    if ((rows as any[]).length > 0) {
      const scaletta = ((rows as any[]))[0];
      const [passaggi] = await con.execute(
        `SELECT p.* FROM Passaggio p
         JOIN Scaletta_Passaggio sp ON p.id = sp.id_passaggio
         WHERE sp.id_scaletta = ?`,
        [scaletta.id]
      );
      scaletta.passaggi = passaggi;
      await con.end();
      res.json(scaletta);
    } else {
      await con.end();
      res.status(404).json({ error: "Scaletta non trovata" });
    }
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero della scaletta" });
  }
}

export async function getScalette(req: import("express").Request, res: import("express").Response) {
  try {
    const con = await getConnection();
    const [scalette] = await con.execute("SELECT * FROM Scaletta");
    for (const scaletta of (scalette as any[])) {
      const [passaggi] = await con.execute(
        `SELECT p.* FROM Passaggio p
         JOIN Scaletta_Passaggio sp ON p.id = sp.id_passaggio
         WHERE sp.id_scaletta = ?`,
        [scaletta.id]
      );
      scaletta.passaggi = passaggi;
    }
    await con.end();
    res.json(scalette);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero delle scalette" });
  }
}

export async function postScalette(req: import("express").Request, res: import("express").Response) {
  const { nome, descrizione, passaggi } = req.body; // passaggi: array di id_passaggio
  try {
    const con = await getConnection();
    const [result] = await con.execute(
      "INSERT INTO Scaletta (nome, descrizione) VALUES (?, ?)",
      [nome, descrizione]
    );
    const id_scaletta = (result as mysql.ResultSetHeader).insertId;
    if (Array.isArray(passaggi) && passaggi.length > 0) {
      for (const id_passaggio of passaggi) {
        await con.execute(
          "INSERT INTO Scaletta_Passaggio (id_scaletta, id_passaggio) VALUES (?, ?)",
          [id_scaletta, id_passaggio]
        );
      }
    }
    await con.end();
    res.json({ id: id_scaletta });
  } catch (err) {
    res.status(500).json({ error: "Errore nella creazione della scaletta" });
  }
}

export async function putScalette(req: import("express").Request, res: import("express").Response) {
  const { nome, descrizione, passaggi } = req.body; // passaggi: array di id_passaggio
  try {
    const con = await getConnection();
    await con.execute(
      "UPDATE Scaletta SET nome = ?, descrizione = ? WHERE id = ?",
      [nome, descrizione, req.params.id]
    );
    // Aggiorna la relazione molti-a-molti: elimina tutte e reinserisce
    await con.execute("DELETE FROM Scaletta_Passaggio WHERE id_scaletta = ?", [
      req.params.id,
    ]);
    if (Array.isArray(passaggi) && passaggi.length > 0) {
      for (const id_passaggio of passaggi) {
        await con.execute(
          "INSERT INTO Scaletta_Passaggio (id_scaletta, id_passaggio) VALUES (?, ?)",
          [req.params.id, id_passaggio]
        );
      }
    }
    await con.end();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Errore nella modifica della scaletta" });
  }
}

export async function deleteScalette(req: import("express").Request, res: import("express").Response) {
  try {
    const con = await getConnection();
    await con.execute("DELETE FROM Scaletta_Passaggio WHERE id_scaletta = ?", [
      req.params.id,
    ]);
    await con.execute("DELETE FROM Scaletta WHERE id = ?", [req.params.id]);
    await con.end();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Errore nell'eliminazione della scaletta" });
  }
}

//TODO: Adattare meglio questa funzione a Typescript
export async function getGeneriPassaggi(req: import("express").Request, res: import("express").Response) {
  const { pageSize = 20, offset = 0 } = req.query;
  const con = await getConnection();
  const [rows] = await con.execute(
    `SELECT p.* FROM Passaggio p
         LEFT JOIN Brano b1 ON p.id_brano_1 = b1.id
         LEFT JOIN Brano b2 ON p.id_brano_2 = b2.id
         WHERE b1.id_genere = ? OR b2.id_genere = ?
         LIMIT ? OFFSET ?`,
    [req.params.id, req.params.id, Number(pageSize), Number(offset)]
  );
  await con.end();
  res.json(rows);
}

//DA QUI IN GIU, LE FUNZIONI GIA ADATTATE A TYPESCRIPT

//-------------------------------------------------------------------------------

// ====== GENERI ======
//FUNZIONE GIA ADATTATA A TYPESCRIPT
//TODO: valuta se la funzione getGeneri e la funzione getGenere possono essere unite
export async function getGeneri(req: import("express").Request, res: import("express").Response) {
  try {
    //CHIAMATA API A DEEZER
    const responseData: any = await makeDeezerApiCall(res, "genre", null, null, null);
    if (responseData === -1) {
      return; //Errore già gestito in makeDeezerApiCall
    }
    //VALIDAZIONE DEI GENERI RESTITUITI DA DEEZER
    if (!isValidDeezerObject(res, responseData.data, GenereDeezerBasicSchema, true)) {
      return;
    }
    const generi = responseData.data as GenereDeezerBasic[];
    const generiDb: GenereDb[] = generi.map(genere => ({ id: genere.id, nome: genere.name } as GenereDb));
    //UPSERT DEI GENERI SUL DB
    const con = await getConnection();
    for (const genere of generiDb) {
      await upsertEntitaDeezer(con, genere, "Genere");
    }
    //CARICAMENTO FOTO DEI GENERI
    for (const genere of generi) {
      await uploadPhoto("generi_pictures", genere.id, genere.picture_big);
    }
    //RECUPERO E RESTITUZIONE GENERI DAL DB
    res.json(generiDb);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero del genere Deezer o dal database" });
  }
}

//FUNZIONE GIA ADATTATA A TYPESCRIPT
export async function getGenere(req: import("express").Request, res: import("express").Response) {
  try {
    //CONTROLLO PARAMETRO ID SU URL
    const id = req.params.id;
    if (id == undefined || isNaN(Number(id))) {
      res.status(400).json({ error: "ID genere non valido" });
      return;
    }
    //CHIAMATA API A DEEZER
    const responseData: any = await makeDeezerApiCall(res, "genre", id, null, null);
    if (responseData === -1) {
      return; //Errore già gestito in makeDeezerApiCall
    }
    //VALIDAZIONE GENERE RESTITUITO DA DEEZER
    if (!isValidDeezerObject(res, responseData, GenereDeezerBasicSchema, false)) {
      return;
    }
    const genere = responseData as GenereDeezerBasic;
    const genereDb = { id: genere.id, nome: genere.name } as GenereDb;
    //UPSERT DEL GENERE SUL DB
    const con = await getConnection();
    await upsertEntitaDeezer(con, genereDb, "Genere");
    //CARICAMENTO FOTO DEL GENERE
    await uploadPhoto("generi_pictures", genere.id, genere.picture_big);
    //RECUPERO E RESTITUZIONE GENERE DAL DB
    res.json(genereDb);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero del genere Deezer o dal database" });
  }
}

/*
//FUNZIONE GIA ADATTATA A TYPESCRIPT
export async function artistiApi(apiName: string, req: import("express").Request, res: import("express").Response) {
  if (artistiAPIsConfig[apiName] === undefined) {
    res.status(400).json({ error: 'API non valida' });
    return;
  }
  const paramName = artistiAPIsConfig[apiName].paramName; //nome del parametro di ricerca
  //CONTROLLO CHE I PARAMETRI query, limit e index SIANO STATI PASSATI E SIANO VALIDI
  const param = typeof req.query[paramName] === "string" ? req.query[paramName] : undefined;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const index = typeof req.query.index === "string" ? Number(req.query.index) : undefined;
  if (!param || limit === undefined || index === undefined || isNaN(limit) || isNaN(index)) {
    return res.status(400).json({ error: 'Parametri "' + paramName + '", "limit" e "index" obbligatori e devono essere validi' });
  }
  try {
    //CHIAMATA API A DEEZER
    const responseData: any = await artistiAPIsConfig[apiName].deezerAPICallback(res, param, limit.toString(), index.toString());
    //DA QUI IN GIU, TUTTO IDENTICO
    if (responseData === -1) {
      return; //Errore già gestito in makeDeezerApiCall
    }
    //VALIDAZIONE DELL'ARRAY DEGLI ARTISTI RESTITUITO DA DEEZER
    if (!isValidDeezerObject(res, responseData.data, ArtistaDeezerBasicSchema, true)) {
      return;
    }
    const artisti: ArtistaDeezerBasic[] = responseData.data as ArtistaDeezerBasic[];
    //SE NON ESISTE, CREA LA CARTELLA PER LE FOTO DEGLI ARTISTI
    const con = await getConnection();
    //RIPETI PER OGNI ARTISTA...
    for (const artista of artisti) {
      //UPSERT ARTISTA SUL DB
      await upsertEntitaDeezer(con, { id: artista.id, nome: artista.name } as ArtistaDb, "Artista"); //conversione possibile perchè ArtistaDeezerBasic e ArtistaDb hanno gli stessi campi
      //CARICAMENTO FOTO DELL'ARTISTA
      await uploadPhoto("artisti_pictures", artista.id, artista.picture_big);
    }
    await con.end();
    res.json(artisti.map((artista) => { return { id: artista.id, nome: artista.name } }));
  } catch (err) {
    res.status(500).json({ error: "Errore nella ricerca artisti Deezer" });
  }
}
*/

/*
//FUNZIONE GIA ADATTATA A TYPESCRIPT
export async function albumApi(apiName: string, req: import("express").Request, res: import("express").Response) {
  if (albumAPIsConfig[apiName] === undefined) {
    res.status(400).json({ error: 'API non valida' });
    return;
  }
  const paramName = albumAPIsConfig[apiName].paramName; //nome del parametro di ricerca
  //CONTROLLO CHE I PARAMETRI query, limit e index SIANO STATI PASSATI E SIANO VALIDI
  const param = typeof req.query[paramName] === "string" ? req.query[paramName] : undefined;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const index = typeof req.query.index === "string" ? Number(req.query.index) : undefined;
  if (!param || limit === undefined || index === undefined || isNaN(limit) || isNaN(index)) {
    return res.status(400).json({ error: 'Parametri "' + paramName + '", "limit" e "index" obbligatori e devono essere validi' });
  }
  try {
    //CHIAMATA API A DEEZER
    const responseData: any = await albumAPIsConfig[apiName].deezerAPICallback(res, param, limit.toString(), index.toString());
    //DA QUI IN GIU, TUTTO IDENTICO
    if (responseData === -1) {
      return; //Errore già gestito in makeDeezerApiCall
    }
    //VALIDAZIONE DELL'ARRAY DEGLI ALBUM RESTITUITO DA DEEZER
    if (!isValidDeezerObject(res, responseData.data, AlbumDeezerBasicSchema, true)) {
      return;
    }
    const albums: AlbumDeezerBasic[] = responseData.data as AlbumDeezerBasic[];
    //SE NON ESISTE, CREA LA CARTELLA PER LE FOTO DEGLI ALBUM
    const con = await getConnection();
    //RIPETI PER OGNI ALBUM...
    for (const album of albums) {
      //UPSERT ALBUM SUL DB
      await upsertEntitaDeezer(con, { id: album.id, titolo: album.title } as AlbumDb, "Album"); //conversione possibile perchè AlbumDeezerBasic e AlbumDb hanno gli stessi campi
      //CARICAMENTO FOTO DELL'ALBUM
      await uploadPhoto("album_pictures", album.id, album.cover_big);
    }
    await con.end();
    res.json(albums.map((album) => { return { id: album.id, titolo: album.title } }));
  } catch (err) {
    res.status(500).json({ error: "Errore nella ricerca album Deezer" });
  }
}
*/

// Overloads for type-safe mapping from Deezer entity to DB entity
function fromDeezerEntityToDbEntity(entity: GenericDeezerEntityBasic, tableName: string): DbEntity {
  switch (tableName) {
    case "Artista":
      return { id: entity.id, nome: (entity as ArtistaDeezerBasic).name } as ArtistaDb;
    case "Album":
      return { id: entity.id, titolo: (entity as AlbumDeezerBasic).title } as AlbumDb;
    case "Genere":
      return { id: entity.id, nome: (entity as GenereDeezerBasic).name } as GenereDb;
    default:
      throw new Error("Tabella non supportata");
  }
}

//FUNZIONE GIA ADATTATA A TYPESCRIPT
export async function deezerEntityApi<T extends ZodObject<any>>(
  apiName: string,
  multiple: boolean,
  apisConfig: DeezerEntityAPIsConfig,
  deezerObjectBasicSchema: ZodIntersection<typeof GenericDeezerEntityBasicSchema, T>,
  dbTableName: string,
  picturesFolder: string,
  req: import("express").Request,
  res: import("express").Response
) {
  if (apisConfig[apiName] === undefined) {
    res.status(400).json({ error: 'API non valida' });
    return;
  }
  const paramName = apisConfig[apiName].paramName; //nome del parametro di ricerca
  //CONTROLLO CHE I PARAMETRI query, limit e index SIANO STATI PASSATI E SIANO VALIDI
  const param = typeof req.query[paramName] === "string" ? req.query[paramName] : undefined;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const index = typeof req.query.index === "string" ? Number(req.query.index) : undefined;
  if (!param || limit === undefined || index === undefined || isNaN(limit) || isNaN(index)) {
    return res.status(400).json({ error: 'Parametri "' + paramName + '", "limit" e "index" obbligatori e devono essere validi' });
  }
  try {
    //CHIAMATA API A DEEZER
    const responseData: any = await apisConfig[apiName].deezerAPICallback(res, param, limit.toString(), index.toString());
    //DA QUI IN GIU, TUTTO IDENTICO
    if (responseData === -1) {
      return; //Errore già gestito in makeDeezerApiCall
    }
    //VALIDAZIONE DELL'OGGETTO RESTITUITO DA DEEZER
    if (!isValidDeezerObject(res, multiple ? responseData.data : responseData, deezerObjectBasicSchema, multiple)) {
      return;
    }
    const entities: GenericDeezerEntityBasic[] = multiple ? responseData.data as GenericDeezerEntityBasic[] : new Array(1).fill(responseData as GenericDeezerEntityBasic) as GenericDeezerEntityBasic[];
    //SE NON ESISTE, CREA LA CARTELLA PER LE FOTO
    const con = await getConnection();
    //RIPETI PER OGNI ENTITA...
    for (const entity of entities) {
      //UPSERT ENTITA SUL DB
      await upsertEntitaDeezer(con, fromDeezerEntityToDbEntity(entity, dbTableName), dbTableName);
      //CARICAMENTO FOTO DELL'ENTITA
      if ("picture_big" in entity || "cover_big" in entity) {
        await uploadPhoto(picturesFolder, entity.id, "picture_big" in entity ? entity.picture_big : entity.cover_big);
      }
    }
    await con.end();
    if (multiple) {
      res.json(entities.map((entity) => { return fromDeezerEntityToDbEntity(entity, dbTableName) }));
    } else {
      const entity = entities[0];
      if (entity) {
        res.json(fromDeezerEntityToDbEntity(entity, dbTableName));
      } else {
        res.status(500).json({ error: "Errore strano che non dovrebbe mai verificarsi. Controlla."});
      }
    }
  } catch (err) {
    res.status(500).json({ error: "Errore su questa Api legata a Deezer" });
  }
}


