"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertGenere = upsertGenere;
exports.upsertArtista = upsertArtista;
exports.upsertAlbum = upsertAlbum;
exports.upsertBrano = upsertBrano;
exports.upsertEntitaDeezer = upsertEntitaDeezer;
// Funzioni di utilità per upsert
async function upsertGenere(con, genere) {
    const [rows] = await con.execute("SELECT id FROM Genere WHERE id = ?", [
        genere.id,
    ]);
    if (rows.length === 0) {
        await con.execute("INSERT INTO Genere (id, nome) VALUES (?, ?)", [
            genere.id,
            genere.nome,
        ]);
    }
    else {
        await con.execute("UPDATE Genere SET nome = ? WHERE id = ?", [
            genere.nome,
            genere.id,
        ]);
    }
}
async function upsertArtista(con, artista) {
    const [rows] = await con.execute("SELECT id FROM Artista WHERE id = ?", [
        artista.id,
    ]);
    if (rows.length === 0) {
        await con.execute("INSERT INTO Artista (id, nome) VALUES (?, ?)", [
            artista.id,
            artista.name,
        ]);
    }
    else {
        await con.execute("UPDATE Artista SET nome = ? WHERE id = ?", [
            artista.name,
            artista.id,
        ]);
    }
}
async function upsertAlbum(con, album) {
    const [rows] = await con.execute("SELECT id FROM Album WHERE id = ?", [
        album.id,
    ]);
    if (rows.length === 0) {
        await con.execute("INSERT INTO Album (id, titolo) VALUES (?, ?)", [album.id, album.titolo]);
    }
    else {
        await con.execute("UPDATE Album SET titolo = ? WHERE id = ?", [album.titolo, album.id]);
    }
}
async function upsertBrano(con, brano) {
    const [rows] = await con.execute("SELECT id FROM Brano WHERE id = ?", [
        brano.id,
    ]);
    if (rows.length === 0) {
        await con.execute("INSERT INTO Brano (id, titolo, durata, id_album) VALUES (?, ?, ?, ?)", [
            brano.id,
            brano.titolo,
            brano.durata,
            brano.id_album,
        ]);
    }
    else {
        await con.execute("UPDATE Brano SET titolo = ?, durata = ?, id_album = ? WHERE id = ?", [
            brano.titolo,
            brano.durata,
            brano.id_album,
            brano.id,
        ]);
    }
}
async function upsertEntitaDeezer(con, entita, nomeEntita) {
    const [rows] = await con.execute(`SELECT id FROM ${nomeEntita} WHERE id = ?`, [entita.id]);
    let columnsInsert = Object.keys(entita).join(", ");
    let valuesInsert = Object.keys(entita).map(() => "?").join(", ");
    let valuesUpdate = Object.entries(entita).filter(([key, _]) => key !== "id").map(([_, val]) => val).concat([entita.id]);
    let columnsUpdate = Object.entries(entita).filter(([key, _]) => key !== "id").map(([key, _]) => `${key} = ?`).join(", ");
    if (rows.length === 0) {
        await con.execute(`INSERT INTO ${nomeEntita} (${columnsInsert}) VALUES (${valuesInsert})`, Object.values(entita));
    }
    else {
        await con.execute(`UPDATE ${nomeEntita} SET ${columnsUpdate} WHERE id = ?`, valuesUpdate);
    }
}
//# sourceMappingURL=upserts.js.map