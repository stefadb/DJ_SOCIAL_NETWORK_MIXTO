import { useNavigate } from "react-router-dom";
import type { ArtistaDb } from "../../types/db_types";
import { useEffect, useRef } from "react";
import Badge from "../Badge";
import { Music, User } from "react-feather";

function CardArtista(props: { artista: ArtistaDb, size: "small" | "large" }) {
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
        <div ref={containerRef} onClick={() => { navigate("/artista?id=" + props.artista.id); }} style={{ padding: props.size === "large" ? "24px" : "12px", cursor: "pointer", opacity: 0, transition: "opacity 0.5s", width: props.size === "large" ? "200px" : "100px" }}>
            <div style={{ position: "relative" }}>
                <Badge scale={scale}>
                    <User size={14 * scale} color={"#A238FF"} />
                </Badge>
                <img style={{ width: props.size === "large" ? "200px" : "100px", height: props.size === "large" ? "200px" : "100px", borderRadius: "50%", boxShadow: `0 0 ${props.size === "small" ? "5" : "10"}px rgba(0,0,0,0.5)` }} src={props.artista.url_immagine ? props.artista.url_immagine : "src/assets/artista_empty.jpg"} alt={"Immagine di profilo di " + props.artista.nome} />
            </div>
            <h3 style={{ width: "100%", textAlign: "center", marginTop: props.size === "large" ? "16px" : "8px", marginBottom: props.size === "large" ? "16px" : "8px", fontSize: props.size === "large" ? "36px" : "18px" }}>{props.artista.nome}</h3>
        </div>
    );
}

export default CardArtista;