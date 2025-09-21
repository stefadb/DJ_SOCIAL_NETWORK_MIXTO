import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
    ArtistaDbSchema,
    BranoDbSchema,
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
            await axios.get(`http://localhost:3000/generi/singolo?genreId=${id}&limit=1&index=0`);
            const response = await axios.get(`http://localhost:3000/generi/esistenti/${id}`, { headers: {"Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
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
                        <PagedList itemsPerPage={5} apiCall={`http://localhost:3000/artisti/genere?genreId=${genere.id}`} schema={ArtistaDbSchema} component={(element: ArtistaDb) => (
                            <CardArtista key={element.id} artista={element} />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri artisti</button>} />
                    </div>
                    <div>
                        <h2>Brani del genere più popolari su Deezer</h2>
                        <PagedList itemsPerPage={5} apiCall={`http://localhost:3000/brani/genere?genreId=${genere.id}`} schema={BranoDbSchema} component={(element: BranoDb) => (
                            <CardBrano key={element.id} brano={element} />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri brani</button>} />
                    </div>
                    <div>
                        <h2>Cosa mettere prima di un brano del genere {genere.nome}?</h2>
                        <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi?genereSecondoBrano=${genere.id}`} schema={PassaggioDbSchema} component={(element: PassaggioDb) => (
                            <CardPassaggio
                                key={element.id}
                                passaggio={element}
                                brano1={(element.brano_1_array as BranoDb[])[0] as BranoDb}
                                brano2={(element.brano_2_array as BranoDb[])[0] as BranoDb}
                            />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>} />
                    </div>
                    <div>
                        <h2>E dopo?</h2>
                        <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi?generePrimoBrano=${genere.id}`} schema={PassaggioDbSchema} component={(element: PassaggioDb) => (
                            <CardPassaggio
                                key={element.id}
                                passaggio={element}
                                brano1={(element.brano_1_array as BranoDb[])[0] as BranoDb}
                                brano2={(element.brano_2_array as BranoDb[])[0] as BranoDb}
                            />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>} />
                    </div>
                </>
            }
        </div>
    );
}

export default Genere;
