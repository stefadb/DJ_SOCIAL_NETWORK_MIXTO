import express from "express";
import fs from "fs";
import path from "path";
import { getConnection } from "./apiroutes";

const router = express.Router();

const expectedApiKey = "dUeR537x9HUspvWPv62RctMsPo4xowXzqUdPbzY4btgSn4FbrpuimX5VnXq3kJXZ";

// API di pulizia database e immagini
router.delete("/cleanup", async (req, res) => {
    if (req.query.apikey !== expectedApiKey) {
        return res.status(403).json({ error: "Forbidden" });
    }
    const conn = await getConnection();
    try {
        // 1) Elimina brani non associati a passaggi né a utenti
        await conn.query(`
      DELETE FROM brano
      WHERE id NOT IN (SELECT id_brano_1 FROM passaggio)
        AND id NOT IN (SELECT id_brano_2 FROM passaggio)
        AND id NOT IN (SELECT id_brano FROM brano_utente)
    `);

        // 2) Elimina album senza brani e relative foto
        const [albumRows] = await conn.query(`
      SELECT id FROM album WHERE id NOT IN (SELECT id_album FROM brano)
    `);
        for (const album of albumRows as any[]) {
            const fotoPath = path.join(__dirname, "album_pictures", `${album.id}.jpg`);
            if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
        }
        await conn.query(`DELETE FROM album WHERE id NOT IN (SELECT id_album FROM brano)`);

        // 3) Elimina artisti senza brani e relative foto
        const [artistaRows] = await conn.query(`
      SELECT id FROM artista WHERE id NOT IN (SELECT id_artista FROM brano_artista)
    `);
        for (const artista of artistaRows as any[]) {
            const fotoPath = path.join(__dirname, "artisti_pictures", `${artista.id}.jpg`);
            if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
        }
        await conn.query(`DELETE FROM artista WHERE id NOT IN (SELECT id_artista FROM brano_artista)`);

        // 4) Elimina generi senza brani e relative foto
        const [genereRows] = await conn.query(`
      SELECT id FROM genere WHERE id NOT IN (
        SELECT album_genere.id_genere FROM album_genere
        JOIN brano ON brano.id_album = album_genere.id_album
      )
    `);
        for (const genere of genereRows as any[]) {
            const fotoPath = path.join(__dirname, "generi_pictures", `${genere.id}.jpg`);
            if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
        }
        await conn.query(`DELETE FROM genere WHERE id NOT IN (
      SELECT album_genere.id_genere FROM album_genere
      JOIN brano ON brano.id_album = album_genere.id_album
    )`);
        // 5) Se qualche API è già stata chiamata oggi, segna come ultima chiamata API ieri
        await conn.query(`UPDATE mixto_api_calls.deezer_api_calls SET date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) WHERE DATE(date) = CURDATE()`);
        res.json({ ok: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    } finally {
        conn.end();
    }
});

export default router;
