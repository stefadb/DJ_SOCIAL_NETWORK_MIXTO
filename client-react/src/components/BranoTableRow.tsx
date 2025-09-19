import { useEffect, useState } from "react";
import type { ArtistaDb, BranoDb } from "../types/db_types";
import { getNomiArtistiBrano } from "../functions/functions";

function BranoTableRow(props: {element: { numero_passaggi: number; id_brano_1: number; brano_1_array: BranoDb[] } | { numero_passaggi: number; id_brano_2: number; brano_2_array: BranoDb[] }}) {
    const [artistiBrano, setArtistiBrano] = useState<ArtistaDb[] | null>(null);
    
    async function loadArtistiPassaggi() {
        const nomi = await getNomiArtistiBrano("id_brano_2" in props.element ? props.element.id_brano_2 : props.element.id_brano_1);
        setArtistiBrano(nomi);
    }

    useEffect(() => {
        loadArtistiPassaggi();
    }, []);

    return <tr>
        <td>{props.element.numero_passaggi}</td>
        <td>{"brano_1_array" in props.element ? props.element.brano_1_array[0].titolo : props.element.brano_2_array[0].titolo}</td>
        <td>{"brano_1_array" in props.element ? props.element.brano_1_array[0].durata : props.element.brano_2_array[0].durata}</td>
        <td>
            {artistiBrano
                ? artistiBrano.map((artista) => artista.nome).join(", ")
                : "Caricamento..."}
        </td>
    </tr>
}
export default BranoTableRow;