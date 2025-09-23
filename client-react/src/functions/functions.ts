import axios from "axios";
import { ArtistaDbSchema, BranoDbSchema, type ArtistaDb, type BranoDb } from "../types/db_types";
import z from "zod";

export async function getNomiArtistiBrano(id: number): Promise<ArtistaDb[]> {
    await axios.get(`http://localhost:3000/brani/singolo?trackId=${id}&limit=1&index=0`);
    const response = await axios.get(`http://localhost:3000/brani/esistenti/${id}?include_artista`);
    if (response.status === 200) {
        z.array(ArtistaDbSchema).parse(response.data.artista);
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
        z.array(BranoDbSchema).parse(responseBrani.data);
        for (const brano of responseBrani.data) {
            await axios.get(`http://localhost:3000/brani/singolo?trackId=${(brano as BranoDb).id}&limit=1&index=0`);
        }
    }
    const response = await axios.get(`http://localhost:3000/artisti/esistenti?album=${idAlbum}`);
    if (response.status === 200) {
        z.array(ArtistaDbSchema).parse(response.data);
        return response.data as ArtistaDb[];
    } else {
        throw new Error("Errore nel recupero degli artisti");
    }
}