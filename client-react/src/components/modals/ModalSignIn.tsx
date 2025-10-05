import Modal from 'react-modal';
import { UtenteDbSchema } from '../../types/db_types';
import { useDispatch } from 'react-redux';
import { setUtente } from '../../store/userSlice';
import api from '../../api';
import { checkConnError, getNoConnMessage, inputTextClassName, modalsContentClassName, modalsOverlayClassName} from '../../functions/functions';
import { cleargenericMessage, setGenericAlert } from '../../store/errorSlice';
import ModalWrapper from './ModalWrapper';
import { useState } from 'react';

function ModalSignIn(props: { isOpen: boolean; onRequestClose: () => void; openSignUp: () => void; }) {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
    const [loginDisabled, setLoginDisabled] = useState<boolean>(false);
    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        // Gestisci il submit del form di login qui
        try {
            setLoginDisabled(true);
            dispatch(setGenericAlert({ message: "Login in corso...", type: "no-autoclose" }));
            const response = await api.post("/login", { username: (event.target as any)[0].value, password: (event.target as any)[1].value }, { withCredentials: true });
            setLoginDisabled(false);
            dispatch(cleargenericMessage())
            const utente = UtenteDbSchema.parse(response.data);
            dispatch(setUtente(utente));
            props.onRequestClose();
        } catch (error) {
            setLoginDisabled(false);
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
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
            <ModalWrapper title="Accedi" onRequestClose={props.onRequestClose}>
                <form onSubmit={onSubmit}>
                    <div className="py-2">
                        <input type="username" className={inputTextClassName()} placeholder="Username" required />
                    </div>
                    <div className="py-2">
                        <input type="password" className={inputTextClassName()} placeholder="Password" required />
                    </div>
                    <div className="py-2">
                        <button className="card-button rounded p-2 w-full" disabled={loginDisabled} type="submit">Accedi</button>
                    </div>
                </form>
                <div className="pt-2">
                    <span className="text-blue-500 text-center cursor-pointer w-full inline-block" onClick={() => { props.onRequestClose(); props.openSignUp(); }}>Non hai un account? Registrati</span>
                </div>
            </ModalWrapper>
        </Modal>);
}

export default ModalSignIn;