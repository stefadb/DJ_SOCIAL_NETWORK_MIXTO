import { deezerEntityApi, deleteCommento, deletePassaggio, deleteScalette, deleteUtente, deleteValutazione, getAlbumPassaggi, getArtistaPassaggi, getBranoPassaggi, getCommenti, getCommento, getGeneriPassaggi, getPassaggi, getPassaggio, getScaletta, getScalette, getUtente, getUtentePassaggi, getUtenti, getValutazione, getValutazioni, postCommento, postLogin, postPassaggio, postScalette, postUtente, postValutazione, postVisualizzazione, putCommento, putPassaggio, putScalette, putUtente, putValutazione } from "./apiroutes";

import express from "express";
import { makeDeezerApiCall } from "./functions";
import { DeezerEntityAPIConfig, DeezerEntityAPIsConfig } from "./types";
import { GenericDeezerEntityBasic, AlbumDeezerBasic, AlbumDeezerBasicSchema, ArtistaDeezerBasic, ArtistaDeezerBasicSchema, GenereDeezerBasicSchema, GenereDeezerSemplificatoSchema, BranoDeezerBasicSchema, BranoDeezerBasic } from "./deezer_types";
import { AlbumDb, ArtistaDb, AssocBranoArtistaDb } from "./db_types";
import axios from "axios";
const app = express();
const port = 3000;

type ArtistiAPIsConfig = {
  search: DeezerEntityAPIConfig;
  related: DeezerEntityAPIConfig;
  genere: DeezerEntityAPIConfig;
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
      },
      showEntityInResponse: true
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
      },
      showEntityInResponse: true
    }]
  },
  genere: {
    paramName: "genreId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "genre", param, "artists", { limit: limit.toString(), index: index.toString() }),
    entities: [{
      tableName: "Artista",
      deezerEntitySchema: ArtistaDeezerBasicSchema,
      getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        return response.data.data as GenericDeezerEntityBasic[];
      },
      showEntityInResponse: true
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
      },
      showEntityInResponse: true
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
        },
        showEntityInResponse: true
      },
      {
        tableName: "Genere",
        deezerEntitySchema: GenereDeezerSemplificatoSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.genres.data as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: false
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
        },
        showEntityInResponse: true
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
      },
      showEntityInResponse: true
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
      },
      showEntityInResponse: true
    }]
  }
}

type BraniAPIsConfig = {
  album: DeezerEntityAPIConfig;
  search: DeezerEntityAPIConfig;
  genere: DeezerEntityAPIConfig;
  artista: DeezerEntityAPIConfig;
  single: DeezerEntityAPIConfig;
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
      },
      showEntityInResponse: true
    }]
  },
  search: {
    paramName: "query",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "search", null, "track", { q: param, limit: limit.toString(), index: index.toString() }),
    entities: [
      {
        tableName: "Album",
        deezerEntitySchema: AlbumDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.data.map((track: BranoDeezerBasic) => track.album) as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: false
      },
      {
        tableName: "Brano",
        deezerEntitySchema: BranoDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.data as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: true
      },
      {
        tableName: "Artista",
        deezerEntitySchema: ArtistaDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.data.map((track: BranoDeezerBasic) => track.artist) as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: false
      }
    ],
    association: {
      getAssociationsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        const tracks: BranoDeezerBasic[] = response.data.data as BranoDeezerBasic[];
        return tracks
          .filter((track): track is typeof track & { artist: { id: number } } => track.artist !== undefined)
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
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "chart", param, "tracks", { limit: limit.toString(), index: index.toString() }),
    entities: [
      {
        tableName: "Album",
        deezerEntitySchema: AlbumDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.data.map((track: BranoDeezerBasic) => track.album) as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: false
      },
      {
        tableName: "Brano",
        deezerEntitySchema: BranoDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.data as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: true
      },
      {
        tableName: "Artista",
        deezerEntitySchema: ArtistaDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.data.map((track: BranoDeezerBasic) => track.artist) as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: false
      },
    ],
    association: {
      getAssociationsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        const tracks: BranoDeezerBasic[] = response.data.data as BranoDeezerBasic[];
        return tracks
          .filter((track): track is typeof track & { artist: { id: number } } => track.artist !== undefined)
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
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "artist", param, "top", { limit: limit.toString(), index: index.toString() }),
    entities: [
      {
        tableName: "Album",
        deezerEntitySchema: AlbumDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.data.map((track: BranoDeezerBasic) => track.album) as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: false
      },
      {
        tableName: "Brano",
        deezerEntitySchema: BranoDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.data as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: true
      },
      {
        tableName: "Artista",
        deezerEntitySchema: ArtistaDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return ([] as ArtistaDeezerBasic[]).concat(...response.data.data.map((track: BranoDeezerBasic) => track.contributors as ArtistaDeezerBasic[] || [])) as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: false
      },
    ],
    association: {
      getAssociationsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        let associationsCount = 0;
        let tracks = response.data.data as BranoDeezerBasic[];
        tracks.forEach((track) => { track.contributors?.forEach((_) => { associationsCount++; }) });
        let index = 0;
        let associations: AssocBranoArtistaDb[] = new Array(associationsCount);
        tracks.forEach((track) => {
          track.contributors?.forEach((contributor) => {
            associations[index] = { id_brano: track.id, id_artista: contributor.id };
            index++;
          })
        });
        return associations;
      },
      tableName: "brano_artista",
      deleteOldAssociations: false
    }
  },
  single: {
    paramName: "trackId",
    deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => makeDeezerApiCall(res, "track", param, null, null),
    entities: [
      {
        tableName: "Album",
        deezerEntitySchema: AlbumDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return [response.data.album] as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: false
      },
      {
        tableName: "Brano",
        deezerEntitySchema: BranoDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return [response.data] as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: true
      },
      {
        tableName: "Artista",
        deezerEntitySchema: ArtistaDeezerBasicSchema,
        getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
          return response.data.contributors as GenericDeezerEntityBasic[];
        },
        showEntityInResponse: false
      },
    ],
    association: {
      getAssociationsFromResponse: (response: axios.AxiosResponse<any, any>) => {
        let track = response.data as BranoDeezerBasic;
        return track.contributors ? track.contributors.map((contributor) => ({ id_brano: track.id, id_artista: contributor.id })) as AssocBranoArtistaDb[] : [];
      },
      tableName: "brano_artista",
      deleteOldAssociations: false
    }
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
app.get("/artisti/genere", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig["genere"]) });
//artisti/brano non serve perchè c'è già brani/single che restituisce anche gli artisti di un brano
//TODO: implementare artisti/album per ottenere tutti gli artisti dell'album (passando per forza dai brani!)
//ALBUM--------------------------------------------------------
app.get("/album/search", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["search"]) });
app.get("/album/single", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["getSingle"]) });
app.get("/album/artista", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["artist"]) });
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["album"]) });
app.get("/brani/search", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["search"]) });
app.get("/brani/genere", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["genere"]) });
app.get("/brani/artista", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["artista"]) });
app.get("/brani/single", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["single"]) });

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
