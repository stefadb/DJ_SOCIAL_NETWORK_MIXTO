import type { ValutazioneEUtente } from "../../types/types";
import Stelle from "../Stelle";

function CardValutazione(props: { valutazione: ValutazioneEUtente}) {
    const valutazione = props.valutazione;
    return (
        <div className="border border-[#ccc] rounded-lg p-3 mb-4">
            <div className="flex items-center mb-2">
                <strong>{valutazione.utente_array[0] !== undefined && valutazione.utente_array.length == 1 ? `${valutazione.utente_array[0].nome} ${valutazione.utente_array[0].cognome}` : "Utente sconosciuto"}</strong>
                <span className="ml-2"><Stelle rating={valutazione.voto} bgColor="white"/></span>
            </div>
        </div>
    );
}

export default CardValutazione;