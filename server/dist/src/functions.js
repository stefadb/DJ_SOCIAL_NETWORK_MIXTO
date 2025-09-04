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
const deezerAPIUrl = "https://api.deezer.com";
/**
 * Funzione comoda per effettuare chiamate API a Deezer
 * URL reale: https://api.deezer.com/[urlFirstPart]/[urlParameter]/[urlSecondPart]?[queryParams]
 * @param res L'oggetto che la funzione può usare per rispondere direttamente in caso di errori
 * @param queryParams Tutti i query params della chiamata API rappresentati come oggetto JSON
 */
async function makeDeezerApiCall(res, urlFirstPart, urlParameter, urlSecondPart, queryParams) {
    return new Promise((resolve) => {
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
            if (response.status == 200) {
                resolve(response.data);
            }
            else {
                res.status(response.status).json({ error: `Errore nella chiamata a Deezer: ${response.statusText}` });
                resolve(-1);
            }
        })
            .catch((error) => {
            if (axios_1.default.isAxiosError(error) && error.response && error.response.status === 404) {
                res.status(404).json({ error: "Deezer non ha trovato quello che si sta cercando" });
                resolve(-1);
            }
            else {
                res.status(500).json({ error: "Errore nella chiamata a Deezer" });
                resolve(-1);
            }
        });
    });
}
//FUNZIONE GIA ADATTATA A TYPESCRIPT
async function uploadPhoto(dirName, id, pictureUrl) {
    //c'è qualcosa che non va in questa funzione
    //Problema: non finisce il download
    const picturesDir = path_1.default.join(__dirname, dirName);
    if (!fs_1.default.existsSync(picturesDir)) {
        fs_1.default.mkdirSync(picturesDir);
    }
    return new Promise((resolve, reject) => {
        const picturesDir = path_1.default.join(__dirname, dirName);
        const imgPath = path_1.default.join(picturesDir, `${id}.jpg`);
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
function isValidDeezerObject(res, obj, schema, isArray) {
    if (!isArray) {
        const safeParseResult = schema.safeParse(obj);
        if (!safeParseResult.success) {
            res.status(500).json({ error: "L'oggetto restituito da Deezer non segue lo schema.", details: safeParseResult.error });
        }
        return safeParseResult.success;
    }
    else {
        if (!Array.isArray(obj)) {
            res.status(500).json({ error: "L'oggetto restituito da Deezer non è un array come previsto." });
            return false;
        }
        const array = obj;
        for (const item of array) {
            const safeParseResult = schema.safeParse(item);
            if (!safeParseResult.success) {
                res.status(500).json({ error: "L'oggetto restituito da Deezer non segue lo schema.", details: safeParseResult.error });
                return false;
            }
        }
        return true;
    }
}
//# sourceMappingURL=functions.js.map