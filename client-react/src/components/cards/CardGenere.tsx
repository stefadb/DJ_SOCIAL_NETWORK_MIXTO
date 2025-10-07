import { useNavigate } from "react-router-dom";
import type { GenereDb } from "../../types/db_types";
import { useEffect, useRef } from "react";
import Badge from "../Badge";
import { Music } from "react-feather";
import { deezerColor, scaleTwProps} from "../../functions/functions";

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
            <div onClick={() => { navigate("/genere?id=" + props.genere.id); }} ref={containerRef} style={scaleTwProps("p-3 cursor-pointer opacity-0 transition-opacity duration-500 w-[100px]",scale)}>
                <div className="relative">
                    <Badge scale={scale}>
                        <Music size={14 * scale} color={deezerColor()} />
                    </Badge>
                    <img style={scaleTwProps("w-[100px] h-[100px] shadow-md"/*no custom*/,scale)} src={props.genere.url_immagine ? props.genere.url_immagine : "src/assets/genere_empty.jpg"} alt={"Immagine del genere musicale " + props.genere.nome} />
                </div>
                <h3 style={scaleTwProps("w-full text-center mt-2 mb-2 text-base",scale)}>{props.genere.nome}</h3>
            </div>

        </>
    );
}

export default CardGenere;