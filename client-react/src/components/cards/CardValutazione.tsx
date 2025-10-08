import { useNavigate } from "react-router-dom";
import type { ValutazioneEUtente } from "../../types/types";
import Stelle from "../Stelle";
import { artistaEmptyPictureUrl } from "../../functions/functions";

function CardValutazione(props: { valutazione: ValutazioneEUtente }) {
    const navigate = useNavigate();
    const valutazione = props.valutazione;
    return (
        <div className="flex flex-row items-center p-2">
            <div className={"pr-2 " + (valutazione.utente_array[0] !== undefined ? "cursor-pointer" : "")} onClick={valutazione.utente_array[0] !== undefined ? () => { navigate(`/utente?id=${valutazione.utente_array[0].id}`) } : undefined}>
                <img  className="rounded-full shadow-md w-12 h-12"/*no-custom*/ src={artistaEmptyPictureUrl()} alt={"Immagine di profilo"} />
            </div>
            <div className={"flex-grow flex flex-col"}>
                <b className={(valutazione.utente_array[0] !== undefined ? "cursor-pointer" : "")} onClick={valutazione.utente_array[0] !== undefined ? () => { navigate(`/utente?id=${valutazione.utente_array[0].id}`) } : undefined}>{valutazione.utente_array[0] !== undefined && valutazione.utente_array.length == 1 ? `${valutazione.utente_array[0].nome} ${valutazione.utente_array[0].cognome}` : "Utente sconosciuto"}</b>
                <span><Stelle rating={valutazione.voto} bgColor="white" /></span>
            </div>
        </div>
    );
}

export default CardValutazione;