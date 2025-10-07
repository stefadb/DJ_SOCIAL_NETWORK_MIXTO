import type { BranoDb } from "../../types/db_types";
import { setBrano1 } from "../../store/giradischiSlice";
import { setBrano2 } from "../../store/giradischiSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { ChevronUp, Disc } from "react-feather";
import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from 'uuid';
import { scaleTwProps } from "../../functions/functions";
import { setGenericAlert } from "../../store/errorSlice";

function PosizionaBrano(props: { deck: 1 | 2, brano?: BranoDb, scale: number }) {
    const randomId = `brano-${props.deck}-${uuidv4()}`;
    const dispatch = useDispatch();
    const brano1: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano1);
    const brano2: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano2);
    function posizionaBranoNelDeck() {
        if (props.brano) {
            if (props.deck === 1) {
                dispatch(setBrano1(props.brano));
                dispatch(setGenericAlert({ message: `'${props.brano.titolo}' posizionato sul deck 1!`, type: "info" }));
            } else {
                dispatch(setBrano2(props.brano));
                dispatch(setGenericAlert({ message: `'${props.brano.titolo}' posizionato sul deck 2!`, type: "info" }));
            }
        }
    }

    function posizionaOChiedi() {
        if (props.brano) {
            if (props.deck === 1 && brano1 && brano1.id === props.brano.id) {
                dispatch(setGenericAlert({ message: "Hai già messo questo brano sul deck 1!", type: "info" }));
            } else if (props.deck === 1 && brano1 && brano1.id !== props.brano.id) {
                if (window.confirm("Il deck 1 è già occupato. Vuoi sostituire il brano?")) {
                    posizionaBranoNelDeck();
                }
            } else if (props.deck === 2 && brano2 && brano2.id === props.brano.id) {
                dispatch(setGenericAlert({ message: "Hai già messo questo brano sul deck 2!", type: "info" }));
            } else if (props.deck === 2 && brano2 && brano2.id !== props.brano.id) {
                if (window.confirm("Il deck 2 è già occupato. Vuoi sostituire il brano?")) {
                    posizionaBranoNelDeck();
                }
            } else {
                posizionaBranoNelDeck();
            }
        }
    }
    return <div className="inline-block" style={scaleTwProps("p-1", props.scale)}>
        <button id={randomId} className="card-button" style={scaleTwProps("p-1 rounded", props.scale)} onClick={() => posizionaOChiedi()}>
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <div style={scaleTwProps("w-4 h-4", props.scale)}>
                        <Disc size={16 * props.scale} color={props.deck == 1 ? "red" : "gray"} />
                    </div>
                    <div style={scaleTwProps("w-4 h-4", props.scale)}>
                        <Disc size={16 * props.scale} color={props.deck == 2 ? "blue" : "gray"} />
                    </div>
                </div>
                <div className="relative flex flex-row" style={scaleTwProps("top-[-3px]", props.scale)}>
                    <div style={scaleTwProps("w-4 h-[13px]", props.scale)}>
                        {props.deck === 1 &&
                            <ChevronUp size={16 * props.scale} color={"red"} />
                        }
                    </div>
                    <div style={scaleTwProps("w-4 h-[13px]", props.scale)}>
                        {props.deck === 2 &&
                            <ChevronUp size={16 * props.scale} color={"blue"} />
                        }
                    </div>
                </div>
            </div>
        </button>
        {props.brano &&
            <Tooltip
                anchorSelect={`#${randomId}`}
                place="top"
                content={`Posiziona il brano sul deck n.${props.deck}`}
            />
        }
    </div>;
}

export default PosizionaBrano;