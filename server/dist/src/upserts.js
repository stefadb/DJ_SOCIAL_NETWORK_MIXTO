"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertEntitaDeezer = upsertEntitaDeezer;
async function upsertEntitaDeezer(con, entita, nomeEntita) {
    const [rows] = await con.execute(`SELECT id FROM ${nomeEntita} WHERE id = ?`, [entita.id]);
    let columnsInsert = Object.keys(entita).join(", ");
    let valuesInsert = Object.keys(entita).map(() => "?").join(", ");
    let valuesUpdate = Object.entries(entita).filter(([key, _]) => key !== "id").map(([_, val]) => val).concat([entita.id]);
    let columnsUpdate = Object.entries(entita).filter(([key, _]) => key !== "id").map(([key, _]) => `${key} = ?`).join(", ");
    if (rows.length === 0) {
        let query = `INSERT IGNORE INTO ${nomeEntita} (${columnsInsert}) VALUES (${valuesInsert})`;
        let values = Object.values(entita).map((val) => val === undefined ? null : val);
        await con.execute(query, values);
    }
    else {
        let query = `UPDATE ${nomeEntita} SET ${columnsUpdate} WHERE id = ?`;
        let values = valuesUpdate.map((val) => val === undefined ? null : val);
        await con.execute(query, values);
    }
}
//# sourceMappingURL=upserts.js.map