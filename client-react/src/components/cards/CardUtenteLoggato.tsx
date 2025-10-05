import type { RootState } from '../../store/store';
import { UtenteDbSchema, type UtenteDb } from '../../types/db_types';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect} from 'react';
import { setUtente } from '../../store/userSlice';
import api from '../../api';
import { getNoConnMessage, scaleTwProps } from '../../functions/functions';
import { setGenericAlert } from '../../store/errorSlice';
import { useSearchParams } from 'react-router-dom';

function CardUtenteLoggato() {
    const dispatch = useDispatch();
    const setSearchParams = useSearchParams()[1];
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);

    async function loadUtente() {
        try {
            const response = await api.get("/utenti/loggato", { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            if (response.data == "") {
                dispatch(setUtente(null));
            } else {
                const utente = UtenteDbSchema.parse(response.data);
                dispatch(setUtente(utente));
            }
        } catch {
            dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
        }
    }
    useEffect(() => {
        loadUtente();
    }, []);

    function openSignIn() {
        setSearchParams((prev) => {
            prev.set("modal", "signIn");
            prev.delete("idInModal");
            return prev;
        });
    }

    function openAggiornaUtente() {
        setSearchParams((prev) => {
            prev.set("modal", "utente");
            prev.delete("idInModal");
            return prev;
        });
    }

    return (
        <>
            {loggedUtente &&
                <div>
                    <img className="rounded-full cursor-pointer" onClick={openAggiornaUtente} style={scaleTwProps("w-12 h-12 shadow-md", 1)} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo di " + loggedUtente.nome + " " + loggedUtente.cognome} />
                </div>
            }
            {!loggedUtente &&
                <div>
                    <button onClick={openSignIn} className="card-button rounded-lg p-4 text-[16px]">Accedi</button>
                </div>
            }
        </>
    );
}

export default CardUtenteLoggato;