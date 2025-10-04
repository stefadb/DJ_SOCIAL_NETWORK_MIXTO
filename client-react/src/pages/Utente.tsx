import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import {
  BranoDbSchema,
  PassaggioDbSchema,
  UtenteDbSchema,
  type BranoDb,
  type UtenteDb,
} from "../types/db_types";

import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import z from "zod";
import CardBrano from "../components/cards/CardBrano";
import CardUtente from "../components/cards/CardUtente";
import Caricamento from "../components/icons/Caricamento";
import { check404 } from "../functions/functions";

// Schema e type per /passaggi?utente=...
const PassaggioConBraniSchema = PassaggioDbSchema.extend({
  brano_1_array: z.array(BranoDbSchema),
  brano_2_array: z.array(BranoDbSchema)
});
type PassaggioConBrani = z.infer<typeof PassaggioConBraniSchema>;

function Utente() {
  //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const id = query.get("id");
  const [utente, setUtente] = useState<UtenteDb | null>(null);
  const [errore, setErrore] = useState<"error" | "not-found" | null>(null);

  //useEffect necessario per recuperare i dati
  useEffect(() => {
    loadUtente();
  }, []);

  async function loadUtente() {
    try {
      const response = await api.get(`/utenti/${id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
      UtenteDbSchema.parse(response.data);
      setUtente(response.data as UtenteDb);
      //Il brano è stato caricato con successo, ora si possono caricare i passaggi
    } catch (error) {
      if (check404(error)) {
        setErrore("not-found");
      } else {
        setErrore("error");
      }
    }
  }

  return (
    <div>
      {utente ? (
        <div className="flex flex-row justify-center">
          <CardUtente utente={utente} size="large" />
        </div>
      ) : (
        <div className="flex flex-row justify-center">
          <Caricamento size="giant" status={errore === null ? "loading" : errore} />
        </div>
      )}
      {utente !== null &&
        <div>
          <div>
            <h3>I brani preferiti di {utente.nome} {utente.cognome}</h3>
            <PagedList
              itemsPerPage={5}
              apiCall={`/brani/esistenti?utente=${utente.id}`}
              schema={BranoDbSchema}
              component={(element: BranoDb) => (
                <CardBrano key={element.id} brano={element} scale={1} />
              )}
              scrollMode="horizontal"
              showMoreButton={(onClick) => <button onClick={onClick}>Carica altri brani</button>}
              emptyMessage="😮 L'utente non ha ancora salvato nessun brano nei preferiti"
            />
          </div>
          <div>
            <h3>Passaggi pubblicati da {utente.nome} {utente.cognome}</h3>
            <PagedList
              itemsPerPage={2}
              apiCall={`/passaggi?utente=${utente.id}`}
              schema={PassaggioConBraniSchema}
              component={(element: PassaggioConBrani) => (
                <CardPassaggio
                  key={element.id}
                  passaggio={element}
                  brano1={element.brano_1_array[0]}
                  brano2={element.brano_2_array[0]}
                  
                  utente={utente}
                />
              )}
              scrollMode="horizontal"
              emptyMessage="😮 L'utente non ha ancora pubblicato nessun passaggio"
            />
          </div>
        </div>
      }
    </div>
  );
}

export default Utente;
