import { useEffect, useState } from "react";
import type { ArtistaDb, BranoDb } from "../../types/db_types";
import { getNomiArtistiBrano } from "../../functions/functions";
import { useNavigate } from "react-router-dom";

function CardBrano(props: { brano: BranoDb }) {
    const [artisti, setArtisti] = useState<ArtistaDb[] | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadArtisti();
    }, []);

    useEffect(() => {
        loadArtisti();
    }, [props.brano]);


    async function loadArtisti() {
        setArtisti(await getNomiArtistiBrano(props.brano.id));
    }
    return (
        <div onClick={() => {navigate("/brano?id=" + props.brano.id);}} style={{ border: "1px solid black", borderRadius: "8px", padding: "10px", margin: "10px", cursor: "pointer" }}>
            <img style={{ width: "100px", height: "100px" }} src={"http://localhost:3000/album_pictures/" + props.brano.id_album + ".jpg"} alt={"Cover del brano " + props.brano.titolo} />
            <h3>{props.brano.titolo}</h3>
            <p>Durata: {props.brano.durata} secondi</p>
            <p>Artisti: {artisti ? artisti.map(artista => artista.nome).join(", ") : "Caricamento..."}</p>
        </div>
    );
}

export default CardBrano;
