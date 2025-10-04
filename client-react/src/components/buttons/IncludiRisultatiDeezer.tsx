import { deezerColor } from "../../functions/functions";
import DeezerLogo from "../icons/DeezerLogo";

function IncludiRisultatiDeezer(props: { inclusi: boolean, onClick: () => void }) {
    return <>
    {!props.inclusi ? <button className={"card-button p-1"} onClick={props.onClick}><DeezerLogo size={14} /> Cerca anche da Deezer</button> : <span className={`text-[${deezerColor()}]`}><DeezerLogo size={14} /><b> Risultati di Deezer aggiunti!</b></span>}
    </>;
}

export default IncludiRisultatiDeezer;