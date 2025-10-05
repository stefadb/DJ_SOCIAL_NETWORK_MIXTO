import { useEffect, useMemo, useState } from "react";
import { AlbumDbSchema, type AlbumDb, type ArtistaDb, type BranoDb } from "../../types/db_types";
import { deezerColor, getNomiArtistiBrano, scaleTwProps} from "../../functions/functions";
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

function CardBrano(props: { brano: BranoDb, noDeckButtons?: boolean, noButtons?: boolean, scale: number }) {
    const [artisti, setArtisti] = useState<ArtistaDb[] | null>(null);
    const [album, setAlbum] = useState<AlbumDb | null>(null);
    const [erroreArtisti, setErroreArtisti] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        loadArtisti();
        loadAlbum();
    }, []);

    const scale = props.scale;


    useEffect(() => {
        loadArtisti();
        loadAlbum();
    }, [props.brano]);


    async function loadArtisti() {
        try{
            setErroreArtisti(false);
            const nomi = await getNomiArtistiBrano(props.brano.id);
            setArtisti(nomi);
        } catch {
            setErroreArtisti(true);
        }
    }

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
        <div style={scaleTwProps("p-3",scale)}>
            {/* In scale = 1, questa card è larga esattamente 198px*/}
            <div style={scaleTwProps("p-3 w-[150px] rounded-lg shadow-md",scale)}>
                <div>
                    <div onClick={() => navigate(`/brano?id=${props.brano.id}`)} className="flex flex-row cursor-pointer">
                        <div className="relative">
                            <Badge scale={scale}>
                                <Disc size={14 * scale} color={deezerColor()} />
                            </Badge>
                            <img style={scaleTwProps("w-[100px] h-[100px] shadow-md",scale)} src={album && album.url_immagine ? album.url_immagine : "src/assets/album_empty.jpg"} alt={"Cover del brano " + props.brano.titolo} />
                        </div>
                        <MezzoDisco radius={50 * scale} />
                    </div>
                    <div style={scaleTwProps("pt-1 pb-2 cursor-pointer",scale)} onClick={() => navigate(`/brano?id=${props.brano.id}`)}>
                        <DynamicText text={props.brano.titolo} width={150 * scale} scale={scale} />
                    </div>
                    <div style={scaleTwProps("flex flex-row items-center pt-1 pb-2",scale)}>
                        <div style={scaleTwProps("pr-2",scale)}>
                            <div style={scaleTwProps("w-4 h-4",scale)}>
                                <div style={scaleTwProps("relative w-4 h-4 top-[-1px]",scale)}>
                                    <Clock size={16 * scale} />
                                </div>
                            </div>
                        </div>
                        <div style={scaleTwProps("pr-2 text-base",scale)}>
                            {props.brano.durata.substring(0,8)}
                        </div>
                    </div>
                    <div style={scaleTwProps("flex flex-row items-center pt-px pb-2", scale)}>
                        <div style={scaleTwProps("pr-2",scale)}>
                            <Users size={14 * scale} color={deezerColor()} />
                        </div>
                        <div>
                            {artisti &&
                                <ListaArtistiOGeneri key={artisti.map(artista => artista.id).join(",")} lines={3} list={artisti} entity={"artista"} scale={scale} idBrano={props.brano.id}/>
                            }
                            {!artisti &&
                                <ListaArtistiOGeneri lines={3} list={[{ id: 0, nome: (erroreArtisti ? "Impossibile caricare gli artisti" : "Caricamento..."), url_immagine: "" }]} noClick={true} entity={"artista"} scale={scale} idBrano={NaN}/>
                            }
                        </div>
                    </div>
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
