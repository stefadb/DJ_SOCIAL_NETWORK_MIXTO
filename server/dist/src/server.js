"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiroutes_1 = require("./apiroutes");
const express_1 = __importDefault(require("express"));
const functions_1 = require("./functions");
const app = (0, express_1.default)();
const port = 3000;
const artistiAPIsConfig = {
    search: {
        paramName: "query",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "search", null, "artist", { q: param, limit: limit.toString(), index: index.toString() }),
        entities: [{
                multiple: true,
                tableName: "Artista",
                keyOfDeezerResponse: "",
                getObjectsFromResponse: (response) => {
                    return response.data.data;
                }
            }]
    },
    related: {
        paramName: "artistId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "artist", param, "related", { limit: limit.toString(), index: index.toString() }),
        entities: [{
                multiple: true,
                tableName: "Artista",
                keyOfDeezerResponse: "",
                getObjectsFromResponse: (response) => {
                    return response.data.data;
                }
            }]
    },
    genre: {
        paramName: "genreId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "genre", param, "artists", { limit: limit.toString(), index: index.toString() }),
        entities: [{
                multiple: true,
                tableName: "Artista",
                keyOfDeezerResponse: "",
                getObjectsFromResponse: (response) => {
                    return response.data.data;
                }
            }]
    }
};
const albumAPIsConfig = {
    search: {
        paramName: "query",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "search", null, "album", { q: param, limit: limit.toString(), index: index.toString() }),
        entities: [{
                multiple: true,
                tableName: "Album",
                keyOfDeezerResponse: "",
                getObjectsFromResponse: (response) => {
                    return response.data.data;
                }
            }]
    }
};
const generiAPIsConfig = {
    getSingle: {
        paramName: "genreId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "genre", param, null, null),
        entities: [{
                multiple: false,
                tableName: "Genere",
                keyOfDeezerResponse: "",
                getObjectsFromResponse: (response) => {
                    return [response.data];
                }
            }]
    },
    getAll: {
        paramName: "uselessParam",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "genre", null, null, null),
        entities: [{
                multiple: true,
                tableName: "Genere",
                keyOfDeezerResponse: "",
                getObjectsFromResponse: (response) => {
                    return response.data.data;
                }
            }]
    }
};
const braniAPIsConfig = {
    album: {
        paramName: "albumId",
        deezerAPICallback: (res, param, limit, index) => (0, functions_1.makeDeezerApiCall)(res, "album", param, "tracks", { limit: limit.toString(), index: index.toString() }),
        entities: [{
                multiple: true,
                tableName: "Brano",
                keyOfDeezerResponse: "",
                getObjectsFromResponse: (response) => {
                    return response.data.data;
                }
            }]
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
app.get("/artisti/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, artistiAPIsConfig["genre"]); });
//ALBUM--------------------------------------------------------
app.get("/album/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, albumAPIsConfig["search"]); });
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, braniAPIsConfig["album"]); });
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