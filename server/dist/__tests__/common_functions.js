"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageUrlToFileMappingFromDeezerResponse = getImageUrlToFileMappingFromDeezerResponse;
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
/**
 * Dalla risposta di Deezer, ricava tutti gli url delle immagini che l'API deve scaricare e li mappa ai nomi dei file corrispondenti
 * @param mockDeezerResponseRaw deve essere di tipo DeezerResponseSingleItem | DeezerResponseMultipleItems, altrimenti il safeParse restituisce errore
 * @returns Un oggetto che mappa gli url delle immagini ai nomi dei file
 */
function getImageUrlToFileMappingFromDeezerResponse(mockDeezerResponseRaw) {
    let mockDeezerResponse;
    //Fai il safeParse della mockDeezerResponse
    const safeParse1 = deezer_types_1.DeezerResponseSingleItemSchema.safeParse(mockDeezerResponseRaw);
    if (safeParse1.success) {
        mockDeezerResponse = safeParse1.data;
    }
    else {
        const safeParse2 = deezer_types_1.DeezerResponseMultipleItemsSchema.safeParse(mockDeezerResponseRaw);
        if (safeParse2.success) {
            mockDeezerResponse = safeParse2.data;
        }
        else {
            throw new Error("mockDeezerResponseRaw does not match any of the expected schemas");
        }
    }
    let toReturn = "data" in mockDeezerResponse ? /* Deeezer ha restituito un array*/
        mockDeezerResponse.data.filter((item) => "picture_big" in item || "cover_big" in item).map((item) => {
            return { url: "picture_big" in item ? item.picture_big : item.cover_big, fileName: `${item.id}.jpg` };
        })
        :
            /* Deezer ha restituito un singolo oggetto. Potrebbe sia avere che non avere l'immagine*/
            ("picture_big" in mockDeezerResponse || "cover_big" in mockDeezerResponse) ? /* Deezer ha restituito un singolo oggetto con immagine */
                [{ url: "picture_big" in mockDeezerResponse ? mockDeezerResponse.picture_big : mockDeezerResponse.cover_big, fileName: `${mockDeezerResponse.id}.jpg` }]
                :
                    /* Deezer ha restituito un singolo oggetto senza immagine */
                    [];
    //Restituisci l'array dei mapping
    //TODO: valuta un modo più efficiente per fare questa roba, senza usare la push
    return toReturn;
}
async function prepareMocksForDeezerResponseAndImages(mockDeezerResponseRaw, picturesFolder, deezerApiCallUrl, mockedAxios) {
    mockedAxios.get.mockImplementation((url) => {
        const imageUrlToFileNameMappings = getImageUrlToFileMappingFromDeezerResponse(mockDeezerResponseRaw);
        //Mock della risposta principale di Deezer
        if (url === deezerApiCallUrl) {
            return Promise.resolve({ status: 200, data: mockDeezerResponseRaw });
        }
        if (picturesFolder) {
            //Mock delle immagini
            for (let mapping of imageUrlToFileNameMappings) {
                if (mapping.url === url) {
                    const imgPath = path_1.default.join(__dirname, `./mock_deezer_pictures/${picturesFolder}`, mapping.fileName);
                    return Promise.resolve({ status: 200, data: fs_1.default.createReadStream(imgPath) });
                }
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
async function deletePicturesToBeDownloaded(picturesFolder, imageUrlToFileNameMappings) {
    return new Promise((resolve) => {
        const picturesDir = path_1.default.join(__dirname, "../src/" + picturesFolder);
        for (let mapping of imageUrlToFileNameMappings) {
            const filePath = path_1.default.join(picturesDir, mapping.fileName);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
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
async function checkThatPicturesWereDownloaded(picturesFolder, imageUrlToFileNameMappings) {
    return new Promise((resolve) => {
        const picturesDir = path_1.default.join(__dirname, "../src/" + picturesFolder);
        const mocksDir = path_1.default.join(__dirname, "./mock_deezer_pictures/" + picturesFolder);
        for (let mapping of imageUrlToFileNameMappings) {
            const mockFilePath = path_1.default.join(mocksDir, mapping.fileName);
            const actualFilePath = path_1.default.join(picturesDir, mapping.fileName);
            expect(fs_1.default.existsSync(actualFilePath)).toBe(true);
            expect(fs_1.default.readFileSync(actualFilePath)).toEqual(fs_1.default.readFileSync(mockFilePath));
        }
        resolve("OK");
    });
}
//FA CHIAMATE API
async function testPicturesDownload(picturesFolder, mockDeezerResponseRaw, testApiCallUrl, app) {
    const imageUrlToFileNameMappings = getImageUrlToFileMappingFromDeezerResponse(mockDeezerResponseRaw);
    await deletePicturesToBeDownloaded(picturesFolder, imageUrlToFileNameMappings);
    const res = await (0, supertest_1.default)(app).get(testApiCallUrl);
    expect(res.status).toBe(200);
    await checkThatPicturesWereDownloaded(picturesFolder, imageUrlToFileNameMappings);
}
async function createOrDeleteTablesOnTestDb(addRowsToTables, createTables) {
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
            if (!createTables) {
                // 2️⃣ disabilita temporaneamente le foreign key
                await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);
                // 3️⃣ ottieni la lista delle tabelle dal database originale
                const [tables] = await connection.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`, [originalDB]);
                // 4️⃣ crea tutte le tabelle nel db di test
                for (const row of tables) {
                    const tableName = row.TABLE_NAME;
                    await connection.query(`DELETE FROM \`${testDB}\`.\`${tableName}\``);
                }
                // 5️⃣ riabilita le foreign key
                await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);
            }
            if (addRowsToTables) {
                //Qui esegui altre query per popolare il database di test con dati fittizi
            }
            await connection.end();
            resolve("Database di test modificato correttamente!");
        }
        catch (error) {
            console.error("Errore nella modifica del database di test:", error);
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