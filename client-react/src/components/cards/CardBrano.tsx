import { useEffect, useState } from "react";
import { AlbumDbSchema, type AlbumDb, type BranoDb } from "../../types/db_types";
import { deezerColor, defaultAlbumPicture, scaleTwProps } from "../../functions/functions";
import { useNavigate } from "react-router-dom";
import SalvaBranoPreferito from "../buttons/SalvaBranoPreferito";
import PosizionaBrano from "../buttons/PosizionaBrano";
import api from "../../api";
import DynamicText from "../DynamicText";
import MezzoDisco from "../MezzoDisco";
import { Clock, Disc } from "react-feather";
import AscoltaSuDeezer from "../buttons/AscoltaSuDeezer";
import Badge from "../Badge";
import VediAlbum from "../buttons/VediAlbum";
import VediArtistiOGeneri from "../buttons/VediArtistiOGeneri";

function CardBrano(props: { brano: BranoDb, noDeckButtons?: boolean, noButtons?: boolean, scale: number, insideModal?: boolean }) {
    const [album, setAlbum] = useState<AlbumDb | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadAlbum();
    }, []);

    const scale = props.scale;


    useEffect(() => {
        loadAlbum();
    }, [props.brano]);

    async function loadAlbum() {
        try {
            const response = await api.get(`/album/esistenti/${props.brano.id_album}`);
            AlbumDbSchema.parse(response.data);
            setAlbum(response.data as AlbumDb);
        } catch (error) {
            //Qui non c'è nessun errore da gestire
            console.error("Errore nel recupero dell'album:", error);
        }
    }
    return (
        <div style={scaleTwProps("p-3", scale)}>
            {/* In scale = 1, questa card è larga esattamente 198px*/}
            <div className="shadow-md-custom" style={scaleTwProps("p-3 w-[150px] rounded-lg", scale)}>
                <div>
                    <div onClick={() => navigate(`/brano?id=${props.brano.id}`)} className="flex flex-row cursor-pointer">
                        <div className="relative">
                            <Badge scale={scale}>
                                <Disc size={14 * scale} color={deezerColor()} />
                            </Badge>
                            <img onError={defaultAlbumPicture} style={scaleTwProps("w-[100px] h-[100px] shadow-md"/*no custom*/, scale)} src={album && album.url_immagine ? album.url_immagine : "src/assets/album_empty.jpg"} alt={"Cover del brano " + props.brano.titolo} />
                        </div>
                        <MezzoDisco radius={50 * scale} />
                    </div>
                    <div style={scaleTwProps("pt-1 pb-2 cursor-pointer", scale)} onClick={() => navigate(`/brano?id=${props.brano.id}`)}>
                        <DynamicText text={props.brano.titolo} width={150 * scale} scale={scale} />
                    </div>
                    <div style={scaleTwProps("flex flex-row items-center pt-1 pb-2", scale)}>
                        <div style={scaleTwProps("pr-2", scale)}>
                            <Clock size={16 * scale} />
                        </div>
                        <div style={scaleTwProps("pr-2 text-base", scale)}>
                            {props.brano.durata.substring(0, 8)}
                        </div>
                    </div>
                    {props.insideModal !== true &&
                        <div style={scaleTwProps("flex flex-row items-center pt-px pb-2", scale)}>
                            <VediArtistiOGeneri entity="artista" id={props.brano.id} scale={scale} />
                        </div>
                    }
                </div>
                {props.noButtons !== true &&
                    <div className="flex items-start flex-wrap">
                        {props.noDeckButtons !== true && <>
                            <PosizionaBrano deck={1} brano={props.brano} scale={scale} />
                            <PosizionaBrano deck={2} brano={props.brano} scale={scale} />
                        </>}
                        <SalvaBranoPreferito idBrano={props.brano.id} scale={scale} />
                        <VediAlbum idAlbum={props.brano.id_album} scale={scale} />
                        <AscoltaSuDeezer id={props.brano.id} entity={"track"} scale={scale} />
                    </div>
                }
            </div>
        </div>
    );
}

export default CardBrano;
