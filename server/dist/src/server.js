"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiroutes_1 = require("./apiroutes");
const express_1 = __importDefault(require("express"));
const functions_1 = require("./functions");
const deezer_types_1 = require("./deezer_types");
const app = (0, express_1.default)();
const port = 3000;
const artistiAPIsConfig = {
    search: {
        paramName: "query",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "search", null, "artist", { q: param, limit: limit.toString(), index: index.toString() }),
        entities: [{
                tableName: "Artista",
                deezerEntitySchema: deezer_types_1.ArtistaDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            }]
    },
    related: {
        paramName: "artistId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "artist", param, "related", { limit: limit.toString(), index: index.toString() }),
        entities: [{
                tableName: "Artista",
                deezerEntitySchema: deezer_types_1.ArtistaDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            }]
    },
    genere: {
        paramName: "genreId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "genre", param, "artists", { limit: limit.toString(), index: index.toString() }),
        entities: [{
                tableName: "Artista",
                deezerEntitySchema: deezer_types_1.ArtistaDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            }]
    }
};
const albumAPIsConfig = {
    search: {
        paramName: "query",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "search", null, "album", { q: param, limit: limit.toString(), index: index.toString() }),
        entities: [{
                tableName: "Album",
                deezerEntitySchema: deezer_types_1.AlbumDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            }]
    },
    getSingle: {
        paramName: "albumId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "album", param, null, null),
        entities: [
            {
                tableName: "Album",
                deezerEntitySchema: deezer_types_1.AlbumDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return [response.data];
                },
                showEntityInResponse: true
            },
            {
                tableName: "Genere",
                deezerEntitySchema: deezer_types_1.GenereDeezerSemplificatoSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.genres.data;
                },
                showEntityInResponse: false
            }
        ],
        association: {
            tableName: "album_genere",
            deleteOldAssociations: true,
            getAssociationsFromResponse: (response) => {
                const albumId = response.data.id;
                const generi = response.data.genres.data;
                const associations = generi.map((genere) => {
                    return { id_album: albumId, id_genere: genere.id };
                });
                return associations;
            }
        }
    },
    artist: {
        paramName: "artistId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "artist", param, "albums", { limit: limit.toString(), index: index.toString() }),
        entities: [
            {
                tableName: "Album",
                deezerEntitySchema: deezer_types_1.AlbumDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            }
        ]
    }
};
const generiAPIsConfig = {
    getSingle: {
        paramName: "genreId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "genre", param, null, null),
        entities: [{
                tableName: "Genere",
                deezerEntitySchema: deezer_types_1.GenereDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return [response.data];
                },
                showEntityInResponse: true
            }]
    },
    getAll: {
        paramName: "uselessParam",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "genre", null, null, null),
        entities: [{
                tableName: "Genere",
                deezerEntitySchema: deezer_types_1.GenereDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            }]
    }
};
const braniAPIsConfig = {
    album: {
        paramName: "albumId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "album", param, "tracks", { limit: limit.toString(), index: index.toString() }),
        entities: [{
                tableName: "Brano",
                deezerEntitySchema: deezer_types_1.BranoDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            }]
    },
    search: {
        paramName: "query",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "search", null, "track", { q: param, limit: limit.toString(), index: index.toString() }),
        entities: [
            {
                tableName: "Album",
                deezerEntitySchema: deezer_types_1.AlbumDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data.map((track) => track.album);
                },
                showEntityInResponse: false
            },
            {
                tableName: "Brano",
                deezerEntitySchema: deezer_types_1.BranoDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            },
            {
                tableName: "Artista",
                deezerEntitySchema: deezer_types_1.ArtistaDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data.map((track) => track.artist);
                },
                showEntityInResponse: false
            }
        ],
        association: {
            getAssociationsFromResponse: (response) => {
                const tracks = response.data.data;
                return tracks
                    .filter((track) => track.artist !== undefined)
                    .map((track) => {
                    return { id_brano: track.id, id_artista: track.artist.id };
                });
            },
            tableName: "brano_artista",
            deleteOldAssociations: false
        }
    },
    genere: {
        paramName: "genreId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "chart", param, "tracks", { limit: limit.toString(), index: index.toString() }),
        entities: [
            {
                tableName: "Album",
                deezerEntitySchema: deezer_types_1.AlbumDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data.map((track) => track.album);
                },
                showEntityInResponse: false
            },
            {
                tableName: "Brano",
                deezerEntitySchema: deezer_types_1.BranoDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            },
            {
                tableName: "Artista",
                deezerEntitySchema: deezer_types_1.ArtistaDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data.map((track) => track.artist);
                },
                showEntityInResponse: false
            },
        ],
        association: {
            getAssociationsFromResponse: (response) => {
                const tracks = response.data.data;
                return tracks
                    .filter((track) => track.artist !== undefined)
                    .map((track) => {
                    return { id_brano: track.id, id_artista: track.artist.id };
                });
            },
            tableName: "brano_artista",
            deleteOldAssociations: false
        }
    },
    artista: {
        paramName: "artistId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "artist", param, "top", { limit: limit.toString(), index: index.toString() }),
        entities: [
            {
                tableName: "Album",
                deezerEntitySchema: deezer_types_1.AlbumDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data.map((track) => track.album);
                },
                showEntityInResponse: false
            },
            {
                tableName: "Brano",
                deezerEntitySchema: deezer_types_1.BranoDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data;
                },
                showEntityInResponse: true
            },
            {
                tableName: "Artista",
                deezerEntitySchema: deezer_types_1.ArtistaDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return [].concat(...response.data.data.map((track) => track.contributors || []));
                },
                showEntityInResponse: false
            },
        ],
        association: {
            getAssociationsFromResponse: (response) => {
                let associationsCount = 0;
                let tracks = response.data.data;
                tracks.forEach((track) => { track.contributors?.forEach((_) => { associationsCount++; }); });
                let index = 0;
                let associations = new Array(associationsCount);
                tracks.forEach((track) => {
                    track.contributors?.forEach((contributor) => {
                        associations[index] = { id_brano: track.id, id_artista: contributor.id };
                        index++;
                    });
                });
                return associations;
            },
            tableName: "brano_artista",
            deleteOldAssociations: false
        }
    },
    single: {
        paramName: "trackId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "track", param, null, null),
        entities: [
            {
                tableName: "Album",
                deezerEntitySchema: deezer_types_1.AlbumDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return [response.data.data.album];
                },
                showEntityInResponse: false
            },
            {
                tableName: "Brano",
                deezerEntitySchema: deezer_types_1.BranoDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return [response.data.data];
                },
                showEntityInResponse: true
            },
            {
                tableName: "Artista",
                deezerEntitySchema: deezer_types_1.ArtistaDeezerBasicSchema,
                getEntityObjectsFromResponse: (response) => {
                    return response.data.data.contributors;
                },
                showEntityInResponse: false
            },
        ],
        association: {
            getAssociationsFromResponse: (response) => {
                let track = response.data.data;
                return track.contributors ? track.contributors.map((contributor) => ({ id_brano: track.id, id_artista: contributor.id })) : [];
            },
            tableName: "brano_artista",
            deleteOldAssociations: false
        }
    },
};
//API ROUTES'
//SCALETTE
app.get("/scalette/:id", apiroutes_1.getScaletta);
app.get("/scalette", apiroutes_1.getScalette);
app.post("/scalette", apiroutes_1.postScalette);
app.put("/scalette/:id", apiroutes_1.putScalette);
app.delete("/scalette/:id", apiroutes_1.deleteScalette);
//API DEEZER---------------------------------------------
//GENERI
app.get("/generi", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, generiAPIsConfig["getAll"]); });
app.get("/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, generiAPIsConfig["getSingle"]); });
//ARTISTI
app.get("/artisti/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, artistiAPIsConfig["search"]); });
app.get("/artisti/related", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, artistiAPIsConfig["related"]); });
app.get("/artisti/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, artistiAPIsConfig["genere"]); });
//artisti/brano non serve perchè c'è già brani/single che restituisce anche gli artisti di un brano
//TODO: implementare artisti/album per ottenere tutti gli artisti dell'album (passando per forza dai brani!)
//ALBUM--------------------------------------------------------
app.get("/album/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, albumAPIsConfig["search"]); });
app.get("/album/single", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, albumAPIsConfig["getSingle"]); });
app.get("/album/artista", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, albumAPIsConfig["artist"]); });
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, braniAPIsConfig["album"]); });
app.get("/brani/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, braniAPIsConfig["search"]); });
app.get("/brani/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, braniAPIsConfig["genere"]); });
app.get("/brani/artista", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, braniAPIsConfig["artista"]); });
app.get("/brani/single", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, braniAPIsConfig["single"]); });
//PASSAGGI
app.get("/brani/:id/passaggi", apiroutes_1.getBranoPassaggi);
app.get("/album/:id/passaggi", apiroutes_1.getAlbumPassaggi);
app.get("/artisti/:id/passaggi", apiroutes_1.getArtistaPassaggi);
app.get("/utenti/:id/passaggi", apiroutes_1.getUtentePassaggi);
app.get("/generi/:id/passaggi", apiroutes_1.getGeneriPassaggi);
app.get("/passaggi", apiroutes_1.getPassaggi);
app.get("/passaggi/:id", apiroutes_1.getPassaggio);
app.post("/passaggi", apiroutes_1.postPassaggio);
app.put("/passaggi/:id", apiroutes_1.putPassaggio);
app.delete("/passaggi/:id", apiroutes_1.deletePassaggio);
//UTENTI
app.get("/utenti", apiroutes_1.getUtenti);
app.get("/utenti/:id", apiroutes_1.getUtente);
app.post("/utenti", apiroutes_1.postUtente);
app.put("/utenti/:id", apiroutes_1.putUtente);
app.delete("/utenti/:id", apiroutes_1.deleteUtente);
//COMMENTI
app.get("/commenti", apiroutes_1.getCommenti);
app.get("/commenti/:id", apiroutes_1.getCommento);
app.post("/commenti", apiroutes_1.postCommento);
app.put("/commenti/:id", apiroutes_1.putCommento);
app.delete("/commenti/:id", apiroutes_1.deleteCommento);
//VALUTAZIONI
app.get("/valutazioni", apiroutes_1.getValutazioni);
app.get("/valutazioni/:id", apiroutes_1.getValutazione);
app.post("/valutazioni", apiroutes_1.postValutazione);
app.put("/valutazioni/:id", apiroutes_1.putValutazione);
app.delete("/valutazioni/:id", apiroutes_1.deleteValutazione);
//VISUALIZZAZIONI
app.post("/visualizzazioni", apiroutes_1.postVisualizzazione);
//LOGIN
app.post("/login", apiroutes_1.postLogin);
exports.default = app;
//# sourceMappingURL=server.js.map