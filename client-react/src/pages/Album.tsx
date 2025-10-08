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
import { check404, deezerColor, getNomiArtistiAlbum } from "../functions/functions";
import api from "../api";
import CardAlbum from "../components/cards/CardAlbum";
import CardArtista from "../components/cards/CardArtista";
import { PassaggioConBraniEUtenteSchema, type PassaggioConBraniEUtente } from "../types/types";
import Caricamento from "../components/icons/Caricamento";
import { Users } from "react-feather";

function Album() {
    //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const id = query.get("id");
    const [album, setAlbum] = useState<AlbumDb | null>(null);
    const [mostraArtistiAlbum, setMostraArtistiAlbum] = useState<boolean>(false);
    const [artistiAlbum, setArtistiAlbum] = useState<ArtistaDb[] | null>(null);
    const [albumLoaded, setAlbumLoaded] = useState(false);
    const [errore, setErrore] = useState<"error" | "not-found" | null>(null);
    //useEffect necessario per recuperare i dati
    useEffect(() => {
        loadAlbum();
    }, []);

    useEffect(() => {
        if (mostraArtistiAlbum && id) {
            (async () => {
                setArtistiAlbum(await getNomiArtistiAlbum(undefined, parseInt(id)));
            })();
        }
    }, [mostraArtistiAlbum]);

    async function loadAlbum() {
        try {
            setErrore(null);
            await api.get(`/album/singolo?albumId=${id}&limit=1&index=0`);
            setAlbumLoaded(true);
            const responseAlbum = await api.get(`/album/esistenti/${id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            const responseAlbumData: AlbumDb = AlbumDbSchema.parse(responseAlbum.data) as AlbumDb;
            setAlbum(responseAlbumData);
            //L'album è stato caricato con successo, ora si possono caricare i passaggi
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
            {album ? (
                <div className="flex flex-row justify-center">
                    <CardAlbum size={"large"} album={album} />
                </div>
            ) : (
                <div className="flex flex-row justify-center">
                    <Caricamento size="giant" status={errore === null ? "loading" : errore} />
                </div>
            )}
            {album !== null &&
                <>
                    <div>
                        <h2>Artisti dell'album</h2>
                        {mostraArtistiAlbum &&
                            <>
                                {artistiAlbum &&
                                    <div className="flex flex-row justify-start overscroll-x-contain">
                                        {artistiAlbum.map((artista, index) => {
                                            return <CardArtista key={index} artista={artista} size={"small"} />;
                                        })}
                                    </div>
                                }
                                {!artistiAlbum &&
                                    <Caricamento size="tiny" status={"loading"} />
                                }
                            </>
                        }
                        {!mostraArtistiAlbum &&
                            <button onClick={() => { setMostraArtistiAlbum(true); }} className="rounded p-2 text-base card-button">
                                <Users size={16} color={deezerColor()} />  Vedi artisti
                            </button >
                        }
                    </div>
                    <div>
                        <h2>Brani dell'album</h2>
                        {albumLoaded &&
                            <PagedList itemsPerPage={5} apiCall={`/brani/esistenti?album=${album.id}`} component={(element: BranoDb) => (
                                <CardBrano scale={1} key={element.id} brano={element} />
                            )} scrollMode="horizontal"
                                emptyMessage="😮 Non ci sono brani in questo album" />
                        }
                        {!albumLoaded &&
                            <Caricamento size="small" status={"loading"} />
                        }
                    </div>
                    <div>
                        <h2>Mix dove il primo brano è di questo album</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?albumPrimoBrano=${album.id}`}
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
                        <h2>Mix dove il secondo brano è di questo album</h2>
                        <PagedList
                            itemsPerPage={2}
                            apiCall={`/passaggi?albumSecondoBrano=${album.id}`}
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

export default Album;
