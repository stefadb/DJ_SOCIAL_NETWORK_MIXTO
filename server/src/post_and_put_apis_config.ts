import { PassaggioDbSchema, ScalettaDbSchema, UtenteDbSchema, VisualizzazioneDbSchema } from "./db_types"
import { CommentoDbSchema, ValutazioneDbSchema } from "./get_single_apis_config"

export const postAndPutApisConfig = {
    scaletta: (req: import("express").Request) => { return{
        mainTableName: "scaletta",
        mainTableSchema: ScalettaDbSchema,
        mainTableNewRowValues: req.body.newRowValues,
        assocTablesAndIds: req.body.assocTablesAndIds,
        deleteOldAssociationsFirst: req.body.deleteOldAssociationsFirst
    }},
    passaggio: (req: import("express").Request) => { return{
        mainTableName: "passaggio",
        mainTableSchema: PassaggioDbSchema,
        mainTableNewRowValues: req.body.newRowValues,
        assocTablesAndIds: req.body.assocTablesAndIds,
        deleteOldAssociationsFirst: req.body.deleteOldAssociationsFirst
    }},
    utente: (req: import("express").Request) => { return{
        mainTableName: "utente",
        mainTableSchema: UtenteDbSchema,
        mainTableNewRowValues: req.body.newRowValues,
        assocTablesAndIds: req.body.assocTablesAndIds,
        deleteOldAssociationsFirst: req.body.deleteOldAssociationsFirst
    }},
    commento: (req: import("express").Request) => { return{
        mainTableName: "commento",
        mainTableSchema: CommentoDbSchema,
        mainTableNewRowValues: req.body.newRowValues,
        assocTablesAndIds: req.body.assocTablesAndIds,
        deleteOldAssociationsFirst: req.body.deleteOldAssociationsFirst
    }},
    valutazione: (req: import("express").Request) => { return{
        mainTableName: "valutazione",
        mainTableSchema: ValutazioneDbSchema,
        mainTableNewRowValues: req.body.newRowValues,
        assocTablesAndIds: req.body.assocTablesAndIds,
        deleteOldAssociationsFirst: req.body.deleteOldAssociationsFirst
    }},
    visualizzazione: (req: import("express").Request) => { return{
        mainTableName: "visualizzazione",
        mainTableSchema: VisualizzazioneDbSchema,
        mainTableNewRowValues: req.body.newRowValues,
        assocTablesAndIds: req.body.assocTablesAndIds,
        deleteOldAssociationsFirst: req.body.deleteOldAssociationsFirst
    }},
}