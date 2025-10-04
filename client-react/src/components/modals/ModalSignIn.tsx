import axios from 'axios';
import Modal from 'react-modal';
import { UtenteDbSchema } from '../../types/db_types';
import { useDispatch } from 'react-redux';
import { setUtente } from '../../store/userSlice';
import api from '../../api';
import { checkConnError, modalsContentClassName, modalsOverlayClassName, scaleTwProps } from '../../functions/functions';
import { setGenericAlert } from '../../store/errorSlice';
import ModalWrapper from './ModalWrapper';

function ModalSignIn(props: { isOpen: boolean; onRequestClose: () => void; }) {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        // Gestisci il submit del form di login qui
        try {
            const response = await api.post("/login", { username: (event.target as any)[0].value, password: (event.target as any)[1].value }, { withCredentials: true });
            const utente = UtenteDbSchema.parse(response.data);
            dispatch(setUtente(utente));
            props.onRequestClose();
        } catch (error) {
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: "Impossibile connettersi al server. Controlla la tua connessione ad internet.", type: "error" }));
            } else {
                dispatch(setGenericAlert({ message: "Impossibile effettuare il login. Controlla le tue credenziali.", type: "error" }));
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
            <ModalWrapper title="Sign In" onRequestClose={props.onRequestClose}>
                <form onSubmit={onSubmit}>
                    <input type="username" placeholder="Username" required />
                    <input type="password" placeholder="Password" required />
                    <button type="submit">Sign In</button>
                </form>
            </ModalWrapper>
        </Modal>);
}

export default ModalSignIn;