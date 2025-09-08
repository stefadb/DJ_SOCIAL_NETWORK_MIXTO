import { deezerEntityApi, deleteCommento, deletePassaggio, deleteScalette, deleteUtente, deleteValutazione, getAlbumPassaggi, getArtistaPassaggi, getBranoPassaggi, getCommenti, getCommento, getGeneriPassaggi, getPassaggi, getPassaggio, getScaletta, getScalette, getUtente, getUtentePassaggi, getUtenti, getValutazione, getValutazioni, postCommento, postLogin, postPassaggio, postScalette, postUtente, postValutazione, postVisualizzazione, putCommento, putPassaggio, putScalette, putUtente, putValutazione } from "./apiroutes";

import express from "express";
import { makeDeezerApiCall } from "./functions";
import { DeezerEntityAPIConfig, DeezerEntityAPIsConfig } from "./types";
import { GenericDeezerEntityBasic, AlbumDeezerBasic, AlbumDeezerBasicSchema, ArtistaDeezerBasic, ArtistaDeezerBasicSchema, GenereDeezerBasicSchema, GenereDeezerSemplificatoSchema, BranoDeezerBasicSchema } from "./deezer_types";
import { AlbumDb, ArtistaDb } from "./db_types";
import axios from "axios";
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
      tableName: "Artista",
      deezerEntitySchema: ArtistaDeezerBasicSchema,
      getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        return response.data.data as GenericDeezerEntityBasic[];
      }
    }]
  },
  related: {
    paramName: "artistId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "artist", param, "related", { limit: limit.toString(), index: index.toString() }),
    entities: [{
      tableName: "Artista",
      deezerEntitySchema: ArtistaDeezerBasicSchema,
      getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        return response.data.data as GenericDeezerEntityBasic[];
      }
    }]
  },
  genre: {
    paramName: "genreId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "genre", param, "artists", { limit: limit.toString(), index: index.toString() }),
    entities: [{
      tableName: "Artista",
      deezerEntitySchema: ArtistaDeezerBasicSchema,
      getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        return response.data.data as GenericDeezerEntityBasic[];
      }
    }]
  }
}

type AlbumAPIsConfig = {
  search: DeezerEntityAPIConfig;
  getSingle: DeezerEntityAPIConfig;
  artist: DeezerEntityAPIConfig;
}

const albumAPIsConfig: AlbumAPIsConfig = {
  search: {
    paramName: "query",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "search", null, "album", { q: param, limit: limit.toString(), index: index.toString() }),
    entities: [{
      tableName: "Album",
      deezerEntitySchema: AlbumDeezerBasicSchema,
      getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        return response.data.data as GenericDeezerEntityBasic[];
      }
    }]
  },
  getSingle: {
    paramName: "albumId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "album", param, null, null),
    entities: [
      {
        tableName: "Album",
        deezerEntitySchema: AlbumDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return [response.data] as GenericDeezerEntityBasic[];
        }
      },
      {
        tableName: "Genere",
        deezerEntitySchema: GenereDeezerSemplificatoSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        return response.data.genres.data as GenericDeezerEntityBasic[];
      }
      }
    ],
    association: {
      tableName: "album_genere",
      deleteOldAssociations: true,
      getAssociationsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        const albumId: number = response.data.id;
        const generi: { id: number; }[] = response.data.genres.data;
        const associations: { id_album: number; id_genere: number; }[] = generi.map((genere) => {
          return { id_album: albumId, id_genere: genere.id };
        });
        return associations;
      }
    }
  },
  artist: {
    paramName: "artistId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "artist", param, "albums", { limit: limit.toString(), index: index.toString() }),
    entities: [
      {
        tableName: "Album",
        deezerEntitySchema: AlbumDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.data as GenericDeezerEntityBasic[];
        }
      }
    ]
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
      tableName: "Genere",
      deezerEntitySchema: GenereDeezerBasicSchema,
      getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        return [response.data] as GenericDeezerEntityBasic[];
      }
    }]
  },
  getAll: {
    paramName: "uselessParam",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "genre", null, null, null),
    entities: [{
      tableName: "Genere",
      deezerEntitySchema: GenereDeezerBasicSchema,
      getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        return response.data.data as GenericDeezerEntityBasic[];
      }
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
      tableName: "Brano",
      deezerEntitySchema: BranoDeezerBasicSchema,
      getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        return response.data.data as GenericDeezerEntityBasic[];
      }
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
app.get("/generi", (req, res) => { deezerEntityApi(req, res, generiAPIsConfig["getAll"]) });
app.get("/genere", (req, res) => { deezerEntityApi(req, res, generiAPIsConfig["getSingle"]) });
//ARTISTI
app.get("/artisti/search", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig["search"]) });
app.get("/artisti/related", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig["related"]) });
app.get("/artisti/genere", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig["genre"]) });
//ALBUM--------------------------------------------------------
app.get("/album/search", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["search"]) });
//TODO scrivere il test per questa API
app.get("/album", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["getSingle"]) });
//TODO scrivere il test per questa API
app.get("/album/artista", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["artist"]) });
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["album"]) });


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
