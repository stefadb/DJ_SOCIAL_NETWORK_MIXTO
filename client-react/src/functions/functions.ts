import { ArtistaDbSchema, BranoDbSchema, type ArtistaDb, type BranoDb, type UtenteDb } from "../types/db_types";
import z from "zod";
import api from "../api";

export async function getNomiArtistiBrano(id: number): Promise<ArtistaDb[]> {
    await api.get(`/brani/singolo?trackId=${id}&limit=1&index=0`);
    const response = await api.get(`/brani/esistenti/${id}?include_artista`);
    if (response.status === 200) {
        z.array(ArtistaDbSchema).parse(response.data.artista);
        return response.data.artista as ArtistaDb[];
    } else {
        throw new Error("Errore nel recupero degli artisti");
    }
}

export async function getNomiArtistiAlbum(idBrani: number[] | undefined, idAlbum: number): Promise<ArtistaDb[]> {
    //TODO: questa funzione deve essere messa in useMemo o useCallback o quello che è, perche fa troppe chiamate API
    if (idBrani) {
        for (const idBrano of idBrani) {
            await api.get(`/brani/singolo?trackId=${idBrano}&limit=1&index=0`);
        }
    } else {
        await api.get(`/album/singolo?albumId=${idAlbum}&limit=1&index=0`);
        const responseBrani = await api.get(`/brani/esistenti?album=${idAlbum}`);
        z.array(BranoDbSchema).parse(responseBrani.data);
        for (const brano of responseBrani.data) {
            await api.get(`/brani/singolo?trackId=${(brano as BranoDb).id}&limit=1&index=0`);
        }
    }
    const response = await api.get(`/artisti/esistenti?album=${idAlbum}`);
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
        const responseIdBrani = await api.get(`/brani/esistenti?utente=${utente.id}`);
        //Togli idBrano da idBrani
        const idBrani: number[] = z.array(BranoDbSchema).parse(responseIdBrani.data).map(brano => brano.id);
        if (!idBrani.includes(idBrano)) {
            idBrani.push(idBrano);
        }
        await api.put(`/utenti/${utente.id}`, { newRowValues: noId(utente), assocTablesAndIds: { brano: idBrani }, deleteOldAssociationsFirst: true });
    } catch (error) {
        throw new Error("Errore nel rimuovere il brano dai preferiti:", error);
    }
}

export async function rimuoviBranoPreferito(utente: UtenteDb, idBrano: number): Promise<void> {
    try {
        const responseIdBrani = await api.get(`/brani/esistenti?utente=${utente.id}`);
        //Togli idBrano da idBrani
        const idBrani: number[] = z.array(BranoDbSchema).parse(responseIdBrani.data).filter(brano => brano.id !== idBrano).map(brano => brano.id);
        await api.put(`/utenti/${utente.id}`, { newRowValues: noId(utente), assocTablesAndIds: { brano: idBrani }, deleteOldAssociationsFirst: true });
    } catch (error) {
        throw new Error("Errore nel rimuovere il brano dai preferiti:", error);
    }
}

export function dataItaliana(data: string): string {
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(data);
    const [anno, mese, giorno] = data.split("-");
    return `${giorno}/${mese}/${anno}`;
}

export function blackBoxShadow(scale: number = 1){
    return `0 0 ${5 * scale}px rgba(0,0,0,0.5)`;
}

export function grayBoxShadow(scale: number = 1){
    return `0 0 ${5 * scale}px rgba(192,192,192,0.5)`;
}

export function noPadding(){
    return "0";
}

export function smallPadding(scale: number = 1){
    return `${4*scale}px`;
}

export function mediumPadding(scale: number = 1){
    return `${8*scale}px`;
}

export function largePadding(scale: number = 1){
    return `${12*scale}px`;
}

export function extraLargePadding(scale: number = 1){
    return `${12*scale}px`;
}

