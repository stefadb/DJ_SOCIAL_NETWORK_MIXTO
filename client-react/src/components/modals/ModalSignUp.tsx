import Modal from 'react-modal';
import api from '../../api';
import { checkConnError, getNoConnMessage, inputTextClassName, modalsContentClassName, modalsOverlayClassName} from '../../functions/functions';
import { setGenericAlert } from '../../store/errorSlice';
import { useDispatch } from 'react-redux';
import ModalWrapper from './ModalWrapper';
import { useRef, useState } from 'react';
import { AlertCircle, Search, User, UserCheck, UserX } from 'react-feather';
import z from 'zod';
import { UtenteDbSchema } from '../../types/db_types';

function ModalSignUp(props: { isOpen: boolean; onRequestClose: () => void; }) {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
    const [registrazioneDisabled, setRegistrazioneDisabled] = useState<boolean>(false);
    const [usernameAvailable, setUsernameAvailable] = useState<"not-checking" | "checking" | "available" | "unavailable" | "error">("not-checking");
    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        const username = (event.target as any)[0].value;
        const nome = (event.target as any)[1].value;
        const cognome = (event.target as any)[2].value;
        const password = (event.target as any)[3].value;
        const confermaPassword = (event.target as any)[4].value;
        if (password !== confermaPassword) {
            dispatch(setGenericAlert({ message: "Le password non coincidono", type: "error" }));
            return;
        }
        try {
            setRegistrazioneDisabled(true);
            dispatch(setGenericAlert({ message: "Registrazione in corso...", type: "no-autoclose" }));
            await api.post("/utenti", {
                newRowValues: { username, nome, cognome, password }
            });
            dispatch(setGenericAlert({ message: "Registrazione avvenuta con successo. Effettua il login per continuare.", type: "info" }));
            setRegistrazioneDisabled(false);
            props.onRequestClose();
        } catch (error) {
            setRegistrazioneDisabled(false);
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
            } else {
                dispatch(setGenericAlert({ message: "Impossibile effettuare la registrazione. Controlla i tuoi dati.", type: "error" }));
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
        if(username == ""){
            setUsernameAvailable("not-checking");
            return;
        }
        try {
            setUsernameAvailable("checking");
            const response = await api.get(`/utenti?username=${encodeURIComponent(username)}`);
            const users = z.array(UtenteDbSchema).parse(response.data);
            if (users.length > 0) {
                setUsernameAvailable("unavailable");
            } else {
                setUsernameAvailable("available");
            }
        } catch (error){
            if(checkConnError(error)){
                dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
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
            <ModalWrapper title="Registrati" onRequestClose={props.onRequestClose}>
                <form onSubmit={onSubmit}>
                    <div className="py-2">
                        <input type="text" className={inputTextClassName()} placeholder="Username" onInput={handleUsernameInput} required />
                    </div>
                    <div className="py-2 max-w-[210px]">
                        {usernameAvailable === "unavailable" && <span className="text-red-500"><UserX size={16}/> Username già occupato</span>}
                        {usernameAvailable === "available" && <span className="text-green-500"><UserCheck size={16}/> Username libero. Puoi usarlo!</span>}
                        {usernameAvailable === "not-checking" && <span className="text-gray-500"><User size={16}/> Digita uno username e controlleremo se è libero o già occupato!</span>}
                        {usernameAvailable === "checking" && <span className="text-gray-500"><Search size={16}/> Stiamo controllando se questo username è libero...</span>}
                        {usernameAvailable === "error" && <span className="text-red-500"><AlertCircle size={16}/> Errore durante il controllo disponibilità!</span>}
                    </div>
                    <div className="py-2">
                        <input type="text" className={inputTextClassName()} placeholder="Nome" required />
                    </div>
                    <div className="py-2">
                        <input type="text" className={inputTextClassName()} placeholder="Cognome" required />
                    </div>
                    <div className="py-2">
                        <input type="password" className={inputTextClassName()} placeholder="Password" required />
                    </div>
                    <div className="py-2">
                        <input type="password" className={inputTextClassName()} placeholder="Conferma Password" required />
                    </div>
                    <div className="py-2">
                        <button className="card-button rounded p-2 w-full" disabled={registrazioneDisabled || usernameAvailable !== "available"} type="submit">Registrati</button>
                    </div>
                </form>
            </ModalWrapper>
        </Modal>
    );
}

export default ModalSignUp;
