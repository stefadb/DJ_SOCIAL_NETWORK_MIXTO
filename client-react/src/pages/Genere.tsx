import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import {
    ArtistaDbSchema,
    BranoDbSchema,
    GenereDbSchema,
    PassaggioDbSchema,
    type ArtistaDb,
    type BranoDb,
    type GenereDb,
    type PassaggioDb,
} from "../types/db_types";

import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import CardBrano from "../components/cards/CardBrano";
import CardArtista from "../components/cards/CardArtista";
import z from "zod";

// Schema e type per /passaggi?genereSecondoBrano= e /passaggi?generePrimoBrano=
const PassaggioConBraniSchema = PassaggioDbSchema.extend({
    brano_1_array: z.array(BranoDbSchema),
    brano_2_array: z.array(BranoDbSchema)
});
type PassaggioConBrani = z.infer<typeof PassaggioConBraniSchema>;

function Genere() {
    //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const id = query.get("id");
    const [genere, setGenere] = useState<GenereDb | null>(null);

    //useEffect necessario per recuperare i dati
    useEffect(() => {
        loadGenere();
    }, []);

    async function loadGenere() {
        try {
            await api.get(`/generi/singolo?genreId=${id}&limit=1&index=0`);
            const response = await api.get(`/generi/esistenti/${id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            GenereDbSchema.parse(response.data);
            setGenere(response.data as GenereDb);
        } catch (error) {
            console.error("Errore nel recupero del genere:", error);
        }
    }

    return (
        <div>
            <h1>Genere</h1>
            {genere ? (
                <div>
                    <img style={{ width: "200px", height: "200px", borderRadius: "50%" }} src={"http://localhost:3000/generi_pictures/" + genere.id + ".jpg"} alt={"Immagine del genere " + genere.nome} />
                    <h2>{genere.nome}</h2>
                </div>
            ) : (
                <p>Caricamento...</p>
            )}
            {genere !== null &&
                <>
                    <div>
                        <h2>Artisti del genere più popolari su Deezer</h2>
                        <PagedList itemsPerPage={5} apiCall={`/artisti/genere?genreId=${genere.id}`} schema={ArtistaDbSchema} component={(element: ArtistaDb) => (
                            <CardArtista key={element.id} artista={element} />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri artisti</button>} />
                    </div>
                    <div>
                        <h2>Brani del genere più popolari su Deezer</h2>
                        <PagedList itemsPerPage={5} apiCall={`/brani/genere?genreId=${genere.id}`} schema={BranoDbSchema} component={(element: BranoDb) => (
                            <CardBrano key={element.id} brano={element} />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri brani</button>} />
                    </div>
                    <div>
                        <h2>Cosa mettere prima di un brano del genere {genere.nome}?</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?genereSecondoBrano=${genere.id}`}
                            schema={PassaggioConBraniSchema}
                            component={(element: PassaggioConBrani) => (
                                <CardPassaggio
                                    key={element.id}
                                    passaggio={element}
                                    brano1={element.brano_1_array[0]}
                                    brano2={element.brano_2_array[0]}
                                />
                            )}
                            showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>}
                        />
                    </div>
                    <div>
                        <h2>E dopo?</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?generePrimoBrano=${genere.id}`}
                            schema={PassaggioConBraniSchema}
                            component={(element: PassaggioConBrani) => (
                                <CardPassaggio
                                    key={element.id}
                                    passaggio={element}
                                    brano1={element.brano_1_array[0]}
                                    brano2={element.brano_2_array[0]}
                                />
                            )}
                            showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>}
                        />
                    </div>
                </>
            }
        </div>
    );
}

export default Genere;
