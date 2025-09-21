import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
    PassaggioDbSchema,
    type AlbumDb,
    type ArtistaDb,
    type BranoDb,
    type GenereDb,
    type PassaggioDb,
} from "../types/db_types";
import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import CardBrano from "../components/cards/CardBrano";
import { getNomiArtistiAlbum } from "../functions/functions";

function Album() {
    //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const id = query.get("id");
    const [album, setAlbum] = useState<AlbumDb | null>(null);
    const [artistiAlbum, setArtistiAlbum] = useState<ArtistaDb[] | null>(null);

    //useEffect necessario per recuperare i dati
    useEffect(() => {
        loadAlbum();
    }, []);

    async function loadAlbum() {
        try {
            await axios.get(`http://localhost:3000/album/singolo?albumId=${id}&limit=1&index=0`);
            const responseAlbum = await axios.get(`http://localhost:3000/album/esistenti/${id}?include_genere&include_brano`, { headers: {"Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            //TODO: validare con zod!!!
            setAlbum(responseAlbum.data as AlbumDb);
            setArtistiAlbum(await getNomiArtistiAlbum((responseAlbum.data.brano as BranoDb[]).map((brano: BranoDb) => brano.id), responseAlbum.data.id));
            //L'album è stato caricato con successo, ora si possono caricare i passaggi
        } catch (error) {
            //TODO: Gestire errore
            console.error("Errore nel recupero dell'album:", error);
        }
    }

    return (
        <div>
            <h1>Album</h1>
            {album ? (
                <div>
                    <h2>{album.titolo}</h2>
                    <p>Data di uscita: {album.data_uscita ? album.data_uscita : "Sconosciuta"}</p>
                    <p>Artisti: {artistiAlbum ? artistiAlbum.map(artista => artista.nome).join(", ") : "Caricamento..."}</p>
                    <p>Generi: {(album.genere as GenereDb[]).map(genere => genere.nome).join(", ")}</p>
                </div>
            ) : (
                <p>Caricamento...</p>
            )}
            {album !== null &&
                <div>
                    <h2>Brani dell'album</h2>
                    {(album.brano as BranoDb[]).map(brano => (
                        <CardBrano key={brano.id} brano={brano} />
                    ))}
                </div>
            }
            {album !== null &&
                <>
                    <div>
                        <h2>Passaggi dove il primo brano è di questo album</h2>
                        <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi?albumPrimoBrano=${album.id}`} schema={PassaggioDbSchema} component={(element: PassaggioDb) => (
                            <CardPassaggio
                                key={element.id}
                                passaggio={element}
                                brano1={(element.brano_1_array as BranoDb[])[0] as BranoDb}
                                brano2={(element.brano_2_array as BranoDb[])[0] as BranoDb}
                            />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri passaggi</button>} />
                    </div>
                    <div>
                        <h2>Passaggi dove il secondo brano è di questo album</h2>
                        <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi?albumSecondoBrano=${album.id}`} schema={PassaggioDbSchema} component={(element: PassaggioDb) => (
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

export default Album;
