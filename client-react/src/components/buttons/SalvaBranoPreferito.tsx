import { useEffect, useState } from "react";
import { checkConnError, rimuoviBranoPreferito, salvaBranoPreferito, scaleTwProps } from "../../functions/functions";
import { useDispatch, useSelector } from "react-redux";
import type { UtenteDb } from "../../types/db_types";
import type { RootState } from "../../store/store";
import api from "../../api";
import { Star } from "react-feather";
import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from 'uuid';
import { setGenericAlert } from "../../store/errorSlice";

function SalvaBranoPreferito(props: { idBrano: number, scale: number }) {
  // ID stabile che non cambia ad ogni render
  const randomId = `preferiti-${uuidv4()}`;
  const dispatch = useDispatch();
  const [preferito, setPreferito] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
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

  return <div className="inline-block" style={scaleTwProps("p-1", props.scale)}>
    <button
      disabled={buttonDisabled}
      id={randomId}
      className="card-brano-button" style={scaleTwProps("py-2 px-1 rounded", props.scale)}

      onClick={async () => {
        if (loggedUtente === null) {
          dispatch(setGenericAlert({message:"Accedi per salvare questo brano tra i preferiti", type: "info"}));
          return;
        }

        try {
          setButtonDisabled(true);
          if (preferito) {
            await rimuoviBranoPreferito(loggedUtente, props.idBrano);
            setPreferito(false);
          } else {
            await salvaBranoPreferito(loggedUtente, props.idBrano);
            setPreferito(true);
          }
          setButtonDisabled(false);
        } catch(error){
          setButtonDisabled(false);
          if(checkConnError(error)){
            dispatch(setGenericAlert({message:"Impossibile connettersi al server. Controlla la tua connessione ad internet.", type: "error"}));
          }else{
            dispatch(setGenericAlert({message:!preferito ? "Impossibile salvare il brano tra i preferiti. Si è verificato un errore." : "Impossibile rimuovere il brano dai preferiti. Si è verificato un errore.", type: "error"}));
          }
        }
      }}
    >
      <Star
        size={14 * props.scale}
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