import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import {
  AlbumDbSchema,
  ArtistaDbSchema,
  BranoDbSchema,
  PassaggioDbSchema,
  type BranoDb,
  type PassaggioDb,
} from "../types/db_types";

import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import BranoTableRow from "../components/BranoTableRow";
import z from "zod";
import CardBrano from "../components/cards/CardBrano";
import Caricamento from "../components/icons/Caricamento";
import { grayBoxShadow, largePadding } from "../functions/functions";

// Schema e type per /passaggi/conta?primoBrano= e /passaggi/conta?secondoBrano=
const ContaPassaggiBrano2Schema = z.object({
  numero_passaggi: z.number(),
  id_brano_2: z.number(),
  brano_2_array: z.array(BranoDbSchema)
});
type ContaPassaggiBrano2 = z.infer<typeof ContaPassaggiBrano2Schema>;

const ContaPassaggiBrano1Schema = z.object({
  numero_passaggi: z.number(),
  id_brano_1: z.number(),
  brano_1_array: z.array(BranoDbSchema)
});
type ContaPassaggiBrano1 = z.infer<typeof ContaPassaggiBrano1Schema>;

function Brano() {
  //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const id = query.get("id");
  const ApiSchema = BranoDbSchema.extend({
    artista: z.array(ArtistaDbSchema),
    album: AlbumDbSchema
  });
  type ApiType = z.infer<typeof ApiSchema>;
  const [brano, setBrano] = useState<ApiType | null>(null);

  //useEffect necessario per recuperare i dati
  useEffect(() => {
    loadBrano();
  }, []);

  async function loadBrano() {
    try {
      await api.get(`/brani/singolo?trackId=${id}&limit=1&index=0`);
      const response = await api.get(`/brani/esistenti/${id}?include_artista&include_album`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
      const responseData = ApiSchema.parse(response.data) as ApiType;
      setBrano(responseData);
      //Il brano è stato caricato con successo, ora si possono caricare i passaggi
    } catch (error) {
      //TODO: Gestire errore
      console.error("Errore nel recupero del brano:", error);
    }
  }

  return (
    <div>
      {brano ? (
  <div className="flex flex-row justify-center">
          <CardBrano brano={brano} size={"large"} />
        </div>
      ) : (
  <div className="flex flex-row justify-center">
          <Caricamento size="giant" />
        </div>
      )}
      {brano !== null &&
        <>
          <div className="flex flex-row justify-evenly flex-wrap gap-5">
            <div className="text-center" style={{ padding: largePadding(), borderRadius: 8, boxShadow: grayBoxShadow() }}>
              <h3>Top brani più mixati dopo di <i>{brano.titolo}</i></h3>
              <div>
                <div className="classifica-row">
                  <div className="classifica-cell classifica-cell-header"><b>#&nbsp;passaggi</b></div>
                  <div className="classifica-cell classifica-cell-header"><b>Titolo</b></div>
                  <div className="classifica-cell classifica-cell-header"><b>Durata</b></div>
                  <div className="classifica-cell classifica-cell-header"><b>Artisti</b></div>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
                  <PagedList
                    itemsPerPage={2}
                    apiCall={`/passaggi/conta?primoBrano=${brano.id}`}
                    schema={ContaPassaggiBrano2Schema}
                    scrollMode="vertical"
                    component={(element: ContaPassaggiBrano2) => (
                      <BranoTableRow element={element} />
                    )}
                    showMoreButton={(onClick) => <div className="classifica-big-cell cursor-pointer" onClick={onClick}>Carica altri brani</div>}
                    emptyMessage={<div className="classifica-big-cell">😮 Nessun passaggio trovato</div>}
                  />
                </div>
              </div>
            </div>
            <div className="text-center" style={{ padding: largePadding(), borderRadius: 8, boxShadow: grayBoxShadow() }}>
              <h3>Top brani più mixati prima di <i>{brano.titolo}</i></h3>
              <div>
                <div className="classifica-row">
                  <div className="classifica-cell classifica-cell-header"><b># passaggi</b></div>
                  <div className="classifica-cell classifica-cell-header"><b>Titolo</b></div>
                  <div className="classifica-cell classifica-cell-header"><b>Durata</b></div>
                  <div className="classifica-cell classifica-cell-header"><b>Artisti</b></div>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
                  <PagedList
                    itemsPerPage={2}
                    apiCall={`/passaggi/conta?secondoBrano=${brano.id}`}
                    schema={ContaPassaggiBrano1Schema}
                    scrollMode="vertical"
                    component={(element: ContaPassaggiBrano1) => (
                      <BranoTableRow element={element} />
                    )}
                    showMoreButton={(onClick) => <div className="classifica-big-cell cursor-pointer" onClick={onClick}>Carica altri brani</div>}
                    emptyMessage={<div className="classifica-big-cell">😮 Nessun passaggio trovato</div>}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2>Brani mixati dopo di <i>{brano.titolo}</i></h2>
            <PagedList itemsPerPage={2} apiCall={`/passaggi?primoBrano=${brano.id}`} schema={PassaggioDbSchema} scrollMode="horizontal" component={(element: PassaggioDb) => (
              <CardPassaggio
                key={element.id}
                passaggio={element}
                brano1={brano}
                brano2={(element.brano_2_array as BranoDb[])[0] as BranoDb}
                utente={element.utente_array[0] ? element.utente_array[0] : null}
                size={"small"}
              />
            )}
              emptyMessage="😮 Nessun passaggio trovato"
            />
          </div>
          <div>
            <h2>Brani mixati prima di <i>{brano.titolo}</i></h2>
            <PagedList itemsPerPage={2} apiCall={`/passaggi?secondoBrano=${brano.id}`} schema={PassaggioDbSchema} scrollMode="horizontal" component={(element: PassaggioDb) => (
              <CardPassaggio
                key={element.id}
                passaggio={element}
                brano1={(element.brano_1_array as BranoDb[])[0] as BranoDb}
                brano2={brano}
                size={"small"}
                utente={element.utente_array[0] ? element.utente_array[0] : null}
              />
            )}
              emptyMessage="😮 Nessun passaggio trovato"
            />
          </div>
        </>
      }
    </div>
  );
}

export default Brano;
