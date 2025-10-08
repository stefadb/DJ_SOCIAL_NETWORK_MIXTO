// MixTo - creato da Stefano Di Bisceglie
// Portfolio di Stefano Di Bisceglie, Ottobre 2025

//Import delle funzioni generiche delle API
import { deezerEntityApi, deleteEntity, getBraniEsistentiPreferiti, getConnection, getEntityWithAssociations, getFilteredEntitiesList, logout, postEntity, postLogin, putEntity } from "./apiroutes";

import express from "express";
import session from "express-session";
//Import delle config delle API
import { albumAPIsConfig, artistiAPIsConfig, braniAPIsConfig, generiAPIsConfig } from "./deezer_apis_config";
import { getSingleApisConfig } from "./get_single_apis_config";
import { getMultipleApisConfig } from "./get_multiple_apis_config";
import { postAndPutApisConfig } from "./post_and_put_apis_config";
import cleanupDbRouter from "./cleanup_db_api";
import bcrypt from "bcrypt";
const app = express();
app.use(express.json());

//Configura il cors di app per permettere richieste dall'indirizzo http://localnost:5173 (dove gira il client React in dev)
import cors from "cors";
app.use(cors({
    origin: process.env.FRONTEND_URL, // Sostituisci con l'URL del tuo client React
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Metodi consentiti
    credentials: true // Se hai bisogno di inviare cookie o credenziali
}));

app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
}));

//API ROUTES

//API CHE SCARICANO DATI DA DEEZER, LI RESTITUISCONO E LI METTONO SUL DB
//GENERI
app.get("/generi/tutti", (req, res) => { deezerEntityApi(req, res, generiAPIsConfig.tutti) });
app.get("/generi/singolo", (req, res) => { deezerEntityApi(req, res, generiAPIsConfig.singolo) });
//genere/search non c'è perchè i generi sono pochi e Deezer non prevede la ricerca
//genere/artista non c'è perchè per ottenere i generi di un artista bisogna prendere tutti gli album che contengono almeno un brano di quell'artista e poi prendere i generi di quegli album (operazione troppo pesante per Deezer)
//genere/brano non c'è perchè per ottenere i generi di un brano bisogna prendere l'album di quel brano e poi prendere i generi di quell'album (operazione troppo pesante per Deezer)
//genere/album non serve perchè c'è gia album/singolo che restituisce anche i generi di un album
//ARTISTI
app.get("/artisti/search", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig.search) });
app.get("/artisti/simili", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig.simili) });
app.get("/artisti/genere", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig.genere) });
app.get("/artisti/singolo", (req, res) => { deezerEntityApi(req, res, artistiAPIsConfig.singolo) });
//artisti/brano non serve perchè c'è già brani/singolo che restituisce anche gli artisti di un brano
//artisti/album non serve perchè il frontend è già in grado di ottenere gli artisti di un album tramite brani/singolo
//ALBUM--------------------------------------------------------
app.get("/album/search", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig.search) });
app.get("/album/singolo", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig.singolo) });
app.get("/album/artista", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig.artista) });
app.get("/album/genere", (req, res) => { deezerEntityApi(req, res, albumAPIsConfig.genere) });
//album/brano non serve perchè basta chiamare brani/singolo per ottenere l'id dell'album e passarlo a album/singolo
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig.album) });
app.get("/brani/search", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig.search) });
app.get("/brani/genere", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig.genere) });
app.get("/brani/artista", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig.artista) });
app.get("/brani/singolo", (req, res) => { deezerEntityApi(req, res, braniAPIsConfig.singolo) });
//FINE DELLE API CHE SCARICANO DATI DA DEEZER

//INIZIO API DI GET singola, GET multipla e DELETE delle entità db legate a Deezer (brani, album, artisti, generi). Operano solo sulle entità già esistenti sul db, senza contattare Deezer
//BRANI
app.get("/brani/esistenti/preferiti", (req, res) => { getBraniEsistentiPreferiti(req, res) }); //recupera i brani preferiti dell'utente loggato
app.get("/brani/esistenti/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.brano) });
app.get("/brani/esistenti", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.brano(req)) });
//app.delete("/brani/esistenti/:id", (req, res) => { deleteEntity(req, res, "brano") });
//ALBUM
app.get("/album/esistenti/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.album) });
app.get("/album/esistenti", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.album(req)) });
//app.delete("/album/esistenti/:id", (req, res) => { deleteEntity(req, res, "album") });
//ARTISTI
app.get("/artisti/esistenti/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.artista) });
app.get("/artisti/esistenti", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.artista(req)) });
//app.delete("/artisti/esistenti/:id", (req, res) => { deleteEntity(req, res, "artista") });
//GENERI
app.get("/generi/esistenti/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.genere) });
app.get("/generi/esistenti", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.genere(req)) });
//app.delete("/generi/esistenti/:id", (req, res) => { deleteEntity(req, res, "genere") });
//FINE API DI GET singola, GET multipla e DELETE delle entità db legate a Deezer

