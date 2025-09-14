import { BranoDbSchema, CommentoDbSchema, PassaggioDbSchema, ScalettaDbSchema, UtenteDbSchema, ValutazioneDbSchema, VisualizzazioneDbSchema } from "./db_types";


export const getSingleApisConfig = {
    scaletta: {
        mainTableName: "scaletta",
        mainTableColumns: ["id", "nome", "descrizione", "id_utente"],
        mainTableSchema: ScalettaDbSchema,
        otherTables: [
            {
                tableName: "passaggio",
                columns: ["id", "testo", "inizio_secondo_brano", "cue_secondo_brano", "data_pubblicazione", "id_utente", "id_brano_1", "id_brano_2"],
                schema: PassaggioDbSchema
            },
            {
                tableName: "utente",
                columns: ["id", "username", "nome", "cognome", "password"],
                schema: UtenteDbSchema
            }
        ]
    },
    passaggio: {
        mainTableName: "passaggio",
        mainTableColumns: ["id", "testo", "inizio_secondo_brano", "cue_secondo_brano", "data_pubblicazione", "id_utente", "id_brano_1", "id_brano_2"],
        mainTableSchema: PassaggioDbSchema,
        otherTables: [
            {
                tableName: "utente",
                columns: ["id", "username", "nome", "cognome", "password"],
                schema: UtenteDbSchema
            },
            {
                tableName: "brano",
                columns: ["id", "titolo", "durata", "id_album"],
                schema: BranoDbSchema
            },
            {
                tableName: "commento",
                columns: ["id", "testo", "data_pubblicazione", "id_utente", "id_passaggio", "id_commento_padre"],
                schema: CommentoDbSchema
            },
            {
                tableName: "valutazione",
                columns: ["id", "voto", "id_utente", "id_passaggio"],
                schema: ValutazioneDbSchema
            },
            {
                tableName: "scaletta",
                columns: ["id", "nome", "descrizione", "id_utente"],
                schema: ScalettaDbSchema
            },
            {
                tableName: "visualizzazione",
                columns: ["id", "data_visualizzazione", "id_utente", "id_passaggio"],
                schema: VisualizzazioneDbSchema
            }
        ]
    },
    utente: {
        mainTableName: "utente",
        mainTableColumns: ["id", "username", "nome", "cognome", "password"],
        mainTableSchema: UtenteDbSchema,
        otherTables: [
            {
                tableName: "passaggio",
                columns: ["id", "testo", "inizio_secondo_brano", "cue_secondo_brano", "data_pubblicazione", "id_utente", "id_brano_1", "id_brano_2"],
                schema: PassaggioDbSchema
            },
            {
                tableName: "scaletta",
                columns: ["id", "nome", "descrizione", "id_utente"],
                schema: ScalettaDbSchema
            },
            {
                tableName: "valutazione",
                columns: ["id", "voto", "id_utente", "id_passaggio"],
                schema: ValutazioneDbSchema
            },
            {
                tableName: "commento",
                columns: ["id", "testo", "data_pubblicazione", "id_utente", "id_passaggio", "id_commento_padre"],
                schema: CommentoDbSchema
            },
            {
                tableName: "visualizzazione",
                columns: ["id", "data_visualizzazione", "id_utente", "id_passaggio"],
                schema: VisualizzazioneDbSchema
            }
        ]
    },
    valutazione: {
        mainTableName: "valutazione",
        mainTableColumns: ["id", "voto", "id_utente", "id_passaggio"],
        mainTableSchema: ValutazioneDbSchema,
        otherTables: [
            {
                tableName: "utente",
                columns: ["id", "username", "nome", "cognome", "password"],
                schema: UtenteDbSchema
            },
            {
                tableName: "passaggio",
                columns: ["id", "testo", "inizio_secondo_brano", "cue_secondo_brano", "data_pubblicazione", "id_utente", "id_brano_1", "id_brano_2"],
                schema: PassaggioDbSchema
            }
        ]
    },
    visualizzazione: {
        mainTableName: "visualizzazione",
        mainTableColumns: ["id", "data_visualizzazione", "id_utente", "id_passaggio"],
        mainTableSchema: VisualizzazioneDbSchema,
        otherTables: [{
            tableName: "utente",
            columns: ["id", "username", "nome", "cognome", "password"],
            schema: UtenteDbSchema
        }],
    },
    commento: {
        mainTableName: "commento",
        mainTableColumns: ["id", "testo", "data_pubblicazione", "id_utente", "id_passaggio", "id_commento_padre"],
        mainTableSchema: CommentoDbSchema,
        otherTables: [
            {
                tableName: "utente",
                columns: ["id", "username", "nome", "cognome", "password"],
                schema: UtenteDbSchema
            },
            {
                tableName: "passaggio",
                columns: ["id", "testo", "inizio_secondo_brano", "cue_secondo_brano", "data_pubblicazione", "id_utente", "id_brano_1", "id_brano_2"],
                schema: PassaggioDbSchema
            },
            {
                tableName: "commento",
                columns: ["id", "testo", "data_pubblicazione", "id_utente", "id_passaggio", "id_commento_padre"],
                schema: CommentoDbSchema
            }
        ]
    },

}