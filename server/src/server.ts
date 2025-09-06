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
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "search", null, "artist", { q: param, limit: limit.toString(), index: index.toString() })
  },
  related: {
    paramName: "artistId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "artist", param, "related", { limit: limit.toString(), index: index.toString() })
  },
  genre: {
    paramName: "genreId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "genre", param, "artists", { limit: limit.toString(), index: index.toString() })
  }
}

type AlbumAPIsConfig = {
  search: DeezerEntityAPIConfig;
}

const albumAPIsConfig: AlbumAPIsConfig = {
  search: {
    paramName: "query",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "search", null, "album", { q: param, limit: limit.toString(), index: index.toString() })
  },
}

type GeneriAPIsConfig = {
  getSingle: DeezerEntityAPIConfig;
  getAll: DeezerEntityAPIConfig;
}

const generiAPIsConfig: GeneriAPIsConfig = {
  getSingle: {
    paramName: "genreId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "genre", param, null, null)
  },
  getAll: {
    paramName: "uselessParam",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "genre", null, null, null)
  }
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
app.get("/generi", (req, res) => { deezerEntityApi(true,generiAPIsConfig["getAll"],GenereDeezerBasicSchema,"Genere",req,res)});
app.get("/genere", (req, res) => { deezerEntityApi(false,generiAPIsConfig["getSingle"],GenereDeezerBasicSchema,"Genere",req,res)});



//TODO: Aggiungere le API per gli album, gli artisti e i brani
//ARTISTI

// Cerca su Deezer gli artisti che l'utente ha cercato e, per ognuno, fa upsert sul db e download della foto.
app.get("/artisti/search", (req, res) => { deezerEntityApi(true,artistiAPIsConfig["search"],ArtistaDeezerBasicSchema,"Artista",req,res)});
app.get("/artisti/related", (req, res) => { deezerEntityApi(true,artistiAPIsConfig["related"],ArtistaDeezerBasicSchema,"Artista",req,res)});
app.get("/artisti/genere", (req, res) => { deezerEntityApi(true,artistiAPIsConfig["genre"],ArtistaDeezerBasicSchema,"Artista",req,res)});
//--------------------------------------------------------
app.get("/album/search", (req, res) => { deezerEntityApi(true,albumAPIsConfig["search"],AlbumDeezerBasicSchema,"Album",req,res)});


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
