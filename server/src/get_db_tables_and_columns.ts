//Scrivere una funzione che, leggendo il database mysql al quale l'app è collegata, restituisce un oggetto di tipo Record<string, string[]>, dove le chiavi sono i nomi delle tabelle mentre i valori sono gli array dei nomi delle colonne

import mysql from "mysql2/promise";

type DbTablesAndColumns = Record<string, string[]>;
import { getConnection } from "./apiroutes";

export var dbTablesAndColumns: Record<string, string[]> = {};

export async function getDbTablesAndColumns(): Promise<string> {
    const disattiva = process.env.NODE_ENV === "test" ? true : false; //Metti a true solo per i test
    if (disattiva) {
        return new Promise((resolve) => {
            resolve("Ok");
            dbTablesAndColumns = {
                album: ['id', 'titolo', 'data_uscita', 'url_immagine'],
                album_genere: ['id_album', 'id_genere'],
                artista: ['id', 'nome', 'url_immagine'],
                brano: ['id', 'titolo', 'durata', 'id_album'],
                brano_artista: ['id_brano', 'id_artista'],
                brano_utente: ['id_brano', 'id_utente'],
                commento: [
                    'id',
                    'testo',
                    'data_pubblicazione',
                    'id_utente',
                    'id_passaggio',
                    'id_commento_padre'
                ],
                genere: ['id', 'nome', 'url_immagine'],
                passaggio: [
                    'id',
                    'testo',
                    'inizio_secondo_brano',
                    'cue_secondo_brano',
                    'data_pubblicazione',
                    'id_utente',
                    'id_brano_1',
                    'id_brano_2'
                ],
                scaletta: ['id', 'nome', 'descrizione', 'id_utente'],
                scaletta_passaggio: ['id_scaletta', 'id_passaggio', 'ordine'],
                utente: ['id', 'username', 'nome', 'cognome', 'password'],
                valutazione: ['id', 'voto', 'id_utente', 'id_passaggio'],
                visualizzazione: ['id', 'data_visualizzazione', 'id_utente', 'id_passaggio']
            };
        });
    } else {
        return new Promise(async (resolve, reject) => {
            const connection = await getConnection();
            const [tables] = await connection.execute<mysql.RowDataPacket[]>("SHOW TABLES");
            if (tables[0] !== undefined) {
                const dbTablesAndColumnsNew: DbTablesAndColumns = {};
                const tableKey = Object.keys(tables[0])[0]; // Ottieni il nome della colonna che contiene i nomi delle tabelle
                if (tableKey) {
                    for (const row of tables) {
                        const tableName = row[tableKey];
                        const [columns] = await connection.execute<mysql.RowDataPacket[]>(`SHOW COLUMNS FROM \`${tableName}\``);
                        dbTablesAndColumnsNew[tableName] = columns.map(column => column.Field);
                    }
                } else {
                    reject("Impossibile determinare il nome della colonna delle tabelle");
                }
                //await connection.execute("USE "+process.env.DATABASE + ";");
                await connection.end();
                resolve("Ok");
                dbTablesAndColumns = dbTablesAndColumnsNew;
            } else {
                reject("Nessuna tabella trovata nel database");
            }
        });
    }
}

