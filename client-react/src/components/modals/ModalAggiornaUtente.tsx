import Modal from 'react-modal';
import { UtenteDbSchema, type UtenteDb } from '../../types/db_types';
import { useDispatch } from 'react-redux';
import { setUtente } from '../../store/userSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../api';
import { checkConnError, checkUserNotLoggedError, getNoConnMessage, getUserNotLoggedMessage, inputTextClassName, modalsContentClassName, modalsOverlayClassName} from '../../functions/functions';
import { cleargenericMessage, setGenericAlert } from '../../store/errorSlice';
import ModalWrapper from './ModalWrapper';
import { useRef, useState } from 'react';
import { AlertCircle, LogOut, Search, User, UserCheck, UserX } from 'react-feather';
import z from 'zod';
import { useNavigate } from 'react-router-dom';

function ModalAggiornaUtente(props: { isOpen: boolean; onRequestClose: () => void; }) {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutDisabled, setLogoutDisabled] = useState<boolean>(false);
    const [aggiornaDisabled, setAggiornaDisabled] = useState<boolean>(false);
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
    const [usernameAvailable, setUsernameAvailable] = useState<"not-checking" | "checking" | "available" | "unavailable" | "error">(loggedUtente ? "available" : "not-checking");
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
                setAggiornaDisabled(true);
                dispatch(setGenericAlert({ message: "Aggiornamento in corso...", type: "no-autoclose" }));
                const response = await api.put(`/utenti/${loggedUtente.id}`, {
                    newRowValues,
                    assocTablesAndIds: {
                        brano: [] //Non inserire nuovi brani associati all'utente in questo caso
                    },
                    deleteOldAssociationsFirst: false, // Non eliminare le associazioni esistenti con i brani
                    oldPassword: vecchiaPassword // Per sicurezza, chiedi la vecchia password
                });
                dispatch(cleargenericMessage());
                setAggiornaDisabled(false);
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
                setAggiornaDisabled(false);
                if (checkConnError(error)) {
                    dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
                } else if (checkUserNotLoggedError(error)) {
                    dispatch(setGenericAlert({ message: getUserNotLoggedMessage(), type: "error" }))
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
            setLogoutDisabled(true);
            dispatch(setGenericAlert({ message: "Logout in corso...", type: "no-autoclose" }));
            await api.delete("/logout", { withCredentials: true });
            dispatch(cleargenericMessage());
            setLogoutDisabled(false);
            dispatch(setUtente(null));
            props.onRequestClose();
        } catch (error) {
            setLogoutDisabled(false);
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
            } else if (checkUserNotLoggedError(error)) {
                dispatch(setGenericAlert({ message: getUserNotLoggedMessage(), type: "error" }))
            } else {
                dispatch(setGenericAlert({ message: "Impossibile effettuare il logout. Si è verificato un errore.", type: "error" }));
            }
        }
    }

    const debounceTimeout = useRef<number | undefined>(undefined);
    function handleUsernameInput(e: React.ChangeEvent<HTMLInputElement>) {
        setUsernameAvailable("not-checking");
        const newValue = e.target.value;
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => { checkUsernameAvailable(newValue) }, 500);
    }

    async function checkUsernameAvailable(username: string) {
        if (username == "") {
            setUsernameAvailable("not-checking");
            return;
        }
        try {
            setUsernameAvailable("checking");
            const response = await api.get(`/utenti?username=${encodeURIComponent(username)}`);
            const users = z.array(UtenteDbSchema).parse(response.data);
            if (users.length == 0 || (loggedUtente && users.length == 1 && users[0].id == loggedUtente.id)) {
                setUsernameAvailable("available");
            } else {
                setUsernameAvailable("unavailable");
            }
        } catch (error) {
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
            } else if (checkUserNotLoggedError(error)) {
                dispatch(setGenericAlert({ message: getUserNotLoggedMessage(), type: "error" }))
            }
            setUsernameAvailable("error");
        }
    }

    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.onRequestClose}
            overlayClassName={modalsOverlayClassName()}
            className={modalsContentClassName()}
        >
            <ModalWrapper title="" onRequestClose={props.onRequestClose}>
                <div className="py-2 flex flex-row flex-wrap">
                    <div className="p-2">
                        <button className="card-button rounded p-2" onClick={() => { navigate("/utente?id="+loggedUtente?.id);}} disabled={logoutDisabled}><User size={16}/> Il mio profilo</button>
                    </div>
                    <div className="p-2">
                        <button className="card-button rounded p-2" onClick={() => { logout(); }} disabled={logoutDisabled}><LogOut size={16}/> Logout</button>
                    </div>
                </div>
                <h2>Le mie informazioni</h2>
                <form onSubmit={onSubmit}>
                    <div className="py-2">
                        <input maxLength={50} type="text" className={inputTextClassName()} defaultValue={loggedUtente ? loggedUtente.username : ''} placeholder="Username" onInput={handleUsernameInput} required />
                    </div>
                    <div className="py-2 max-w-[210px]">
                        {usernameAvailable === "unavailable" && <span className="text-red-500"><UserX size={16} /> Username già occupato</span>}
                        {usernameAvailable === "available" && <span className="text-green-500"><UserCheck size={16} /> Username libero. Puoi usarlo!</span>}
                        {usernameAvailable === "not-checking" && <span className="text-gray-500"><User size={16} /> Digita uno username e controlleremo se è libero o già occupato!</span>}
                        {usernameAvailable === "checking" && <span className="text-gray-500"><Search size={16} /> Stiamo controllando se questo username è libero...</span>}
                        {usernameAvailable === "error" && <span className="text-red-500"><AlertCircle size={16} /> Errore durante il controllo disponibilità!</span>}
                    </div>
                    <div className="py-2">
                        <input maxLength={100} type="text" className={inputTextClassName()} defaultValue={loggedUtente ? loggedUtente.nome : ''} placeholder="Nome" required />
                    </div>
                    <div className="py-2">
                        <input maxLength={100} type="text" className={inputTextClassName()} defaultValue={loggedUtente ? loggedUtente.cognome : ''} placeholder="Cognome" required />
                    </div>
                    <div className="py-2">
                        <input maxLength={255} type="password" className={inputTextClassName()} placeholder="Nuova Password" />
                    </div>
                    <div className="py-2">
                        <input maxLength={255} type="password" className={inputTextClassName()} placeholder="Conferma Nuova Password" />
                    </div>
                    <div className="py-2">
                        <input maxLength={255} type="password" className={inputTextClassName()} placeholder="Password Attuale" />
                    </div>
                    <div className="py-2">
                        <button className="card-button rounded p-2 w-full" disabled={aggiornaDisabled || usernameAvailable !== "available"} type="submit">Aggiorna</button>
                    </div>
                </form>
            </ModalWrapper>
        </Modal>
    );
}

export default ModalAggiornaUtente;
