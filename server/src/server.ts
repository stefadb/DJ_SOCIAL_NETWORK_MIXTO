import { deezerEntityApi, deleteCommento, deletePassaggio, deleteScalette, deleteUtente, deleteValutazione, getAlbumPassaggi, getArtistaPassaggi, getBranoPassaggi, getCommenti, getCommento, getGeneriPassaggi, getPassaggi, getPassaggio, getScaletta, getScalette, getUtente, getUtentePassaggi, getUtenti, getValutazione, getValutazioni, postCommento, postLogin, postPassaggio, postScalette, postUtente, postValutazione, postVisualizzazione, putCommento, putPassaggio, putScalette, putUtente, putValutazione } from "./apiroutes";

import express from "express";
import { makeDeezerApiCall } from "./functions";
import { DeezerEntityAPIConfig, DeezerEntityAPIsConfig } from "./types";
import { GenericDeezerEntityBasic, AlbumDeezerBasic, AlbumDeezerBasicSchema, ArtistaDeezerBasic, ArtistaDeezerBasicSchema, GenereDeezerBasicSchema } from "./deezer_types";
import { AlbumDb, ArtistaDb } from "./db_types";
const app = express();
const port = 3000;

type ArtistiAPIsConfig = {
  search: DeezerEntityAPIConfig;
  related: DeezerEntityAPIConfig;
  genre: DeezerEntityAPIConfig;
}

const artistiAPIsConfig: ArtistiAPIsConfig = {
  search: {
    paramName: "query",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "search", null, "artist", { q: param, limit: limit.toString(), index: index.toString() }),
    entities: [{
      multiple: true,
      tableName: "Artista",
      keyOfDeezerResponse: ""
    }]
  },
  related: {
    paramName: "artistId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "artist", param, "related", { limit: limit.toString(), index: index.toString() }),
    entities: [{
      multiple: true,
      tableName: "Artista",
      keyOfDeezerResponse: ""
    }]
  },
  genre: {
    paramName: "genreId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "genre", param, "artists", { limit: limit.toString(), index: index.toString() }),
    entities: [{
      multiple: true,
      tableName: "Artista",
      keyOfDeezerResponse: ""
    }]
  }
}

type AlbumAPIsConfig = {
  search: DeezerEntityAPIConfig;
}

const albumAPIsConfig: AlbumAPIsConfig = {
  search: {
    paramName: "query",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "search", null, "album", { q: param, limit: limit.toString(), index: index.toString() }),
    entities: [{
      multiple: true,
      tableName: "Album",
      keyOfDeezerResponse: ""
    }]
  }
}

type GeneriAPIsConfig = {
  getSingle: DeezerEntityAPIConfig;
  getAll: DeezerEntityAPIConfig;
}

const generiAPIsConfig: GeneriAPIsConfig = {
  getSingle: {
    paramName: "genreId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "genre", param, null, null),
    entities: [{
      multiple: false,
      tableName: "Genere",
      keyOfDeezerResponse: ""
    }]
  },
  getAll: {
    paramName: "uselessParam",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "genre", null, null, null),
    entities: [{
      multiple: true,
      tableName: "Genere",
      keyOfDeezerResponse: ""
    }]
  }
}

type BraniAPIsConfig = {
  album: DeezerEntityAPIConfig;
}

const braniAPIsConfig: BraniAPIsConfig = {
  album: {
    paramName: "albumId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "album", param, "tracks", { limit: limit.toString(), index: index.toString() }),
    entities: [{
      multiple: true,
      tableName: "Brano",
      keyOfDeezerResponse: ""
    }]
  },
}

//API ROUTES'
//SCALETTE
app.get("/scalette/:id", getScaletta);
app.get("/scalette", getScalette);
app.post("/scalette", postScalette);
app.put("/scalette/:id", putScalette);
app.delete("/scalette/:id", deleteScalette);
//API DEEZER---------------------------------------------
//GENERI
app.get("/generi", (req, res) => { deezerEntityApi(req,res,generiAPIsConfig["getAll"])});
app.get("/genere", (req, res) => { deezerEntityApi(req,res,generiAPIsConfig["getSingle"])});
//ARTISTI
app.get("/artisti/search", (req, res) => { deezerEntityApi(req,res,artistiAPIsConfig["search"])});
app.get("/artisti/related", (req, res) => { deezerEntityApi(req,res,artistiAPIsConfig["related"])});
app.get("/artisti/genere", (req, res) => { deezerEntityApi(req,res,artistiAPIsConfig["genre"])});
//ALBUM--------------------------------------------------------
app.get("/album/search", (req, res) => { deezerEntityApi(req,res,albumAPIsConfig["search"])});
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { deezerEntityApi(req,res,braniAPIsConfig["album"])});


//PASSAGGI
app.get("/brani/:id/passaggi", getBranoPassaggi);
app.get("/album/:id/passaggi", getAlbumPassaggi);
app.get("/artisti/:id/passaggi", getArtistaPassaggi);
app.get("/utenti/:id/passaggi", getUtentePassaggi);
app.get("/generi/:id/passaggi", getGeneriPassaggi);
app.get("/passaggi", getPassaggi);
app.get("/passaggi/:id", getPassaggio);
app.post("/passaggi", postPassaggio);
app.put("/passaggi/:id", putPassaggio);
app.delete("/passaggi/:id", deletePassaggio);
//UTENTI
app.get("/utenti", getUtenti);
app.get("/utenti/:id", getUtente);
app.post("/utenti", postUtente);
app.put("/utenti/:id", putUtente);
app.delete("/utenti/:id", deleteUtente);
//COMMENTI
app.get("/commenti", getCommenti);
app.get("/commenti/:id", getCommento);
app.post("/commenti", postCommento);
app.put("/commenti/:id", putCommento);
app.delete("/commenti/:id", deleteCommento);
//VALUTAZIONI
app.get("/valutazioni", getValutazioni);
app.get("/valutazioni/:id", getValutazione);
app.post("/valutazioni", postValutazione);
app.put("/valutazioni/:id", putValutazione);
app.delete("/valutazioni/:id", deleteValutazione);
//VISUALIZZAZIONI
app.post("/visualizzazioni", postVisualizzazione);
//LOGIN
app.post("/login", postLogin);

export default app;
