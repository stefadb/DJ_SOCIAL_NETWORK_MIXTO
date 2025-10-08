import { ArtistaDbSchema, BranoDbSchema, type ArtistaDb, type BranoDb, type UtenteDb } from "../types/db_types";
import z from "zod";
import api from "../api";
import type { CSSProperties } from "react";
import { twj } from "tw-to-css";
import axios from "axios";


export async function getNomiArtistiBrano(id: number): Promise<ArtistaDb[]> {
    try {
        await api.get(`/brani/singolo?trackId=${id}&limit=1&index=0`);
        const response = await api.get(`/brani/esistenti/${id}?include_artista`);
        z.array(ArtistaDbSchema).parse(response.data.artista);
        return response.data.artista as ArtistaDb[];
    } catch (error) {
        //Qui non devi gestire nessun errore
        throw error as any;
    }
}

export async function getNomiArtistiAlbum(idBrani: number[] | undefined, idAlbum: number): Promise<ArtistaDb[]> {
    try {
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
        z.array(ArtistaDbSchema).parse(response.data);
        return response.data as ArtistaDb[];
    } catch (error) {
        //Qui non devi gestire nessun errore
        throw error as any;
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
        //Qui non devi gestire nessun errore
        throw error as any;
    }
}

export async function rimuoviBranoPreferito(utente: UtenteDb, idBrano: number): Promise<void> {
    try {
        const responseIdBrani = await api.get(`/brani/esistenti?utente=${utente.id}`);
        //Togli idBrano da idBrani
        const idBrani: number[] = z.array(BranoDbSchema).parse(responseIdBrani.data).filter(brano => brano.id !== idBrano).map(brano => brano.id);
        await api.put(`/utenti/${utente.id}`, { newRowValues: noId(utente), assocTablesAndIds: { brano: idBrani }, deleteOldAssociationsFirst: true });
    } catch (error) {
        //Qui non devi gestire nessun errore
        throw error as any;
    }
}

export function dataItaliana(data: string): string {
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(data);
    const [anno, mese, giorno] = data.split("-");
    return `${giorno}/${mese}/${anno}`;
}

function scaleCssValues(cssValue: string, scale: number) {
    return cssValue.replace(/(-?\d*\.?\d+)(px|rem)/g, (_, number, unit) => {
        const scaledNumber = parseFloat(number) * scale;
        return `${scaledNumber}${unit}`;
    });
}

function makeMutableStyle(style: CSSProperties): CSSProperties {
    return { ...style };
}

function scaleCssProps(properties: Record<string, any>, scale: number): CSSProperties {
    properties = makeMutableStyle(properties);
    const keys = Object.keys(properties);
    for (const key of keys) {
        if (typeof properties[key] == "number") {
            properties[key] *= scale;
        } else if (typeof properties[key] == "string") {
            properties[key] = scaleCssValues(properties[key], scale);
        }
    }
    return properties as CSSProperties;
}

const twjCache = new Map<string, CSSProperties>();

export function cachedTwj(className: string): CSSProperties {
    if (twjCache.has(className)) {
        return twjCache.get(className)!;
    }
    const style = twj(className);
    twjCache.set(className, style);
    return style;
}

export function scaleTwProps(twClassNames: string, scale: number): CSSProperties {
    return scaleCssProps(cachedTwj(twClassNames), scale);
}

export function check404(error: unknown) {
    return typeof error == "object" && error && "response" in error && typeof error.response == "object" && error.response && "status" in error.response && error.response.status == "404";
}

export function check403(error: unknown){
    return typeof error == "object" && error && "response" in error && typeof error.response == "object" && error.response && "status" in error.response && error.response.status == "403";
}

export function checkConnError(error: unknown): boolean {
    return (
        axios.isAxiosError(error) &&
        (!error.response ||
            error.code === "ECONNABORTED" ||
            error.code === "ERR_NETWORK" ||
            error.code === "ECONNREFUSED" ||
            error.code === "ETIMEDOUT")
    );
}

export function deezerColor() {
    const color = import.meta.env.VITE_DEEZER_COLOR as string;
    return color;
}

export function modalsOverlayClassName() {
    return "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center";
}

export function modalsContentClassName() {
    return "relative max-w-[calc(100vw-80px)] max-h-[calc(100vh-80px)] bg-white p-6 rounded box-border overflow-y-auto";
}

export function inputTextClassName() {
    return "w-full border-b border-black border-t-0 border-l-0 border-r-0 text-center outline-none box-border text-[16px] p-2 resize-none";
}

//Restituisce i punti che rappresentano il poligono della M dell logo di Mixto
export function mPoints(): number[] {
    return [
        0.2, 0.2,
        0.3, 0.2,
        0.5, 0.4,
        0.7, 0.2,
        0.8, 0.2,
        0.8, 0.8,
        0.7, 0.8,
        0.7, 0.2 + Math.sqrt(2) * 0.1,
        0.5, 0.4 + Math.sqrt(2) * 0.1,
        0.3, 0.2 + Math.sqrt(2) * 0.1,
        0.3, 0.8,
        0.2, 0.8
    ];
}

export function getNoConnMessage(): string {
    return "Impossibile connettersi al server. Controlla la tua connessione ad internet.";
}

export function getUserNotLoggedMessage(): string {
    return "La sessione è scaduta oppure hai eseguito il logout. Effettua nuovamente l'accesso e riprova.";
}

export function checkUserNotLoggedError(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response !== undefined && error.response.status === 401 && error.response.data === "Utente non loggato";
}

export function checkUnauthorizedError(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response !== undefined && error.response.status === 401;
}

const minimumGreyScale = 32;
const maximumGreyScale = 64;

export function getRandomGreyScale() {
    const greyValue = Math.floor(Math.random() * (maximumGreyScale - minimumGreyScale + 1)) + minimumGreyScale;
    return `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
}
