import type { RootState } from '../../store/store';
import { UtenteDbSchema, type UtenteDb } from '../../types/db_types';
import { useDispatch, useSelector } from 'react-redux';
import ModalSignIn from '../modals/ModalSignIn';
import { useEffect, useState } from 'react';
import ModalAggiornaUtente from '../modals/ModalAggiornaUtente';
import ModalSignUp from '../modals/ModalSignUp';
import { setUtente } from '../../store/userSlice';
import api from '../../api';
import { getNoConnMessage, scaleTwProps } from '../../functions/functions';
import { setGenericAlert } from '../../store/errorSlice';

function CardUtenteLoggato() {
    const dispatch = useDispatch();
    const [isModalSignInOpen, setIsModalSignInOpen] = useState<boolean>(false);
    const [isModalAggiornaUtenteOpen, setIsModalAggiornaUtenteOpen] = useState<boolean>(false);
    const [isModalSignUpOpen, setIsModalSignUpOpen] = useState<boolean>(false);
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

    return (
        <>
            {loggedUtente &&
                <div>
                    <img className="rounded-full cursor-pointer" onClick={() => setIsModalAggiornaUtenteOpen(true)} style={scaleTwProps("w-12 h-12 shadow-md", 1)} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo di " + loggedUtente.nome + " " + loggedUtente.cognome} />
                </div>
            }
            {!loggedUtente &&
                <div>
                    <button onClick={() => setIsModalSignInOpen(true)} className="card-button rounded-lg p-4 text-[16px]">Accedi</button>
                </div>
            }
            {isModalSignInOpen &&
                <ModalSignIn isOpen={true} onRequestClose={() => setIsModalSignInOpen(false)} openSignUp={() => setIsModalSignUpOpen(true)} />
            }
            {isModalAggiornaUtenteOpen &&
                <ModalAggiornaUtente isOpen={true} onRequestClose={() => setIsModalAggiornaUtenteOpen(false)} />
            }
            {isModalSignUpOpen &&
                <ModalSignUp isOpen={true} onRequestClose={() => setIsModalSignUpOpen(false)} />
            }
        </>
    );
}

export default CardUtenteLoggato;