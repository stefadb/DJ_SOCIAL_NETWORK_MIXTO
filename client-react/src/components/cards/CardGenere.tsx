import { useNavigate } from "react-router-dom";
import type { GenereDb } from "../../types/db_types";
import { useEffect, useRef } from "react";
import Badge from "../Badge";
import { Music } from "react-feather";
import { blackBoxShadow, largePadding } from "../../functions/functions";

function CardGenere(props: { genere: GenereDb, size: "small" | "large" }) {
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
        <>
            <div onClick={() => { navigate("/genere?id=" + props.genere.id); }} ref={containerRef} style={{ padding: largePadding(scale), cursor: "pointer", opacity: 0, transition: "opacity 0.5s", width: 100 * scale }}>
                <div style={{ position: "relative" }}>
                    <Badge scale={scale}>
                        <Music size={14 * scale} color={"#A238FF"} />
                    </Badge>
                    <img style={{ width: 100 * scale, height: 100 * scale, boxShadow: blackBoxShadow(scale) }} src={props.genere.url_immagine ? props.genere.url_immagine : "src/assets/genere_empty.jpg"} alt={"Immagine del genere musicale " + props.genere.nome} />
                </div>
                <h3 style={{ width: "100%", textAlign: "center", marginTop: 8 * scale, marginBottom: 8 * scale, fontSize: 18 * scale }}>{props.genere.nome}</h3>
            </div>

        </>
    );
}

export default CardGenere;