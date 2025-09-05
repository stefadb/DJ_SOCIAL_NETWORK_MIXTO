"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = getConnection;
exports.postLogin = postLogin;
exports.getUtenti = getUtenti;
exports.getUtente = getUtente;
exports.postUtente = postUtente;
exports.putUtente = putUtente;
exports.deleteUtente = deleteUtente;
exports.getPassaggi = getPassaggi;
exports.getPassaggio = getPassaggio;
exports.postPassaggio = postPassaggio;
exports.putPassaggio = putPassaggio;
exports.deletePassaggio = deletePassaggio;
exports.getCommenti = getCommenti;
exports.getCommento = getCommento;
exports.postCommento = postCommento;
exports.putCommento = putCommento;
exports.deleteCommento = deleteCommento;
exports.getValutazioni = getValutazioni;
exports.getValutazione = getValutazione;
exports.postValutazione = postValutazione;
exports.putValutazione = putValutazione;
exports.deleteValutazione = deleteValutazione;
exports.postVisualizzazione = postVisualizzazione;
exports.getBranoPassaggi = getBranoPassaggi;
exports.getAlbumPassaggi = getAlbumPassaggi;
exports.getArtistaPassaggi = getArtistaPassaggi;
exports.getUtentePassaggi = getUtentePassaggi;
exports.getScaletta = getScaletta;
exports.getScalette = getScalette;
exports.postScalette = postScalette;
exports.putScalette = putScalette;
exports.deleteScalette = deleteScalette;
exports.getGeneriPassaggi = getGeneriPassaggi;
exports.getGeneri = getGeneri;
exports.getGenere = getGenere;
exports.artistiApi = artistiApi;
exports.albumApi = albumApi;
const bcrypt_1 = __importDefault(require("bcrypt"));
const promise_1 = __importDefault(require("mysql2/promise"));
const types_1 = require("./types");
const dotenv_1 = __importDefault(require("dotenv"));
const functions_1 = require("./functions");
const upserts_1 = require("./upserts");
// Decidi quale file .env usare in base a NODE_ENV
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv_1.default.config({ path: envFile });
const dbConfig = {
    host: process.env.HOST || "localhost",
    user: process.env.USER || "root",
    password: process.env.PASSWORD || "5vhpS8!2xxS88s4rbT8m7j",
    database: process.env.DATABASE || "mixto",
};
async function getConnection() {
    return await promise_1.default.createConnection(dbConfig);
}
//FUNZIONI DELLE CHIAMATE API ESPORTATE
// ====== LOGIN ======
async function postLogin(req, res) {
    const { username, password } = req.body;
    try {
        const con = await getConnection();
        const [rows] = await con.execute("SELECT * FROM Utente WHERE username = ?", [username]);
        const utenti = rows;
        await con.end();
        if (utenti.length === 0) {
            return res.status(401).json({ error: "Credenziali non valide" });
        }
        const user = utenti[0];
        const match = await bcrypt_1.default.compare(password, user.password);
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
    }
    catch (err) {
        res.status(500).json({ error: "Errore durante il login" });
    }
}
// ====== CRUD UTENTE ======
async function getUtenti(req, res) {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Utente");
    await con.end();
    res.json(rows);
}
async function getUtente(req, res) {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Utente WHERE id = ?", [
        req.params.id,
    ]);
    await con.end();
    const utenti = rows;
    res.json(utenti[0]);
}
async function postUtente(req, res) {
    const { username, first_name, surname, password } = req.body;
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const con = await getConnection();
        const [result] = await con.execute("INSERT INTO Utente (username, first_name, surname, password) VALUES (?, ?, ?, ?)", [username, first_name, surname, hashedPassword]);
        await con.end();
        res.json({ id: result.insertId });
    }
    catch (err) {
        res.status(500).json({ error: "Errore nella creazione utente" });
    }
}
async function putUtente(req, res) {
    const { username, first_name, surname, password } = req.body;
    const con = await getConnection();
    await con.execute("UPDATE Utente SET username=?, first_name=?, surname=?, password=? WHERE id=?", [username, first_name, surname, password, req.params.id]);
    await con.end();
    res.sendStatus(204);
}
async function deleteUtente(req, res) {
    const con = await getConnection();
    await con.execute("DELETE FROM Utente WHERE id=?", [req.params.id]);
    await con.end();
    res.sendStatus(204);
}
// ====== CRUD PASSAGGIO ======
async function getPassaggi(req, res) {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Passaggio");
    await con.end();
    res.json(rows);
}
async function getPassaggio(req, res) {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Passaggio WHERE id = ?", [
        req.params.id,
    ]);
    await con.end();
    res.json(rows[0]);
}
async function postPassaggio(req, res) {
    const { testo, inizio, fine, id_utente, id_brano_1, id_brano_2 } = req.body;
    const con = await getConnection();
    const [result] = await con.execute("INSERT INTO Passaggio (testo, inizio, fine, id_utente, id_brano_1, id_brano_2) VALUES (?, ?, ?, ?, ?, ?)", [testo, inizio, fine, id_utente, id_brano_1, id_brano_2]);
    await con.end();
    res.json({ id: result.insertId });
}
async function putPassaggio(req, res) {
    const { testo, inizio, fine, id_utente, id_brano_1, id_brano_2 } = req.body;
    const con = await getConnection();
    await con.execute("UPDATE Passaggio SET testo=?, inizio=?, fine=?, id_utente=?, id_brano_1=?, id_brano_2=? WHERE id=?", [testo, inizio, fine, id_utente, id_brano_1, id_brano_2, req.params.id]);
    await con.end();
    res.sendStatus(204);
}
async function deletePassaggio(req, res) {
    const con = await getConnection();
    await con.execute("DELETE FROM Passaggio WHERE id=?", [req.params.id]);
    await con.end();
    res.sendStatus(204);
}
// ====== CRUD COMMENTO ======
async function getCommenti(req, res) {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Commento");
    await con.end();
    res.json(rows);
}
async function getCommento(req, res) {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Commento WHERE id = ?", [
        req.params.id,
    ]);
    await con.end();
    res.json(rows[0]);
}
async function postCommento(req, res) {
    const { testo, id_utente, id_passaggio, id_commento_padre } = req.body;
    const con = await getConnection();
    const [result] = await con.execute("INSERT INTO Commento (testo, id_utente, id_passaggio, id_commento_padre) VALUES (?, ?, ?, ?)", [testo, id_utente, id_passaggio, id_commento_padre]);
    await con.end();
    res.json({ id: result.insertId });
}
async function putCommento(req, res) {
    const { testo, id_utente, id_passaggio, id_commento_padre } = req.body;
    const con = await getConnection();
    await con.execute("UPDATE Commento SET testo=?, id_utente=?, id_passaggio=?, id_commento_padre=? WHERE id=?", [testo, id_utente, id_passaggio, id_commento_padre, req.params.id]);
    await con.end();
    res.sendStatus(204);
}
async function deleteCommento(req, res) {
    const con = await getConnection();
    await con.execute("DELETE FROM Commento WHERE id=?", [req.params.id]);
    await con.end();
    res.sendStatus(204);
}
// ====== CRUD VALUTAZIONE ======
async function getValutazioni(req, res) {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Valutazione");
    await con.end();
    res.json(rows);
}
async function getValutazione(req, res) {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Valutazione WHERE id = ?", [
        req.params.id,
    ]);
    await con.end();
    res.json(rows[0]);
}
async function postValutazione(req, res) {
    const { voto, id_utente, id_passaggio } = req.body;
    const con = await getConnection();
    const [result] = await con.execute("INSERT INTO Valutazione (voto, id_utente, id_passaggio) VALUES (?, ?, ?)", [voto, id_utente, id_passaggio]);
    await con.end();
    res.json({ id: result.insertId });
}
async function putValutazione(req, res) {
    const { voto, id_utente, id_passaggio } = req.body;
    const con = await getConnection();
    await con.execute("UPDATE Valutazione SET voto=?, id_utente=?, id_passaggio=? WHERE id=?", [voto, id_utente, id_passaggio, req.params.id]);
    await con.end();
    res.sendStatus(204);
}
async function deleteValutazione(req, res) {
    const con = await getConnection();
    await con.execute("DELETE FROM Valutazione WHERE id=?", [req.params.id]);
    await con.end();
    res.sendStatus(204);
}
// ====== CREATE VISUALIZZAZIONE ======
async function postVisualizzazione(req, res) {
    const { id_utente, id_passaggio } = req.body;
    const con = await getConnection();
    const [result] = await con.execute("INSERT INTO Visualizzazione (id_utente, id_passaggio) VALUES (?, ?)", [id_utente, id_passaggio]);
    await con.end();
    res.json({ id: result.insertId });
}
function getPagination(page, pageSize) {
    const offset = (page - 1) * pageSize;
    return { pageSize, offset };
}
// ====== PASSAGGI CORRELATI ======
async function getBranoPassaggi(req, res) {
    if (typeof req.query.page !== "string" || typeof req.query.pageSize !== "string" || isNaN(parseInt(req.query.page)) || isNaN(parseInt(req.query.pageSize))) {
        return res.status(400).json({ error: "Parametri di paginazione non validi" });
    }
    const { pageSize, offset } = getPagination(parseInt(req.query.page), parseInt(req.query.pageSize));
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Passaggio WHERE id_brano_1 = ? OR id_brano_2 = ? LIMIT ? OFFSET ?", [req.params.id, req.params.id, pageSize, offset]);
    await con.end();
    res.json(rows);
}
async function getAlbumPassaggi(req, res) {
    if (typeof req.query.page !== "string" || typeof req.query.pageSize !== "string" || isNaN(parseInt(req.query.page)) || isNaN(parseInt(req.query.pageSize))) {
        return res.status(400).json({ error: "Parametri di paginazione non validi" });
    }
    const { pageSize, offset } = getPagination(parseInt(req.query.page), parseInt(req.query.pageSize));
    const con = await getConnection();
    const [rows] = await con.execute(`SELECT p.* FROM Passaggio p
         LEFT JOIN Brano b1 ON p.id_brano_1 = b1.id
         LEFT JOIN Brano b2 ON p.id_brano_2 = b2.id
         WHERE b1.id_album = ? OR b2.id_album = ?
         LIMIT ? OFFSET ?`, [req.params.id, req.params.id, pageSize, offset]);
    await con.end();
    res.json(rows);
}
async function getArtistaPassaggi(req, res) {
    if (typeof req.query.page !== "string" || typeof req.query.pageSize !== "string" || isNaN(parseInt(req.query.page)) || isNaN(parseInt(req.query.pageSize))) {
        return res.status(400).json({ error: "Parametri di paginazione non validi" });
    }
    const { pageSize, offset } = getPagination(parseInt(req.query.page), parseInt(req.query.pageSize));
    const con = await getConnection();
    const [rows] = await con.execute(`SELECT p.* FROM Passaggio p
         LEFT JOIN Brano b1 ON p.id_brano_1 = b1.id
         LEFT JOIN Brano b2 ON p.id_brano_2 = b2.id
         LEFT JOIN Album_Artista aa1 ON b1.id_album = aa1.id_album
         LEFT JOIN Album_Artista aa2 ON b2.id_album = aa2.id_album
         WHERE aa1.id_artista = ? OR aa2.id_artista = ?
         LIMIT ? OFFSET ?`, [req.params.id, req.params.id, pageSize, offset]);
    await con.end();
    res.json(rows);
}
async function getUtentePassaggi(req, res) {
    const con = await getConnection();
    const [rows] = await con.execute("SELECT * FROM Passaggio WHERE id_utente = ?", [req.params.id]);
    await con.end();
    res.json(rows);
}
// Configurazione del database
async function getScaletta(req, res) {
    try {
        const con = await getConnection();
        const [rows] = await con.execute("SELECT * FROM Scaletta WHERE id = ?", [
            req.params.id,
        ]);
        if (rows.length > 0) {
            const scaletta = rows[0];
            const [passaggi] = await con.execute(`SELECT p.* FROM Passaggio p
         JOIN Scaletta_Passaggio sp ON p.id = sp.id_passaggio
         WHERE sp.id_scaletta = ?`, [scaletta.id]);
            scaletta.passaggi = passaggi;
            await con.end();
            res.json(scaletta);
        }
        else {
            await con.end();
            res.status(404).json({ error: "Scaletta non trovata" });
        }
    }
    catch (err) {
        res.status(500).json({ error: "Errore nel recupero della scaletta" });
    }
}
async function getScalette(req, res) {
    try {
        const con = await getConnection();
        const [scalette] = await con.execute("SELECT * FROM Scaletta");
        for (const scaletta of scalette) {
            const [passaggi] = await con.execute(`SELECT p.* FROM Passaggio p
         JOIN Scaletta_Passaggio sp ON p.id = sp.id_passaggio
         WHERE sp.id_scaletta = ?`, [scaletta.id]);
            scaletta.passaggi = passaggi;
        }
        await con.end();
        res.json(scalette);
    }
    catch (err) {
        res.status(500).json({ error: "Errore nel recupero delle scalette" });
    }
}
async function postScalette(req, res) {
    const { nome, descrizione, passaggi } = req.body; // passaggi: array di id_passaggio
    try {
        const con = await getConnection();
        const [result] = await con.execute("INSERT INTO Scaletta (nome, descrizione) VALUES (?, ?)", [nome, descrizione]);
        const id_scaletta = result.insertId;
        if (Array.isArray(passaggi) && passaggi.length > 0) {
            for (const id_passaggio of passaggi) {
                await con.execute("INSERT INTO Scaletta_Passaggio (id_scaletta, id_passaggio) VALUES (?, ?)", [id_scaletta, id_passaggio]);
            }
        }
        await con.end();
        res.json({ id: id_scaletta });
    }
    catch (err) {
        res.status(500).json({ error: "Errore nella creazione della scaletta" });
    }
}
async function putScalette(req, res) {
    const { nome, descrizione, passaggi } = req.body; // passaggi: array di id_passaggio
    try {
        const con = await getConnection();
        await con.execute("UPDATE Scaletta SET nome = ?, descrizione = ? WHERE id = ?", [nome, descrizione, req.params.id]);
        // Aggiorna la relazione molti-a-molti: elimina tutte e reinserisce
        await con.execute("DELETE FROM Scaletta_Passaggio WHERE id_scaletta = ?", [
            req.params.id,
        ]);
        if (Array.isArray(passaggi) && passaggi.length > 0) {
            for (const id_passaggio of passaggi) {
                await con.execute("INSERT INTO Scaletta_Passaggio (id_scaletta, id_passaggio) VALUES (?, ?)", [req.params.id, id_passaggio]);
            }
        }
        await con.end();
        res.sendStatus(204);
    }
    catch (err) {
        res.status(500).json({ error: "Errore nella modifica della scaletta" });
    }
}
async function deleteScalette(req, res) {
    try {
        const con = await getConnection();
        await con.execute("DELETE FROM Scaletta_Passaggio WHERE id_scaletta = ?", [
            req.params.id,
        ]);
        await con.execute("DELETE FROM Scaletta WHERE id = ?", [req.params.id]);
        await con.end();
        res.sendStatus(204);
    }
    catch (err) {
        res.status(500).json({ error: "Errore nell'eliminazione della scaletta" });
    }
}
//TODO: Adattare meglio questa funzione a Typescript
async function getGeneriPassaggi(req, res) {
    const { pageSize = 20, offset = 0 } = req.query;
    const con = await getConnection();
    const [rows] = await con.execute(`SELECT p.* FROM Passaggio p
         LEFT JOIN Brano b1 ON p.id_brano_1 = b1.id
         LEFT JOIN Brano b2 ON p.id_brano_2 = b2.id
         WHERE b1.id_genere = ? OR b2.id_genere = ?
         LIMIT ? OFFSET ?`, [req.params.id, req.params.id, Number(pageSize), Number(offset)]);
    await con.end();
    res.json(rows);
}
//DA QUI IN GIU, LE FUNZIONI GIA ADATTATE A TYPESCRIPT
//-------------------------------------------------------------------------------
// ====== GENERI ======
//FUNZIONE GIA ADATTATA A TYPESCRIPT
//TODO: valuta se la funzione getGeneri e la funzione getGenere possono essere unite
async function getGeneri(req, res) {
    try {
        //CHIAMATA API A DEEZER
        const responseData = await (0, functions_1.makeDeezerApiCall)(res, "genre", null, null, null);
        if (responseData === -1) {
            return; //Errore già gestito in makeDeezerApiCall
        }
        //VALIDAZIONE DEI GENERI RESTITUITI DA DEEZER
        if (!(0, functions_1.isValidDeezerObject)(res, responseData.data, types_1.GenereDeezerBasicSchema, true)) {
            return;
        }
        const generi = responseData.data;
        const generiDb = generi.map(genere => ({ id: genere.id, nome: genere.name }));
        //UPSERT DEI GENERI SUL DB
        const con = await getConnection();
        for (const genere of generiDb) {
            await (0, upserts_1.upsertEntitaDeezer)(con, genere, "Genere");
        }
        //CARICAMENTO FOTO DEI GENERI
        for (const genere of generi) {
            await (0, functions_1.uploadPhoto)("generi_pictures", genere.id, genere.picture_big);
        }
        //RECUPERO E RESTITUZIONE GENERI DAL DB
        res.json(generiDb);
    }
    catch (err) {
        res.status(500).json({ error: "Errore nel recupero del genere Deezer o dal database" });
    }
}
//FUNZIONE GIA ADATTATA A TYPESCRIPT
async function getGenere(req, res) {
    try {
        //CONTROLLO PARAMETRO ID SU URL
        const id = req.params.id;
        if (id == undefined || isNaN(Number(id))) {
            res.status(400).json({ error: "ID genere non valido" });
            return;
        }
        //CHIAMATA API A DEEZER
        const responseData = await (0, functions_1.makeDeezerApiCall)(res, "genre", id, null, null);
        if (responseData === -1) {
            return; //Errore già gestito in makeDeezerApiCall
        }
        //VALIDAZIONE GENERE RESTITUITO DA DEEZER
        if (!(0, functions_1.isValidDeezerObject)(res, responseData, types_1.GenereDeezerBasicSchema, false)) {
            return;
        }
        const genere = responseData;
        const genereDb = { id: genere.id, nome: genere.name };
        //UPSERT DEL GENERE SUL DB
        const con = await getConnection();
        await (0, upserts_1.upsertEntitaDeezer)(con, genereDb, "Genere");
        //CARICAMENTO FOTO DEL GENERE
        await (0, functions_1.uploadPhoto)("generi_pictures", genere.id, genere.picture_big);
        //RECUPERO E RESTITUZIONE GENERE DAL DB
        res.json(genereDb);
    }
    catch (err) {
        res.status(500).json({ error: "Errore nel recupero del genere Deezer o dal database" });
    }
}
const artistiAPIsConfig = {
    search: {
        paramName: "query",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "search", null, "artist", { q: param, limit: limit.toString(), index: index.toString() })
    },
    related: {
        paramName: "artistId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "artist", param, "related", { limit: limit.toString(), index: index.toString() })
    },
    genre: {
        paramName: "genreId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "genre", param, "artists", { limit: limit.toString(), index: index.toString() })
    }
};
//FUNZIONE GIA ADATTATA A TYPESCRIPT
async function artistiApi(apiName, req, res) {
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
        const responseData = await artistiAPIsConfig[apiName].deezerAPICallback(res, param, limit.toString(), index.toString());
        //DA QUI IN GIU, TUTTO IDENTICO
        if (responseData === -1) {
            return; //Errore già gestito in makeDeezerApiCall
        }
        //VALIDAZIONE DELL'ARRAY DEGLI ARTISTI RESTITUITO DA DEEZER
        if (!(0, functions_1.isValidDeezerObject)(res, responseData.data, types_1.ArtistaDeezerBasicSchema, true)) {
            return;
        }
        const artisti = responseData.data;
        //SE NON ESISTE, CREA LA CARTELLA PER LE FOTO DEGLI ARTISTI
        const con = await getConnection();
        //RIPETI PER OGNI ARTISTA...
        for (const artista of artisti) {
            //UPSERT ARTISTA SUL DB
            await (0, upserts_1.upsertEntitaDeezer)(con, { id: artista.id, nome: artista.name }, "Artista"); //conversione possibile perchè ArtistaDeezerBasic e ArtistaDb hanno gli stessi campi
            //CARICAMENTO FOTO DELL'ARTISTA
            await (0, functions_1.uploadPhoto)("artisti_pictures", artista.id, artista.picture_big);
        }
        await con.end();
        res.json(artisti.map((artista) => { return { id: artista.id, nome: artista.name }; }));
    }
    catch (err) {
        res.status(500).json({ error: "Errore nella ricerca artisti Deezer" });
    }
}
const albumAPIsConfig = {
    search: {
        paramName: "query",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "search", null, "album", { q: param, limit: limit.toString(), index: index.toString() })
    },
};
//FUNZIONE GIA ADATTATA A TYPESCRIPT
async function albumApi(apiName, req, res) {
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
        const responseData = await albumAPIsConfig[apiName].deezerAPICallback(res, param, limit.toString(), index.toString());
        //DA QUI IN GIU, TUTTO IDENTICO
        if (responseData === -1) {
            return; //Errore già gestito in makeDeezerApiCall
        }
        //VALIDAZIONE DELL'ARRAY DEGLI ALBUM RESTITUITO DA DEEZER
        if (!(0, functions_1.isValidDeezerObject)(res, responseData.data, types_1.AlbumDeezerBasicSchema, true)) {
            return;
        }
        const albums = responseData.data;
        //SE NON ESISTE, CREA LA CARTELLA PER LE FOTO DEGLI ALBUM
        const con = await getConnection();
        //RIPETI PER OGNI ALBUM...
        for (const album of albums) {
            //UPSERT ALBUM SUL DB
            await (0, upserts_1.upsertEntitaDeezer)(con, { id: album.id, titolo: album.title }, "Album"); //conversione possibile perchè AlbumDeezerBasic e AlbumDb hanno gli stessi campi
            //CARICAMENTO FOTO DELL'ALBUM
            await (0, functions_1.uploadPhoto)("album_pictures", album.id, album.cover_big);
        }
        await con.end();
        res.json(albums.map((album) => { return { id: album.id, titolo: album.title }; }));
    }
    catch (err) {
        res.status(500).json({ error: "Errore nella ricerca album Deezer" });
    }
}
//# sourceMappingURL=apiroutes.js.map