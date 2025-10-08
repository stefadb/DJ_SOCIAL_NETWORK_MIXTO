"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const get_db_tables_and_columns_1 = require("./get_db_tables_and_columns");
const logger_1 = __importDefault(require("./logger"));
function checkDbTablesAndColumns(dbTablesAndColumns) {
    // Tabelle normali: nome senza "_"
    const normali = Object.keys(dbTablesAndColumns).filter(t => !t.includes("_"));
    // Tabelle associazione: nome con "_"
    const associazione = Object.keys(dbTablesAndColumns).filter(t => t.includes("_"));
    // 1. Tabelle normali devono avere colonna "id"
    for (const tabella of normali) {
        const colonne = dbTablesAndColumns[tabella];
        if (!colonne || !colonne.includes("id"))
            return false;
    }
    // 2. Tabelle associazione: nome = tabella1_tabella2, tabella1 e tabella2 devono essere tabelle normali distinte
    for (const tabella of associazione) {
        const parts = tabella.split("_");
        if (parts.length < 2)
            return false;
        const [tabella1, tabella2] = parts;
        if (!tabella1 || !tabella2)
            return false;
        if (!normali.includes(tabella1) || !normali.includes(tabella2) || tabella1 === tabella2)
            return false;
        const colonne = dbTablesAndColumns[tabella];
        if (!colonne || !colonne.includes(`id_${tabella1}`) || !colonne.includes(`id_${tabella2}`))
            return false;
        // Devono avere almeno queste due colonne
        const colonneId = colonne.filter(c => c.startsWith("id_"));
        if (colonneId.length < 2)
            return false;
    }
    // 3. In tutte le tabelle normali, se esiste una colonna che inizia con "id_", deve essere "id_[tabella]" dove tabella è una tabella normale
    for (const tabella of normali) {
        const colonne = dbTablesAndColumns[tabella];
        if (!colonne)
            return false;
        for (const col of colonne) {
            if (col.startsWith("id_") && col !== "id") {
                let found = false;
                for (const refTabella of normali) {
                    if (col.substring(0, 3 + refTabella.length) === `id_${refTabella}`) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false;
                }
            }
        }
    }
    return true;
}
async function startServer() {
    console.log("Funzione startServer chiamata");
    console.log("FRONTEND URL: " + process.env.FRONTEND_URL);
    try {
        // Attendi che dbTablesAndColumns sia popolato
        await (0, get_db_tables_and_columns_1.getDbTablesAndColumns)();
        console.log("Metti questo JSON nel file get_db_tables_and_columns.ts come valore di default della variabile dbTablesAndColumns:");
        console.log(get_db_tables_and_columns_1.dbTablesAndColumns);
        if (checkDbTablesAndColumns(get_db_tables_and_columns_1.dbTablesAndColumns) === true) {
            server_1.default.listen(process.env.PORT, () => {
                console.log(`Server is running on port ${process.env.PORT}`);
            });
        }
        else {
            logger_1.default.error("Database schema validation failed - server startup aborted", {
                dbTablesAndColumns: get_db_tables_and_columns_1.dbTablesAndColumns
            });
            console.error("Sono state trovate delle tabelle o colonne non conformi. Il server non verrà avviato.");
        }
    }
    catch (error) {
        logger_1.default.error("Server initialization failed", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        console.error("Errore durante l'inizializzazione del server:", error);
    }
}
startServer();
//# sourceMappingURL=start.js.map