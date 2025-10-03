import { useEffect, useRef, useState } from "react";
import React from "react";
import CardArtista from "../components/cards/CardArtista";
import PagedList from "../components/PagedList";
import { AlbumDbSchema, ArtistaDbSchema, BranoDbSchema, GenereDbSchema, UtenteDbSchema, type AlbumDb, type ArtistaDb, type BranoDb, type GenereDb, type UtenteDb } from "../types/db_types";
import CardBrano from "../components/cards/CardBrano";
import CardAlbum from "../components/cards/CardAlbum";
import { useLocation, useNavigate } from "react-router-dom";
import IncludiRisultatiDeezer from "../components/buttons/IncludiRisultatiDeezer";
import api from "../api";
import CardGenere from "../components/cards/CardGenere";
import { Clock } from "react-feather";
import CardUtente from "../components/cards/CardUtente";

function Ricerca() {
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const q = query.get("q");
    const [viewedQueryText, setViewedQueryText] = useState<string>(q ? q : "");
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [artistiDeezer, setArtistiDeezer] = useState<boolean>(false);
    const [albumDeezer, setAlbumDeezer] = useState<boolean>(false);
    const [braniDeezer, setBraniDeezer] = useState<boolean>(false);
    const [generiLoaded, setGeneriLoaded] = useState<boolean>(false);
    const ultimeRicercheLength = 10;

    //console.log(JSON.parse(localStorage.getItem('ultimeRicerche') || '[]'));

    //Se ancora non esiste, crea un array di 10 elementi per le ultime ricerche
    useEffect(() => {
        const ultimeRicerche = JSON.parse(localStorage.getItem('ultimeRicerche') || '[]');
        if (!Array.isArray(ultimeRicerche) || ultimeRicerche.length !== ultimeRicercheLength) {
            localStorage.setItem('ultimeRicerche', JSON.stringify(Array(ultimeRicercheLength).fill("")));
        }
    }, []);

    //Fare debouncing: sentQueryText viene aggiornato solo se viewedQueryText non cambia da almeno 500ms
    const debounceTimeout = useRef<number | undefined>(undefined);
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setShowDropdown(false);
        const newValue = e.target.value;
        setViewedQueryText(newValue);
        // Resetta il timeout di debounce
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            navigate(`/ricerca?q=${newValue}`);
            if (newValue !== "") {
                aggiungiRicercaACronologia(newValue);
            }
        }, 500);
    }

    function aggiungiRicercaACronologia(newValue: string) {
        const ultimeRicerche = JSON.parse(localStorage.getItem('ultimeRicerche') || '[]');
        if (!ultimeRicerche.includes(newValue)) {
            for (let i = ultimeRicerche.length - 1; i > 0; i--) {
                ultimeRicerche[i] = ultimeRicerche[i - 1];
            }
            ultimeRicerche[0] = newValue;
            localStorage.setItem('ultimeRicerche', JSON.stringify(ultimeRicerche));
        }
    }

    function handleInputClick() {
        setShowDropdown(true);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

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

    return (
        <div>
            <div className="text-center"><h1>Cerca</h1></div>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={viewedQueryText}
                    className="w-full border-b border-black text-center outline-none box-border text-[16px] p-2"
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    placeholder="Scrivi qui quello che stai cercando..."
                />
                {showDropdown && (
                    <div className={"dropdown-ricerca"}>
                        {/* Qui puoi aggiungere il contenuto della tendina */}
                        {JSON.parse(localStorage.getItem('ultimeRicerche') || '[]').length === 0 &&
                            <div className="p-1"><i>Qui compariranno tutte le ricerche recenti</i></div>
                        }
                        {JSON.parse(localStorage.getItem('ultimeRicerche') || '[]').map((item: string, index: number) => {
                            if (item === "") {
                                return null;
                            } else {
                                return <div key={index} className="flex cursor-pointer" onMouseDown={(event) => { event.stopPropagation(); navigate(`/ricerca?q=${item}`); setShowDropdown(false); setViewedQueryText(item); }}>
                                    <div className="p-1"><Clock size={14} /></div>
                                    <div className="p-1">{item}</div>
                                </div>;
                            }
                        })}
                    </div>
                )}
            </div>
            {q != undefined && q.length > 0 && (
                <>
                    <h2>Risultati per <i>"{q}"</i></h2>
                    {generiLoaded && (
                        <>
                            <h3>Generi:</h3>
                            <PagedList key={q} itemsPerPage={10} apiCall={`/generi/esistenti?query=${q}`} schema={GenereDbSchema} scrollMode="horizontal" component={(element: GenereDb) => (
                                <CardGenere key={element.id} genere={element} size={"small"} />
                            )} 
                            emptyMessage={`😮 Non ho trovato nessun genere che si chiama '${q}'`}
                            />
                        </>
                    )}
                    <h3>Artisti:</h3>
                    <IncludiRisultatiDeezer inclusi={artistiDeezer} onClick={() => setArtistiDeezer(true)} />
                    {artistiDeezer &&
                        <PagedList key={"artisti-search-" + q} itemsPerPage={10} apiCall={`/artisti/search?query=${q}`} schema={ArtistaDbSchema} scrollMode="horizontal" component={(element: ArtistaDb) => (
                            <CardArtista key={element.id} artista={element} size="small" />
                        )}
                        emptyMessage={`😮 Non ho trovato nessun artista che si chiama '${q}', ${!artistiDeezer?"prova a cercarlo anche da Deezer!": "neanche su Deezer!"}`}
                        />
                    }
                    {!artistiDeezer &&
                        <PagedList key={"artisti-esistenti-" + q} itemsPerPage={10} apiCall={`/artisti/esistenti?query=${q}`} schema={ArtistaDbSchema} scrollMode="horizontal" component={(element: ArtistaDb) => (
                            <CardArtista key={element.id} artista={element} size="small" />
                        )} 
                        emptyMessage={`😮 Non ho trovato nessun artista che si chiama '${q}', ${!artistiDeezer?"prova a cercarlo anche da Deezer!": "neanche su Deezer!"}`}
                        />
                    }
                    <h3>Album:</h3>
                    <IncludiRisultatiDeezer inclusi={albumDeezer} onClick={() => setAlbumDeezer(true)} />
                    {albumDeezer &&
                        <PagedList key={"album-search-" + q} itemsPerPage={10} apiCall={`/album/search?query=${q}`} schema={AlbumDbSchema} scrollMode="horizontal" component={(element: AlbumDb) => (
                            <CardAlbum key={element.id} album={element} size="small" />
                        )} 
                        emptyMessage={`😮 Non ho trovato nessun album che si chiama '${q}', ${!albumDeezer?"prova a cercarlo anche da Deezer!": "neanche su Deezer!"}`}
                        />
                    }
                    {!albumDeezer &&
                        <PagedList key={"album-esistenti-" + q} itemsPerPage={10} apiCall={`/album/esistenti?query=${q}`} schema={AlbumDbSchema} scrollMode="horizontal" component={(element: AlbumDb) => (
                            <CardAlbum key={element.id} album={element} size="small" />
                        )}
                        emptyMessage={`😮 Non ho trovato nessun album che si chiama '${q}', ${!albumDeezer?"prova a cercarlo anche da Deezer!": "neanche su Deezer!"}`}
                        />
                    }
                    <h3>Brani:</h3>
                    <IncludiRisultatiDeezer inclusi={braniDeezer} onClick={() => setBraniDeezer(true)} />
                    {braniDeezer &&
                        <PagedList key={"brani-search-" + q} itemsPerPage={10} apiCall={`/brani/search?query=${q}`} schema={BranoDbSchema} scrollMode="horizontal" component={(element: BranoDb) => (
                            <CardBrano key={element.id} brano={element} size="small" />
                        )}
                        emptyMessage={`😮 Non ho trovato nessun brano che si chiama '${q}', ${!braniDeezer?"prova a cercarlo anche da Deezer!": "neanche su Deezer!"}`}
                        />
                    }
                    {!braniDeezer &&
                        <PagedList key={"brani-esistenti-" + q} itemsPerPage={10} apiCall={`/brani/esistenti?query=${q}`} schema={BranoDbSchema} scrollMode="horizontal" component={(element: BranoDb) => (
                            <CardBrano key={element.id} brano={element} size="small" />
                        )}
                        emptyMessage={`😮 Non ho trovato nessun brano che si chiama '${q}', ${!braniDeezer?"prova a cercarlo anche da Deezer!": "neanche su Deezer!"}`}
                        />
                    }
                    <h3>Utenti:</h3>
                    <PagedList key={"utenti-esistenti-" + q} itemsPerPage={10} apiCall={`/utenti?query=${q}`} scrollMode="horizontal" schema={UtenteDbSchema} component={(element: UtenteDb) => (
                        <CardUtente key={element.id} utente={element} size="small" />
                    )}
                    emptyMessage={`😮 Non ho trovato nessun utente che si chiama '${q}'.`}
                    />
                </>
            )}
        </div>
    );
}
export default Ricerca;