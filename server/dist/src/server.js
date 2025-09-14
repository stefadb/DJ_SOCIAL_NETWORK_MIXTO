"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiroutes_1 = require("./apiroutes");
const express_1 = __importDefault(require("express"));
const deezer_apis_config_1 = require("./deezer_apis_config");
const get_single_apis_config_1 = require("./get_single_apis_config");
const get_multiple_apis_config_1 = require("./get_multiple_apis_config");
const post_and_put_apis_config_1 = require("./post_and_put_apis_config");
const app = (0, express_1.default)();
const port = 3000;
//API ROUTES
//API DEEZER---------------------------------------------
//GENERI
app.get("/generi", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.generiAPIsConfig["tutti"]); });
app.get("/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.generiAPIsConfig["singolo"]); });
//genere/search non c'è perchè i generi sono pochi e Deezer non prevede la ricerca
//genere/artista non c'è perchè per ottenere i generi di un artista bisogna prendere tutti gli album che contengono almeno un brano di quell'artista e poi prendere i generi di quegli album (operazione troppo pesante per Deezer)
//genere/brano non c'è perchè per ottenere i generi di un brano bisogna prendere l'album di quel brano e poi prendere i generi di quell'album (operazione troppo pesante per Deezer)
//genere/album non serve perchè c'è gia album/singolo che restituisce anche i generi di un album
//ARTISTI
app.get("/artisti/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.artistiAPIsConfig["search"]); });
app.get("/artisti/simili", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.artistiAPIsConfig["simili"]); });
app.get("/artisti/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.artistiAPIsConfig["genere"]); });
app.get("/artisti/singolo", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.artistiAPIsConfig["singolo"]); });
//artisti/brano non serve perchè c'è già brani/singolo che restituisce anche gli artisti di un brano
//TODO: implementare artisti/album per ottenere tutti gli artisti dell'album (passando per forza dai brani!)
//ALBUM--------------------------------------------------------
app.get("/album/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.albumAPIsConfig["search"]); });
app.get("/album/singolo", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.albumAPIsConfig["singolo"]); });
app.get("/album/artista", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.albumAPIsConfig["artist"]); });
app.get("/album/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.albumAPIsConfig["genere"]); });
//TODO: album/brano non serve perchè basta chiamare brani/singolo per ottenere l'id dell'album e passarlo a album/singolo
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["album"]); });
app.get("/brani/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["search"]); });
app.get("/brani/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["genere"]); });
app.get("/brani/artista", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["artista"]); });
app.get("/brani/singolo", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["singolo"]); });
//FINE DELLE API DI DEEZER----------------------------------------
//SCALETTE
app.get("/scalette/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.scaletta); });
app.get("/scalette", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.scaletta(req)); });
app.post("/scalette", (req, res) => { (0, apiroutes_1.postEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.scaletta(req)); });
app.put("/scalette/:id", (req, res) => { (0, apiroutes_1.putEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.scaletta(req)); });
app.delete("/scalette/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "scaletta"); }); //uso la funzione generica per eliminare un'entità
//PASSAGGI
app.get("/passaggi", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.passaggio(req)); });
app.get("/passaggi/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.passaggio); });
app.post("/passaggi", (req, res) => { (0, apiroutes_1.postEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.passaggio(req)); });
app.put("/passaggi/:id", (req, res) => { (0, apiroutes_1.putEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.passaggio(req)); });
app.delete("/passaggi/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "passaggio"); });
//UTENTI
app.get("/utenti", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.utente(req)); });
app.get("/utenti/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.utente); });
app.post("/utenti", (req, res) => { (0, apiroutes_1.postEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.utente(req)); });
app.put("/utenti/:id", (req, res) => { (0, apiroutes_1.putEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.utente(req)); });
app.delete("/utenti/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "utente"); });
//COMMENTI
app.get("/commenti", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.commento(req)); });
app.get("/commenti/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.commento); });
app.post("/commenti", (req, res) => { (0, apiroutes_1.postEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.commento(req)); });
app.put("/commenti/:id", (req, res) => { (0, apiroutes_1.putEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.commento(req)); });
app.delete("/commenti/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "commento"); });
//VALUTAZIONI
app.get("/valutazioni", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.valutazione(req)); });
app.get("/valutazioni/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.valutazione); });
app.post("/valutazioni", (req, res) => { (0, apiroutes_1.postEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.valutazione(req)); });
app.put("/valutazioni/:id", (req, res) => { (0, apiroutes_1.putEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.valutazione(req)); });
app.delete("/valutazioni/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "valutazione"); });
//VISUALIZZAZIONI
app.post("/visualizzazioni", (req, res) => { (0, apiroutes_1.postEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.visualizzazione(req)); });
app.get("/visualizzazioni", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.visualizzazione(req)); });
app.get("/visualizzazioni/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.visualizzazione); });
//LOGIN
app.post("/login", apiroutes_1.postLogin);
exports.default = app;
//# sourceMappingURL=server.js.map