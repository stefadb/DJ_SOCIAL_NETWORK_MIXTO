import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import {
  AlbumDbSchema,
  ArtistaDbSchema,
  BranoDbSchema,
  GenereDbSchema,
  PassaggioDbSchema,
  type BranoDb,
  type GenereDb,
  type PassaggioDb,
} from "../types/db_types";

import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import BranoTableRow from "../components/BranoTableRow";
import z from "zod";
import CardBrano from "../components/cards/CardBrano";

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
  const [generi, setGeneri] = useState<GenereDb[] | null>(null);

  //useEffect necessario per recuperare i dati
  useEffect(() => {
    loadBrano();
  }, []);

  async function loadBrano() {
    try {
      await api.get(`/brani/singolo?trackId=${id}&limit=1&index=0`);
      const response = await api.get(`/brani/esistenti/${id}?include_artista&include_album`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
      const responseData = ApiSchema.parse(response.data) as ApiType;
      await api.get(`/album/singolo?albumId=${responseData.id_album}&limit=1&index=0`);
      const responseAlbum = await api.get(`/album/esistenti/${responseData.id_album}?include_genere`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
      const ApiSchemaAlbum = AlbumDbSchema.extend({
        genere: z.array(GenereDbSchema)
      });
      type ApiTypeAlbum = z.infer<typeof ApiSchemaAlbum>;
      const responseAlbumData = ApiSchemaAlbum.parse(responseAlbum.data) as ApiTypeAlbum;
      setBrano(responseData);
      setGeneri(responseAlbumData.genere as GenereDb[]);
      //Il brano è stato caricato con successo, ora si possono caricare i passaggi
    } catch (error) {
      //TODO: Gestire errore
      console.error("Errore nel recupero del brano:", error);
    }
  }

  return (
    <div>
      {brano ? (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
          <CardBrano brano={brano} size={"large"} />
        </div>
      ) : (
        <p>Caricamento...</p>
      )}
      {brano !== null &&
        <div>
          <div>
            <h3>Passaggi dove il brano è il primo (conteggio per brano 2)</h3>
            <table>
              <thead>
                <tr>
                  <th>Numero passaggi</th>
                  <th>Titolo</th>
                  <th>Durata</th>
                  <th>Artisti</th>
                </tr>
              </thead>
              <tbody>
                <PagedList
                  itemsPerPage={2}
                  apiCall={`/passaggi/conta?primoBrano=${brano.id}`}
                  schema={ContaPassaggiBrano2Schema}
                  scrollMode="vertical"
                  component={(element: ContaPassaggiBrano2) => (
                    <BranoTableRow element={element} />
                  )}
                  showMoreButton={(onClick) => <tr><td colSpan={4}><button onClick={onClick}>Carica altri brani</button></td></tr>}
                />
              </tbody>
            </table>
          </div>
          <div>
            <h3>Passaggi dove il brano è il secondo (conteggio per brano 1)</h3>
            <table>
              <thead>
                <tr>
                  <th>Numero passaggi</th>
                  <th>Titolo</th>
                  <th>Durata</th>
                  <th>Artisti</th>
                </tr>
              </thead>
              <tbody>
                <PagedList
                  itemsPerPage={2}
                  apiCall={`/passaggi/conta?secondoBrano=${brano.id}`}
                  schema={ContaPassaggiBrano1Schema}
                  scrollMode="horizontal"
                  component={(element: ContaPassaggiBrano1) => (
                    <BranoTableRow element={element} />
                  )}
                  showMoreButton={(onClick) => <tr><td colSpan={4}><button onClick={onClick}>Carica altri brani</button></td></tr>}
                />
              </tbody>
            </table>
          </div>
        </div>
      }
      {brano !== null &&
        <>
          <div>
            <h2>Passaggi dove il brano è il primo</h2>
            <PagedList itemsPerPage={2} apiCall={`/passaggi?primoBrano=${brano.id}`} schema={PassaggioDbSchema} scrollMode="horizontal" component={(element: PassaggioDb) => (
              <CardPassaggio
                key={element.id}
                passaggio={element}
                brano1={brano}
                brano2={(element.brano_2_array as BranoDb[])[0] as BranoDb}
              />
            )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>} />
          </div>
          <div>
            <h2>Passaggi dove il brano è il secondo</h2>
            <PagedList itemsPerPage={2} apiCall={`/passaggi?secondoBrano=${brano.id}`} schema={PassaggioDbSchema} scrollMode="horizontal" component={(element: PassaggioDb) => (
              <CardPassaggio
                key={element.id}
                passaggio={element}
                brano1={(element.brano_1_array as BranoDb[])[0] as BranoDb}
                brano2={brano}
              />
            )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>} />
          </div>
        </>
      }
    </div>
  );
}

export default Brano;
