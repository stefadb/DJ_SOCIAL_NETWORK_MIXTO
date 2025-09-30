import { useEffect, useRef, useState } from "react";
import CardArtista from "../components/cards/CardArtista";
import PagedList from "../components/PagedList";
import { AlbumDbSchema, ArtistaDbSchema, BranoDbSchema, GenereDbSchema, UtenteDbSchema, type AlbumDb, type ArtistaDb, type BranoDb, type GenereDb, type UtenteDb } from "../types/db_types";
import CardBrano from "../components/cards/CardBrano";
import CardAlbum from "../components/cards/CardAlbum";
import { useLocation, useNavigate } from "react-router-dom";
import IncludiRisultatiDeezer from "../components/buttons/IncludiRisultatiDeezer";
import api from "../api";
import CardGenere from "../components/cards/CardGenere";
import CardUtente from "../components/cards/CardUtente";

function Ricerca() {
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const q = query.get("q");
    const [viewedQueryText, setViewedQueryText] = useState<string>(q ? q : "");
    const navigate = useNavigate();
    const [artistiDeezer, setArtistiDeezer] = useState<boolean>(false);
    const [albumDeezer, setAlbumDeezer] = useState<boolean>(false);
    const [braniDeezer, setBraniDeezer] = useState<boolean>(false);
    const [generiLoaded, setGeneriLoaded] = useState<boolean>(false);

    //Fare debouncing: sentQueryText viene aggiornato solo se viewedQueryText non cambia da almeno 500ms
    const debounceTimeout = useRef<number | undefined>(undefined);
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;
        setViewedQueryText(newValue);

        // Resetta il timeout di debounce
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            navigate(`/ricerca?q=${newValue}`);
        }, 500);
    }

    useEffect(() => {
        loadGeneri();
        setAlbumDeezer(false);
        setArtistiDeezer(false);
        setBraniDeezer(false);
    }, []);

    useEffect(() => {
        setAlbumDeezer(false);
        setArtistiDeezer(false);
        setBraniDeezer(false);
    }, [q]);

    async function loadGeneri() {
        try {
            await api.get(`/generi/tutti?uselessParam=uselessValue&limit=100&index=0`);
            setGeneriLoaded(true);
        } catch (error) {
            console.error("Errore nel recupero dei generi:", error);
        }
    }

    return <div>
        <h1>Cerca</h1>
        <input type="text" value={viewedQueryText} onChange={handleInputChange} placeholder="Inserisci il testo da cercare..." />
        {q != undefined && q.length > 0 &&
            <>
                <h2>Risultati per <i>"{q}"</i></h2>
                {generiLoaded && <>
                    <h3>Generi:</h3>
                    <PagedList itemsPerPage={5} apiCall={`/generi/esistenti?query=${q}`} schema={GenereDbSchema} scrollMode="horizontal" component={(element: GenereDb) => (
                        <CardGenere key={element.id} genere={element} size={"small"} />
                    )} />
                </>
                }
                <h3>Artisti:</h3>
                <IncludiRisultatiDeezer inclusi={artistiDeezer} onClick={() => setArtistiDeezer(true)} />
                {artistiDeezer === false &&
                    <PagedList key={"artisti-esistenti-" + q} itemsPerPage={5} apiCall={`/artisti/esistenti?query=${q}`} schema={ArtistaDbSchema} scrollMode="horizontal" component={(element: ArtistaDb) => (
                        <CardArtista key={element.id} artista={element} size="small" />
                    )} />
                }
                {artistiDeezer === true &&
                    <PagedList key={"artisti-search-" + q} itemsPerPage={5} apiCall={`/artisti/search?query=${q}`} schema={ArtistaDbSchema} scrollMode="horizontal" component={(element: ArtistaDb) => (
                        <CardArtista key={element.id} artista={element} size="small" />
                    )} />
                }
                <h3>Album:</h3>
                <IncludiRisultatiDeezer inclusi={albumDeezer} onClick={() => setAlbumDeezer(true)} />
                {albumDeezer === false &&
                    <PagedList key={"album-esistenti-" + q} itemsPerPage={5} apiCall={`/album/esistenti?query=${q}`} schema={AlbumDbSchema} scrollMode="horizontal" component={(element: AlbumDb) => (
                        <CardAlbum key={element.id} album={element} size={"small"}/>
                    )} />
                }
                {albumDeezer === true &&
                    <PagedList key={"album-search-" + q} itemsPerPage={5} apiCall={`/album/search?query=${q}`} schema={AlbumDbSchema} scrollMode="horizontal" component={(element: AlbumDb) => (
                        <CardAlbum key={element.id} album={element} size={"small"}/>
                    )} />
                }
                <h3>Brani:</h3>
                <IncludiRisultatiDeezer inclusi={braniDeezer} onClick={() => setBraniDeezer(true)} />
                {braniDeezer === false &&
                    <PagedList key={"brani-esistenti-" + q} itemsPerPage={5} apiCall={`/brani/esistenti?query=${q}`} schema={BranoDbSchema} scrollMode="horizontal" component={(element: BranoDb) => (
                        <CardBrano key={element.id} brano={element} size={"small"}/>
                    )} />
                }
                {braniDeezer === true &&
                    <PagedList key={"brani-search-" + q} itemsPerPage={5} apiCall={`/brani/search?query=${q}`} schema={BranoDbSchema} scrollMode="horizontal" component={(element: BranoDb) => (
                        <CardBrano key={element.id} brano={element} size={"small"}/>
                    )} />
                }
                <h3>Utenti:</h3>
                <PagedList key={"utenti-search-" + q} itemsPerPage={5} apiCall={`/utenti?query=${q}`} schema={UtenteDbSchema} scrollMode="horizontal" component={(element: UtenteDb) => (
                    <CardUtente key={element.id} utente={element} size="small"/>
                )} />
            </>
        }
    </div>;
}
export default Ricerca;