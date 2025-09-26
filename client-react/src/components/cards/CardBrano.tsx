import { useEffect, useState } from "react";
import { AlbumDbSchema, type AlbumDb, type ArtistaDb, type BranoDb } from "../../types/db_types";
import { getNomiArtistiBrano } from "../../functions/functions";
import { useNavigate } from "react-router-dom";
import SalvaBranoPreferito from "../SalvaBranoPreferito";
import PosizionaBrano from "../PosizionaBrano";
import api from "../../api";

function CardBrano(props: { brano: BranoDb, noDeckButtons?: boolean }) {
    const [artisti, setArtisti] = useState<ArtistaDb[] | null>(null);
    const [album, setAlbum] = useState<AlbumDb | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadArtisti();
        loadAlbum();
    }, []);

    useEffect(() => {
        loadArtisti();
        loadAlbum();
    }, [props.brano]);


    async function loadArtisti() {
        setArtisti(await getNomiArtistiBrano(props.brano.id));
    }

    async function loadAlbum() {
        try{
            const response = await api.get(`/album/esistenti/${props.brano.id_album}`);
            AlbumDbSchema.parse(response.data);
            setAlbum(response.data as AlbumDb);
        }catch(error){
            console.error("Errore nel recupero dell'album:", error);
        }
    }
    return (
        <div style={{ border: "1px solid black", borderRadius: "8px", padding: "10px", margin: "10px", cursor: "pointer" }}>
            <div onClick={() => { navigate("/brano?id=" + props.brano.id); }}>
                <img style={{ width: "100px", height: "100px" }} src={album && album.url_immagine ? album.url_immagine : "src/assets/album_empty.jpg"} alt={"Cover del brano " + props.brano.titolo} />
                <h3>{props.brano.titolo}</h3>
                <p>Durata: {props.brano.durata} secondi</p>
                <p>Artisti: {artisti ? artisti.map(artista => artista.nome).join(", ") : "Caricamento..."}</p>
            </div>
            <SalvaBranoPreferito idBrano={props.brano.id} />
            {props.noDeckButtons !== true && <>
                <PosizionaBrano deck={1} brano={props.brano} />
                <PosizionaBrano deck={2} brano={props.brano} />
            </>}
        </div >
    );
}

export default CardBrano;
