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
        large: 1.5
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
        <div ref={containerRef} onClick={() => { navigate("/utente?id=" + props.utente.id); }} style={{ padding: props.size === "large" ? "24px" : "12px", cursor: "pointer", opacity: 0, transition: "opacity 0.5s", width: props.size === "large" ? "200px" : "100px" }}>
            <div style={{ position: "relative" }}>
                <Badge scale={scale}>
                    <User size={14 * scale} />
                </Badge>
                <img style={{ width: props.size === "large" ? "200px" : "100px", height: props.size === "large" ? "200px" : "100px", borderRadius: "50%", boxShadow: `0 0 ${props.size === "small" ? "5" : "10"}px rgba(0,0,0,0.5)` }} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo di " + props.utente.nome + " " + props.utente.cognome} />
            </div>
            <h3 style={{ width: "100%", textAlign: "center", marginTop: props.size === "large" ? "16px" : "8px", marginBottom: props.size === "large" ? "16px" : "8px", fontSize: props.size === "large" ? "36px" : "18px" }}>{props.utente.nome + " " + props.utente.cognome}</h3>
            <h4 style={{ width: "100%", textAlign: "center", marginTop: props.size === "large" ? "14px" : "7px", marginBottom: props.size === "large" ? "14px" : "7px", fontSize: props.size === "large" ? "24px" : "12px" }}>@{props.utente.username}</h4>
        </div>
    );
}

export default CardUtente;