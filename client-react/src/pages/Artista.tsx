import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import {
    AlbumDbSchema,
    ArtistaDbSchema,
    BranoDbSchema,
    PassaggioDbSchema,
    type AlbumDb,
    type ArtistaDb,
    type BranoDb,
} from "../types/db_types";

import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import CardAlbum from "../components/cards/CardAlbum";
import CardBrano from "../components/cards/CardBrano";
import CardArtista from "../components/cards/CardArtista";
import z from "zod";
import { PassaggioConBraniEUtenteSchema, type PassaggioConBraniEUtente } from "../types/types";
import Caricamento from "../components/icons/Caricamento";
import { check404 } from "../functions/functions";

function Artista() {
    //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const id = query.get("id");
    const [artista, setArtista] = useState<ArtistaDb | null>(null);
    const [errore, setErrore] = useState<"error" | "not-found" | null>(null);

    //useEffect necessario per recuperare i dati
    useEffect(() => {
        loadArtista();
    }, []);

    async function loadArtista() {
        try {
            await api.get(`/artisti/singolo?artistId=${id}&limit=1&index=0`);
            await api.get(`/album/artista?artistId=${id}&limit=1&index=0`);
            const responseArtista = await api.get(`/artisti/esistenti/${id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            ArtistaDbSchema.parse(responseArtista.data);
            setArtista(responseArtista.data as ArtistaDb);
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
            <div className="flex flex-row justify-center">
                {artista ? (
                    <CardArtista artista={artista} size="large" />
                ) : (
                    <Caricamento size="giant" status={errore === null ? "loading" : errore} />
                )}
            </div>
            {artista !== null &&
                <>
                    <div>
                        <h2>Album dell'artista</h2>
                        <PagedList itemsPerPage={5} apiCall={`/album/artista?artistId=${artista.id}`} schema={AlbumDbSchema} scrollMode="horizontal" component={(element: AlbumDb) => (
                            <CardAlbum key={element.id} album={element} size={"small"} />
                        )}
                            emptyMessage="😮 Questo artista non ha pubblicato nessun album" />
                    </div>
                    <div>
                        <h2>Brani dell'artista più popolari su DEEZER</h2>
                        <PagedList itemsPerPage={5} apiCall={`/brani/artista?artistId=${artista.id}`} schema={BranoDbSchema} scrollMode="horizontal" component={(element: BranoDb) => (
                            <CardBrano key={element.id} brano={element} scale={1} />
                        )}
                            emptyMessage="😮 Non ci sono brani particolarmente popolari di questo artista"
                        />
                    </div>
                    <div>
                        <h2>Artisti simili a {artista.nome}</h2>
                        <PagedList itemsPerPage={5} apiCall={`/artisti/simili?artistId=${artista.id}`} schema={ArtistaDbSchema} scrollMode="horizontal" component={(element: ArtistaDb) => (
                            <CardArtista key={element.id} artista={element} size="small" />
                        )}
                            emptyMessage={`😮 Non ci sono artisti simili a ${artista.nome}. Hai trovato un artista davvero unico!`}
                        />
                    </div>
                    <div>
                        <h2>Cosa mettere prima di un brano di {artista.nome}?</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?artistaSecondoBrano=${artista.id}`}
                            schema={PassaggioConBraniEUtenteSchema}
                            scrollMode="horizontal"
                            component={(element: PassaggioConBraniEUtente) => (
                                <div className="p-3">
                                <CardPassaggio
                                    key={element.id}
                                    passaggio={element}
                                    brano1={element.brano_1_array[0]}
                                    brano2={element.brano_2_array[0]}
                                    utente={element.utente_array[0] ? element.utente_array[0] : null}
                                   
                                />
                                </div>
                            )}
                            emptyMessage="😮 Nessun mix trovato"
                        />
                    </div>
                    <div>
                        <h2>E dopo?</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?artistaPrimoBrano=${artista.id}`}
                            schema={PassaggioConBraniEUtenteSchema}
                            scrollMode="horizontal"
                            component={(element: PassaggioConBraniEUtente) => (
                                <div className="p-3">
                                <CardPassaggio
                                    key={element.id}
                                    passaggio={element}
                                    brano1={element.brano_1_array[0]}
                                    brano2={element.brano_2_array[0]}
                                    utente={element.utente_array[0] ? element.utente_array[0] : null}
                                    
                                />
                                </div>
                            )}
                            emptyMessage="😮 Nessun mix trovato"
                        />
                    </div>
                </>
            }
        </div>
    );
}

export default Artista;
