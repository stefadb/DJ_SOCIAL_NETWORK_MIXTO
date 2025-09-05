"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertEntitaDeezer = upsertEntitaDeezer;
/*
// Funzioni di utilità per upsert
export async function upsertGenere(con: mysql.Connection, genere: GenereDb) {
    const [rows] = await con.execute("SELECT id FROM Genere WHERE id = ?", [
        genere.id,
    ]);
    if ((rows as any[]).length === 0) {
        await con.execute("INSERT INTO Genere (id, nome) VALUES (?, ?)", [
            genere.id,
            genere.nome,
        ]);
    } else {
        await con.execute("UPDATE Genere SET nome = ? WHERE id = ?", [
            genere.nome,
            genere.id,
        ]);
    }
}

export async function upsertArtista(con: mysql.Connection, artista: ArtistaDb) {
    const [rows] = await con.execute("SELECT id FROM Artista WHERE id = ?", [
        artista.id,
    ]);
    if ((rows as any[]).length === 0) {
        await con.execute("INSERT INTO Artista (id, nome) VALUES (?, ?)", [
            artista.id,
            artista.name,
        ]);
    } else {
        await con.execute("UPDATE Artista SET nome = ? WHERE id = ?", [
            artista.name,
            artista.id,
        ]);
    }
}

export async function upsertAlbum(con: mysql.Connection, album: AlbumDb) {
    const [rows] = await con.execute("SELECT id FROM Album WHERE id = ?", [
        album.id,
    ]);
    if ((rows as any[]).length === 0) {
        await con.execute(
            "INSERT INTO Album (id, titolo) VALUES (?, ?)",
            [album.id, album.titolo]
        );
    } else {
        await con.execute(
            "UPDATE Album SET titolo = ? WHERE id = ?",
            [album.titolo, album.id]
        );
    }
}

export async function upsertBrano(con: mysql.Connection, brano: BranoDb) {
    const [rows] = await con.execute("SELECT id FROM Brano WHERE id = ?", [
        brano.id,
    ]);
    if ((rows as BranoDb[]).length === 0) {
        await con.execute(
            "INSERT INTO Brano (id, titolo, durata, id_album) VALUES (?, ?, ?, ?)",
            [
                brano.id,
                brano.titolo,
                brano.durata,
                brano.id_album,
            ]
        );
    } else {
        await con.execute(
            "UPDATE Brano SET titolo = ?, durata = ?, id_album = ? WHERE id = ?",
            [
                brano.titolo,
                brano.durata,
                brano.id_album,
                brano.id,
            ]
        );
    }
}
*/
async function upsertEntitaDeezer(con, entita, nomeEntita) {
    const [rows] = await con.execute(`SELECT id FROM ${nomeEntita} WHERE id = ?`, [entita.id]);
    let columnsInsert = Object.keys(entita).join(", ");
    let valuesInsert = Object.keys(entita).map(() => "?").join(", ");
    let valuesUpdate = Object.entries(entita).filter(([key, _]) => key !== "id").map(([_, val]) => val).concat([entita.id]);
    let columnsUpdate = Object.entries(entita).filter(([key, _]) => key !== "id").map(([key, _]) => `${key} = ?`).join(", ");
    if (rows.length === 0) {
        let query = `INSERT INTO ${nomeEntita} (${columnsInsert}) VALUES (${valuesInsert})`;
        let values = Object.values(entita);
        console.log("QUERY DI INSERT:", query, values);
        await con.execute(query, values);
    }
    else {
        let query = `UPDATE ${nomeEntita} SET ${columnsUpdate} WHERE id = ?`;
        let values = valuesUpdate;
        console.log("QUERY DI UPDATE:", query, values);
        await con.execute(query, values);
    }
}
//# sourceMappingURL=upserts.js.map