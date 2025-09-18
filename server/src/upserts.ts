import mysql from "mysql2/promise";
import { DbEntity } from "./db_types";

export async function upsertEntitaDeezer(con: mysql.Connection, entita: DbEntity, nomeEntita: string) {
    const [rows] = await con.execute(
        `SELECT id FROM ${nomeEntita} WHERE id = ?`,
        [entita.id]
    );
    let columnsInsert = Object.keys(entita).join(", ");
    let valuesInsert = Object.keys(entita).map(() => "?").join(", ");
    let valuesUpdate = Object.entries(entita).filter(([key, _]) => key !== "id").map(([_, val]) => val).concat([entita.id]);
    let columnsUpdate = Object.entries(entita).filter(([key, _]) => key !== "id").map(([key, _]) => `${key} = ?`).join(", ");
    if ((rows as any[]).length === 0) {
        let query = `INSERT INTO ${nomeEntita} (${columnsInsert}) VALUES (${valuesInsert})`;
        let values = Object.values(entita).map((val) => val === undefined ? null : val);
        await con.execute(query, values);
    } else {
        let query = `UPDATE ${nomeEntita} SET ${columnsUpdate} WHERE id = ?`;
        let values = valuesUpdate.map((val) => val === undefined ? null : val);
        await con.execute(query, values);
    }
}