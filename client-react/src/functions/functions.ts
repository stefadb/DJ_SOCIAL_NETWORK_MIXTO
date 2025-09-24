import axios from "axios";
import { ArtistaDbSchema, BranoDbSchema, type ArtistaDb, type BranoDb, type UtenteDb } from "../types/db_types";
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

function noId<T extends { id?: number }>(obj: T): Omit<T, "id"> {
  const { id, ...rest } = obj;
  return rest;
}

export async function salvaBranoPreferito(utente: UtenteDb, idBrano: number): Promise<void> {
    try {
        const responseIdBrani = await axios.get(`http://localhost:3000/brani/esistenti?utente=${utente.id}`);
        //Togli idBrano da idBrani
        const idBrani: number[] = z.array(BranoDbSchema).parse(responseIdBrani.data).map(brano => brano.id);
        if (!idBrani.includes(idBrano)) {
            idBrani.push(idBrano);
        }
        await axios.put(`http://localhost:3000/utenti/${utente.id}`, { newRowValues: noId(utente), assocTablesAndIds: { brano: idBrani }, deleteOldAssociationsFirst: true });
    } catch (error) {
        throw new Error("Errore nel rimuovere il brano dai preferiti:", error);
    }
}

export async function rimuoviBranoPreferito(utente: UtenteDb, idBrano: number): Promise<void> {
    try {
        const responseIdBrani = await axios.get(`http://localhost:3000/brani/esistenti?utente=${utente.id}`);
        //Togli idBrano da idBrani
        const idBrani: number[] = z.array(BranoDbSchema).parse(responseIdBrani.data).filter(brano => brano.id !== idBrano).map(brano => brano.id);
        await axios.put(`http://localhost:3000/utenti/${utente.id}`, { newRowValues: noId(utente), assocTablesAndIds: { brano: idBrani }, deleteOldAssociationsFirst: true });
    } catch (error) {
        throw new Error("Errore nel rimuovere il brano dai preferiti:", error);
    }
}

export function getLoggedUtente(): UtenteDb {
    return {
        id: 1,
        username: "djalpha",
        nome: "Alessandro",
        cognome: "Rossi",
        password: "pwd_1"
    }
}