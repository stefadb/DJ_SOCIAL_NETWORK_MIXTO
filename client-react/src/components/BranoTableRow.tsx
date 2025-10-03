import { useEffect, useState } from "react";
import type { ArtistaDb, BranoDb } from "../types/db_types";
import { getNomiArtistiBrano } from "../functions/functions";
import ListaArtistiOGeneri from "./ListaArtistiOGeneri";
import { useNavigate } from "react-router-dom";

function BranoTableRow(props: { element: { numero_passaggi: number; id_brano_1: number; brano_1_array: BranoDb[] } | { numero_passaggi: number; id_brano_2: number; brano_2_array: BranoDb[] } }) {
    const [artistiBrano, setArtistiBrano] = useState<ArtistaDb[] | null>(null);
    const navigate = useNavigate();

    async function loadArtistiPassaggi() {
        const nomi = await getNomiArtistiBrano("id_brano_2" in props.element ? props.element.id_brano_2 : props.element.id_brano_1);
        setArtistiBrano(nomi);
    }

    useEffect(() => {
        loadArtistiPassaggi();
    }, []);

    function navigateToBrano() {
        navigate("/brano?id=" + ("id_brano_1" in props.element ? props.element.id_brano_1 : props.element.id_brano_2));
    }

    return <div className="classifica-row">
    <div className="classifica-cell cursor-pointer" onClick={navigateToBrano}><div className="classifica-cell-inside">{props.element.numero_passaggi}</div></div>
    <div className="classifica-cell cursor-pointer" onClick={navigateToBrano}><div className="classifica-cell-inside">{"brano_1_array" in props.element ? props.element.brano_1_array[0].titolo : props.element.brano_2_array[0].titolo}</div></div>
    <div className="classifica-cell cursor-pointer" onClick={navigateToBrano}><div className="classifica-cell-inside">{"brano_1_array" in props.element ? props.element.brano_1_array[0].durata : props.element.brano_2_array[0].durata}</div></div>
        <div className="classifica-cell">
            {artistiBrano &&
                <ListaArtistiOGeneri key={artistiBrano.map(artista => artista.id).join(",")} lines={2} list={artistiBrano} entity={"artista"} scale={1}/>
            }
            {!artistiBrano &&
                <ListaArtistiOGeneri lines={2} list={[{ id: 0, nome: "Caricamento...", url_immagine: "" }]} noClick={true} entity={"artista"} scale={1}/>
            }
        </div>
    </div>
}
export default BranoTableRow;