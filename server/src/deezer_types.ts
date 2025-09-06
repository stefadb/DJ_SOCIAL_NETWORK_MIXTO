import { z } from "zod";

//Tipi di dati legati a Deezer
export const GenericDeezerEntityBasicSchema = z.union([
    z.object({
        id: z.number(),
        picture_big: z.string(),
    }),
    z.object({
        id: z.number(),
        cover_big: z.string(),
    }),
    z.object({
        id: z.number()
    })
]);

export type GenericDeezerEntityBasic = z.infer<typeof GenericDeezerEntityBasicSchema>;

//Contiene le informazioni di base sugli artisti di Deezer
export const ArtistaDeezerBasicSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        name: z.string(),
        picture_big: z.string(),
    })
);

export type ArtistaDeezerBasic = z.infer<typeof ArtistaDeezerBasicSchema>;

export const GenereDeezerBasicSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        name: z.string(),
        picture_big: z.string(),
    })
);

export type GenereDeezerBasic = z.infer<typeof GenereDeezerBasicSchema>;

//Contiene le informazioni di base sugli album di Deezer
export const AlbumDeezerBasicSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        title: z.string(),
        cover_big: z.string(),
    })
);

export type AlbumDeezerBasic = z.infer<typeof AlbumDeezerBasicSchema>;

export const AnyDeezerEntityBasicSchema = z.union([
    AlbumDeezerBasicSchema,
    ArtistaDeezerBasicSchema,
    GenereDeezerBasicSchema
]);
export type AnyDeezerEntityBasic = z.infer<typeof AnyDeezerEntityBasicSchema>;

//FINE tipi di dati legati a Deezer

export const DeezerResponseSingleItemSchema = z.union([
    z.object({
        id: z.number(),
        picture_big: z.string(),
    }),
    z.object({
        id: z.number(),
        cover_big: z.string(),
    }),
    z.object({
        id: z.number()
    })
]);

export type DeezerResponseSingleItem = z.infer<typeof DeezerResponseSingleItemSchema>;

export const DeezerResponseMultipleItemsSchema = z.object({
    data: z.array(DeezerResponseSingleItemSchema),
});

export type DeezerResponseMultipleItems = z.infer<typeof DeezerResponseMultipleItemsSchema>;