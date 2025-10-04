import axios from 'axios';
import Modal from 'react-modal';
import api from '../../api';
import { checkConnError, modalsContentClassName, modalsOverlayClassName, scaleTwProps } from '../../functions/functions';
import { setGenericAlert } from '../../store/errorSlice';
import { useDispatch } from 'react-redux';

function ModalSignUp(props: { isOpen: boolean; onRequestClose: () => void; }) {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
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
            await api.post("/utenti", {
                newRowValues: { username, nome, cognome, password }
            });
            props.onRequestClose();
        } catch (error) {
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
            <h2>Sign Up</h2>
            <form onSubmit={onSubmit}>
                <input type="text" placeholder="Username" required />
                <input type="text" placeholder="Nome" required />
                <input type="text" placeholder="Cognome" required />
                <input type="password" placeholder="Password" required />
                <input type="password" placeholder="Conferma Password" required />
                <button type="submit">Sign Up</button>
            </form>
        </Modal>
    );
}

export default ModalSignUp;
