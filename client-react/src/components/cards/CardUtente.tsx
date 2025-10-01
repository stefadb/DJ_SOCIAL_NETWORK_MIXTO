import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { UtenteDb } from "../../types/db_types";
import Badge from "../Badge";
import { User } from "react-feather";
function CardUtente(props: { utente: UtenteDb, size: "small" | "large" }) {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        setOpacityTo1();
    }, []);

    const scales = {
        small: 1,
        large: 2
    };

    const scale = scales[props.size] || 1;

    function setOpacityTo1() {
        if (containerRef.current) {
            void containerRef.current.offsetWidth;
            containerRef.current.style.opacity = "1";
        } else {
            setTimeout(setOpacityTo1, 10);
        }
    }
    return (
        <div ref={containerRef} onClick={() => { navigate("/utente?id=" + props.utente.id); }} style={{ padding: 12 * scale, cursor: "pointer", opacity: 0, transition: "opacity 0.5s", width: 100 * scale }}>
            <div style={{ position: "relative" }}>
                <Badge scale={scale}>
                    <User size={14 * scale} />
                </Badge>
                <img style={{ width: 100 * scale, height: 100 * scale, borderRadius: "50%", boxShadow: `0 0 ${5 * scale}px rgba(0,0,0,0.5)` }} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo di " + props.utente.nome + " " + props.utente.cognome} />
            </div>
            <h3 style={{ width: "100%", textAlign: "center", marginTop: 8 * scale, marginBottom: 8 * scale, fontSize: 18 * scale }}>{props.utente.nome + " " + props.utente.cognome}</h3>
            <h4 style={{ width: "100%", textAlign: "center", marginTop: 7 * scale, marginBottom: 7 * scale, fontSize: 12 * scale }}>@{props.utente.username}</h4>
        </div>
    );
}

export default CardUtente;