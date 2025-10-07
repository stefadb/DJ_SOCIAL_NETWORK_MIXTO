import { useState } from "react";
import type { ArtistaDb, GenereDb } from "../types/db_types";
import ListaArtistiOGeneri from "./ListaArtistiOGeneri";

function ListaArtistiOGeneriContainer(props: { list: ArtistaDb[], noClick?: boolean, entity: "artista", lines: number, scale: number, idBrano: number} | { list: GenereDb[], noClick?: boolean, entity: "genere", lines: number, scale: number, idAlbum: number}){
    const [height, setHeight] = useState<number | undefined>(undefined);

    return <div id="contenitore" style={{height: height ? height * props.scale : undefined}} className="overflow-hidden">
        <ListaArtistiOGeneri {...props} passHeightToParent={setHeight} />
    </div>;
}

export default ListaArtistiOGeneriContainer;