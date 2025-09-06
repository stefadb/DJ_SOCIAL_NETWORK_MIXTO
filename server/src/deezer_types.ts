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
        id: z.number(),
        picture: z.string(),
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

export const GenereDeezerSemplificatoSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        name: z.string(),
        picture: z.string(),
    })
);

export type GenereDeezerSemplificato = z.infer<typeof GenereDeezerSemplificatoSchema>;

//Contiene le informazioni di base sugli album di Deezer
export const AlbumDeezerBasicSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        title: z.string(),
        cover_big: z.string(),
    })
);

export type AlbumDeezerBasic = z.infer<typeof AlbumDeezerBasicSchema>;

//Contiene le informazioni di base sugli album di Deezer
export const BranoDeezerBasicSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        title: z.string(),
        duration: z.number(),
        album: z.object({
            id: z.number()
        }).optional()
    })
);

export type BranoDeezerBasic = z.infer<typeof BranoDeezerBasicSchema>;

export const AnyDeezerEntityBasicSchema = z.union([
    AlbumDeezerBasicSchema,
    ArtistaDeezerBasicSchema,
    GenereDeezerBasicSchema,
    BranoDeezerBasicSchema
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
        id: z.number(),
        picture: z.string(),
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