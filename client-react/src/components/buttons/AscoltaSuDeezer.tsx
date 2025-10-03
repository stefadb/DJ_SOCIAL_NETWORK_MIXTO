import { Headphones } from "react-feather";
import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from 'uuid';
import DeezerLogo from "../icons/DeezerLogo";
import { scaleTwProps} from "../../functions/functions";

function AscoltaSuDeezer(props: { id: number, entity: "track" | "album", scale: number}) {
    const randomId = `deezer-${props.entity}-${props.id}-${uuidv4()}`;
    return <div className="inline-block" style={scaleTwProps("p-1", props.scale)}>
    <button id={randomId} onClick={() => { window.open(`https://www.deezer.com/${props.entity}/${props.id}`, "_blank"); }} className={"card-brano-button"} style={scaleTwProps("pt-2 pr-1 pb-2 pl-1 rounded", props.scale)}>
            <div className="flex flex-row">
                <div style={scaleTwProps("pr-1",props.scale)}>
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
