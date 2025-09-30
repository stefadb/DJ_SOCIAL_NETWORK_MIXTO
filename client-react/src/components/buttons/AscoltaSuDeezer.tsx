import { Headphones } from "react-feather";
import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from 'uuid';
import DeezerLogo from "../DeezerLogo";

function AscoltaSuDeezer(props: { id: number, entity: "track" | "album", scale: number}) {
    const buttonPadding = `${8*props.scale}px ${4*props.scale}px ${7*props.scale}px ${4*props.scale}px`;
    const randomId = `deezer-${props.entity}-${props.id}-${uuidv4()}`;
    return <div style={{ padding: 4*props.scale, display: "inline-block" }}>
        <button id={randomId} onClick={() => { window.open(`https://www.deezer.com/${props.entity}/${props.id}`, "_blank"); }} style={{ padding: buttonPadding, borderRadius: 4*props.scale }} className={"card-brano-button"}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ paddingRight: 4*props.scale }}>
                    <Headphones size={14*props.scale} color={"gray"} />
                </div>
                <div>
                    <DeezerLogo size={14*props.scale}/>
                </div>
            </div>
        </button>
        <Tooltip
            anchorSelect={`#${randomId}`}
            place="top"
            content={"Ascolta su Deezer"}
        />
    </div>;
}

export default AscoltaSuDeezer;
