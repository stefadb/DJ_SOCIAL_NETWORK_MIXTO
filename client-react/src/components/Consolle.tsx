import { useEffect } from "react";
import type { BranoDb, UtenteDb } from "../types/db_types";
import { useDispatch, useSelector } from "react-redux";
import { setBrano1 } from "../store/giradischiSlice";
import { setBrano2 } from "../store/giradischiSlice";
import CardBrano from "./cards/CardBrano";
import type { RootState } from "../store/store";
import { openModal } from "../store/modalNuovoPassaggioSlice";

function Consolle() {
    const dispatch = useDispatch();
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente);
    const brano1: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano1);
    const brano2: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano2);
    useEffect(() => {
        const savedBrano1 = localStorage.getItem('brano1');
        const savedBrano2 = localStorage.getItem('brano2');
        if (savedBrano1) {
            const brano1: BranoDb = JSON.parse(savedBrano1);
            dispatch(setBrano1(brano1));
        }
        if (savedBrano2) {
            const brano2: BranoDb = JSON.parse(savedBrano2);
            dispatch(setBrano2(brano2));
        }
    }, []);

    function scambia(){
        const temp = brano1;
        dispatch(setBrano1(brano2));
        dispatch(setBrano2(temp));
    }
    return <div>
        <h3>Brano 1</h3>
        {brano1 === null ? <p><i>(vuoto)</i></p> :
        <CardBrano brano={brano1} noDeckButtons/>}
        <h3>Brano 2</h3>
        {brano2 === null ? <p><i>(vuoto)</i></p> :
        <CardBrano brano={brano2} noDeckButtons/>}
        <button onClick={scambia}>Scambia</button>
        <button onClick={() => {if(loggedUtente){dispatch(openModal())}else{alert("Accedi per pubblicare un passaggio");}}}>Pubblica un nuovo passaggio</button>
    </div>;
}

export default Consolle;
