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
} from "../types/db_types";

import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import CardBrano from "../components/cards/CardBrano";
import CardArtista from "../components/cards/CardArtista";
import z from "zod";
import CardGenere from "../components/cards/CardGenere";
import { PassaggioConBraniEUtenteSchema, type PassaggioConBraniEUtente } from "../types/types";

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
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                {genere ? (
                    <CardGenere genere={genere} size="large" />
                ) : (
                    <p>Caricamento...</p>
                )}
            </div>
            {genere !== null &&
                <>
                    <div>
                        <h2>Artisti del genere più popolari su Deezer</h2>
                        <PagedList noPaging itemsPerPage={5} apiCall={`/artisti/genere?genreId=${genere.id}`} schema={ArtistaDbSchema} scrollMode="horizontal" component={(element: ArtistaDb) => (
                            <CardArtista key={element.id} artista={element} size="small" />
                        )}
                            emptyMessage="😮 Nessun artista trovato"
                        />
                    </div>
                    <div>
                        <h2>Brani del genere più popolari su Deezer</h2>
                        <PagedList itemsPerPage={5} apiCall={`/brani/genere?genreId=${genere.id}`} schema={BranoDbSchema} scrollMode="horizontal" component={(element: BranoDb) => (
                            <CardBrano key={element.id} brano={element} size={"small"}/>
                        )}
                        emptyMessage="😮 Nessun brano trovato"
                        />
                    </div>
                    <div>
                        <h2>Cosa mettere prima di un brano del genere {genere.nome}?</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?genereSecondoBrano=${genere.id}`}
                            schema={PassaggioConBraniEUtenteSchema}
                            scrollMode="horizontal"
                            component={(element: PassaggioConBraniEUtente) => (
                                <CardPassaggio
                                    key={element.id}
                                    passaggio={element}
                                    brano1={element.brano_1_array[0]}
                                    brano2={element.brano_2_array[0]}
                                    utente={element.utente_array[0] ? element.utente_array[0] : null}
                                    size={"small"}
                                />
                            )}
                            emptyMessage="😮 Nessun passaggio trovato"
                        />
                    </div>
                    <div>
                        <h2>E dopo?</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?generePrimoBrano=${genere.id}`}
                            schema={PassaggioConBraniEUtenteSchema}
                            scrollMode="horizontal"
                            component={(element: PassaggioConBraniEUtente) => (
                                <CardPassaggio
                                    key={element.id}
                                    passaggio={element}
                                    brano1={element.brano_1_array[0]}
                                    brano2={element.brano_2_array[0]}
                                    utente={element.utente_array[0] ? element.utente_array[0] : null}
                                    size={"small"}
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

export default Genere;
