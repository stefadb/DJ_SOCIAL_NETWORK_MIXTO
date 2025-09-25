import type { RootState } from '../../store/store';
import { UtenteDbSchema, type UtenteDb } from '../../types/db_types';
import { useDispatch, useSelector } from 'react-redux';
import ModalSignIn from '../modals/ModalSignIn';
import { useEffect, useState } from 'react';
import ModalAggiornaUtente from '../modals/ModalAggiornaUtente';
import ModalSignUp from '../modals/ModalSignUp';
import { setUtente } from '../../store/userSlice';
import api from '../../api';

function CardUtenteLoggato() {
    const dispatch = useDispatch();
    const [isModalSignInOpen, setIsModalSignInOpen] = useState<boolean>(false);
    const [isModalAggiornaUtenteOpen, setIsModalAggiornaUtenteOpen] = useState<boolean>(false);
    const [isModalSignUpOpen, setIsModalSignUpOpen] = useState<boolean>(false);
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);

    async function loadUtente() {
        try {
            const response = await api.get("/utenti/loggato", { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            //TODO: aggiorna lo stato globale con i dati dell'utente loggato
            if (response.data == "") {
                dispatch(setUtente(null));
            } else {
                const utente = UtenteDbSchema.parse(response.data);
                dispatch(setUtente(utente));
            }
        } catch (error) {
            console.error("Errore nel recupero dell'utente loggato:", error);
        }
    }
    useEffect(() => {
        loadUtente();
    }, []);

    return (
        <>
            {loggedUtente &&
                <div onClick={() => setIsModalAggiornaUtenteOpen(true)} style={{ cursor: "pointer" }}>
                    <b><i>{loggedUtente.nome} {loggedUtente.cognome}</i></b>
                </div>
            }
            {!loggedUtente &&
                <>
                    <button onClick={() => setIsModalSignInOpen(true)}>Entra</button>
                    <button onClick={() => setIsModalSignUpOpen(true)}>Registrati</button>
                </>
            }
            <ModalSignIn isOpen={isModalSignInOpen} onRequestClose={() => setIsModalSignInOpen(false)} />
            <ModalAggiornaUtente isOpen={isModalAggiornaUtenteOpen} onRequestClose={() => setIsModalAggiornaUtenteOpen(false)} />
            <ModalSignUp isOpen={isModalSignUpOpen} onRequestClose={() => setIsModalSignUpOpen(false)} />
        </>
    );
}

export default CardUtenteLoggato;