import axios from "axios";
import { useEffect, useState } from "react";
import { getLoggedUtente, rimuoviBranoPreferito, salvaBranoPreferito } from "../functions/functions";

function SalvaBranoPreferito(props: {idBrano: number}) {
    const [preferito, setPreferito] = useState<boolean>(false);

    async function loadPreferito(){
        const response = await axios.get(`http://localhost:3000/brani/esistenti/preferiti?utente=${getLoggedUtente().id}&brano=${props.idBrano}`);
        setPreferito(response.data === true);
    }
    useEffect(() => {
        loadPreferito();
    }, []);



  return <div>
    {preferito &&
    <button onClick={async () => {try{await rimuoviBranoPreferito(getLoggedUtente(), props.idBrano); setPreferito(false);}catch(error){console.error("Errore nel rimuovere il brano preferito:", error);}}} className="btn btn-primary">⭐</button>
    }
    {!preferito &&
    <button onClick={async () => {try{await salvaBranoPreferito(getLoggedUtente(), props.idBrano); setPreferito(true);}catch(error){console.error("Errore nel salvare il brano preferito:", error);}}} className="btn btn-primary">☆</button>
    }
  </div>;
}

export default SalvaBranoPreferito;