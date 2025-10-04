import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { UtenteDb } from "../../types/db_types";
import Badge from "../Badge";
import { User } from "react-feather";
import {  scaleTwProps} from "../../functions/functions";
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
        <div ref={containerRef} onClick={() => { navigate("/utente?id=" + props.utente.id); }} style={scaleTwProps("p-3 cursor-pointer opacity-0 transition-opacity duration-500 w-[100px]",scale)}>
            <div className="relative">
                <Badge scale={scale}>
                    <User size={14 * scale} />
                </Badge>
                <img style={scaleTwProps("w-[100px] h-[100px] rounded-full shadow-md",scale)} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo di " + props.utente.nome + " " + props.utente.cognome} />
            </div>
            <h3 style={scaleTwProps("w-full text-center mt-2 mb-2 text-lg",scale)}>{props.utente.nome + " " + props.utente.cognome}</h3>
            <h4 style={scaleTwProps("w-full text-xs my-2 text-center",scale)}>@{props.utente.username}</h4>
        </div>
    );
}

export default CardUtente;