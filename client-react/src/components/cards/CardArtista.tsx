import { useNavigate } from "react-router-dom";
import type { ArtistaDb } from "../../types/db_types";
import { useEffect, useRef } from "react";
import Badge from "../Badge";
import { User } from "react-feather";
import {artistaEmptyPictureUrl, deezerColor, scaleTwProps} from "../../functions/functions";

function CardArtista(props: { artista: ArtistaDb, size: "small" | "large" }) {
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
        <div ref={containerRef} onClick={() => { navigate("/artista?id=" + props.artista.id); }} style={scaleTwProps("p-3 cursor-pointer opacity-0 transition-opacity duration-500 w-[100px]",scale)}>
            <div className="relative">
                <Badge scale={scale}>
                    <User size={14 * scale} color={deezerColor()} />
                </Badge>
                <img  style={scaleTwProps("w-[100px] h-[100px] rounded-full shadow-md"/*no-custom*/,scale)} src={props.artista.url_immagine ? props.artista.url_immagine : artistaEmptyPictureUrl()} alt={"Immagine di profilo di " + props.artista.nome} />
            </div>
            <h3 style={scaleTwProps("w-full text-center mt-2 mb-2 text-base",scale)}>{props.artista.nome}</h3>
        </div>
    );
}

export default CardArtista;