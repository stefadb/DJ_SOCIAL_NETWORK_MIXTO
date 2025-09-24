"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDeezerApiCall = makeDeezerApiCall;
exports.uploadPhoto = uploadPhoto;
exports.isValidDeezerObject = isValidDeezerObject;
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const bottleneck_1 = __importDefault(require("bottleneck"));
const deezerAPIUrl = "https://api.deezer.com";
const deezerLimiter = new bottleneck_1.default({
    minTime: 100,
    reservoir: 50,
    reservoirRefreshAmount: 50,
    reservoirRefreshInterval: 5000
});
/**
 * Funzione comoda per effettuare chiamate API a Deezer
 * URL reale: https://api.deezer.com/[urlFirstPart]/[urlParameter]/[urlSecondPart]?[queryParams]
 * @param res L'oggetto che la funzione può usare per rispondere direttamente in caso di errori
 * @param queryParams Tutti i query params della chiamata API rappresentati come oggetto JSON
 */
async function makeDeezerApiCall(res, urlFirstPart, urlParameter, urlSecondPart, queryParams) {
    return new Promise((resolve) => {
        deezerLimiter.schedule(async () => {
            let url = deezerAPIUrl;
            if (urlFirstPart) {
                url += `/${urlFirstPart}`;
            }
            if (urlParameter) {
                url += `/${urlParameter}`;
            }
            if (urlSecondPart) {
                url += `/${urlSecondPart}`;
            }
            if (queryParams) {
                const queryString = new URLSearchParams(queryParams).toString();
                url += `?${queryString}`;
            }
            axios_1.default.get(url)
                .then((response) => {
                if (!response.data.error) {
                    resolve(response);
                }
                else {
                    if (response.data.error.code === 800) {
                        res.status(404).json({ error: "L'oggetto richiesto non esiste su Deezer.", details: response.data.error });
                    }
                    else {
                        res.status(500).json({ error: "Errore nella chiamata a Deezer", details: response.data.error });
                    }
                    resolve(-1);
                }
            })
                .catch((error) => {
                res.status(500).json({ error: "Errore nella chiamata a Deezer", details: error });
                resolve(-1);
            });
        });
    });
}
//FUNZIONE GIA ADATTATA A TYPESCRIPT
async function uploadPhoto(dirName, entity) {
    let pictureUrl;
    if ("picture_big" in entity || "cover_big" in entity || "picture" in entity) {
        pictureUrl = "picture_big" in entity ? entity.picture_big : "cover_big" in entity ? entity.cover_big : entity.picture;
    }
    else {
        //Nessuna immagine da caricare
        return;
    }
    const picturesDir = path_1.default.join(__dirname, dirName);
    if (!fs_1.default.existsSync(picturesDir)) {
        fs_1.default.mkdirSync(picturesDir);
    }
    return new Promise((resolve, reject) => {
        const picturesDir = path_1.default.join(__dirname, dirName);
        const imgPath = path_1.default.join(picturesDir, `${entity.id}.jpg`);
        try {
            axios_1.default.get(pictureUrl, { responseType: "stream" })
                .then((imgResponse) => {
                const writer = fs_1.default.createWriteStream(imgPath);
                imgResponse.data.pipe(writer);
                writer.on("finish", () => { resolve("Upload della foto completato"); });
                writer.on("error", () => { reject(); });
            })
                .catch((error) => {
                reject(error);
            });
        }
        catch (imgErr) {
            reject(imgErr);
        }
    });
}
/**
 * Restituisce true se l'oggetto Deezer è valido, false altrimenti
 */
//FUNZIONE GIA ADATTATA A TYPESCRIPT
function isValidDeezerObject(res, obj, schema) {
    const safeParseResult = schema.safeParse(obj);
    if (!safeParseResult.success) {
        res.status(500).json({ error: "L'oggetto restituito da Deezer non segue lo schema.", details: safeParseResult.error });
    }
    return safeParseResult.success;
}
//# sourceMappingURL=functions.js.map