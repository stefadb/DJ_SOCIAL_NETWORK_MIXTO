import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  PassaggioDbSchema,
  UtenteDbSchema,
  type BranoDb,
  type PassaggioDb,
  type UtenteDb,
} from "../types/db_types";
import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";

function Utente() {
  //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const id = query.get("id");
  const [utente, setUtente] = useState<UtenteDb | null>(null);

  //useEffect necessario per recuperare i dati
  useEffect(() => {
    loadUtente();
  }, []);

  async function loadUtente() {
    try {
      const response = await axios.get(`http://localhost:3000/utenti/${id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
      UtenteDbSchema.parse(response.data);
      setUtente(response.data as UtenteDb);
      //Il brano è stato caricato con successo, ora si possono caricare i passaggi
    } catch (error) {
      //TODO: Gestire errore
      console.error("Errore nel recupero del brano:", error);
    }
  }

  return (
    <div>
      <h1>Scheda utente</h1>
      {utente ? (
        <div>
          <h2>{utente.nome} {utente.cognome}</h2>
        </div>
      ) : (
        <p>Caricamento...</p>
      )}
      {utente !== null &&
        <div>
          <div>
            <h3>Passaggi pubblicati da {utente.nome} {utente.cognome}</h3>
            <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi?utente=${utente.id}`} schema={PassaggioDbSchema} component={(element: PassaggioDb) => (
              <CardPassaggio
                key={element.id}
                passaggio={element}
                brano1={(element.brano_1_array as BranoDb[])[0] as BranoDb}
                brano2={(element.brano_2_array as BranoDb[])[0] as BranoDb}
              />
            )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>} />
          </div>
        </div>
      }
    </div>
  );
}

export default Utente;
