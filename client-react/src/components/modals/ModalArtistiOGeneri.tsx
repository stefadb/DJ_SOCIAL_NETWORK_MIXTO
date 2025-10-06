import Modal from "react-modal"
import ModalWrapper from "./ModalWrapper"
import { check404, checkConnError, deezerColor, getNoConnMessage, getNomiArtistiAlbum, getNomiArtistiBrano, modalsContentClassName, modalsOverlayClassName } from "../../functions/functions"
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArtistaDbSchema, GenereDbSchema, type ArtistaDb, type GenereDb } from "../../types/db_types";
import Badge from "../Badge";
import {Music, User } from "react-feather";
import { Link } from "react-router-dom";    
import Caricamento from "../icons/Caricamento";
import { setGenericAlert } from "../../store/errorSlice";
import { useDispatch } from "react-redux";
import z from "zod";
import api from "../../api";

function ModalArtistiOGeneri(props: { entity: "artista" | "genere", id: number }) {
    const setSearchParams = useSearchParams()[1];
    const dispatch = useDispatch();
    Modal.setAppElement('#root');

    function closeThisModal() {
        setSearchParams((prev) => {
            prev.delete("modal");
            prev.delete("idInModal");
            return prev;
        });
    }

    async function load() {
        try {
            if (props.entity === "artista") {
                await api.get(`/brani/singolo?trackId=${props.id}&limit=1&index=0`);
                const response = await api.get(`/brani/esistenti/${props.id}?include_artista`);
                z.array(ArtistaDbSchema).parse(response.data.artista);
                setList(response.data.artista as ArtistaDb[]);
            } else {
                await api.get(`/album/singolo?albumId=${props.id}&limit=1&index=0`);
                const generiResponse = await api.get(`/generi/esistenti?album=${props.id}`);
                const generi: GenereDb[] = z.array(GenereDbSchema).parse(generiResponse.data) as GenereDb[];
                setList(generi);
            }
        } catch (error) {
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
                setStatus("error");
            } else if (check404(error)) {
                setStatus("not-found");
            } else {
                setStatus("error");
            }
        }
    }

    useEffect(() => {
        load();
    }, [props.id]);

    useEffect(() => {
        load();
    }, []);

    const [status, setStatus] = useState<"loading" | "error" | "not-found" | null>(null);

    const [list, setList] = useState<ArtistaDb[] | GenereDb[] | null>(null);

    return <Modal
        overlayClassName={modalsOverlayClassName()}
        className={modalsContentClassName()}
        isOpen={true} onRequestClose={closeThisModal}>
        <ModalWrapper title={`Tutti ${props.entity == "artista" ? "gli artisti" : "i generi"} di questo ${props.entity == "artista" ? "brano" : "album"}`} onRequestClose={closeThisModal}>
            {list === null &&
                <div className="flex flex-row justify-center">
                    <Caricamento size="large" status={status === null ? "loading" : status} />
                </div>
            }
            {list !== null && list.map((element) => {
                return <div key={element.id} className="flex flex-row">
                    <div className="relative p-1 w-6 h-6">
                        <Badge scale={1}>
                            {props.entity == "artista" &&
                                <User size={14} color={deezerColor()} />
                            }
                            {props.entity == "genere" &&
                                <Music size={14} color={deezerColor()} />
                            }
                        </Badge>
                    </div>
                    <div className="p-1">
                        <Link className="text-base" to={"/" + props.entity + "?id=" + element.id}>{element.nome}</Link>
                    </div>
                </div>
            })}
        </ModalWrapper>
    </Modal>
}

export default ModalArtistiOGeneri;