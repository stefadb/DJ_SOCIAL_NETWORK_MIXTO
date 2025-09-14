
import app from "./server";
import { getDbTablesAndColumns } from "./get_db_tables_and_columns";

async function startServer() {
  console.log("Funzione startServer chiamata");
  try {
    // Attendi che dbTablesAndColumns sia popolato
    await getDbTablesAndColumns();
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Errore durante l'inizializzazione del server:", error);
  }
}

startServer();



