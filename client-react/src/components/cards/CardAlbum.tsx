import { useEffect, useState } from "react";
import type { AlbumDb, ArtistaDb} from "../../types/db_types";
import { getNomiArtistiAlbum} from "../../functions/functions";

function CardAlbum(props: { album: AlbumDb }) {
    const [artisti, setArtisti] = useState<ArtistaDb[] | null>(null);

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
        <div>
            <img style={{ width: "100px", height: "100px" }} src={"http://localhost:3000/album_pictures/" + props.album.id + ".jpg"} alt={"Cover album " + props.album.titolo} />
            <h3>{props.album.titolo}</h3>
            <p>Data di uscita: {props.album.data_uscita ? props.album.data_uscita : "Sconosciuta"}</p>
            <p>Artisti: {artisti ? artisti.map(artista => artista.nome).join(", ") : "Caricamento..."}</p>
        </div>
    );
}

export default CardAlbum;