import axios from "axios";
import { AlbumDeezerBasicSchema, ArtistaDeezerBasic, ArtistaDeezerBasicSchema, BranoDeezerBasic, BranoDeezerBasicSchema, GenereDeezerBasicSchema, GenereDeezerSemplificatoSchema, GenericDeezerEntityBasic } from "./deezer_types";
import { DeezerEntityAPIConfig } from "./types";
import { makeDeezerApiCall } from "./functions";
import { AssocBranoArtistaDb } from "./db_types";

function limitAndIndex(limit: number | undefined, index: number | undefined): Record<string, string> {
    return {
        ...(limit !== undefined ? { limit: limit.toString() } : {}),
        ...(index !== undefined ? { index: index.toString() } : {})
    };
}

type ArtistiAPIsConfig = {
    search: DeezerEntityAPIConfig;
    simili: DeezerEntityAPIConfig;
    genere: DeezerEntityAPIConfig;
    singolo: DeezerEntityAPIConfig;
}

type BraniAPIsConfig = {
    album: DeezerEntityAPIConfig;
    search: DeezerEntityAPIConfig;
    genere: DeezerEntityAPIConfig;
    artista: DeezerEntityAPIConfig;
    singolo: DeezerEntityAPIConfig;
}

type AlbumAPIsConfig = {
    search: DeezerEntityAPIConfig;
    singolo: DeezerEntityAPIConfig;
    artista: DeezerEntityAPIConfig;
    genere: DeezerEntityAPIConfig;
}

type GeneriAPIsConfig = {
    singolo: DeezerEntityAPIConfig;
    tutti: DeezerEntityAPIConfig;
}

export const artistiAPIsConfig: ArtistiAPIsConfig = {
    search: {
        paramName: "query",
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "search", null, "artist", {q: param, ...limitAndIndex(limit, index)}),
        entities: [{
            tableName: "Artista",
            deezerEntitySchema: ArtistaDeezerBasicSchema,
            getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
                return response.data.data as GenericDeezerEntityBasic[];
            },
            showEntityInResponse: true
        }]
    },
    simili: {
        paramName: "artistId",
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "artist", param, "related", limitAndIndex(limit, index)),
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
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "genre", param, "artists", null),
        pagination: false,
        entities: [{
            tableName: "Artista",
            deezerEntitySchema: ArtistaDeezerBasicSchema,
            getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
                return response.data.data as GenericDeezerEntityBasic[];
            },
            showEntityInResponse: true
        }]
    },
    singolo: {
        paramName: "artistId",
        maxOneCallPerDay: true,
        pagination: false,
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "artist", param, null, null),
        entities: [{
            tableName: "Artista",
            deezerEntitySchema: ArtistaDeezerBasicSchema,
            getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
                return [response.data] as GenericDeezerEntityBasic[];
            },
            showEntityInResponse: true
        }]
    }
}

export const albumAPIsConfig: AlbumAPIsConfig = {
    search: {
        paramName: "query",
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "search", null, "album", {q: param, ...limitAndIndex(limit, index)}),
        entities: [{
            tableName: "Album",
            deezerEntitySchema: AlbumDeezerBasicSchema,
            getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
                return response.data.data as GenericDeezerEntityBasic[];
            },
            showEntityInResponse: true
        }]
    },
    singolo: {
        paramName: "albumId",
        maxOneCallPerDay: true,
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "album", param, null, null),
        pagination: false,
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
            },
            {
                tableName: "Brano",
                deezerEntitySchema: BranoDeezerBasicSchema,
                getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
                    return response.data.tracks.data as GenericDeezerEntityBasic[];
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
    artista: {
        paramName: "artistId",
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "artist", param, "albums", limitAndIndex(limit, index)),
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
    },
    genere: {
        paramName: "genreId",
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "chart", param, "albums", limitAndIndex(limit, index)),
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

export const generiAPIsConfig: GeneriAPIsConfig = {
    singolo: {
        paramName: "genreId",
        maxOneCallPerDay: true,
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "genre", param, null, null),
        pagination: false,
        entities: [{
            tableName: "Genere",
            deezerEntitySchema: GenereDeezerBasicSchema,
            getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
                return [response.data] as GenericDeezerEntityBasic[];
            },
            showEntityInResponse: true
        }]
    },
    tutti: {
        paramName: "uselessParam",
        maxOneCallPerDay: true,
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "genre", null, null, null),
        pagination: false,
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

export const braniAPIsConfig: BraniAPIsConfig = {
    album: {
        paramName: "albumId",
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "album", param, "tracks", limitAndIndex(limit, index)),
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
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "search", null, "track", {q: param, ...limitAndIndex(limit, index)}),
        entities: [
            {
                tableName: "Album",
                deezerEntitySchema: AlbumDeezerBasicSchema,
                getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => {
                    return response.data.data.map((track: BranoDeezerBasic
                    ) => track.album) as GenericDeezerEntityBasic[];
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
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "chart", param, "tracks", limitAndIndex(limit, index)),
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
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "artist", param, "top", limitAndIndex(limit, index)),
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
    singolo: {
        paramName: "trackId",
        maxOneCallPerDay: true,
        deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => makeDeezerApiCall(res, "track", param, null, null),
        pagination: false,
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