//SCALETTE
app.get("/scalette/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.scaletta) });
app.get("/scalette", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.scaletta(req)) });
app.post("/scalette", (req, res) => { postEntity(req, res, postAndPutApisConfig.scaletta(req)) });
app.put("/scalette/:id", (req, res) => { putEntity(req, res, postAndPutApisConfig.scaletta(req)) });
app.delete("/scalette/:id", (req, res) => { deleteEntity(req, res, "scaletta") }); //uso la funzione generica per eliminare un'entità
//PASSAGGI
app.get("/passaggi", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.passaggio(req)) });
app.get("/passaggi/conta", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.passaggioConta(req)) });
app.get("/passaggi/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.passaggio) });
app.post("/passaggi", (req, res) => { postEntity(req, res, postAndPutApisConfig.passaggio(req)) });
app.put("/passaggi/:id", (req, res) => { putEntity(req, res, postAndPutApisConfig.passaggio(req)) });
app.delete("/passaggi/:id", (req, res) => { deleteEntity(req, res, "passaggio") });
//UTENTI
app.get("/utenti", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.utente(req)) });
app.get("/utenti/loggato", (req, res) => {
    if (!req.session.user) {
        res.status(200).json();
        return;
    }
    req.params = { id: req.session.user.id };
    getEntityWithAssociations(req, res, getSingleApisConfig.utente);
});
app.get("/utenti/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.utente) });
app.post("/utenti", (req, res) => {
    bcrypt.hash(req.body.newRowValues.password, 10, (err, hash) => {
        if (err) {
            res.status(500).json({ error: "Errore nel server durante la registrazione." });
            return;
        }
        req.body.newRowValues.password = hash;
        postEntity(req, res, postAndPutApisConfig.utentePost(req));
    });
});
app.put("/utenti/:id", async (req, res) => {
    if(req.session.user === undefined || req.session.user.id !== parseInt(req.params.id)){
        res.status(403).json({ error: "Accesso negato." });
        return;
    }
    if (req.body.oldPassword) {
        const con = await getConnection();
        const [rows] = await con.query("SELECT password FROM utente WHERE id = ? ", [req.params.id]);
        if ((rows as any[])[0] === undefined) {
            res.status(404).json({ error: "Utente non trovato." });
            return;
        }
        const match = await bcrypt.compare(req.body.oldPassword, (rows as any[])[0].password);
        if(!match){
            res.status(401).json({ error: "Vecchia password errata." });
            return;
        }
        bcrypt.hash(req.body.newRowValues.password, 10, (err, hash) => {
            if (err) {
                res.status(500).json({ error: "Errore nel server durante la registrazione." });
                return;
            }
            req.body.newRowValues.password = hash;
            putEntity(req, res, postAndPutApisConfig.utentePut(req));
        });
        con.end();
    } else {
        delete req.body.newRowValues.password;
        delete req.body.oldPassword;
        const con = await getConnection();
        const [rows] = await con.query("SELECT password FROM utente WHERE id = ?", [req.params.id]);
        if ((rows as any[])[0] === undefined) {
            res.status(404).json({ error: "Utente non trovato." });
            return;
        }
        req.body.newRowValues.password = (rows as any[])[0].password; //mantieni la password vecchia
        putEntity(req, res, postAndPutApisConfig.utentePut(req));
        con.end();
    }
});
app.delete("/utenti/:id", (req, res) => {
    if(req.session.user === undefined || req.session.user.id !== parseInt(req.params.id)){
        res.status(403).json({ error: "Accesso negato." });
        return;
    }
    if (req.session.user && req.session.user.id === parseInt(req.params.id)) {
        deleteEntity(req, res, "utente");
    } else {
        res.status(403).json({ error: "Accesso negato." });
    }
});
//COMMENTI
app.get("/commenti", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.commento(req)) });
app.get("/commenti/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.commento) });
app.post("/commenti", (req, res) => { postEntity(req, res, postAndPutApisConfig.commento(req)) });
app.put("/commenti/:id", (req, res) => { putEntity(req, res, postAndPutApisConfig.commento(req)) });
app.delete("/commenti/:id", (req, res) => { deleteEntity(req, res, "commento") });
//VALUTAZIONI
app.get("/valutazioni", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.valutazione(req)) });
app.get("/valutazioni/media", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.valutazioneMedia(req)) });
app.get("/valutazioni/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.valutazione) });
app.post("/valutazioni", (req, res) => { postEntity(req, res, postAndPutApisConfig.valutazione(req)) });
app.put("/valutazioni/:id", (req, res) => { putEntity(req, res, postAndPutApisConfig.valutazione(req)) });
app.delete("/valutazioni/:id", (req, res) => { deleteEntity(req, res, "valutazione") });
//VISUALIZZAZIONI
app.post("/visualizzazioni", (req, res) => { postEntity(req, res, postAndPutApisConfig.visualizzazione(req)) });
app.get("/visualizzazioni", (req, res) => { getFilteredEntitiesList(req, res, getMultipleApisConfig.visualizzazione(req)) });
app.get("/visualizzazioni/:id", (req, res) => { getEntityWithAssociations(req, res, getSingleApisConfig.visualizzazione) });
//LOGIN
app.post("/login", postLogin);
//LOGOUT
app.delete("/logout", logout);
//CLEANUP
app.use(cleanupDbRouter);


export default app;
