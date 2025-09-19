import type { ArtistaDb} from "../../types/db_types";

function CardArtista(props: { artista: ArtistaDb }) {
    return (
        <div>
            <img style={{ width: "100px", height: "100px", borderRadius: "50%" }} src={"http://localhost:3000/artisti_pictures/" + props.artista.id + ".jpg"} alt={"Immagine di profilo di " + props.artista.nome} />
            <h3>{props.artista.nome}</h3>
        </div>
    );
}

export default CardArtista;