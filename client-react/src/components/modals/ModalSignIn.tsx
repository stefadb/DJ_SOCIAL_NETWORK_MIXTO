import axios from 'axios';
import Modal from 'react-modal';
import { UtenteDbSchema } from '../../types/db_types';
import { useDispatch } from 'react-redux';
import { setUtente } from '../../store/userSlice';
import api from '../../api';
import { scaleTwProps } from '../../functions/functions';

function ModalSignIn(props: { isOpen: boolean; onRequestClose: () => void; }) {
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
            console.error("Errore nel login:", error);
        }
    }

    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.onRequestClose}
            style={{
                content: scaleTwProps("max-w-[400px] w-full mx-auto", 1)
            }}
        >
            <h2>Sign In</h2>
            <form onSubmit={onSubmit}>
                <input type="username" placeholder="Username" required />
                <input type="password" placeholder="Password" required />
                <button type="submit">Sign In</button>
            </form>
        </Modal>);
}

export default ModalSignIn;