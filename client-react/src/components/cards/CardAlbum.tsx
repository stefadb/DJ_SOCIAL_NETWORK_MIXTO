import { AlbumDbSchema, GenereDbSchema, type AlbumDb, type GenereDb } from "../../types/db_types";
import { useNavigate } from "react-router-dom";
import DynamicText from "../DynamicText";
import MezzoDisco from "../MezzoDisco";
import { Calendar, Music } from "react-feather";
import { dataItaliana, scaleTwProps} from "../../functions/functions";
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

    const stableMezzoDisco = useMemo(() => <MezzoDisco radius={50 * scale} />, []);

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
        <div style={scaleTwProps("p-3",scale)}>
            <div style={scaleTwProps("p-3 w-[150px] rounded-lg shadow-md",scale)}>
                <div>
                    <div className="flex flex-row cursor-pointer" onClick={() => navigate(`/album?id=${props.album.id}`)}>
                        <div className="text-gray-500">
                            <Badge scale={scale}>
                                <AlbumIcon size={14 * scale} color={"#A238FF"} />
                            </Badge>
                            <img style={scaleTwProps("w-[100px] h-[100px] shadow-md",scale)} src={props.album.url_immagine ? props.album.url_immagine : "src/assets/album_empty.jpg"} alt={"Cover album " + props.album.titolo} />
                        </div>
                        {stableMezzoDisco}
                    </div>
                    <div style={scaleTwProps("pt-1 pb-2 cursor-pointer",scale)} onClick={() => navigate(`/album?id=${props.album.id}`)}>
                        <DynamicText text={props.album.titolo} width={150 * scale} scale={scale} />
                    </div>
                    <div style={scaleTwProps("py-1 flex flex-row items-center",scale)}>
                        <div style={scaleTwProps("pr-2", scale)}>
                            <div style={scaleTwProps("w-4 h-4", scale)}>
                                <div style={scaleTwProps("relative w-4 h-4 top-[-1px]",scale)}>
                                    <Calendar size={16 * scale} />
                                </div>
                            </div>
                        </div>
                        <div style={scaleTwProps("text-base",scale)}>
                            {props.album.data_uscita ? dataItaliana(props.album.data_uscita) : (dataUscita ? dataItaliana(dataUscita) : <i className="text-gray-500">Sconosciuta</i>)}
                        </div>
                    </div>
                    <div style={scaleTwProps("flex flex-row items-center pt-1 pb-2",scale)}>
                        <div style={scaleTwProps("pr-2", scale)}>
                            <Music size={14 * scale} color={"#A238FF"}/>
                        </div>
                        <div>
                            {generi &&
                                <ListaArtistiOGeneri key={generi.map(genere => genere.id).join(",")} lines={3} list={generi} entity={"genere"} scale={scale}/>
                            }
                            {!generi &&
                                <ListaArtistiOGeneri lines={3} list={[{ id: 0, nome: "Caricamento...", url_immagine: "" }]} noClick={true} entity={"genere"} scale={scale}/>
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