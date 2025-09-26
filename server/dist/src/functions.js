"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDeezerApiCall = makeDeezerApiCall;
exports.isValidDeezerObject = isValidDeezerObject;
const axios_1 = __importDefault(require("axios"));
const bottleneck_1 = __importDefault(require("bottleneck"));
const logger_1 = __importDefault(require("./logger"));
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
                        logger_1.default.warn('Deezer API: Object not found', {
                            url,
                            error: response.data.error
                        });
                        res.status(404).json({ error: "L'oggetto richiesto non esiste su Deezer." });
                    }
                    else {
                        logger_1.default.error('Deezer API error', {
                            url,
                            error: response.data.error
                        });
                        res.status(500).json({ error: "Errore nella chiamata a Deezer" });
                    }
                    resolve(-1);
                }
            })
                .catch((error) => {
                logger_1.default.error('Deezer API request failed', {
                    url,
                    error: error.message,
                    stack: error.stack
                });
                res.status(500).json({ error: "Errore nella chiamata a Deezer" });
                resolve(-1);
            });
        });
    });
}
/**
 * Restituisce true se l'oggetto Deezer è valido, false altrimenti
 */
//FUNZIONE GIA ADATTATA A TYPESCRIPT
function isValidDeezerObject(res, obj, schema) {
    const safeParseResult = schema.safeParse(obj);
    if (!safeParseResult.success) {
        logger_1.default.error('Deezer object validation failed', {
            object: obj,
            validationErrors: safeParseResult.error.issues
        });
        res.status(500).json({ error: "L'oggetto restituito da Deezer non segue lo schema." });
    }
    return safeParseResult.success;
}
//# sourceMappingURL=functions.js.map