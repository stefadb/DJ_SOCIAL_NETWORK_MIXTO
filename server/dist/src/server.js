"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Import delle funzioni generiche delle API
const apiroutes_1 = require("./apiroutes");
const express_1 = __importDefault(require("express"));
//Import delle config delle API
const deezer_apis_config_1 = require("./deezer_apis_config");
const get_single_apis_config_1 = require("./get_single_apis_config");
const get_multiple_apis_config_1 = require("./get_multiple_apis_config");
const post_and_put_apis_config_1 = require("./post_and_put_apis_config");
const app = (0, express_1.default)();
//Configura il cors di app per permettere richieste dall'indirizzo http://localnost:5173 (dove gira il client React in dev)
const cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Sostituisci con l'URL del tuo client React
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Metodi consentiti
    credentials: true // Se hai bisogno di inviare cookie o credenziali
}));
//API ROUTES
//API CHE SCARICANO DATI DA DEEZER, LI RESTITUISCONO E LI METTONO SUL DB
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
//album/brano non serve perchè basta chiamare brani/singolo per ottenere l'id dell'album e passarlo a album/singolo
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["album"]); });
app.get("/brani/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["search"]); });
app.get("/brani/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["genere"]); });
app.get("/brani/artista", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["artista"]); });
app.get("/brani/singolo", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig["singolo"]); });
//FINE DELLE API CHE SCARICANO DATI DA DEEZER
//INIZIO API DI GET singola, GET multipla e DELETE delle entità db legate a Deezer (brani, album, artisti, generi). Operano solo sulle entità già esistenti sul db, senza contattare Deezer
//BRANI
app.get("/brani/esistenti/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.brano); });
app.get("/brani/esistenti", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.brano(req)); });
app.delete("/brani/esistenti/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "brano"); });
//ALBUM
app.get("/album/esistenti/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.album); });
app.get("/album/esistenti", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.album(req)); });
app.delete("/album/esistenti/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "album"); });
//ARTISTI
app.get("/artisti/esistenti/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.artista); });
app.get("/artisti/esistenti", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.artista(req)); });
app.delete("/artisti/esistenti/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "artista"); });
//GENERI
app.get("/generi/esistenti/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.genere); });
app.get("/generi/esistenti", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.genere(req)); });
app.delete("/generi/esistenti/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "genere"); });
//FINE API DI GET singola, GET multipla e DELETE delle entità db legate a Deezer
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