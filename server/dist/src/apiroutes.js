"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = getConnection;
exports.postLogin = postLogin;
exports.deleteEntity = deleteEntity;
exports.getEntityWithAssociations = getEntityWithAssociations;
exports.getFilteredEntitiesList = getFilteredEntitiesList;
exports.postEntity = postEntity;
exports.putEntity = putEntity;
exports.deezerEntityApi = deezerEntityApi;
const bcrypt_1 = __importDefault(require("bcrypt"));
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const functions_1 = require("./functions");
const upserts_1 = require("./upserts");
const get_db_tables_and_columns_1 = require("./get_db_tables_and_columns");
// Decidi quale file .env usare in base a NODE_ENV
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv_1.default.config({ path: envFile });
const dbConfig = {
    host: process.env.HOST || "localhost",
    user: process.env.USER || "root",
    password: process.env.PASSWORD || "5vhpS8!2xxS88s4rbT8m7j",
    database: process.env.DATABASE || "mixto",
    dateStrings: true
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
//DA QUI IN GIU, LE FUNZIONI GIA ADATTATE A TYPESCRIPT
async function deleteEntity(req, res, tableName) {
    const id = req.params.id;
    const con = await getConnection();
    try {
        await con.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        await con.end();
        res.sendStatus(204);
    }
    catch (err) {
        res.status(500).json({ error: "Errore nell'eliminazione dell'entità" });
    }
}
function relationIsManyToOne(table1, table2) {
    const columns = get_db_tables_and_columns_1.dbTablesAndColumns[table1];
    if (columns === undefined) {
        return false;
    }
    for (const column of columns) {
        if (!table2.includes("_")) {
            //La tabella è una tabella di entità normale
            if (column.startsWith(`id_${table2}`)) {
                return true;
            }
        }
        else {
            //La tabella è usata per formare relazioni molti a molti
            const parts = table2.split("_");
            if (parts.length === 2 && (column.startsWith(`id_${parts[0]}`) || column.startsWith(`id_${parts[1]}`))) {
                return true;
            }
        }
    }
    return false;
}
function relationIsOneToMany(table1, table2) {
    const columns = get_db_tables_and_columns_1.dbTablesAndColumns[table2];
    if (columns === undefined) {
        return false;
    }
    for (const column of columns) {
        if (!table1.includes("_")) {
            //La tabella è una tabella di entità normale
            if (column.startsWith(`id_${table1}`)) {
                return true;
            }
        }
        else {
            //La tabella è usata per formare relazioni molti a molti
            const parts = table1.split("_");
            if (parts.length === 2 && (column.startsWith(`id_${parts[0]}`) || column.startsWith(`id_${parts[1]}`))) {
                return true;
            }
        }
    }
    return false;
}
function relationIsManyToMany(table1, table2) {
    return `${table1}_${table2}` in get_db_tables_and_columns_1.dbTablesAndColumns || `${table2}_${table1}` in get_db_tables_and_columns_1.dbTablesAndColumns;
}
function dbResultIsValid(res, array, entity, schema, tableName) {
    if (!array) {
        if (!schema.safeParse(entity).success) {
            //Passaggio necessario perchè i valori null del db sono undefined per gli schemi zod
            res.status(500).json({ error: `Entità associata ${tableName} non valida`, details: schema.safeParse(entity).error });
            return false;
        }
    }
    else {
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
async function getEntityWithAssociations(req, res, config) {
    const id = req.params.id;
    const con = await getConnection();
    try {
        //ESEGUI LA QUERY DI SELECT SULLA TABELLA PRINCIPALE
        const mainTableCols = config.mainTableColumns.map(col => `${config.mainTableName}.${col}`).join(", ");
        const [mainRows] = await con.execute(`SELECT ${mainTableCols} FROM ${config.mainTableName} WHERE ${config.mainTableName}.id = ?`, [id]);
        const mainEntity = mainRows[0];
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
                    const middleTableName = `${config.mainTableName}_${assoc.tableName}` in get_db_tables_and_columns_1.dbTablesAndColumns ? `${config.mainTableName}_${assoc.tableName}` : `${assoc.tableName}_${config.mainTableName}`;
                    const [rows] = await con.execute(`SELECT ${tableCols}
          FROM ${assoc.tableName}
          JOIN ${middleTableName} ON ${assoc.tableName}.id = ${middleTableName}.id_${assoc.tableName}
          WHERE ${middleTableName}.id_${config.mainTableName} = ?`, [id]);
                    if (!dbResultIsValid(res, true, rows, assoc.schema, assoc.tableName)) {
                        return;
                    }
                    mainEntity[assoc.tableName] = rows;
                }
                else if (relationIsManyToOne(config.mainTableName, assoc.tableName)) {
                    const columns = get_db_tables_and_columns_1.dbTablesAndColumns[config.mainTableName];
                    if (columns !== undefined) {
                        for (const column of columns) {
                            if (column.startsWith(`id_${assoc.tableName}`)) {
                                const [rows] = await con.execute(`SELECT ${assoc.columns.map(col => `${assoc.tableName}.${col}`).join(", ")}
                FROM ${assoc.tableName}
                WHERE ${assoc.tableName}.id = ?`, [mainEntity[column]]);
                                const row = rows[0];
                                if (!dbResultIsValid(res, false, row, assoc.schema, assoc.tableName)) {
                                    return;
                                }
                                mainEntity[assoc.tableName + column.substring((`id_${assoc.tableName}`).length)] = row;
                            }
                        }
                    }
                    else {
                        res.status(500).json({ error: `Manca la tabella ${config.mainTableName} nel db!` });
                    }
                }
                else if (relationIsOneToMany(config.mainTableName, assoc.tableName)) {
                    const columns = get_db_tables_and_columns_1.dbTablesAndColumns[assoc.tableName];
                    if (columns !== undefined) {
                        for (const column of columns) {
                            if (column.startsWith(`id_${config.mainTableName}`)) {
                                const [rows] = await con.execute(`SELECT ${assoc.columns.map(col => `${assoc.tableName}.${col}`).join(", ")}
                FROM ${assoc.tableName}
                WHERE ${column} = ?`, [mainEntity.id]);
                                if (!dbResultIsValid(res, true, rows, assoc.schema, assoc.tableName)) {
                                    return;
                                }
                                mainEntity[assoc.tableName + column.substring((`id_${config.mainTableName}`).length)] = rows;
                            }
                        }
                    }
                    else {
                        res.status(500).json({ error: `Manca la tabella ${config.mainTableName} nel db!` });
                    }
                }
                else {
                    res.status(500).json({ error: `Non è stato possibile riconoscere il tipo di relazione tra ${config.mainTableName} e ${assoc.tableName}` });
                    return;
                }
            }
        }
        res.json(mainEntity);
    }
    catch (err) {
        res.status(500).json({ error: "Errore in una delle query", details: err });
    }
    finally {
        await con.end();
    }
}
function getSqlOperatorString(operator) {
    switch (operator) {
        case "LIKE":
            return "LIKE";
        case "=":
            return "=";
        case "IN":
            return "IN";
        default:
            return "=";
    }
}
async function getFilteredEntitiesList(req, res, config) {
    let mainTableColumns = config.mainTableColumns.map(col => `${config.mainTableName}.${col}`);
    let selectCustomColumns = config.selectCustomColumns ? config.selectCustomColumns : [];
    let jsonArrayAggColumns = [];
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
            console.log("Stabilisco la relazione tra " + config.mainTableName + " e " + filter.joinedTableName);
            if (relationIsManyToMany(config.mainTableName, filter.joinedTableName)) {
                const middleTableName = `${config.mainTableName}_${filter.joinedTableName}` in get_db_tables_and_columns_1.dbTablesAndColumns ? `${config.mainTableName}_${filter.joinedTableName}` : `${filter.joinedTableName}_${config.mainTableName}`;
                joins += `LEFT JOIN ${middleTableName} AS ${middleTableName}_${i} ON ${config.mainTableName}.id = ${middleTableName}_${i}.id_${config.mainTableName}\n`;
                joins += `LEFT JOIN ${filter.joinedTableName} AS ${filter.joinedTableName}_${i} ON ${filter.joinedTableName}_${i}.id = ${middleTableName}_${i}.id_${filter.joinedTableName}\n`;
            }
            else if (relationIsManyToOne(config.mainTableName, filter.joinedTableName)) {
                joins += `LEFT JOIN ${filter.joinedTableName} AS ${filter.joinedTableName}_${i} ON ${filter.joinedTableName}_${i}.id = ${config.mainTableName}.id_${filter.joinedTableName}${filter.joinColumnSuffix ? `_${filter.joinColumnSuffix}` : ""}\n`;
            }
            else if (relationIsOneToMany(config.mainTableName, filter.joinedTableName)) {
                joins += `LEFT JOIN ${filter.joinedTableName} AS ${filter.joinedTableName}_${i} ON ${filter.joinedTableName}_${i}.id_${config.mainTableName}${filter.joinColumnSuffix ? `_${filter.joinColumnSuffix}` : ""} = ${config.mainTableName}.id\n`;
            }
        }
    }
    const finalQuery = selectStatement + joins + whereStatement + groupByStatement + orderByStatement + limitOffset;
    const con = await getConnection();
    try {
        const [rows] = await con.execute(finalQuery);
        for (let row of rows) {
            if (config.mainTableSchema !== undefined && !dbResultIsValid(res, false, row, config.mainTableSchema, config.mainTableName)) {
                //console.log("Questa row non ha fatto passare la validazione di zod:");
                //console.log(row);
                return;
            }
            for (const queryJoin of config.filtersAndJoins) {
                if (!("value" in queryJoin)) {
                    let keyName = `${queryJoin.joinedTableName}${queryJoin.joinColumnSuffix ? `_${queryJoin.joinColumnSuffix}` : ""}_array`;
                    if (keyName in row) {
                        if (queryJoin.schema !== undefined && !dbResultIsValid(res, true, row[keyName], queryJoin.schema, keyName)) {
                            //console.log("Questa row non ha fatto passare la validazione di zod:");
                            //console.log(row);
                            return;
                        }
                    }
                }
            }
        }
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: "Errore nella query", details: err });
    }
    finally {
        await con.end();
    }
}
async function postEntity(req, res, config) {
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
        const [result] = await con.execute(`INSERT INTO ${mainTableName} (${columns}) VALUES (${placeholders})`, values);
        //1.5 Se si verifica l'errore di chiave duplicata, rispondi con 400
        if (result.affectedRows === 0) {
            res.status(400).json({ error: "Chiave duplicata" });
            return;
        }
        // 2. Recupera l'id della nuova riga
        const insertId = result.insertId;
        // 3. Inserisci le associazioni nelle tabelle di join
        for (const assocTable in assocTablesAndIds) {
            if (assocTablesAndIds[assocTable] !== undefined) {
                const ids = assocTablesAndIds[assocTable];
                // Nome tabella di join (in ordine alfabetico, separato da _)
                const joinTable = mainTableName + "_" + assocTable in get_db_tables_and_columns_1.dbTablesAndColumns ? mainTableName + "_" + assocTable : assocTable + "_" + mainTableName;
                if (!(joinTable in get_db_tables_and_columns_1.dbTablesAndColumns)) {
                    res.status(500).json({ error: `Tabella di join ${joinTable} non trovata nel database` });
                    return;
                }
                // Chiave esterna per la tabella principale e associata
                const mainKey = `id_${mainTableName.toLowerCase()}`;
                const assocKey = `id_${assocTable.toLowerCase()}`;
                for (const assocId of ids) {
                    await con.execute(`INSERT INTO ${joinTable} (${mainKey}, ${assocKey}) VALUES (?, ?)`, [insertId, assocId]);
                }
            }
        }
        await con.end();
        // 4. Risposta con id della nuova entità
        res.json({ id: insertId });
    }
    catch (err) {
        res.status(500).json({ error: "Errore nella creazione dell'entità", details: err });
    }
}
async function putEntity(req, res, config) {
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
        const [result] = await con.execute(`UPDATE ${mainTableName} SET ${columnsAndPlaceholders} WHERE id = ?`, [...values, mainTableNewRowValues.id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: "Entità non trovata" });
            return;
        }
        // 2. Inserisci le associazioni nelle tabelle di join (eliminando prima le vecchie se richiesto)
        for (const assocTable in assocTablesAndIds) {
            if (assocTablesAndIds[assocTable] !== undefined) {
                const ids = assocTablesAndIds[assocTable];
                // Nome tabella di join (in ordine alfabetico, separato da _)
                const joinTable = mainTableName + "_" + assocTable in get_db_tables_and_columns_1.dbTablesAndColumns ? mainTableName + "_" + assocTable : assocTable + "_" + mainTableName;
                if (!(joinTable in get_db_tables_and_columns_1.dbTablesAndColumns)) {
                    res.status(500).json({ error: `Tabella di join ${joinTable} non trovata nel database` });
                    return;
                }
                if (!config.deleteOldAssociationsFirst) {
                    // Elimina tutte le associazioni vecchie
                    await con.execute(`DELETE FROM ${joinTable} WHERE id_${mainTableName.toLowerCase()} = ?`, [mainTableNewRowValues.id]);
                }
                // Chiave esterna per la tabella principale e associata
                const mainKey = `id_${mainTableName.toLowerCase()}`;
                const assocKey = `id_${assocTable.toLowerCase()}`;
                for (const assocId of ids) {
                    await con.execute(`INSERT IGNORE INTO ${joinTable} (${mainKey}, ${assocKey}) VALUES (?, ?)`, [req.params.id, assocId]);
                }
            }
        }
        await con.end();
        // 4. Risposta con id della nuova entità
        res.status(200).json();
    }
    catch (err) {
        res.status(500).json({ error: "Errore nella creazione dell'entità", details: err });
    }
}
function fromSecondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
// Overloads for type-safe mapping from Deezer entity to DB entity
function fromDeezerEntityToDbEntity(entity, tableName, param) {
    switch (tableName) {
        case "Artista":
            return { id: entity.id, nome: entity.name };
        case "Album":
            return { id: entity.id, titolo: entity.title, data_uscita: entity.release_date !== undefined ? entity.release_date : null };
        case "Genere":
            return { id: entity.id, nome: entity.name };
        case "Brano":
            const brano = entity;
            const album = brano.album;
            if (album !== undefined) {
                return {
                    id: brano.id,
                    titolo: brano.title,
                    durata: fromSecondsToTime(brano.duration),
                    id_album: album.id
                };
            }
            else {
                return {
                    id: brano.id,
                    titolo: brano.title,
                    durata: fromSecondsToTime(brano.duration),
                    id_album: Number(param)
                };
            }
        default:
            throw new Error("Tabella non supportata");
    }
}
function getPicturesFolder(tableName) {
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
async function upsertAssociations(tableName, associations) {
    //Questa funzione deve eseguire l'upsert di tutte le associazioni passate in associations, sulla tabella album_genere o brano_artista
    //Per ogni associazione, se non esiste, va inserita
    //Se esiste già, non va fatto nulla (non ci sono altri campi da aggiornare)
    if (associations[0] !== undefined) {
        const con = await getConnection();
        await con.beginTransaction();
        try {
            for (let assoc of associations) {
                if (tableName === "album_genere") {
                    assoc = assoc;
                    const [rows] = await con.execute(`SELECT * FROM ${tableName} WHERE id_album = ? AND id_genere = ?`, [assoc.id_album, assoc.id_genere]);
                    if (rows.length === 0) {
                        await con.execute(`INSERT INTO ${tableName} (id_album, id_genere) VALUES (?, ?)`, [assoc.id_album, assoc.id_genere]);
                    }
                }
                else if (tableName === "brano_artista") {
                    assoc = assoc;
                    const [rows] = await con.execute(`SELECT * FROM ${tableName} WHERE id_brano = ? AND id_artista = ?`, [assoc.id_brano, assoc.id_artista]);
                    if (rows.length === 0) {
                        await con.execute(`INSERT INTO ${tableName} (id_brano, id_artista) VALUES (?, ?)`, [assoc.id_brano, assoc.id_artista]);
                    }
                }
            }
            await con.commit();
        }
        catch (error) {
            await con.rollback();
            throw error;
        }
        finally {
            await con.end();
        }
    }
}
async function deleteOldAssociations(tableName, associations) {
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
                    assoc = assoc;
                    await con.execute(`DELETE FROM ${tableName} WHERE id_album = ?`, [assoc.id_album]);
                }
                else if (tableName === "brano_artista") {
                    assoc = assoc;
                    await con.execute(`DELETE FROM ${tableName} WHERE id_brano = ?`, [assoc.id_brano]);
                }
            }
            await con.commit();
        }
        catch (error) {
            await con.rollback();
            throw error;
        }
        finally {
            await con.end();
        }
    }
}
async function updateDeezerApiCalls(key, value) {
    //Usare il database mixto_api_calls e la tabella deezer_api_calls con le colonne url (stringa, chiave primaria) e date (stringa)
    const con = await getConnection();
    const [rows] = await con.execute(`SELECT * FROM mixto_api_calls.deezer_api_calls WHERE url = ?`, [key]);
    if (rows.length > 0) {
        await con.execute(`UPDATE mixto_api_calls.deezer_api_calls SET date = ? WHERE url = ?`, [value, key]);
    }
    else {
        await con.execute(`INSERT IGNORE INTO mixto_api_calls.deezer_api_calls (url, date) VALUES (?, ?)`, [key, value]);
    }
    con.end();
}
async function getDeezerApiCalls(key) {
    const con = await getConnection();
    const [rows] = await con.execute(`SELECT date FROM mixto_api_calls.deezer_api_calls WHERE url = ?`, [key]);
    con.end();
    return rows.length > 0 ? rows[0].date : undefined;
}
//FUNZIONE GIA ADATTATA A TYPESCRIPT
async function deezerEntityApi(req, res, apisConfig) {
    if (apisConfig.maxOneCallPerDay === true && await getDeezerApiCalls(req.originalUrl) == new Date().toISOString().split('T')[0]) {
        res.status(200).json({ error: "API già chiamata oggi. Il risultato di questa richiesta è già stato memorizzato. Potrà essere aggiornato domani" });
        return;
    }
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
            const entityObjects = entityConfig.getEntityObjectsFromResponse(response);
            const con = await getConnection();
            for (const obj of entityObjects) {
                if (!(0, functions_1.isValidDeezerObject)(res, obj, entityConfig.deezerEntitySchema)) {
                    return;
                }
                await (0, upserts_1.upsertEntitaDeezer)(con, fromDeezerEntityToDbEntity(obj, entityConfig.tableName, param), entityConfig.tableName);
                await (0, functions_1.uploadPhoto)(getPicturesFolder(entityConfig.tableName), obj);
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
                const mainEntityObjects = entityConfig.getEntityObjectsFromResponse(response);
                res.json(mainEntityObjects.map((obj) => { return fromDeezerEntityToDbEntity(obj, entityConfig.tableName, param); }));
                if (apisConfig.maxOneCallPerDay === true) {
                    //Questa API non è ancora stata chiamata oggi, quindi aggiorna il file
                    await updateDeezerApiCalls(req.originalUrl, new Date().toISOString().split('T')[0]);
                }
                break;
            }
        }
    }
    catch (err) {
        console.log("Guarda questo errore:");
        console.log(err);
        res.status(500).json({ error: "Errore su questa Api legata a Deezer" });
    }
}
//# sourceMappingURL=apiroutes.js.map