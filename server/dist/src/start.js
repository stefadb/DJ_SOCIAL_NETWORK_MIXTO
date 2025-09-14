"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const get_db_tables_and_columns_1 = require("./get_db_tables_and_columns");
async function startServer() {
    console.log("Funzione startServer chiamata");
    try {
        // Attendi che dbTablesAndColumns sia popolato
        await (0, get_db_tables_and_columns_1.getDbTablesAndColumns)();
        server_1.default.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    }
    catch (error) {
        console.error("Errore durante l'inizializzazione del server:", error);
    }
}
startServer();
//# sourceMappingURL=start.js.map