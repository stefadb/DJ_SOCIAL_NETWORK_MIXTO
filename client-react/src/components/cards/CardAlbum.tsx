import { use, useEffect, useState } from "react";
import type { AlbumDb, ArtistaDb} from "../../types/db_types";
import { getNomiArtistiAlbum} from "../../functions/functions";
import { useNavigate } from "react-router-dom";

function CardAlbum(props: { album: AlbumDb }) {
    const [artisti, setArtisti] = useState<ArtistaDb[] | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadArtisti();
    }, []);

    useEffect(() => {
        loadArtisti();
    }, [props.album]);


    async function loadArtisti() {
        setArtisti(await getNomiArtistiAlbum(undefined,props.album.id));
    }
    return (
        <div onClick={() => {navigate("/album?id=" + props.album.id);}} style={{ border: "1px solid black", borderRadius: "8px", padding: "10px", margin: "10px", cursor: "pointer" }}>
            <img style={{ width: "100px", height: "100px" }} src={props.album.url_immagine ? props.album.url_immagine : "src/assets/album_empty.jpg"} alt={"Cover album " + props.album.titolo} />
            <h3>{props.album.titolo}</h3>
            <p>Data di uscita: {props.album.data_uscita ? props.album.data_uscita : "Sconosciuta"}</p>
            <p>Artisti: {artisti ? artisti.map(artista => artista.nome).join(", ") : "Caricamento..."}</p>
        </div>
    );
}

export default CardAlbum;