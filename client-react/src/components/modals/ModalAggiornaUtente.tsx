import Modal from 'react-modal';
import { UtenteDbSchema, type UtenteDb } from '../../types/db_types';
import { useDispatch } from 'react-redux';
import { setUtente } from '../../store/userSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../api';
import { checkConnError, modalsContentClassName, modalsOverlayClassName, scaleTwProps } from '../../functions/functions';
import { setGenericAlert } from '../../store/errorSlice';
import ModalWrapper from './ModalWrapper';

function ModalAggiornaUtente(props: { isOpen: boolean; onRequestClose: () => void; }) {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (loggedUtente) {
            const username = (event.target as any)[0].value;
            const nome = (event.target as any)[1].value;
            const cognome = (event.target as any)[2].value;
            const password = (event.target as any)[3].value;
            const confermaPassword = (event.target as any)[4].value;
            const vecchiaPassword = (event.target as any)[5].value;
            if (password && password !== confermaPassword) {
                dispatch(setGenericAlert({ message: "Le password non coincidono", type: "error" }));
                return;
            }
            if (vecchiaPassword == "" && (password !== "" || confermaPassword !== "")) {
                dispatch(setGenericAlert({ message: "Per modificare la password, inserire anche la password attuale", type: "info" }));
            }
            try {
                const newRowValues = { username, nome, cognome, password };
                const response = await api.put(`/utenti/${loggedUtente.id}`, {
                    newRowValues,
                    assocTablesAndIds: {
                        brano: [] //Non inserire nuovi brani associati all'utente in questo caso
                    },
                    deleteOldAssociationsFirst: false, // Non eliminare le associazioni esistenti con i brani
                    oldPassword: vecchiaPassword // Per sicurezza, chiedi la vecchia password
                });
                const utente = UtenteDbSchema.parse(response.data);
                dispatch(setUtente({
                    id: loggedUtente.id,
                    username: utente.username,
                    nome: utente.nome,
                    cognome: utente.cognome,
                    password: utente.password
                }));
                props.onRequestClose();
            } catch (error) {
                if (checkConnError(error)) {
                    dispatch(setGenericAlert({ message: "Impossibile connettersi al server. Controlla la tua connessione ad internet.", type: "error" }));
                } else {
                    dispatch(setGenericAlert({ message: "Impossibile salvare le informazioni del tuo utente. Si è verificato un errore.", type: "error" }));
                }
            }
        } else {
            dispatch(setGenericAlert({ message: "Errore: utente non loggato", type: "error" }));
        }
    }

    async function logout() {
        try {
            await api.delete("/logout", { withCredentials: true });
            dispatch(setUtente(null));
            props.onRequestClose();
        } catch (error) {
            //Qui devi mostrare un toast di errore
        }
    }

    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.onRequestClose}
            overlayClassName={modalsOverlayClassName()}
            className={modalsContentClassName()}
        >
            <ModalWrapper title="Aggiorna Utente" onRequestClose={props.onRequestClose}>
                <button onClick={() => { logout(); }}>Logout</button>
                <h2>Le mie informazioni</h2>
                <form onSubmit={onSubmit}>
                    <input type="text" defaultValue={loggedUtente ? loggedUtente.username : ''} placeholder="Username" required />
                    <input type="text" defaultValue={loggedUtente ? loggedUtente.nome : ''} placeholder="Nome" required />
                    <input type="text" defaultValue={loggedUtente ? loggedUtente.cognome : ''} placeholder="Cognome" required />
                    <input type="password" placeholder="Nuova Password" />
                    <input type="password" placeholder="Conferma Nuova Password" />
                    <input type="password" placeholder="Password Attuale" />
                    <button type="submit">Aggiorna</button>
                </form>
            </ModalWrapper>
        </Modal>
    );
}

export default ModalAggiornaUtente;
