"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareMocksForDeezerResponseAndImages = prepareMocksForDeezerResponseAndImages;
exports.deletePicturesToBeDownloaded = deletePicturesToBeDownloaded;
exports.checkThatPicturesWereDownloaded = checkThatPicturesWereDownloaded;
exports.testPicturesDownload = testPicturesDownload;
exports.createOrDeleteTablesOnTestDb = createOrDeleteTablesOnTestDb;
exports.checkDbUpsert = checkDbUpsert;
exports.checkApiSuccessResponse = checkApiSuccessResponse;
const deezer_types_1 = require("../src/deezer_types");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supertest_1 = __importDefault(require("supertest"));
const promise_1 = __importDefault(require("mysql2/promise"));
function extractImageUrlsFromDeezerResponse(obj, imageUrlToFileNameMappings) {
    //C'è un problema qui dentro!!
    if (typeof obj !== "object" || obj === null) {
        return;
    }
    if (deezer_types_1.GenereDeezerBasicSchema.safeParse(obj).success) {
        let genere = obj;
        const fileName = path_1.default.join(__dirname, `./mock_deezer_pictures/generi_pictures`, genere.id + ".jpg");
        imageUrlToFileNameMappings.push({ url: genere.picture_big, fileName: fileName });
    }
    else if (deezer_types_1.AlbumDeezerBasicSchema.safeParse(obj).success) {
        let album = obj;
        const fileName = path_1.default.join(__dirname, `./mock_deezer_pictures/album_pictures`, album.id + ".jpg");
        imageUrlToFileNameMappings.push({ url: album.cover_big, fileName: fileName });
    }
    else if (deezer_types_1.ArtistaDeezerBasicSchema.safeParse(obj).success) {
        let artista = obj;
        const fileName = path_1.default.join(__dirname, `./mock_deezer_pictures/artisti_pictures`, artista.id + ".jpg");
        imageUrlToFileNameMappings.push({ url: artista.picture_big, fileName: fileName });
    }
    else if (deezer_types_1.GenereDeezerSemplificatoSchema.safeParse(obj).success) {
        let genere = obj;
        const fileName = path_1.default.join(__dirname, `./mock_deezer_pictures/generi_pictures`, genere.id + ".jpg");
        imageUrlToFileNameMappings.push({ url: genere.picture, fileName: fileName });
    }
    let keys = Object.keys(obj);
    for (const key of keys) {
        extractImageUrlsFromDeezerResponse(obj[key], imageUrlToFileNameMappings);
    }
}
async function prepareMocksForDeezerResponseAndImages(mockDeezerResponseRaw, deezerApiCallUrl, mockedAxios) {
    const imageUrlToFileNameMappings = [];
    extractImageUrlsFromDeezerResponse(mockDeezerResponseRaw, imageUrlToFileNameMappings);
    let notFoundFiles = [];
    for (let mapping of imageUrlToFileNameMappings) {
        if (!fs_1.default.existsSync(mapping.fileName)) {
            notFoundFiles.push({ url: mapping.url, fileName: mapping.fileName });
        }
    }
    if (notFoundFiles.length > 0) {
        throw new Error(`File dell'immagine non trovati:\n${notFoundFiles.map(mapping => "{\"fileName\": \"" + mapping.fileName.replace(/\\/g, "\\\\") + "\", \"url\": \"" + mapping.url + "\"},").join("\n")}.\nMettili nella cartella dei mock!`);
    }
    mockedAxios.get.mockImplementation((url) => {
        //Mock della risposta principale di Deezer
        if (url === deezerApiCallUrl) {
            return Promise.resolve({ status: 200, data: mockDeezerResponseRaw });
        }
        for (let mapping of imageUrlToFileNameMappings) {
            if (mapping.url === url) {
                return Promise.resolve({ status: 200, data: fs_1.default.createReadStream(mapping.fileName) });
            }
        }
        //E se ci sono URL inattesi...
        return Promise.reject(new Error("Unexpected URL: " + url));
    });
    return Promise.resolve();
}
/**
 * Elimina le immagini che andranno scaricate nella cartella src/[picturesFolder]
 * @param picturesFolder
 * @param imageUrlToFile
 */
async function deletePicturesToBeDownloaded(photosIdToDownload) {
    return new Promise((resolve) => {
        for (const picturesFolder in photosIdToDownload) {
            const picturesDir = path_1.default.join(__dirname, "../src/" + picturesFolder);
            for (let id of picturesFolder) {
                const filePath = path_1.default.join(picturesDir, `${id}.jpg`);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
        }
        resolve("OK");
    });
}
/**
 * Controlla che le immagini da scaricare siano state effettivamente scaricate e che siano identiche a quelle della cartella mocks/[picturesFolder]
 * @param picturesFolder
 * @param imageUrlToFile
 */
async function checkThatPicturesWereDownloaded(photosIdToDownload) {
    return new Promise((resolve) => {
        for (const picturesFolder in photosIdToDownload) {
            const picturesDir = path_1.default.join(__dirname, "../src/" + picturesFolder);
            const mocksDir = path_1.default.join(__dirname, "./mock_deezer_pictures/" + picturesFolder);
            if (photosIdToDownload[picturesFolder] !== undefined) {
                for (let id of photosIdToDownload[picturesFolder]) {
                    const mockFilePath = path_1.default.join(mocksDir, `${id}.jpg`);
                    const actualFilePath = path_1.default.join(picturesDir, `${id}.jpg`);
                    expect(fs_1.default.existsSync(actualFilePath)).toBe(true);
                    expect(fs_1.default.readFileSync(actualFilePath).length).toBe(fs_1.default.readFileSync(mockFilePath).length);
                    expect(fs_1.default.readFileSync(actualFilePath)).toEqual(fs_1.default.readFileSync(mockFilePath));
                }
            }
        }
        resolve("OK");
    });
}
//FA CHIAMATE API
async function testPicturesDownload(photosIdToDownload, testApiCallUrl, app) {
    if (photosIdToDownload === undefined) {
        return;
    }
    await deletePicturesToBeDownloaded(photosIdToDownload);
    const res = await (0, supertest_1.default)(app).get(testApiCallUrl);
    expect(res.status).toBe(200);
    await checkThatPicturesWereDownloaded(photosIdToDownload);
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
                password: process.env.PASSWORD || "5vhpS8!2xxS88s4rbT8m7j"
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