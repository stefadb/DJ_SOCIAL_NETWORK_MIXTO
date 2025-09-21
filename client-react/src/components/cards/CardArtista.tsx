import { useNavigate } from "react-router-dom";
import type { ArtistaDb} from "../../types/db_types";

function CardArtista(props: { artista: ArtistaDb }) {
    const navigate = useNavigate();
    return (
        <div onClick={() => {navigate("/artista?id=" + props.artista.id);}} style={{ border: "1px solid black", borderRadius: "8px", padding: "10px", margin: "10px", cursor: "pointer" }}>
            <img style={{ width: "100px", height: "100px", borderRadius: "50%" }} src={"http://localhost:3000/artisti_pictures/" + props.artista.id + ".jpg"} alt={"Immagine di profilo di " + props.artista.nome} />
            <h3>{props.artista.nome}</h3>
        </div>
    );
}

export default CardArtista;