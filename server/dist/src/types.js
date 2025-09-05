"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeezerResponseMultipleItemsSchema = exports.DeezerResponseSingleItemSchema = exports.GenereDbSchema = exports.AlbumDbSchema = exports.BranoDbSchema = exports.ArtistaDbSchema = exports.AlbumDeezerBasicSchema = exports.GenereDeezerBasicSchema = exports.ArtistaDeezerBasicSchema = void 0;
const zod_1 = require("zod");
//Tipi di dati legati a Deezer
//Contiene le informazioni di base sugli artisti di Deezer
exports.ArtistaDeezerBasicSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    picture_big: zod_1.z.string(),
});
exports.GenereDeezerBasicSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    picture_big: zod_1.z.string(),
});
//Contiene le informazioni di base sugli album di Deezer
exports.AlbumDeezerBasicSchema = zod_1.z.object({
    id: zod_1.z.number(),
    title: zod_1.z.string(),
    cover_big: zod_1.z.string(),
});
//Tipi di dati legati al db
//Mostra come sono memorizzati gli artisti nel database
exports.ArtistaDbSchema = zod_1.z.object({
    id: zod_1.z.number(),
    nome: zod_1.z.string(),
});
//Mostra come sono memorizzati i brani nel database
exports.BranoDbSchema = zod_1.z.object({
    id: zod_1.z.number(),
    titolo: zod_1.z.string(),
    durata: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Invalid duration format, expected mm:ss"),
    id_album: zod_1.z.number()
});
//Mostra come sono memorizzati gli album nel database
exports.AlbumDbSchema = zod_1.z.object({
    id: zod_1.z.number(),
    titolo: zod_1.z.string()
});
//Mostra come sono memorizzati i generi nel database
exports.GenereDbSchema = zod_1.z.object({
    id: zod_1.z.number(),
    nome: zod_1.z.string()
});
exports.DeezerResponseSingleItemSchema = zod_1.z.union([
    zod_1.z.object({
        id: zod_1.z.number(),
        picture_big: zod_1.z.string(),
    }),
    zod_1.z.object({
        id: zod_1.z.number(),
        cover_big: zod_1.z.string(),
    }),
]);
exports.DeezerResponseMultipleItemsSchema = zod_1.z.object({
    data: zod_1.z.array(exports.DeezerResponseSingleItemSchema),
});
//# sourceMappingURL=types.js.map