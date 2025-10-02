import { useEffect, useMemo, useState } from "react";
import { AlbumDbSchema, type AlbumDb, type ArtistaDb, type BranoDb } from "../../types/db_types";
import { blackBoxShadow, getNomiArtistiBrano, grayBoxShadow, largePadding } from "../../functions/functions";
import { useNavigate } from "react-router-dom";
import SalvaBranoPreferito from "../buttons/SalvaBranoPreferito";
import PosizionaBrano from "../buttons/PosizionaBrano";
import api from "../../api";
import DynamicText from "../DynamicText";
import MezzoDisco from "../MezzoDisco";
import { Clock, Disc, Users } from "react-feather";
import ListaArtistiOGeneri from "../ListaArtistiOGeneri";
import AscoltaSuDeezer from "../buttons/AscoltaSuDeezer";
import Badge from "../Badge";
import VediAlbum from "../buttons/VediAlbum";

function CardBrano(props: { brano: BranoDb, noDeckButtons?: boolean, noButtons?: boolean, size: "tiny" | "small" | "large" }) {
    const [artisti, setArtisti] = useState<ArtistaDb[] | null>(null);
    const [album, setAlbum] = useState<AlbumDb | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadArtisti();
        loadAlbum();
    }, []);

    const scales = {
        tiny: 0.75,
        small: 1,
        large: 1.5
    };

    const scale = scales[props.size] || 1;

    const stableMezzoDisco = useMemo(() => <MezzoDisco radius={scale * 50} />, []);

    useEffect(() => {
        loadArtisti();
        loadAlbum();
    }, [props.brano]);


    async function loadArtisti() {
        setArtisti(await getNomiArtistiBrano(props.brano.id));
    }

    async function loadAlbum() {
        try {
            const response = await api.get(`/album/esistenti/${props.brano.id_album}`);
            AlbumDbSchema.parse(response.data);
            setAlbum(response.data as AlbumDb);
        } catch (error) {
            console.error("Errore nel recupero dell'album:", error);
        }
    }
    return (
        <div style={{ padding: largePadding(scale) }}>
            <div style={{ padding: largePadding(scale), width: 150 * scale, borderRadius: 8 * scale, boxShadow: grayBoxShadow(scale) }}>
                <div>
                    <div onClick={() => navigate(`/brano?id=${props.brano.id}`)} style={{ display: "flex", flexDirection: "row", cursor: "pointer" }}>
                        <div style={{ position: "relative" }}>
                            <Badge scale={scale}>
                                <Disc size={14 * scale} color={"#A238FF"} />
                            </Badge>
                            <img style={{ width: 100 * scale, height: 100 * scale, boxShadow: blackBoxShadow(scale) }} src={album && album.url_immagine ? album.url_immagine : "src/assets/album_empty.jpg"} alt={"Cover del brano " + props.brano.titolo} />
                        </div>
                        {stableMezzoDisco}
                    </div>
                    <div style={{ paddingTop: scale * 4, paddingBottom: scale * 8, cursor: "pointer" }} onClick={() => navigate(`/brano?id=${props.brano.id}`)}>
                        <DynamicText text={props.brano.titolo} width={150 * scale} scale={scale} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", paddingTop: 2 * scale, paddingBottom: 2 * scale, alignItems: "center" }}>
                        <div style={{ paddingRight: 8 * scale }}>
                            <div style={{ width: 14 * scale, height: 14 * scale }}>
                                <div style={{ position: "relative", width: 14 * scale, height: 14 * scale, top: -1 * scale }}>
                                    <Clock size={14 * scale} />
                                </div>
                            </div>
                        </div>
                        <div style={{ paddingRight: 8 * scale, fontSize: 16 * scale }}>
                            {props.brano.durata}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", paddingTop: 2 * scale, paddingBottom: 8 * scale, alignItems: "center" }}>
                        <div style={{ paddingRight: 8 * scale }}>
                            <Users size={14 * scale} color={"#A238FF"}/>
                        </div>
                        <div>
                            {artisti &&
                                <ListaArtistiOGeneri key={artisti.map(artista => artista.id).join(",")} lines={3} list={artisti} entity={"artista"} fontSize={14 * scale} />
                            }
                            {!artisti &&
                                <ListaArtistiOGeneri lines={3} list={[{ id: 0, nome: "Caricamento...", url_immagine: "" }]} noClick={true} entity={"artista"} fontSize={14 * scale} />
                            }
                        </div>
                    </div>
                </div>
                {props.noButtons !== true &&
                    <div style={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap" }}>
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
