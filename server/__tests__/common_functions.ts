import { AlbumDeezerBasic, AlbumDeezerBasicSchema, ArtistaDeezerBasic, ArtistaDeezerBasicSchema, BranoDeezerBasicSchema, DeezerResponseDataItemsArray, DeezerResponseDataItemsArraySchema, DeezerResponseSingleItem, DeezerResponseSingleItemSchema, GenereDeezerBasic, GenereDeezerBasicSchema, GenereDeezerSemplificato, GenereDeezerSemplificatoSchema } from "../src/deezer_types";
import fs from "fs";
import path from "path";
import axios from "axios";
import request from "supertest";
import { Express } from "express";
import mysql from "mysql2/promise";
import { ImageUrlFileNameMapping } from "./types";

function extractImageUrlsFromDeezerResponse(obj: any, imageUrlToFileNameMappings: ImageUrlFileNameMapping[]) {
    //C'è un problema qui dentro!!
    if (typeof obj !== "object" || obj === null) {
        return;
    }
    if (GenereDeezerBasicSchema.safeParse(obj).success) {
        let genere = obj as GenereDeezerBasic;
        const fileName = path.join(__dirname, `./mock_deezer_pictures/generi_pictures`, genere.id + ".jpg");
        imageUrlToFileNameMappings.push({ url: genere.picture_big, fileName: fileName });
    } else if (AlbumDeezerBasicSchema.safeParse(obj).success) {
        let album = obj as AlbumDeezerBasic;
        const fileName = path.join(__dirname, `./mock_deezer_pictures/album_pictures`, album.id + ".jpg");
        imageUrlToFileNameMappings.push({ url: album.cover_big, fileName: fileName });
    } else if (ArtistaDeezerBasicSchema.safeParse(obj).success) {
        let artista = obj as ArtistaDeezerBasic;
        const fileName = path.join(__dirname, `./mock_deezer_pictures/artisti_pictures`, artista.id + ".jpg");
        imageUrlToFileNameMappings.push({ url: artista.picture_big, fileName: fileName });
    } else if (GenereDeezerSemplificatoSchema.safeParse(obj).success) {
        let genere = obj as GenereDeezerSemplificato;
        const fileName = path.join(__dirname, `./mock_deezer_pictures/generi_pictures`, genere.id + ".jpg");
        imageUrlToFileNameMappings.push({ url: genere.picture, fileName: fileName });
    }
    let keys = Object.keys(obj);
    for (const key of keys) {
        extractImageUrlsFromDeezerResponse(obj[key], imageUrlToFileNameMappings);
    }
}

export async function prepareMocksForDeezerResponseAndImages(mockDeezerResponseRaw: any, deezerApiCallUrl: string, mockedAxios: jest.Mocked<typeof axios>) {
    const imageUrlToFileNameMappings: ImageUrlFileNameMapping[] = [];
    extractImageUrlsFromDeezerResponse(mockDeezerResponseRaw, imageUrlToFileNameMappings);
    let notFoundFiles: ImageUrlFileNameMapping[] = [];
    for (let mapping of imageUrlToFileNameMappings) {
        if (!fs.existsSync(mapping.fileName)) {
            notFoundFiles.push({ url: mapping.url, fileName: mapping.fileName });
        }
    }
    if (notFoundFiles.length > 0) {
        throw new Error(`File dell'immagine non trovati:\n${notFoundFiles.map(mapping => "{\"fileName\": \"" + mapping.fileName.replace(/\\/g, "\\\\") + "\", \"url\": \"" + mapping.url + "\"},").join("\n")}.\nMettili nella cartella dei mock!`);
    }
    mockedAxios.get.mockImplementation((url: string) => {
        //Mock della risposta principale di Deezer
        if (url === deezerApiCallUrl) {
            return Promise.resolve({ status: 200, data: mockDeezerResponseRaw });
        }
        for (let mapping of imageUrlToFileNameMappings) {
            if (mapping.url === url) {
                return Promise.resolve({ status: 200, data: fs.createReadStream(mapping.fileName) });
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
export async function deletePicturesToBeDownloaded(photosIdToDownload: { [picturesFolder: string]: number[] }) {
    return new Promise((resolve) => {
        for (const picturesFolder in photosIdToDownload) {
            const picturesDir = path.join(__dirname, "../src/" + picturesFolder);
            for (let id of picturesFolder) {
                const filePath = path.join(picturesDir, `${id}.jpg`);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
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
export async function checkThatPicturesWereDownloaded(photosIdToDownload: { [picturesFolder: string]: number[] }) {
    return new Promise((resolve) => {
        for (const picturesFolder in photosIdToDownload) {
            const picturesDir = path.join(__dirname, "../src/" + picturesFolder);
            const mocksDir = path.join(__dirname, "./mock_deezer_pictures/" + picturesFolder);
            if (photosIdToDownload[picturesFolder] !== undefined) {
                for (let id of photosIdToDownload[picturesFolder]) {
                    const mockFilePath = path.join(mocksDir, `${id}.jpg`);
                    const actualFilePath = path.join(picturesDir, `${id}.jpg`);
                    expect(fs.existsSync(actualFilePath)).toBe(true);
                    expect(fs.readFileSync(actualFilePath).length).toBe(fs.readFileSync(mockFilePath).length);
                    expect(fs.readFileSync(actualFilePath)).toEqual(fs.readFileSync(mockFilePath));
                }
            }
        }
        resolve("OK");
    });
}

//FA CHIAMATE API
export async function testPicturesDownload(photosIdToDownload: { [picturesFolder: string]: number[] } | undefined, testApiCallUrl: string, app: Express) {
    if (photosIdToDownload === undefined) {
        return;
    }
    await deletePicturesToBeDownloaded(photosIdToDownload);
    const res = await request(app).get(testApiCallUrl);
    expect(res.status).toBe(200);
    await checkThatPicturesWereDownloaded(photosIdToDownload);
}


export async function createOrDeleteTablesOnTestDb(queriesAfterDbInit: string[] | undefined, createTables: boolean): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            //Questo metodo deve partire da uno schema mixto_test completamente pulito e senza tabelle, altrimenti non va
            const originalDB = "mixto";
            const testDB = "mixto_test";
            const connection = await mysql.createConnection({
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
                const [tables] = await connection.query(
                    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
                    [originalDB]
                );
                // 4️⃣ crea tutte le tabelle nel db di test
                for (const row of tables as any[]) {
                    const tableName = row.TABLE_NAME;
                    await connection.query(`CREATE TABLE \`${testDB}\`.\`${tableName}\` LIKE \`${originalDB}\`.\`${tableName}\``);
                }
                // 5️⃣ riabilita le foreign key
                await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);
            } else {
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
        } catch (error) {
            console.error("Errore nella " + (createTables ? "creazione" : "eliminazione") + " del database di test:", error);
            reject(error);
        }
    });
}

//FA CHIAMATE API
export async function checkDbUpsert(sqlQuery: string, testApiCallUrl: string, app: Express, expectedQueryResult: Record<string, any>[]) {
    const res = await request(app).get(testApiCallUrl);
    //CONTROLLA CHE IL JSON RESTITUITO SIA QUELLO ATTESO
    expect(res.status).toBe(200);
    //Controlla che sul db gli artisti siano esattamente quelli attesi
    const con = await mysql.createConnection({
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
export async function checkApiSuccessResponse(testApiCallUrl: string, app: Express, expectedResponse: Record<string, any> | Record<string, any>[]) {
    const res = await request(app).get(testApiCallUrl);
    if(res.status !== 200){
        console.log("Ecco l'errore !");
        console.log(res.body);
    }
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expectedResponse);
}
