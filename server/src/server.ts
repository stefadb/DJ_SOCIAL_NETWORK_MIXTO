import { deezerEntityApi, deleteCommento, deletePassaggio, deleteScalette, deleteUtente, deleteValutazione, getAlbumPassaggi, getArtistaPassaggi, getBranoPassaggi, getCommenti, getCommento, getGeneriPassaggi, getPassaggi, getPassaggio, getScaletta, getScalette, getUtente, getUtentePassaggi, getUtenti, getValutazione, getValutazioni, postCommento, postLogin, postPassaggio, postScalette, postUtente, postValutazione, postVisualizzazione, putCommento, putPassaggio, putScalette, putUtente, putValutazione } from "./apiroutes";

import express from "express";
import { albumAPIsConfig, artistiAPIsConfig, braniAPIsConfig, generiAPIsConfig } from "./deezer_apis_config";
const app = express();
const port = 3000;

//API ROUTES'
//SCALETTE
app.get("/scalette/:id", getScaletta);
app.get("/scalette", getScalette);
app.post("/scalette", postScalette);
app.put("/scalette/:id", putScalette);
app.delete("/scalette/:id", deleteScalette);

//API DEEZER---------------------------------------------
//GENERI
app.get("/generi", (req, res) => { deezerEntityApi(req, res, generiAPIsConfig["tutti"]) });
app.get("/genere", (req, res) => { deezerEntityApi(req, res, generiAPIsConfig["singolo"]) });
//genere/search non c'è perchè i generi sono pochi e Deezer non prevede la ricerca
//genere/artista non c'è perchè per ottenere i generi di un artista bisogna prendere tutti gli album che contengono almeno un brano di quell'artista e poi prendere i generi di quegli album (operazione troppo pesante per Deezer)
//genere/brano non c'è perchè per ottenere i generi di un brano bisogna prendere l'album di quel brano e poi prendere i generi di quell'album (operazione troppo pesante per Deezer)
//genere/album non serve perchè c'è gia album/singolo che restituisce anche i generi di un album
//ARTISTI
app.get("/artisti/search", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig["search"]) });
app.get("/artisti/simili", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig["simili"]) });
app.get("/artisti/genere", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig["genere"]) });
app.get("/artisti/singolo", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig["singolo"]) });
//artisti/brano non serve perchè c'è già brani/singolo che restituisce anche gli artisti di un brano
//TODO: implementare artisti/album per ottenere tutti gli artisti dell'album (passando per forza dai brani!)
//ALBUM--------------------------------------------------------
app.get("/album/search", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["search"]) });
app.get("/album/singolo", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["singolo"]) });
app.get("/album/artista", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["artist"]) });
app.get("/album/genere", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig["genere"]) });
//TODO: album/brano non serve perchè basta chiamare brani/singolo per ottenere l'id dell'album e passarlo a album/singolo
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["album"]) });
app.get("/brani/search", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["search"]) });
app.get("/brani/genere", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["genere"]) });
app.get("/brani/artista", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["artista"]) });
app.get("/brani/singolo", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig["singolo"]) });
//FINE DELLE API DI DEEZER----------------------------------------

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
