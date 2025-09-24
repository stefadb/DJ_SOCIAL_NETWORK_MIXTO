import type { BranoDb } from "../types/db_types";
import { setBrano1 } from "../store/giradischiSlice";
import { setBrano2 } from "../store/giradischiSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";

function PosizionaBrano(props: {deck: 1 | 2, brano: BranoDb}) {
    const dispatch = useDispatch();
    const brano1 : BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano1);
    const brano2 : BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano2);
    function posizionaBranoNelDeck(deck: 1 | 2, brano: BranoDb) {
        if(deck === 1){
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
    return <button onClick={() => posizionaBranoNelDeck(props.deck, props.brano)}>Posiziona sul deck {props.deck}</button>;
}

export default PosizionaBrano;