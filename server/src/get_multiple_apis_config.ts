import { PassaggioDbSchema, ScalettaDbSchema, UtenteDbSchema, VisualizzazioneDbSchema, CommentoDbSchema, ValutazioneDbSchema } from "./db_types";

export const getMultipleApisConfig = {
    scaletta: (req: import("express").Request) => { return{
        mainTableName: "scaletta",
        mainTableColumns: req.query.columns === undefined ? ["id", "nome", "descrizione", "id_utente"] : (req.query.columns as string).split(","),
        mainTableSchema: ScalettaDbSchema,
        filters: [
            ...(req.query.utente ? [{
                table: "utente",
                column: "id",
                value: req.query.utente as string
            }] : []),
            ...(req.query.passaggio ? [{
                table: "passaggio",
                column: "id",
                value: req.query.passaggio as string
            }] : [])
        ]
    }},
    passaggio: (req: import("express").Request) => { return{
        mainTableName: "passaggio",
        mainTableColumns: req.query.columns === undefined ? ["id", "testo", "inizio_secondo_brano", "cue_secondo_brano", "data_pubblicazione", "id_utente", "id_brano_1", "id_brano_2"] : (req.query.columns as string).split(","),
        mainTableSchema: PassaggioDbSchema,
        filters: [
            ...(req.query.utente ? [{
                table: "utente",
                column: "id",
                value: req.query.utente as string
            }] : []),
            ...(req.query.primoBrano ? [{
                table: "brano",
                column: "id",
                value: req.query.primoBrano as string,
                joinColumnSuffix: "1"
            }] : []),
            ...(req.query.secondoBrano ? [{
                table: "brano",
                column: "id",
                value: req.query.secondoBrano as string,
                joinColumnSuffix: "2"
            }] : []),
            ...(req.query.scaletta ? [{
                table: "scaletta",
                column: "id",
                value: req.query.scaletta as string
            }] : [])
        ]
    }},
    commento: (req: import("express").Request) => { return{
        mainTableName: "commento",
        mainTableColumns: req.query.columns === undefined ? ["id", "testo", "data_pubblicazione", "id_utente", "id_passaggio", "id_commento_padre"] : (req.query.columns as string).split(","),
        mainTableSchema: CommentoDbSchema,
        filters: [
            ...(req.query.utente ? [{
                table: "utente",
                column: "id",
                value: req.query.utente as string
            }] : []),
            ...(req.query.passaggio ? [{
                table: "passaggio",
                column: "id",
                value: req.query.passaggio as string
            }] : []),
            ...(req.query.commentoPadre ? [{
                table: "commento",
                column: "id",
                value: req.query.commentoPadre as string,
                joinColumnSuffix: "padre"
            }] : []),
        ]
    }},
    valutazione: (req: import("express").Request) => { return{
        mainTableName: "valutazione",
        mainTableColumns: req.query.columns === undefined ? ["id", "voto", "id_utente", "id_passaggio"] : (req.query.columns as string).split(","),
        mainTableSchema: ValutazioneDbSchema,
        filters: [
            ...(req.query.utente ? [{
                table: "utente",
                column: "id",
                value: req.query.utente as string
            }] : []),
            ...(req.query.passaggio ? [{
                table: "passaggio",
                column: "id",
                value: req.query.passaggio as string
            }] : []),
        ]
    }},
    visualizzazione: (req: import("express").Request) => { return{
        mainTableName: "visualizzazione",
        mainTableColumns: req.query.columns === undefined ? ["id", "data_visualizzazione", "id_utente", "id_passaggio"] : (req.query.columns as string).split(","),
        mainTableSchema: VisualizzazioneDbSchema,
        filters: [
            ...(req.query.passaggio ? [{
                table: "passaggio",
                column: "id",
                value: req.query.passaggio as string
            }] : []),
        ]
    }},
    utente: (req: import("express").Request) => { return{
        mainTableName: "utente",
        mainTableColumns: req.query.columns === undefined ? ["id", "username", "nome", "cognome", "password"] : (req.query.columns as string).split(","),
        mainTableSchema: UtenteDbSchema,
        filters: []
    }},
}