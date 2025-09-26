import { AlbumDeezerBasic, AlbumDeezerBasicSchema, ArtistaDeezerBasic, ArtistaDeezerBasicSchema, BranoDeezerBasicSchema, DeezerResponseDataItemsArray, DeezerResponseDataItemsArraySchema, DeezerResponseSingleItem, DeezerResponseSingleItemSchema, GenereDeezerBasic, GenereDeezerBasicSchema, GenereDeezerSemplificato, GenereDeezerSemplificatoSchema } from "../src/deezer_types";
import fs from "fs";
import path from "path";
import axios from "axios";
import request from "supertest";
import { Express } from "express";
import mysql from "mysql2/promise";

export async function prepareMocksForDeezerResponse(mockDeezerResponseRaw: any, deezerApiCallUrl: string, mockedAxios: jest.Mocked<typeof axios>) {
    mockedAxios.get.mockImplementation((url: string) => {
        //Mock della risposta principale di Deezer
        if (url === deezerApiCallUrl) {
            return Promise.resolve({ status: 200, data: mockDeezerResponseRaw });
        }
        //E se ci sono URL inattesi...
        return Promise.reject(new Error("Unexpected URL: " + url));
    });
    return Promise.resolve();
}

export async function initializeOrRestoreDb(insertQueriesAfterTablesTruncate: string[]): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            //Questo metodo deve partire da uno schema mixto completamente pulito e senza tabelle, altrimenti non va
            const originalDB = "mixto";
            const connection = await mysql.createConnection({
                host: process.env.HOST || "localhost",
                user: process.env.USER || "root",
                password: process.env.PASSWORD || "5vhpS8!2xxS88s4rbT8m7j",
                dateStrings: true
            });
            // 2️⃣ disabilita temporaneamente le foreign key
            await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);
            // 3️⃣ ottieni la lista delle tabelle dal database originale
            const [tables] = await connection.query(
                `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
                [originalDB]
            );
            // 4️⃣ svuota tutte le tabelle
            for (const row of tables as any[]) {
                const tableName = row.TABLE_NAME;
                await connection.query(`TRUNCATE TABLE \`${originalDB}\`.\`${tableName}\``);
            }
            await connection.query(`USE \`${originalDB}\``);
            //Qui esegui altre query per popolare il database con dati fittizi
            for (let i = 0; i < insertQueriesAfterTablesTruncate.length; i++) {
                const query = insertQueriesAfterTablesTruncate[i];
                if (typeof query === "string") {
                    await connection.query(query);
                }
            }
            // 5️⃣ riabilita le foreign key
            await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);
            await connection.end();
            resolve("Database di test inizializzato o ripristinato correttamente!");
        } catch (error) {
            console.error("Errore nella inizializzazione o ripristino del database di test:", error);
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
        database: process.env.DATABASE || "mixto",
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
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expectedResponse);
}
