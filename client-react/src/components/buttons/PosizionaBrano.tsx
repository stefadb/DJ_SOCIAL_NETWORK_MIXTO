import type { BranoDb } from "../../types/db_types";
import { setBrano1 } from "../../store/giradischiSlice";
import { setBrano2 } from "../../store/giradischiSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { ChevronUp, Disc } from "react-feather";
import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from 'uuid';
import { smallPadding } from "../../functions/functions";

function PosizionaBrano(props: { deck: 1 | 2, brano: BranoDb, scale: number}) {
    const randomId = `brano-${props.deck}-${uuidv4()}`;
    const dispatch = useDispatch();
    const shift = 3 * props.scale; //lascia cosi
    const brano1: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano1);
    const brano2: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano2);
    function posizionaBranoNelDeck(deck: 1 | 2, brano: BranoDb) {
        if (deck === 1) {
            if (brano1 && brano1.id !== brano.id) {
                if (!window.confirm("C'è già un brano sul deck 1. Vuoi sostituirlo?")) return;
            }
            dispatch(setBrano1(brano));
        } else {
            if (brano2 && brano2.id !== brano.id) {
                if (!window.confirm("C'è già un brano sul deck 2. Vuoi sostituirlo?")) return;
            }
            dispatch(setBrano2(brano));
        }
    }
    return <div className="inline-block" style={{ padding: smallPadding(props.scale) }}>
    <button id={randomId} className="card-brano-button" style={{ padding: smallPadding(props.scale), borderRadius: 4*props.scale }} onClick={() => posizionaBranoNelDeck(props.deck, props.brano)}>
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <div style={{ width: 14*props.scale, height: 14*props.scale }}>
                        <Disc size={14*props.scale} color={props.deck == 1 ? "red" : "gray"} />
                    </div>
                    <div style={{ width: 14*props.scale, height: 14*props.scale }}>
                        <Disc size={14*props.scale} color={props.deck == 2 ? "blue" : "gray"} />
                    </div>
                </div>
                <div className="relative flex flex-row" style={{ top: -shift }}>
                    <div style={{ width: 14*props.scale, height: 14*props.scale - shift }}>
                        {props.deck === 1 &&
                            <ChevronUp size={14*props.scale} color={"red"} />
                        }
                    </div>
                    <div style={{ width: 14*props.scale, height: 14*props.scale - shift }}>
                        {props.deck === 2 &&
                            <ChevronUp size={14*props.scale} color={"blue"} />
                        }
                    </div>
                </div>
            </div>
        </button>
        <Tooltip
            anchorSelect={`#${randomId}`}
            place="top"
            content={`Posiziona il brano sul deck n.${props.deck}`}
        />
    </div>;
}

export default PosizionaBrano;