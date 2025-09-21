import { useNavigate } from "react-router-dom";
import type {GenereDb} from "../../types/db_types";

function CardGenere(props: { genere: GenereDb }) {
    const navigate = useNavigate();
    return (
        <div onClick={() => {navigate("/genere?id=" + props.genere.id);}} style={{ border: "1px solid black", borderRadius: "8px", padding: "10px", margin: "10px", cursor: "pointer" }}>
            <img style={{ width: "100px", height: "100px"}} src={"http://localhost:3000/generi_pictures/" + props.genere.id + ".jpg"} alt={"Immagine del genere musicale " + props.genere.nome} />
            <h3>{props.genere.nome}</h3>
        </div>
    );
}

export default CardGenere;