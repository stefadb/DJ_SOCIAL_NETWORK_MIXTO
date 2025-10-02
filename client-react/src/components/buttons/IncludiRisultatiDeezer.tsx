import { smallPadding } from "../../functions/functions";
import DeezerLogo from "../icons/DeezerLogo";

function IncludiRisultatiDeezer(props: { inclusi: boolean, onClick: () => void }) {
    return <>
        {!props.inclusi ? <button style={{padding: smallPadding()}} className={"card-brano-button"} onClick={props.onClick}><DeezerLogo size={14} /> Cerca anche da Deezer</button> : <span style={{ color: "#A238FF" }}><DeezerLogo size={14} /><b> Risultati di Deezer aggiunti!</b></span>}
    </>;
}

export default IncludiRisultatiDeezer;