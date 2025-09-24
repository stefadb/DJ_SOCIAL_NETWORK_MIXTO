import { useEffect, useState } from "react";
import type { BranoDb } from "../types/db_types";

function Consolle() {
    const [brano1, setBrano1] = useState<BranoDb | null>(() => {
        const stored = localStorage.getItem('brano1');
        return stored ? JSON.parse(stored) as BranoDb : null;
    });

    useEffect(() => {
        localStorage.setItem('brano1', JSON.stringify(brano1));
    }, [brano1]);

    const [brano2, setBrano2] = useState<BranoDb | null>(() => {
        const stored = localStorage.getItem('brano2');
        return stored ? JSON.parse(stored) as BranoDb : null;
    });

    useEffect(() => {
        localStorage.setItem('brano2', JSON.stringify(brano2));
    }, [brano2]);
    return <div>Consolle</div>;
}

export default Consolle;
