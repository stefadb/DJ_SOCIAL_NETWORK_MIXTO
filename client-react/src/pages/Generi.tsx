import { useEffect, useState } from "react";
import type { GenereDb } from "../types/db_types";
import axios from "axios";
import CardGenere from "../components/cards/CardGenere";

function Generi(){
    const [generi, setGeneri] = useState<GenereDb[] | null>(null);

    useEffect(() => {
        loadGeneri();
    }, []);

    async function loadGeneri() {
        try {
            await axios.get(`http://localhost:3000/generi/tutti?uselessParam=uselessValue&limit=100&index=0`);
            const response = await axios.get(`http://localhost:3000/generi/esistenti`, { headers: {"Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            setGeneri(response.data as GenereDb[]);
        } catch (error) {
            console.error("Errore nel recupero dei generi:", error);
        }
    }

    return(<div>
        <h1>Generi</h1>
        {generi ? (
            <ul>
                {generi.map(genere => (
                    <CardGenere key={genere.id} genere={genere}/>
                ))}
            </ul>
        ) : (
            <p>Caricamento...</p>
        )}
    </div>);
}

export default Generi;