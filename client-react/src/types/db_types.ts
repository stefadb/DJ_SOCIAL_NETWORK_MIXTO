import z from "zod";

export const DbEntitySchema = z.object({
    id: z.number()
}).loose();

export type DbEntity = z.infer<typeof DbEntitySchema>;

//Mostra come sono memorizzati gli artisti nel database
export const ArtistaDbSchema = DbEntitySchema.extend({
    nome: z.string(),
    url_immagine: z.url().nullable()
});

export type ArtistaDb = z.infer<typeof ArtistaDbSchema>;

//Mostra come sono memorizzati i brani nel database
export const DurataSchema = z.string().regex(/^\d{2}:\d{2}:\d{2}(\.\d{1,6})?$/, "Invalid time format, expected HH:MM:SS or HH:MM:SS.000000");

export type Durata = z.infer<typeof DurataSchema>;

export const BranoDbSchema = DbEntitySchema.extend({
    titolo: z.string(),
    durata: DurataSchema,
    id_album: z.number()
});

export type BranoDb = z.infer<typeof BranoDbSchema>;

//Mostra come sono memorizzati gli album nel database
export const AlbumDbSchema = DbEntitySchema.extend({
    titolo: z.string(),
    data_uscita: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD").nullable(),
    url_immagine: z.url().nullable()
});

export type AlbumDb = z.infer<typeof AlbumDbSchema>;

//Mostra come sono memorizzati i generi nel database
export const GenereDbSchema = DbEntitySchema.extend({
    nome: z.string(),
    url_immagine: z.url().nullable()
});

export type GenereDb = z.infer<typeof GenereDbSchema>;

export const AssocBranoArtistaDbSchema = z.object({
    id_brano: z.number(),
    id_artista: z.number()
}).strict();

export type AssocBranoArtistaDb = z.infer<typeof AssocBranoArtistaDbSchema>;

export const AssocAlbumGenereDbSchema = z.object({
    id_album: z.number(),
    id_genere: z.number(),
}).strict();

export type AssocAlbumGenereDb = z.infer<typeof AssocAlbumGenereDbSchema>;

//Mostra come sono memorizzati i passaggi nel database
export const PassaggioDbSchema = DbEntitySchema.extend({
    testo: z.string().nullable(),
    inizio_secondo_brano: DurataSchema.nullable(),
    cue_secondo_brano: DurataSchema.nullable(),
    data_pubblicazione: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "Invalid date time format, expected YYYY-MM-DD HH:MM:SS"),
    id_utente: z.number(),
    id_brano_1: z.number(),
    id_brano_2: z.number()
});

export type PassaggioDb = z.infer<typeof PassaggioDbSchema>;


//Mostra come sono memorizzate le scalette nel database
export const ScalettaDbSchema = DbEntitySchema.extend({
    nome: z.string(),
    descrizione: z.string(),
    id_utente: z.number().nullable()
});

export type ScalettaDb = z.infer<typeof ScalettaDbSchema>;

//Mostra come sono memorizzati gli utenti nel database
export const UtenteDbSchema = DbEntitySchema.extend({
    username: z.string(),
    nome: z.string(),
    cognome: z.string(),
    password: z.string().optional()
});

export type UtenteDb = z.infer<typeof UtenteDbSchema>;

//Mostra come sono memorizzate le visualizzazioni nel database
export const VisualizzazioneDbSchema = DbEntitySchema.extend({
    data_visualizzazione: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "Invalid date time format, expected YYYY-MM-DD HH:MM:SS"),
    id_utente: z.number().nullable(),
    id_passaggio: z.number()
});

export type VisualizzazioneDb = z.infer<typeof VisualizzazioneDbSchema>;


//Mostra come sono memorizzati i commenti nel database
export const CommentoDbSchema = DbEntitySchema.extend({
    testo: z.string(),
    data_pubblicazione: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "Invalid date time format, expected YYYY-MM-DD HH:MM:SS"),
    id_utente: z.number().nullable(),
    id_passaggio: z.number().nullable(),
    id_commento_padre: z.number().nullable()
});

export type CommentoDb = z.infer<typeof CommentoDbSchema>;

//Mostra come sono memorizzati i commenti nel database
export const ValutazioneDbSchema = DbEntitySchema.extend({
    voto: z.number().min(1).max(5),
    id_utente: z.number().nullable(),
    id_passaggio: z.number()
});

export type ValutazioneDb = z.infer<typeof ValutazioneDbSchema>;



