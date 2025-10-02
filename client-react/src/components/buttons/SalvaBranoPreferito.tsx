import { useEffect, useState } from "react";
import { rimuoviBranoPreferito, salvaBranoPreferito, smallPadding } from "../../functions/functions";
import { useSelector } from "react-redux";
import type { UtenteDb } from "../../types/db_types";
import type { RootState } from "../../store/store";
import api from "../../api";
import { Star } from "react-feather";
import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from 'uuid';

function SalvaBranoPreferito(props: { idBrano: number, scale: number}) {
  // ID stabile che non cambia ad ogni render
  const randomId = `preferiti-${uuidv4()}`;
  const buttonPadding = `${8*props.scale}px ${4*props.scale}px ${7*props.scale}px ${4*props.scale}px`;
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

  return <div style={{ padding: smallPadding(props.scale), display: "inline-block" }}>
    <button 
      id={randomId} 
      style={{ padding: buttonPadding, borderRadius: 4*props.scale}} 
      className={"card-brano-button"} 
      onClick={async () => {
        if (loggedUtente === null) {
          alert("Accedi per salvare questo brano tra i preferiti");
          return;
        }
        
        try {
          if (preferito) {
            await rimuoviBranoPreferito(loggedUtente, props.idBrano);
            setPreferito(false);
          } else {
            await salvaBranoPreferito(loggedUtente, props.idBrano);
            setPreferito(true);
          }
        } catch (error) {
          console.error("Errore nel gestire il brano preferito:", error);
        }
      }}
    >
      <Star 
        size={14*props.scale} 
        color={loggedUtente === null ? "gray" : (preferito ? "gold" : "gray")} 
        fill={loggedUtente === null ? "gray" : (preferito ? "gold" : "gray")} 
      />
    </button>
    <Tooltip
      anchorSelect={`#${randomId}`}
      place="top"
      content={preferito ? "Rimuovi il brano dai preferiti" : "Salva il brano nei preferiti"}
    />
  </div>
}

export default SalvaBranoPreferito;