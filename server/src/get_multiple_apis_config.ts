import { ZodObject } from "zod/v3";
import { PassaggioDbSchema, ScalettaDbSchema, UtenteDbSchema, VisualizzazioneDbSchema, CommentoDbSchema, ValutazioneDbSchema, BranoDbSchema, AlbumDbSchema, ArtistaDbSchema, GenereDbSchema } from "./db_types";

export const getMultipleApisConfig = {
    scaletta: (req: import("express").Request) => {
        return {
            mainTableName: "scaletta",
            mainTableColumns: req.query.columns === undefined ? ["id", "nome", "descrizione", "id_utente"] : (req.query.columns as string).split(","),
            mainTableSchema: ScalettaDbSchema,
            filtersAndJoins: [
                ...(req.query.utente ? [{
                    joinedTableName: "utente",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.utente as string
                }] : []),
                ...(req.query.passaggio ? [{
                    joinedTableName: "passaggio",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.passaggio as string
                }] : [])
            ]
        }
    },
    passaggio: (req: import("express").Request) => {
        return {
            mainTableName: "passaggio",
            mainTableColumns: req.query.columns === undefined ? ["id", "testo", "inizio_secondo_brano", "cue_secondo_brano", "data_pubblicazione", "id_utente", "id_brano_1", "id_brano_2"] : (req.query.columns as string).split(","),
            mainTableSchema: PassaggioDbSchema,
            orderBys: ["passaggio.data_pubblicazione DESC"],
            filtersAndJoins: [
                ...(req.query.utente ? [{
                    joinedTableName: "utente",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.utente as string
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "1",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                },
                {
                    joinedTableName: "brano",
                    joinColumnSuffix: "2",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
                ...(req.query.primoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.primoBrano as string,
                    joinColumnSuffix: "1"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "2",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
                ...(req.query.secondoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.secondoBrano as string,
                    joinColumnSuffix: "2"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "1",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
                ...(req.query.albumPrimoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id_album",
                    value: req.query.albumPrimoBrano as string,
                    joinColumnSuffix: "1"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "1",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                },
                {
                    joinedTableName: "brano",
                    joinColumnSuffix: "2",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
                ...(req.query.albumSecondoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id_album",
                    value: req.query.albumSecondoBrano as string,
                    joinColumnSuffix: "2"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "1",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                },
                {
                    joinedTableName: "brano",
                    joinColumnSuffix: "2",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
                ...(req.query.scaletta ? [{
                    joinedTableName: "scaletta",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.scaletta as string
                }] : []),
                ...(req.query.artistaPrimoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: "(SELECT brano.id FROM brano JOIN brano_artista ON brano_artista.id_brano = brano.id WHERE brano_artista.id_artista = " + (req.query.artistaPrimoBrano as string) + ")",
                    operator: "IN" as "LIKE" | "=" | "IN",
                    joinColumnSuffix: "1"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "1",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                },
                {
                    joinedTableName: "brano",
                    joinColumnSuffix: "2",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
                ...(req.query.artistaSecondoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: "(SELECT brano.id FROM brano JOIN brano_artista ON brano_artista.id_brano = brano.id WHERE brano_artista.id_artista = " + (req.query.artistaSecondoBrano as string) + ")",
                    operator: "IN" as "LIKE" | "=" | "IN",
                    joinColumnSuffix: "2"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "1",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                },
                {
                    joinedTableName: "brano",
                    joinColumnSuffix: "2",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
                ...(req.query.generePrimoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: "(SELECT brano.id FROM album_genere JOIN album ON album_genere.id_album = album.id JOIN brano ON brano.id_album = album.id WHERE album_genere.id_genere = " + (req.query.generePrimoBrano as string) + ")",
                    operator: "IN" as "LIKE" | "=" | "IN",
                    joinColumnSuffix: "1"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "1",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                },
                {
                    joinedTableName: "brano",
                    joinColumnSuffix: "2",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
                ...(req.query.genereSecondoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: "(SELECT brano.id FROM album_genere JOIN album ON album_genere.id_album = album.id JOIN brano ON brano.id_album = album.id WHERE album_genere.id_genere = " + (req.query.genereSecondoBrano as string) + ")",
                    operator: "IN" as "LIKE" | "=" | "IN",
                    joinColumnSuffix: "2"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "1",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                },
                {
                    joinedTableName: "brano",
                    joinColumnSuffix: "2",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
            ]
        }
    },
    passaggioConta: (req: import("express").Request) => {
        return {
            mainTableName: "passaggio",
            mainTableColumns: [...(req.query.primoBrano ? ["id_brano_2"] : []), ...(req.query.secondoBrano ? ["id_brano_1"] : [])],
            selectCustomColumns: ["COUNT(*) AS numero_passaggi"],
            mainTableSchema: undefined, //perchè non vengono restituite tutte le colonne del passaggio
            orderBys: ["numero_passaggi DESC"],
            customGroupBys: [...(req.query.primoBrano ? ["passaggio.id_brano_2"] : []), ...(req.query.secondoBrano ? ["passaggio.id_brano_1"] : [])],
            filtersAndJoins: [
                ...(req.query.primoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.primoBrano as string,
                    joinColumnSuffix: "1"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "2",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : []),
                ...(req.query.secondoBrano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.secondoBrano as string,
                    joinColumnSuffix: "2"
                }, {
                    joinedTableName: "brano",
                    joinColumnSuffix: "1",
                    
                    columns: ["id", "titolo", "durata", "id_album"],
                    schema: BranoDbSchema
                }] : [])
            ]
        }
    },
    commento: (req: import("express").Request) => {
        return {
            mainTableName: "commento",
            mainTableColumns: req.query.columns === undefined ? ["id", "testo", "data_pubblicazione", "id_utente", "id_passaggio", "id_commento_padre"] : (req.query.columns as string).split(","),
            mainTableSchema: CommentoDbSchema,
            filtersAndJoins: [
                ...(req.query.utente ? [{
                    joinedTableName: "utente",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.utente as string
                }] : []),
                ...(req.query.passaggio ? [{
                    joinedTableName: "passaggio",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.passaggio as string
                }, {
                    joinedTableName: "utente",
                    
                    columns: ["id", "username", "nome", "cognome"],
                    schema: UtenteDbSchema
                }] : []),
                ...(req.query.commentoPadre ? [{
                    joinedTableName: "commento",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.commentoPadre as string,
                    joinColumnSuffix: "padre"
                }] : []),
            ]
        }
    },
    valutazione: (req: import("express").Request) => {
        return {
            mainTableName: "valutazione",
            mainTableColumns: req.query.columns === undefined ? ["id", "voto", "id_utente", "id_passaggio"] : (req.query.columns as string).split(","),
            mainTableSchema: ValutazioneDbSchema,
            filtersAndJoins: [
                ...(req.query.utente ? [{
                    joinedTableName: "utente",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.utente as string
                }] : []),
                ...(req.query.passaggio ? [{
                    joinedTableName: "passaggio",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.passaggio as string
                },{
                    joinedTableName: "utente",
                    
                    columns: ["id", "username", "nome", "cognome"],
                    schema: UtenteDbSchema
                }] : []),
                ...(req.query.mediaPassaggio ? [{
                    selectCustomColumns: ["AVG(valutazione.voto) AS voto_medio"],
                    customGroupBys: ["valutazione.id_passaggio"],
                    joinedTableName: undefined,
                    joinedTableColumnToCheckValueIn: "id_passaggio",
                    value: req.query.mediaPassaggio as string
                }] : []),
            ]
        }
    },
    visualizzazione: (req: import("express").Request) => {
        return {
            mainTableName: "visualizzazione",
            mainTableColumns: req.query.columns === undefined ? ["id", "data_visualizzazione", "id_utente", "id_passaggio"] : (req.query.columns as string).split(","),
            mainTableSchema: VisualizzazioneDbSchema,
            filtersAndJoins: [
                ...(req.query.passaggio ? [{
                    joinedTableName: "passaggio",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.passaggio as string
                }] : []),
            ]
        }
    },
    utente: (req: import("express").Request) => {
        return {
            mainTableName: "utente",
            mainTableColumns: req.query.columns === undefined ? ["id", "username", "nome", "cognome", "password"] : (req.query.columns as string).split(","),
            mainTableSchema: UtenteDbSchema,
            filtersAndJoins: []
        }
    },
    brano: (req: import("express").Request) => {
        return {
            mainTableName: "brano",
            mainTableColumns: req.query.columns === undefined ? ["id", "titolo", "durata", "id_album"] : (req.query.columns as string).split(","),
            mainTableSchema: BranoDbSchema,
            filtersAndJoins: [
                ...(req.query.album ? [{
                    joinedTableName: "album",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.album as string
                }] : []),
                ...(req.query.artista ? [{
                    joinedTableName: "artista",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.artista as string

                }] : []),
                ...(req.query.passaggio ? [{
                    joinedTableName: "passaggio",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.passaggio as string
                }] : []),
                ...(req.query.query ? [{
                    joinedTableName: undefined,
                    joinedTableColumnToCheckValueIn: "titolo",
                    operator: "LIKE" as "LIKE" | "=" | "IN",
                    value: `'%${req.query.query as string}%'`
                }] : [])
            ]
        }
    },
    album: (req: import("express").Request) => {
        return {
            mainTableName: "album",
            mainTableColumns: req.query.columns === undefined ? ["id", "titolo", "data_uscita"] : (req.query.columns as string).split(","),
            mainTableSchema: AlbumDbSchema,
            filtersAndJoins: [
                ...(req.query.brano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.brano as string
                }] : []),
                ...(req.query.genere ? [{
                    joinedTableName: "genere",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.genere as string
                }] : []),
                ...(req.query.query ? [{
                    joinedTableName: undefined,
                    joinedTableColumnToCheckValueIn: "titolo",
                    operator: "LIKE" as "LIKE" | "=" | "IN",
                    value: `'%${req.query.query as string}%'`
                }] : [])
            ]
        }
    },
    artista: (req: import("express").Request) => {
        return {
            mainTableName: "artista",
            mainTableColumns: req.query.columns === undefined ? ["id", "nome"] : (req.query.columns as string).split(","),
            mainTableSchema: ArtistaDbSchema,
            filtersAndJoins: [
                ...(req.query.brano ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.brano as string
                }] : []),
                ...(req.query.album ? [{
                    joinedTableName: "brano",
                    joinedTableColumnToCheckValueIn: "id_album",
                    value: req.query.album as string
                }] : []),
                ...(req.query.query ? [{
                    joinedTableName: undefined,
                    joinedTableColumnToCheckValueIn: "nome",
                    operator: "LIKE" as "LIKE" | "=" | "IN",
                    value: `'%${req.query.query as string}%'`
                }] : [])
            ]
        }
    },
    genere: (req: import("express").Request) => {
        return {
            mainTableName: "genere",
            mainTableColumns: req.query.columns === undefined ? ["id", "nome"] : (req.query.columns as string).split(","),
            mainTableSchema: GenereDbSchema,
            filtersAndJoins: [
                ...(req.query.album ? [{
                    joinedTableName: "album",
                    joinedTableColumnToCheckValueIn: "id",
                    value: req.query.album as string
                }] : []),
            ]
        }
    }
};