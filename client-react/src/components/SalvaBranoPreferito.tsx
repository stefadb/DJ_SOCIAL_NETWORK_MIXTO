import { useEffect, useState } from "react";
import { rimuoviBranoPreferito, salvaBranoPreferito } from "../functions/functions";
import { useSelector } from "react-redux";
import type { UtenteDb } from "../types/db_types";
import type { RootState } from "../store/store";
import api from "../api";

function SalvaBranoPreferito(props: { idBrano: number }) {
  const [preferito, setPreferito] = useState<boolean>(false);
  const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
  async function loadPreferito() {
    if (loggedUtente) {
      const response = await api.get(`/brani/esistenti/preferiti?utente=${loggedUtente.id}&brano=${props.idBrano}`);
      setPreferito(response.data === true);
    }
  }
  useEffect(() => {
    loadPreferito();
  }, []);

  /*
  useEffect(() => {
    loadPreferito();
  }, [loggedUtente]);
  */



  return <div>
    {loggedUtente !== null &&
      <>
        {preferito &&
          <button onClick={async () => { try { await rimuoviBranoPreferito(loggedUtente, props.idBrano); setPreferito(false); } catch (error) { console.error("Errore nel rimuovere il brano preferito:", error); } }} className="btn btn-primary">⭐</button>
        }
        {!preferito &&
          <button onClick={async () => { try { await salvaBranoPreferito(loggedUtente, props.idBrano); setPreferito(true); } catch (error) { console.error("Errore nel salvare il brano preferito:", error); } }} className="btn btn-primary">☆</button>
        }
      </>
    }
    {loggedUtente === null &&
      <button className="btn btn-primary" onClick={() => {alert("Accedi per salvare questo brano tra i preferiti");}}>☆</button>
    }

  </div>;
}

export default SalvaBranoPreferito;