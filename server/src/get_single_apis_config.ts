import { AlbumDbSchema, ArtistaDbSchema, BranoDbSchema, CommentoDbSchema, GenereDbSchema, PassaggioDbSchema, ScalettaDbSchema, UtenteDbSchema, ValutazioneDbSchema, VisualizzazioneDbSchema } from "./db_types";
import {branoColumns, scalettaColumns, passaggioColumns, commentoColumns, utenteColumns, valutazioneColumns, visualizzazioneColumns, albumColumns, artistaColumns, genereColumns} from "./columns_config";
export const getSingleApisConfig = {
    scaletta: {
        mainTableName: "scaletta",
        mainTableColumns: scalettaColumns,
        mainTableSchema: ScalettaDbSchema,
        otherTables: [
            {
                tableName: "passaggio",
                columns: passaggioColumns,
                schema: PassaggioDbSchema
            },
            {
                tableName: "utente",
                columns: utenteColumns.concat("password"),
                schema: UtenteDbSchema
            }
        ]
    },
    passaggio: {
        mainTableName: "passaggio",
        mainTableColumns: passaggioColumns,
        mainTableSchema: PassaggioDbSchema,
        otherTables: [
            {
                tableName: "utente",
                columns: utenteColumns.concat("password"),
                schema: UtenteDbSchema
            },
            {
                tableName: "commento",
                columns: commentoColumns,
                schema: CommentoDbSchema
            },
            {
                tableName: "valutazione",
                columns: valutazioneColumns,
                schema: ValutazioneDbSchema
            },
            {
                tableName: "scaletta",
                columns: scalettaColumns,
                schema: ScalettaDbSchema
            },
            {
                tableName: "visualizzazione",
                columns: visualizzazioneColumns,
                schema: VisualizzazioneDbSchema
            }
        ]
    },
    utente: {
        mainTableName: "utente",
        mainTableColumns: utenteColumns.concat("password"),
        mainTableSchema: UtenteDbSchema,
        otherTables: [
            {
                tableName: "passaggio",
                columns: passaggioColumns,
                schema: PassaggioDbSchema
            },
            {
                tableName: "scaletta",
                columns: scalettaColumns,
                schema: ScalettaDbSchema
            },
            {
                tableName: "valutazione",
                columns: valutazioneColumns,
                schema: ValutazioneDbSchema
            },
            {
                tableName: "commento",
                columns: commentoColumns,
                schema: CommentoDbSchema
            },
            {
                tableName: "visualizzazione",
                columns: visualizzazioneColumns,
                schema: VisualizzazioneDbSchema
            }
        ]
    },
    valutazione: {
        mainTableName: "valutazione",
        mainTableColumns: valutazioneColumns,
        mainTableSchema: ValutazioneDbSchema,
        otherTables: [
            {
                tableName: "utente",
                columns: utenteColumns.concat("password"),
                schema: UtenteDbSchema
            },
            {
                tableName: "passaggio",
                columns: passaggioColumns,
                schema: PassaggioDbSchema
            }
        ]
    },
    visualizzazione: {
        mainTableName: "visualizzazione",
        mainTableColumns: visualizzazioneColumns,
        mainTableSchema: VisualizzazioneDbSchema,
        otherTables: [{
            tableName: "utente",
            columns: utenteColumns.concat("password"),
            schema: UtenteDbSchema
        }],
    },
    commento: {
        mainTableName: "commento",
        mainTableColumns: commentoColumns,
        mainTableSchema: CommentoDbSchema,
        otherTables: [
            {
                tableName: "utente",
                columns: utenteColumns.concat("password"),
                schema: UtenteDbSchema
            },
            {
                tableName: "passaggio",
                columns: passaggioColumns,
                schema: PassaggioDbSchema
            }
        ]
    },
    brano: {
        mainTableName: "brano",
        mainTableColumns: branoColumns,
        mainTableSchema: BranoDbSchema,
        otherTables: [
            {
                tableName: "album",
                columns: albumColumns,
                schema: AlbumDbSchema
            },
            {
                tableName: "passaggio",
                columns: passaggioColumns,
                schema: PassaggioDbSchema
            },
            {
                tableName: "artista",
                columns: artistaColumns,
                schema: ArtistaDbSchema
            }
        ]
    },
    artista: {
        mainTableName: "artista",
        mainTableColumns: artistaColumns,
        mainTableSchema: ArtistaDbSchema,
        otherTables: [
            {
                tableName: "brano",
                columns: branoColumns,
                schema: BranoDbSchema
            }
        ]
    },
    album: {
        mainTableName: "album",
        mainTableColumns: albumColumns,
        mainTableSchema: AlbumDbSchema,
        otherTables: [
            {
                tableName: "brano",
                columns: branoColumns,
                schema: BranoDbSchema
            },
            {
                tableName: "genere",
                columns: genereColumns,
                schema: GenereDbSchema
            }
        ]
    },
    genere: {
        mainTableName: "genere",
        mainTableColumns: genereColumns,
        mainTableSchema: GenereDbSchema,
        otherTables: [
            {
                tableName: "album",
                columns: albumColumns,
                schema: AlbumDbSchema
            }
        ]
    }
};