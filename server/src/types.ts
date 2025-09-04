import { z } from "zod";

//Tipi di dati legati a Deezer

//Contiene le informazioni di base sugli artisti di Deezer
export const ArtistaDeezerBasicSchema = z.object({
    id: z.number(),
    name: z.string(),
    picture_big: z.string(),
});

export type ArtistaDeezerBasic = z.infer<typeof ArtistaDeezerBasicSchema>;

export const GenereDeezerBasicSchema = z.object({
    id: z.number(),
    name: z.string(),
    picture_big: z.string(),
});

export type GenereDeezerBasic = z.infer<typeof GenereDeezerBasicSchema>;

//Tipi di dati legati al db

//Mostra come sono memorizzati gli artisti nel database
export const ArtistaDbSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export type ArtistaDb = z.infer<typeof ArtistaDbSchema>;

//Mostra come sono memorizzati i brani nel database
export const BranoDbSchema = z.object({
    id: z.number(),
    titolo: z.string(),
    durata: z.string().regex(/^\d{2}:\d{2}$/, "Invalid duration format, expected mm:ss"),
    id_album: z.number()
});

export type BranoDb = z.infer<typeof BranoDbSchema>;

//Mostra come sono memorizzati gli album nel database
export const AlbumDbSchema = z.object({
    id: z.number(),
    titolo: z.string(),
    data_uscita: z.string(),
    id_genere: z.number()
});

export type AlbumDb = z.infer<typeof AlbumDbSchema>;

//Mostra come sono memorizzati i generi nel database
export const GenereDbSchema = z.object({
    id: z.number(),
    nome: z.string()
});

export type GenereDb = z.infer<typeof GenereDbSchema>;

export type QueryParams = Record<string, string>;

export const DeezerResponseSingleItemSchema = z.object({
    id: z.number(),
    picture_big: z.string(),
});

export type DeezerResponseSingleItem = z.infer<typeof DeezerResponseSingleItemSchema>;

export const DeezerResponseMultipleItemsSchema = z.object({
    data: z.array(DeezerResponseSingleItemSchema),
});

export type DeezerResponseMultipleItems = z.infer<typeof DeezerResponseMultipleItemsSchema>;
