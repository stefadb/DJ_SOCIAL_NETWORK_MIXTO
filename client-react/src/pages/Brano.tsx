import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  BranoDbSchema,
  PassaggioDbSchema,
  type ArtistaDb,
  type BranoDb,
  type PassaggioDb,
} from "../types/db_types";
import CardPassaggio from "../components/CardPassaggio";
import PagedList from "../components/PagedList";
import BranoTableRow from "../components/BranoTableRow";

function Brano() {
  //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const id = query.get("id");
  const [brano, setBrano] = useState<BranoDb | null>(null);

  //useEffect necessario per recuperare i dati
  useEffect(() => {
    axios
      .get(`http://localhost:3000/brani/singolo?trackId=${id}&limit=1&index=0`)
      .then((response) => {
        if (response.status == 200) {
          const branoParsed = BranoDbSchema.safeParse(response.data[0]);
          if (!branoParsed.success) {
            //TODO: Gestire errore
            console.error(
              "Errore di validazione dei dati del brano:",
              branoParsed.error
            );
            return;
          }
          setBrano(branoParsed.data);
          //Il brano è stato caricato con successo, ora si possono caricare i passaggi
        } else {
          //TODO: Gestire errore
          console.error("Errore nel recupero del brano:", response.statusText);
        }
      })
      .catch((error) => {
        //TODO: Gestire errore
        console.error("Errore nel recupero del brano:", error);
      });
  }, []);

  //TODO: spostare questa funzione in un file condiviso e non in un componente
  async function getNomiArtistiBrano(id: number): Promise<ArtistaDb[]> {
    //TODO: migliorare le prestazioni in modo che non venga sempre fatta la chiamata API a Deezer
    return new Promise((resolve, reject) => {
      axios
        .get(
          `http://localhost:3000/brani/singolo?trackId=${id}&limit=1&index=0`
        )
        .then((response) => {
          if (response.status == 200) {
            axios
              .get(
                `http://localhost:3000/brani/esistenti/${id}?include_artista`
              )
              .then((response) => {
                if (response.status === 200) {
                  //TODO: effettuare la validazione con zod
                  resolve(response.data.artista as ArtistaDb[]);
                } else {
                  reject(new Error("Errore nel recupero dell'artista"));
                }
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            reject(new Error("Errore nel recupero del brano"));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  return (
    <div>
      <h1>Brano</h1>
      {brano ? (
        <div>
          <h2>{brano.titolo}</h2>
          <p>Durata: {brano.durata} secondi</p>
          <p>Album ID: {brano.id_album}</p>
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
                <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi/conta?primoBrano=${brano.id}`} component={(element: { numero_passaggi: number; id_brano_2: number; brano_2_array: BranoDb[] }) => (
                  <BranoTableRow element={element} getNomiArtistiBrano={getNomiArtistiBrano} />
                )} showMoreButton={(onClick) => <tr><td colSpan={4}><button onClick={onClick}>Carica altri brani</button></td></tr>} />
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
                <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi/conta?secondoBrano=${brano.id}`} component={(element: { numero_passaggi: number; id_brano_1: number; brano_1_array: BranoDb[] }) => (
                  <BranoTableRow element={element} getNomiArtistiBrano={getNomiArtistiBrano} />
                )} showMoreButton={(onClick) => <tr><td colSpan={4}><button onClick={onClick}>Carica altri brani</button></td></tr>} />
              </tbody>
            </table>
          </div>
        </div>
      }
      {brano !== null &&
        <>
          <div>
            <h2>Passaggi dove il brano è il primo</h2>
            <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi?primoBrano=${brano.id}`} schema={PassaggioDbSchema} component={(element: PassaggioDb) => (
              <CardPassaggio
                key={element.id}
                passaggio={element}
                brano1={brano}
                brano2={(element.brano_2_array as BranoDb[])[0] as BranoDb}
                getNomiArtistiBrano={getNomiArtistiBrano}
              />
            )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>} />
          </div>
          <div>
            <h2>Passaggi dove il brano è il secondo</h2>
            <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi?secondoBrano=${brano.id}`} schema={PassaggioDbSchema} component={(element: PassaggioDb) => (
              <CardPassaggio
                key={element.id}
                passaggio={element}
                brano1={(element.brano_1_array as BranoDb[])[0] as BranoDb}
                brano2={brano}
                getNomiArtistiBrano={getNomiArtistiBrano}
              />
            )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>}/>
          </div>
        </>
      }
    </div>
  );
}

export default Brano;
