"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiroutes_1 = require("./apiroutes");
const express_1 = __importDefault(require("express"));
const deezer_apis_config_1 = require("./deezer_apis_config");
const app = (0, express_1.default)();
const port = 3000;
//API ROUTES'
//SCALETTE
app.get("/scalette/:id", apiroutes_1.getScaletta);
app.get("/scalette", apiroutes_1.getScalette);
app.post("/scalette", apiroutes_1.postScalette);
app.put("/scalette/:id", apiroutes_1.putScalette);
app.delete("/scalette/:id", apiroutes_1.deleteScalette);
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
//PASSAGGI
app.get("/brani/:id/passaggi", apiroutes_1.getBranoPassaggi);
app.get("/album/:id/passaggi", apiroutes_1.getAlbumPassaggi);
app.get("/artisti/:id/passaggi", apiroutes_1.getArtistaPassaggi);
app.get("/utenti/:id/passaggi", apiroutes_1.getUtentePassaggi);
app.get("/generi/:id/passaggi", apiroutes_1.getGeneriPassaggi);
app.get("/passaggi", apiroutes_1.getPassaggi);
app.get("/passaggi/:id", apiroutes_1.getPassaggio);
app.post("/passaggi", apiroutes_1.postPassaggio);
app.put("/passaggi/:id", apiroutes_1.putPassaggio);
app.delete("/passaggi/:id", apiroutes_1.deletePassaggio);
//UTENTI
app.get("/utenti", apiroutes_1.getUtenti);
app.get("/utenti/:id", apiroutes_1.getUtente);
app.post("/utenti", apiroutes_1.postUtente);
app.put("/utenti/:id", apiroutes_1.putUtente);
app.delete("/utenti/:id", apiroutes_1.deleteUtente);
//COMMENTI
app.get("/commenti", apiroutes_1.getCommenti);
app.get("/commenti/:id", apiroutes_1.getCommento);
app.post("/commenti", apiroutes_1.postCommento);
app.put("/commenti/:id", apiroutes_1.putCommento);
app.delete("/commenti/:id", apiroutes_1.deleteCommento);
//VALUTAZIONI
app.get("/valutazioni", apiroutes_1.getValutazioni);
app.get("/valutazioni/:id", apiroutes_1.getValutazione);
app.post("/valutazioni", apiroutes_1.postValutazione);
app.put("/valutazioni/:id", apiroutes_1.putValutazione);
app.delete("/valutazioni/:id", apiroutes_1.deleteValutazione);
//VISUALIZZAZIONI
app.post("/visualizzazioni", apiroutes_1.postVisualizzazione);
//LOGIN
app.post("/login", apiroutes_1.postLogin);
exports.default = app;
//# sourceMappingURL=server.js.map