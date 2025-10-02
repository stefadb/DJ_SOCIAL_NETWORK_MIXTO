import { AlbumDbSchema, GenereDbSchema, type AlbumDb, type GenereDb } from "../../types/db_types";
import { useNavigate } from "react-router-dom";
import DynamicText from "../DynamicText";
import MezzoDisco from "../MezzoDisco";
import { Calendar, Music } from "react-feather";
import { blackBoxShadow, dataItaliana, grayBoxShadow, largePadding } from "../../functions/functions";
import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import z from "zod";
import ListaArtistiOGeneri from "../ListaArtistiOGeneri";
import AscoltaSuDeezer from "../buttons/AscoltaSuDeezer";
import AlbumIcon from "../icons/AlbumIcon";
import Badge from "../Badge";

function CardAlbum(props: { album: AlbumDb, size: "small" | "large" }) {
    const [generi, setGeneri] = useState<GenereDb[] | null>(null);
    const [dataUscita, setDataUscita] = useState<string | null>(null);

    useEffect(() => {
        loadAlbum();
    }, []);

    const scales = {
        small: 1,
        large: 1.5
    };

    const scale = scales[props.size] || 1;

    const stableMezzoDisco = useMemo(() => <MezzoDisco radius={scale * 50} />, []);

    useEffect(() => {
        loadAlbum();
    }, [props.album]);

    async function loadAlbum() {
        try {
            await api.get(`/album/singolo?albumId=${props.album.id}&limit=1&index=0`);
            const generiResponse = await api.get(`/generi/esistenti?album=${props.album.id}`);
            const generi: GenereDb[] = z.array(GenereDbSchema).parse(generiResponse.data) as GenereDb[];
            const albumResponse = await api.get(`/album/esistenti/${props.album.id}`);
            const album: AlbumDb = AlbumDbSchema.parse(albumResponse.data);
            setGeneri(generi);
            setDataUscita(album.data_uscita);
        } catch (error) {
            console.error("Errore nel recupero dell'album:", error);
        }
    }

    const navigate = useNavigate();
    return (
        <div style={{ padding: largePadding(scale) }}>
            <div style={{ padding: largePadding(scale), width: 150 * scale, borderRadius: 8 * scale, boxShadow: grayBoxShadow(scale) }}>
                <div>
                    <div className="flex flex-row cursor-pointer" onClick={() => navigate(`/album?id=${props.album.id}`)}>
                        <div style={{ position: "relative" }}>
                            <Badge scale={scale}>
                                <AlbumIcon size={14 * scale} color={"#A238FF"} />
                            </Badge>
                            <img style={{ width: 100 * scale, height: 100 * scale, boxShadow: blackBoxShadow(scale) }} src={props.album.url_immagine ? props.album.url_immagine : "src/assets/album_empty.jpg"} alt={"Cover album " + props.album.titolo} />
                        </div>
                        {stableMezzoDisco}
                    </div>
                    <div style={{ paddingTop: 4 * scale, paddingBottom: 8 * scale, cursor: "pointer" }} onClick={() => navigate(`/album?id=${props.album.id}`)}>
                        <DynamicText text={props.album.titolo} width={150 * scale} scale={scale} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 2 * scale, paddingBottom: 2 * scale }}>
                        <div style={{ paddingRight: 8 * scale }}>
                            <div style={{ width: 14 * scale, height: 14 * scale }}>
                                <div style={{ position: "relative", width: 14 * scale, height: 14 * scale, top: -1 * scale }}>
                                    <Calendar size={14 * scale} />
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: 16 * scale }}>
                            {props.album.data_uscita ? dataItaliana(props.album.data_uscita) : (dataUscita ? dataItaliana(dataUscita) : <i style={{ color: "gray" }}>Sconosciuta</i>)}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 2 * scale, paddingBottom: 8 * scale }}>
                        <div style={{ paddingRight: 8 * scale }}>
                            <Music size={14 * scale} color={"#A238FF"}/>
                        </div>
                        <div>
                            {generi &&
                                <ListaArtistiOGeneri key={generi.map(genere => genere.id).join(",")} lines={3} list={generi} entity={"genere"} fontSize={14 * scale} />
                            }
                            {!generi &&
                                <ListaArtistiOGeneri lines={3} list={[{ id: 0, nome: "Caricamento...", url_immagine: "" }]} noClick={true} entity={"genere"} fontSize={14 * scale} />
                            }
                        </div>
                    </div>
                </div>
                <div className="flex items-start flex-wrap">
                    <AscoltaSuDeezer id={props.album.id} entity={"album"} scale={scale} />
                </div>
            </div>
        </div>
    );
}

export default CardAlbum;