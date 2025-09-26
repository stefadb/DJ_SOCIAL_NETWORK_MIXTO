"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareMocksForDeezerResponse = prepareMocksForDeezerResponse;
exports.createOrDeleteTablesOnTestDb = createOrDeleteTablesOnTestDb;
exports.checkDbUpsert = checkDbUpsert;
exports.checkApiSuccessResponse = checkApiSuccessResponse;
const supertest_1 = __importDefault(require("supertest"));
const promise_1 = __importDefault(require("mysql2/promise"));
async function prepareMocksForDeezerResponse(mockDeezerResponseRaw, deezerApiCallUrl, mockedAxios) {
    mockedAxios.get.mockImplementation((url) => {
        //Mock della risposta principale di Deezer
        if (url === deezerApiCallUrl) {
            return Promise.resolve({ status: 200, data: mockDeezerResponseRaw });
        }
        //E se ci sono URL inattesi...
        return Promise.reject(new Error("Unexpected URL: " + url));
    });
    return Promise.resolve();
}
async function createOrDeleteTablesOnTestDb(queriesAfterDbInit, createTables) {
    return new Promise(async (resolve, reject) => {
        try {
            //Questo metodo deve partire da uno schema mixto_test completamente pulito e senza tabelle, altrimenti non va
            const originalDB = "mixto";
            const testDB = "mixto_test";
            const connection = await promise_1.default.createConnection({
                host: process.env.HOST || "localhost",
                user: process.env.USER || "root",
                password: process.env.PASSWORD || "5vhpS8!2xxS88s4rbT8m7j",
                dateStrings: true
            });
            if (createTables) {
                await connection.query(`DROP DATABASE IF EXISTS \`${testDB}\``);
                await connection.query(`CREATE DATABASE \`${testDB}\``);
                // 2️⃣ disabilita temporaneamente le foreign key
                await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);
                // 3️⃣ ottieni la lista delle tabelle dal database originale
                const [tables] = await connection.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`, [originalDB]);
                // 4️⃣ crea tutte le tabelle nel db di test
                for (const row of tables) {
                    const tableName = row.TABLE_NAME;
                    await connection.query(`CREATE TABLE \`${testDB}\`.\`${tableName}\` LIKE \`${originalDB}\`.\`${tableName}\``);
                }
                // 5️⃣ riabilita le foreign key
                await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);
            }
            else {
                await connection.query(`DROP DATABASE IF EXISTS \`${testDB}\``);
            }
            if (queriesAfterDbInit) {
                await connection.query(`USE \`${testDB}\``);
                //Qui esegui altre query per popolare il database di test con dati fittizi
                for (let i = 0; i < queriesAfterDbInit.length; i++) {
                    const query = queriesAfterDbInit[i];
                    if (typeof query === "string") {
                        await connection.query(query);
                    }
                }
            }
            await connection.end();
            resolve("Database di test " + (createTables ? "creato" : "eliminato") + " correttamente!");
        }
        catch (error) {
            console.error("Errore nella " + (createTables ? "creazione" : "eliminazione") + " del database di test:", error);
            reject(error);
        }
    });
}
//FA CHIAMATE API
async function checkDbUpsert(sqlQuery, testApiCallUrl, app, expectedQueryResult) {
    const res = await (0, supertest_1.default)(app).get(testApiCallUrl);
    //CONTROLLA CHE IL JSON RESTITUITO SIA QUELLO ATTESO
    expect(res.status).toBe(200);
    //Controlla che sul db gli artisti siano esattamente quelli attesi
    const con = await promise_1.default.createConnection({
        host: process.env.HOST || "localhost",
        user: process.env.USER || "root",
        password: process.env.PASSWORD || "5vhpS8!2xxS88s4rbT8m7j",
        database: process.env.DATABASE || "mixto_test",
        dateStrings: true
    });
    const [rows] = await con.query(sqlQuery);
    //QUI C'è UN PROBLEMA, O CON LA FUNZIONE STESSA O CON QUELLE CHE LA CHIAMANO!!!
    //TANTE VOLTE, rows e expectedQueryResult NON SONO UGUALI!!
    //PERCHè I DATI EFFETTIVAMENTE INSERITI SUL DB NON SONO QUELLI ATTESI!!
    expect(rows).toEqual(expectedQueryResult);
    await con.end();
}
//FA CHIAMATE API
async function checkApiSuccessResponse(testApiCallUrl, app, expectedResponse) {
    const res = await (0, supertest_1.default)(app).get(testApiCallUrl);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expectedResponse);
}
//# sourceMappingURL=common_functions.js.map