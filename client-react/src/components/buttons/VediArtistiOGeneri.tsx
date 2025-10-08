import { Music, Users } from "react-feather";
import { deezerColor, scaleTwProps } from "../../functions/functions";
import { useSearchParams } from "react-router-dom";

function VediArtistiOGeneri(props: { entity: "artista" | "genere", id: number, scale: number }) {
    const setSearchParams = useSearchParams()[1];
    function openModal() {
        setSearchParams((prev) => {
            prev.set("modal", props.entity == "genere" ? "generiAlbum" : "artistiBrano");
            prev.set("idInModal", String(props.id));
            return prev;
        });
    }

    return <button onClick={openModal} style={scaleTwProps("rounded p-2 text-base", props.scale)} className="card-button">
        {props.entity === "artista" &&
            <Users size={16 * props.scale} color={deezerColor()} />
        }
        {props.entity === "genere" &&
            <Music size={16 * props.scale} color={deezerColor()} />
        }
        {props.entity === "artista" ? "  Vedi artisti" : "  Vedi generi"}
    </button >
}

export default VediArtistiOGeneri;