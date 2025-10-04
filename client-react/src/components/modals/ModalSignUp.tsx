import Modal from 'react-modal';
import api from '../../api';
import { checkConnError, modalsContentClassName, modalsOverlayClassName, scaleTwProps } from '../../functions/functions';
import { setGenericAlert } from '../../store/errorSlice';
import { useDispatch } from 'react-redux';
import ModalWrapper from './ModalWrapper';
import { useState } from 'react';

function ModalSignUp(props: { isOpen: boolean; onRequestClose: () => void; }) {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
    const [registrazioneDisabled, setRegistrazioneDisabled] = useState<boolean>(false);
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
            dispatch(setGenericAlert({ message: "Registrazione in corso...", type: "info" }));
            await api.post("/utenti", {
                newRowValues: { username, nome, cognome, password }
            });
            dispatch(setGenericAlert({ message: "Registrazione avvenuta con successo. Effettua il login per continuare.", type: "info" }));
            setRegistrazioneDisabled(false);
            props.onRequestClose();
        } catch (error) {
            setRegistrazioneDisabled(false);
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: "Impossibile connettersi al server. Controlla la tua connessione ad internet.", type: "error" }));
            } else {
                dispatch(setGenericAlert({ message: "Impossibile effettuare la registrazione. Controlla i tuoi dati.", type: "error" }));
            }
        }
    }

    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.onRequestClose}
            overlayClassName={modalsOverlayClassName()}
            className={modalsContentClassName()}
        >
            <ModalWrapper title="Sign Up" onRequestClose={props.onRequestClose}>
                <form onSubmit={onSubmit}>
                    <input type="text" placeholder="Username" required />
                    <input type="text" placeholder="Nome" required />
                    <input type="text" placeholder="Cognome" required />
                    <input type="password" placeholder="Password" required />
                    <input type="password" placeholder="Conferma Password" required />
                    <button disabled={registrazioneDisabled} type="submit">Sign Up</button>
                </form>
            </ModalWrapper>
        </Modal>
    );
}

export default ModalSignUp;
