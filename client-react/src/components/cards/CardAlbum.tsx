import { type AlbumDb } from "../../types/db_types";
import { useNavigate } from "react-router-dom";
import DynamicText from "../DynamicText";
import MezzoDisco from "../MezzoDisco";
import { Calendar } from "react-feather";
import { dataItaliana, deezerColor, defaultAlbumPicture, scaleTwProps } from "../../functions/functions";
import { useMemo } from "react";
import AscoltaSuDeezer from "../buttons/AscoltaSuDeezer";
import AlbumIcon from "../icons/AlbumIcon";
import Badge from "../Badge";
import VediArtistiOGeneri from "../buttons/VediArtistiOGeneri";

function CardAlbum(props: { album: AlbumDb, size: "small" | "large" }) {
    const scales = {
        small: 1,
        large: 1.5
    };

    const scale = scales[props.size] || 1;

    const stableMezzoDisco = useMemo(() => <MezzoDisco radius={50 * scale} />, []);

    const navigate = useNavigate();
    return (
        <div style={scaleTwProps("p-3", scale)}>
            <div className="shadow-md-custom" style={scaleTwProps("p-3 w-[150px] rounded-lg", scale)}>
                <div>
                    <div className="flex flex-row cursor-pointer" onClick={() => navigate(`/album?id=${props.album.id}`)}>
                        <div className="relative">
                            <Badge scale={scale}>
                                <AlbumIcon size={14 * scale} color={deezerColor()} />
                            </Badge>
                            <img onError={defaultAlbumPicture} style={scaleTwProps("w-[100px] h-[100px] shadow-md"/* no-custom*/, scale)} src={props.album.url_immagine ? props.album.url_immagine : "src/assets/album_empty.jpg"} alt={"Cover album " + props.album.titolo} />
                        </div>
                        {stableMezzoDisco}
                    </div>
                    <div style={scaleTwProps("pt-1 pb-2 cursor-pointer", scale)} onClick={() => navigate(`/album?id=${props.album.id}`)}>
                        <DynamicText text={props.album.titolo} width={150 * scale} scale={scale} />
                    </div>
                    <div style={scaleTwProps("py-1 flex flex-row items-center", scale)} className={!props.album.data_uscita ? "opacity-0" : ""}>
                        <div style={scaleTwProps("pr-2", scale)}>
                            <div style={scaleTwProps("w-4 h-4", scale)}>
                                <div style={scaleTwProps("relative w-4 h-4 top-[-1px]", scale)}>
                                    <Calendar size={16 * scale} />
                                </div>
                            </div>
                        </div>
                        <div style={scaleTwProps("text-base", scale)}>
                            {props.album.data_uscita ? dataItaliana(props.album.data_uscita) : <i className="text-gray-500">Sconosciuta</i>}
                        </div>
                    </div>
                    <div style={scaleTwProps("flex flex-row items-center pt-1 pb-2", scale)}>
                        <VediArtistiOGeneri entity="genere" id={props.album.id} scale={scale} />
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