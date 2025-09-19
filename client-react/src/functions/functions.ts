import axios from "axios";
import type { ArtistaDb, BranoDb } from "../types/db_types";

export async function getNomiArtistiBrano(id: number): Promise<ArtistaDb[]> {
    await axios.get(`http://localhost:3000/brani/singolo?trackId=${id}&limit=1&index=0`);
    const response = await axios.get(`http://localhost:3000/brani/esistenti/${id}?include_artista`);
    if (response.status === 200) {
        // TODO: validazione con zod
        return response.data.artista as ArtistaDb[];
    } else {
        throw new Error("Errore nel recupero degli artisti");
    }
}

export async function getNomiArtistiAlbum(idBrani: number[] | undefined, idAlbum: number): Promise<ArtistaDb[]> {
    if (idBrani) {
        for (const idBrano of idBrani) {
            await axios.get(`http://localhost:3000/brani/singolo?trackId=${idBrano}&limit=1&index=0`);
        }
    } else {
        await axios.get(`http://localhost:3000/album/singolo?albumId=${idAlbum}&limit=1&index=0`);
        const responseBrani = await axios.get(`http://localhost:3000/brani/esistenti?album=${idAlbum}`);
        for (const brano of responseBrani.data) {
            await axios.get(`http://localhost:3000/brani/singolo?trackId=${(brano as BranoDb).id}&limit=1&index=0`);
        }
    }
    const response = await axios.get(`http://localhost:3000/artisti/esistenti?album=${idAlbum}`);
    if (response.status === 200) {
        // TODO: validazione con zod
        return response.data.artista as ArtistaDb[];
    } else {
        throw new Error("Errore nel recupero degli artisti");
    }
}