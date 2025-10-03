import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    AlbumDbSchema,
    type AlbumDb,
    type ArtistaDb,
    type BranoDb,
} from "../types/db_types";

import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import CardBrano from "../components/cards/CardBrano";
import { getNomiArtistiAlbum } from "../functions/functions";
import api from "../api";
import CardAlbum from "../components/cards/CardAlbum";
import CardArtista from "../components/cards/CardArtista";
import { PassaggioConBraniEUtenteSchema, type PassaggioConBraniEUtente } from "../types/types";
import Caricamento from "../components/icons/Caricamento";

function Album() {
    //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const id = query.get("id");
    const [album, setAlbum] = useState<AlbumDb | null>(null);
    const [artistiAlbum, setArtistiAlbum] = useState<ArtistaDb[] | null>(null);
    const [albumLoaded, setAlbumLoaded] = useState(false);
    //useEffect necessario per recuperare i dati
    useEffect(() => {
        loadAlbum();
    }, []);

    async function loadAlbum() {
        try {
            await api.get(`/album/singolo?albumId=${id}&limit=1&index=0`);
            setAlbumLoaded(true);
            const responseAlbum = await api.get(`/album/esistenti/${id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            const responseAlbumData: AlbumDb = AlbumDbSchema.parse(responseAlbum.data) as AlbumDb;
            setAlbum(responseAlbumData);
            setArtistiAlbum(await getNomiArtistiAlbum(undefined, responseAlbumData.id));
            //L'album è stato caricato con successo, ora si possono caricare i passaggi
        } catch (error) {
            //TODO: Gestire errore
            console.error("Errore nel recupero dell'album:", error);
        }
    }

    return (
        <div>
            {album ? (
                <div className="flex flex-row justify-center">
                    <CardAlbum size={"large"} album={album} />
                </div>
            ) : (
                <div className="flex flex-row justify-center">
                    <Caricamento size="giant" status={"loading"}/>
                </div>
            )}
            {album !== null &&
                <>
                    <div>
                        <h2>Artisti dell'album</h2>
                        {artistiAlbum &&
                            <div className="flex flex-row justify-start overscroll-x-contain">
                                {artistiAlbum.map((artista, index) => {
                                    return <CardArtista key={index} artista={artista} size={"small"} />;
                                })}
                            </div>
                        }
                        {!artistiAlbum &&
                            <Caricamento size="tiny" status={"loading"}/>
                        }
                    </div>
                    <div>
                        <h2>Brani dell'album</h2>
                        {albumLoaded &&
                            <PagedList itemsPerPage={5} apiCall={`/brani/esistenti?album=${album.id}`} component={(element: BranoDb) => (
                                <CardBrano size={"small"} key={element.id} brano={element} />
                            )} scrollMode="horizontal"
                                emptyMessage="😮 Non ci sono brani in questo album" />
                        }
                        {!albumLoaded &&
                            <Caricamento size="small" status={"loading"}/>
                        }
                    </div>
                    <div>
                        <h2>Passaggi dove il primo brano è di questo album</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?albumPrimoBrano=${album.id}`}
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
                        <h2>Passaggi dove il secondo brano è di questo album</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?albumSecondoBrano=${album.id}`}
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

export default Album;
