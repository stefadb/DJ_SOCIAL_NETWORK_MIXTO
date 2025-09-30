import { useNavigate } from "react-router-dom";
import type { GenereDb } from "../../types/db_types";
import { useEffect, useRef } from "react";
import Badge from "../Badge";
import { Music } from "react-feather";

function CardGenere(props: { genere: GenereDb, size: "small" | "large" }) {
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
        <>
            <div onClick={() => { navigate("/genere?id=" + props.genere.id); }} ref={containerRef} style={{ padding: props.size === "large" ? "24px" : "12px", cursor: "pointer", opacity: 0, transition: "opacity 0.5s", width: props.size === "large" ? "200px" : "100px" }}>
                <div style={{ position: "relative" }}>
                    <Badge scale={scale}>
                        <Music size={14 * scale} color={"#A238FF"} />
                    </Badge>
                    <img style={{ width: props.size === "large" ? "200px" : "100px", height: props.size === "large" ? "200px" : "100px", boxShadow: `0 0 ${props.size === "small" ? "5" : "10"}px rgba(0,0,0,0.5)` }} src={props.genere.url_immagine ? props.genere.url_immagine : "src/assets/genere_empty.jpg"} alt={"Immagine del genere musicale " + props.genere.nome} />
                </div>
                <h3 style={{ width: "100%", textAlign: "center", marginTop: props.size === "large" ? "16px" : "8px", marginBottom: props.size === "large" ? "16px" : "8px", fontSize: props.size === "large" ? "36px" : "18px" }}>{props.genere.nome}</h3>
            </div>

        </>
    );
}

export default CardGenere;