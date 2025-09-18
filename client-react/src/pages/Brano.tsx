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

function Brano() {
  //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const id = query.get("id");
  //Fare la chiamata con axios a /brani/singolo?trackId={id}&limit=1&index=0
  //Salvare i dati del brano in uno stato
  //Mostrare i dati del brano nella pagina (titolo, durata, album, artisti, generi)

  //In questi 3 useState si salvano i dati usati dalla pagina
  const [brano, setBrano] = useState<BranoDb | null>(null);
  const [passaggi1, setPassaggi1] = useState<PassaggioDb[] | null>(null);
  const [passaggi2, setPassaggi2] = useState<PassaggioDb[] | null>(null);

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
          axios
            .get(
              `http://localhost:3000/passaggi?primoBrano=${branoParsed.data.id}`
            )
            .then((response) => {
              if (response.status == 200) {
                const passaggiParsed = PassaggioDbSchema.array().safeParse(
                  response.data
                );
                if (!passaggiParsed.success) {
                  //TODO: Gestire errore
                  console.error(
                    "Errore di validazione dei dati dei passaggi:",
                    passaggiParsed.error
                  );
                  return;
                }
                //TODO: fare la validazione con zod prima di assegnare lo stato
                setPassaggi1(passaggiParsed.data);
              } else {
                //TODO: Gestire errore
                console.error(
                  "Errore nel recupero dei passaggi:",
                  response.statusText
                );
              }
            })
            .catch((error) => {
              //TODO: Gestire errore
              console.error("Errore nel recupero dei passaggi:", error);
            });
          axios
            .get(
              `http://localhost:3000/passaggi?secondoBrano=${branoParsed.data.id}`
            )
            .then((response) => {
              if (response.status == 200) {
                const passaggiParsed = PassaggioDbSchema.array().safeParse(
                  response.data
                );
                if (!passaggiParsed.success) {
                  //TODO: Gestire errore
                  console.error(
                    "Errore di validazione dei dati dei passaggi:",
                    passaggiParsed.error
                  );
                  return;
                }
                //TODO: fare la validazione con zod prima di assegnare lo stato
                setPassaggi2(passaggiParsed.data);
              } else {
                //TODO: Gestire errore
                console.error(
                  "Errore nel recupero dei passaggi:",
                  response.statusText
                );
              }
            })
            .catch((error) => {
              //TODO: Gestire errore
              console.error("Errore nel recupero dei passaggi:", error);
            });
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
      {/* Creare due liste di passaggi sfruttando il componente CardPassaggio.tsx. La prima è la lista dei passaggi dove questo brano è il primo, l'altra è la lista dei passaggi dove questo brano è il secondo */}
      {brano !== null && passaggi1 && passaggi1.length > 0 && (
        <div>
          <h2>Passaggi dove il brano è il primo</h2>
          {passaggi1.map((passaggio) => (
            <CardPassaggio
              key={passaggio.id}
              passaggio={passaggio}
              brano1={brano}
              brano2={(passaggio.brano_2_array as BranoDb[])[0] as BranoDb}
              getNomiArtistiBrano={getNomiArtistiBrano}
            />
          ))}
        </div>
      )}
      {brano !== null && passaggi2 && passaggi2.length > 0 && (
        <div>
          <h2>Passaggi dove il brano è il secondo</h2>
          {passaggi2.map((passaggio) => (
            <CardPassaggio
              key={passaggio.id}
              passaggio={passaggio}
              brano1={(passaggio.brano_1_array as BranoDb[])[0] as BranoDb}
              brano2={brano}
              getNomiArtistiBrano={getNomiArtistiBrano}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Brano;
