import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
    ArtistaDbSchema,
    BranoDbSchema,
    PassaggioDbSchema,
    type AlbumDb,
    type ArtistaDb,
    type BranoDb,
    type PassaggioDb,
} from "../types/db_types";
import CardPassaggio from "../components/cards/CardPassaggio";
import PagedList from "../components/PagedList";
import CardAlbum from "../components/cards/CardAlbum";
import CardBrano from "../components/cards/CardBrano";
import CardArtista from "../components/cards/CardArtista";

function Artista() {
    //Il componente deve prendere in input l'id del brano (da passare come parametro di query nell'URL) e fare una chiamata al backend per ottenere i dati del brano
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const id = query.get("id");
    const [artista, setArtista] = useState<ArtistaDb | null>(null);
    const [albumArtista, setAlbumArtista] = useState<AlbumDb[] | null>(null);

    //useEffect necessario per recuperare i dati
    useEffect(() => {
        loadArtista();
    }, []);

    async function loadArtista() {
        try {
            await axios.get(`http://localhost:3000/artisti/singolo?artistId=${id}&limit=1&index=0`);
            await axios.get(`http://localhost:3000/album/artista?artistId=${id}&limit=1&index=0`);
            const responseArtista = await axios.get(`http://localhost:3000/artisti/esistenti/${id}`);
            //TODO: validare con zod!!!
            setArtista(responseArtista.data as ArtistaDb);
            const responseAlbum = await axios.get(`http://localhost:3000/album/esistenti?artista=${id}`);
            //TODO: validare con zod!!!
            //setAlbumArtista(responseAlbum.data as AlbumDb[]);
        } catch (error) {
            //TODO: Gestire errore
            console.error("Errore nel recupero dell'artista:", error);
        }
    }

    return (
        <div>
            <h1>Artista</h1>
            {artista ? (
                <div>
                    <img style={{ width: "200px", height: "200px", borderRadius: "50%" }} src={"http://localhost:3000/artisti_pictures/" + artista.id + ".jpg"} alt={"Immagine di profilo di " + artista.nome} />
                    <h2>{artista.nome}</h2>
                    <p>Generi: --ancora non so come farli vedere-- //TODO:</p>
                </div>
            ) : (
                <p>Caricamento...</p>
            )}
            {artista !== null &&
                <>
                    <div>
                        <h2>Album dell'artista (ancora non so come farli vedere //TODO:)</h2>
                        {albumArtista ? (
                            albumArtista.map(album => (
                                <CardAlbum key={album.id} album={album} />
                            ))
                        ) : (
                            <p>Caricamento...</p>
                        )}
                    </div>
                    <div>
                        <h2>Brani dell'artista più popolari su Deezer</h2>
                        <PagedList itemsPerPage={5} apiCall={`http://localhost:3000/brani/artista?artistId=${artista.id}`} schema={BranoDbSchema} component={(element: BranoDb) => (
                            <CardBrano key={element.id} brano={element} />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri brani</button>} />
                    </div>
                    <div>
                        <h2>Artisti simili a {artista.nome}</h2>
                        <PagedList itemsPerPage={5} apiCall={`http://localhost:3000/artisti/simili?artistId=${artista.id}`} schema={ArtistaDbSchema} component={(element: ArtistaDb) => (
                            <CardArtista key={element.id} artista={element} />
                        )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri artisti</button>} />
                    </div>
                    <div>
                        <h2>Cosa mettere prima di un brano di {artista.nome}?</h2>
                        <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi?artistaSecondoBrano=${artista.id}`} schema={PassaggioDbSchema} component={(element: PassaggioDb) => (
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
                        <PagedList itemsPerPage={2} apiCall={`http://localhost:3000/passaggi?artistaPrimoBrano=${artista.id}`} schema={PassaggioDbSchema} component={(element: PassaggioDb) => (
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

export default Artista;
