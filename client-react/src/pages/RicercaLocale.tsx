import { useRef, useState } from "react";
import CardArtista from "../components/cards/CardArtista";
import PagedList from "../components/PagedList";
import { AlbumDbSchema, ArtistaDbSchema, BranoDbSchema, type AlbumDb, type ArtistaDb, type BranoDb } from "../types/db_types";
import CardBrano from "../components/cards/CardBrano";
import CardAlbum from "../components/cards/CardAlbum";

function RicercaLocale() {
    const [viewedQueryText, setViewedQueryText] = useState<string>("");
    const [sentQueryText, setSentQueryText] = useState<string>("");

    //Fare debouncing: sentQueryText viene aggiornato solo se viewedQueryText non cambia da almeno 500ms
    const debounceTimeout = useRef<number | undefined>(undefined);
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;
        setViewedQueryText(newValue);

        // Resetta il timeout di debounce
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            setSentQueryText(newValue);
        }, 500);
    }

    return <div>
        <h1>Cerca su Mixto</h1>
        <input type="text" value={viewedQueryText} onChange={handleInputChange} placeholder="Inserisci il testo da cercare..." />
        {sentQueryText.length > 0 &&
            <>
                <h2>Risultati per <i>"{sentQueryText}"</i></h2>
                <h3>Artisti:</h3>
                <PagedList itemsPerPage={10} apiCall={`/artisti/esistenti?query=${sentQueryText}`} schema={ArtistaDbSchema} component={(element: ArtistaDb) => (
                    <CardArtista key={element.id} artista={element} />
                )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri artisti</button>} />
                <h3>Album:</h3>
                <PagedList itemsPerPage={10} apiCall={`/album/esistenti?query=${sentQueryText}`} schema={AlbumDbSchema} component={(element: AlbumDb) => (
                    <CardAlbum key={element.id} album={element} />
                )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri album</button>} />
                <h3>Brani:</h3>
                <PagedList itemsPerPage={10} apiCall={`/brani/esistenti?query=${sentQueryText}`} schema={BranoDbSchema} component={(element: BranoDb) => (
                    <CardBrano key={element.id} brano={element} />
                )} showMoreButton={(onClick) => <button onClick={onClick}>Carica altri brani</button>} />
            </>
        }
    </div>;
}
export default RicercaLocale;