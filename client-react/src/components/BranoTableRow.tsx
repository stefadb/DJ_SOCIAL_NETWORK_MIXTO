import type { BranoDb } from "../types/db_types";
import { useNavigate } from "react-router-dom";
import VediArtistiOGeneri from "./buttons/VediArtistiOGeneri";

function BranoTableRow(props: { element: { numero_passaggi: number; id_brano_1: number; brano_1_array: BranoDb[] } | { numero_passaggi: number; id_brano_2: number; brano_2_array: BranoDb[] } }) {
    const navigate = useNavigate();

    function navigateToBrano() {
        navigate("/brano?id=" + ("id_brano_1" in props.element ? props.element.id_brano_1 : props.element.id_brano_2));
    }

    return <div className="classifica-row">
    <div className="classifica-cell cursor-pointer" onClick={navigateToBrano}><div className="classifica-cell-inside">{props.element.numero_passaggi}</div></div>
    <div className="classifica-cell cursor-pointer" onClick={navigateToBrano}><div className="classifica-cell-inside">{"brano_1_array" in props.element ? props.element.brano_1_array[0].titolo : props.element.brano_2_array[0].titolo}</div></div>
    <div className="classifica-cell cursor-pointer" onClick={navigateToBrano}><div className="classifica-cell-inside">{"brano_1_array" in props.element ? props.element.brano_1_array[0].durata.substring(0,8) : props.element.brano_2_array[0].durata.substring(0,8)}</div></div>
        <div className="classifica-cell">
            <VediArtistiOGeneri entity="artista" id={"id_brano_1" in props.element ? props.element.id_brano_1 : props.element.id_brano_2} scale={1} />
        </div>
    </div>
}
export default BranoTableRow;