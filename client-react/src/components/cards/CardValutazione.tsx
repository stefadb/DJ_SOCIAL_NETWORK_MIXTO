import type { ValutazioneEUtente } from "../../types/types";
import Stelle from "../Stelle";

function CardValutazione(props: { valutazione: ValutazioneEUtente}) {
    const valutazione = props.valutazione;
    return (
        <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <strong>{valutazione.utente_array[0] !== undefined && valutazione.utente_array.length == 1 ? `${valutazione.utente_array[0].nome} ${valutazione.utente_array[0].cognome}` : "Utente sconosciuto"}</strong>
                <span style={{ marginLeft: 8 }}><Stelle rating={valutazione.voto} bgColor="white"/></span>
            </div>
        </div>
    );
}

export default CardValutazione;