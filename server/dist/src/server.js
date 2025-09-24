"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Import delle funzioni generiche delle API
const apiroutes_1 = require("./apiroutes");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
//Import delle config delle API
const deezer_apis_config_1 = require("./deezer_apis_config");
const get_single_apis_config_1 = require("./get_single_apis_config");
const get_multiple_apis_config_1 = require("./get_multiple_apis_config");
const post_and_put_apis_config_1 = require("./post_and_put_apis_config");
const cleanup_db_api_1 = __importDefault(require("./cleanup_db_api"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
//Configura il cors di app per permettere richieste dall'indirizzo http://localnost:5173 (dove gira il client React in dev)
const cors_1 = __importDefault(require("cors"));
const win32_1 = __importDefault(require("path/win32"));
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Sostituisci con l'URL del tuo client React
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Metodi consentiti
    credentials: true // Se hai bisogno di inviare cookie o credenziali
}));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
}));
app.use("/generi_pictures", express_1.default.static(win32_1.default.join(__dirname, "generi_pictures")));
app.use("/artisti_pictures", express_1.default.static(win32_1.default.join(__dirname, "artisti_pictures")));
app.use("/album_pictures", express_1.default.static(win32_1.default.join(__dirname, "album_pictures")));
const swaggerDocument = yamljs_1.default.load(win32_1.default.join(__dirname, 'openapi.yaml'));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
//API ROUTES
//API CHE SCARICANO DATI DA DEEZER, LI RESTITUISCONO E LI METTONO SUL DB
//GENERI
app.get("/generi/tutti", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.generiAPIsConfig.tutti); });
app.get("/generi/singolo", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.generiAPIsConfig.singolo); });
//genere/search non c'è perchè i generi sono pochi e Deezer non prevede la ricerca
//genere/artista non c'è perchè per ottenere i generi di un artista bisogna prendere tutti gli album che contengono almeno un brano di quell'artista e poi prendere i generi di quegli album (operazione troppo pesante per Deezer)
//genere/brano non c'è perchè per ottenere i generi di un brano bisogna prendere l'album di quel brano e poi prendere i generi di quell'album (operazione troppo pesante per Deezer)
//genere/album non serve perchè c'è gia album/singolo che restituisce anche i generi di un album
//ARTISTI
app.get("/artisti/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.artistiAPIsConfig.search); });
app.get("/artisti/simili", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.artistiAPIsConfig.simili); });
app.get("/artisti/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.artistiAPIsConfig.genere); });
app.get("/artisti/singolo", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.artistiAPIsConfig.singolo); });
//artisti/brano non serve perchè c'è già brani/singolo che restituisce anche gli artisti di un brano
//artisti/album non serve perchè il frontend è già in grado di ottenere gli artisti di un album tramite brani/singolo
//ALBUM--------------------------------------------------------
app.get("/album/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.albumAPIsConfig.search); });
app.get("/album/singolo", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.albumAPIsConfig.singolo); });
app.get("/album/artista", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.albumAPIsConfig.artista); });
app.get("/album/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.albumAPIsConfig.genere); });
//album/brano non serve perchè basta chiamare brani/singolo per ottenere l'id dell'album e passarlo a album/singolo
//BRANI--------------------------------------------------------
app.get("/brani/album", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig.album); });
app.get("/brani/search", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig.search); });
app.get("/brani/genere", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig.genere); });
app.get("/brani/artista", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig.artista); });
app.get("/brani/singolo", (req, res) => { (0, apiroutes_1.deezerEntityApi)(req, res, deezer_apis_config_1.braniAPIsConfig.singolo); });
//FINE DELLE API CHE SCARICANO DATI DA DEEZER
//INIZIO API DI GET singola, GET multipla e DELETE delle entità db legate a Deezer (brani, album, artisti, generi). Operano solo sulle entità già esistenti sul db, senza contattare Deezer
//BRANI
app.get("/brani/esistenti/preferiti", (req, res) => { (0, apiroutes_1.getBraniEsistentiPreferiti)(req, res); }); //recupera i brani preferiti dell'utente loggato
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
app.get("/passaggi/conta", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.passaggioConta(req)); });
app.get("/passaggi/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.passaggio); });
app.post("/passaggi", (req, res) => { (0, apiroutes_1.postEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.passaggio(req)); });
app.put("/passaggi/:id", (req, res) => { (0, apiroutes_1.putEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.passaggio(req)); });
app.delete("/passaggi/:id", (req, res) => { (0, apiroutes_1.deleteEntity)(req, res, "passaggio"); });
//UTENTI
app.get("/utenti", (req, res) => { (0, apiroutes_1.getFilteredEntitiesList)(req, res, get_multiple_apis_config_1.getMultipleApisConfig.utente(req)); });
app.get("/utenti/loggato", (req, res) => {
    if (!req.session.user) {
        res.status(401).json({ error: "Utente non autenticato." });
        return;
    }
    req.params = { id: req.session.user.id };
    (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.utente);
});
app.get("/utenti/:id", (req, res) => { (0, apiroutes_1.getEntityWithAssociations)(req, res, get_single_apis_config_1.getSingleApisConfig.utente); });
app.post("/utenti", (req, res) => {
    bcrypt_1.default.hash(req.body.newRowValues.password, 10, (err, hash) => {
        if (err) {
            res.status(500).json({ error: "Errore nel server durante la registrazione." });
            return;
        }
        req.body.newRowValues.password = hash;
        (0, apiroutes_1.postEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.utente(req));
    });
});
app.put("/utenti/:id", async (req, res) => {
    if (req.body.oldPassword) {
        const con = await (0, apiroutes_1.getConnection)();
        const [rows] = await con.query("SELECT password FROM utente WHERE id = ? ", [req.params.id]);
        if (rows[0] === undefined) {
            res.status(401).json({ error: "Utente non trovato." });
            return;
        }
        const match = await bcrypt_1.default.compare(req.body.oldPassword, rows[0].password);
        if (!match) {
            res.status(401).json({ error: "Vecchia password errata." });
            return;
        }
        bcrypt_1.default.hash(req.body.newRowValues.password, 10, (err, hash) => {
            if (err) {
                res.status(500).json({ error: "Errore nel server durante la registrazione." });
                return;
            }
            req.body.newRowValues.password = hash;
            (0, apiroutes_1.putEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.utente(req));
        });
        con.end();
    }
    else {
        delete req.body.newRowValues.password;
        delete req.body.oldPassword;
        const con = await (0, apiroutes_1.getConnection)();
        const [rows] = await con.query("SELECT password FROM utente WHERE id = ?", [req.params.id]);
        if (rows[0] === undefined) {
            res.status(401).json({ error: "Utente non trovato." });
            return;
        }
        req.body.newRowValues.password = rows[0].password; //mantieni la password vecchia
        (0, apiroutes_1.putEntity)(req, res, post_and_put_apis_config_1.postAndPutApisConfig.utente(req));
        con.end();
    }
});
app.delete("/utenti/:id", (req, res) => {
    if (req.session.user && req.session.user.id === parseInt(req.params.id)) {
        (0, apiroutes_1.deleteEntity)(req, res, "utente");
    }
    else {
        res.status(403).json({ error: "Accesso negato." });
    }
});
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
//LOGOUT
app.delete("/logout", apiroutes_1.logout);
//CLEANUP
app.use(cleanup_db_api_1.default);
exports.default = app;
//# sourceMappingURL=server.js.map