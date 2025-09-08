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
        type: z.literal("artist")
    })
);

export type ArtistaDeezerBasic = z.infer<typeof ArtistaDeezerBasicSchema>;

export const GenereDeezerBasicSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        name: z.string(),
        picture_big: z.string(),
        type: z.literal("genre")
    })
);

export type GenereDeezerBasic = z.infer<typeof GenereDeezerBasicSchema>;

export const GenereDeezerSemplificatoSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        name: z.string(),
        picture: z.string(),
        type: z.literal("genre")
    })
);

export type GenereDeezerSemplificato = z.infer<typeof GenereDeezerSemplificatoSchema>;

//Contiene le informazioni di base sugli album di Deezer
export const AlbumDeezerBasicSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        title: z.string(),
        cover_big: z.string(),
        type: z.literal("album"),
        release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD").optional()
    })
);

export type AlbumDeezerBasic = z.infer<typeof AlbumDeezerBasicSchema>;

//Contiene le informazioni di base sugli album di Deezer
export const BranoDeezerBasicSchema = GenericDeezerEntityBasicSchema.and(
    z.object({
        title: z.string(),
        duration: z.number(),
        album: z.object({
            id: z.number(),
            type: z.literal("album")
        }).optional(),
        type: z.literal("track")
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

export const DeezerResponseDataItemsArraySchema = z.object({
    data: z.array(DeezerResponseSingleItemSchema),
});

export type DeezerResponseDataItemsArray = z.infer<typeof DeezerResponseDataItemsArraySchema>;

export const DeezerResponseItemsArraySchema = z.array(DeezerResponseSingleItemSchema);

export type DeezerResponseItemsArray = z.infer<typeof DeezerResponseItemsArraySchema>;