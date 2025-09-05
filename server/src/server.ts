import { albumApi, artistiApi, deleteCommento, deletePassaggio, deleteScalette, deleteUtente, deleteValutazione, getAlbumPassaggi, getArtistaPassaggi, getBranoPassaggi, getCommenti, getCommento, getGenere, getGeneri, getGeneriPassaggi, getPassaggi, getPassaggio, getScaletta, getScalette, getUtente, getUtentePassaggi, getUtenti, getValutazione, getValutazioni, postCommento, postLogin, postPassaggio, postScalette, postUtente, postValutazione, postVisualizzazione, putCommento, putPassaggio, putScalette, putUtente, putValutazione } from "./apiroutes";

import express from "express";
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
app.get("/generi", getGeneri); //FUNZIONA
app.get("/generi/:id", getGenere); //FUNZIONA
//TODO: Aggiungere le API per gli album, gli artisti e i brani
//ARTISTI

// Cerca su Deezer gli artisti che l'utente ha cercato e, per ognuno, fa upsert sul db e download della foto.
app.get("/artisti/search", (req, res) => { artistiApi("search", req, res) });
app.get("/artisti/related", (req, res) => { artistiApi("related", req, res) });
app.get("/artisti/genere", (req, res) => { artistiApi("genre", req, res) });
//--------------------------------------------------------
app.get("/album/search", (req, res) => { albumApi("search", req, res) });
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
