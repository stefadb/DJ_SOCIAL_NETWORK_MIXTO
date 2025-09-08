import z from "zod";

export const DbEntitySchema = z.object({
    id: z.number()
}).catchall(z.union([z.string(), z.number()]));

export type DbEntity = z.infer<typeof DbEntitySchema>;

//Mostra come sono memorizzati gli artisti nel database
export const ArtistaDbSchema = DbEntitySchema.extend({
    nome: z.string(),
});

export type ArtistaDb = z.infer<typeof ArtistaDbSchema>;

//Mostra come sono memorizzati i brani nel database
export const DurataSchema = z.string().regex(/^\d{2}:\d{2}$/, "Invalid duration format, expected mm:ss");

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
    data_uscita: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD").optional()
});

export type AlbumDb = z.infer<typeof AlbumDbSchema>;

//Mostra come sono memorizzati i generi nel database
export const GenereDbSchema = DbEntitySchema.extend({
    nome: z.string()
});

export type GenereDb = z.infer<typeof GenereDbSchema>;

export const AssocBranoArtistaDbSchema = z.object({
    id_brano: z.number(),
    id_artista: z.number(),
}).strict();

export type AssocBranoArtistaDb = z.infer<typeof AssocBranoArtistaDbSchema>;

export const AssocAlbumGenereDbSchema = z.object({
    id_album: z.number(),
    id_genere: z.number(),
}).strict();

export type AssocAlbumGenereDb = z.infer<typeof AssocAlbumGenereDbSchema>;
