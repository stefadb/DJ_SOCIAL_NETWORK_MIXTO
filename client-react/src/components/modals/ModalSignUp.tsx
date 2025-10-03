import axios from 'axios';
import Modal from 'react-modal';
import api from '../../api';

function ModalSignUp(props: { isOpen: boolean; onRequestClose: () => void; }) {
    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        const username = (event.target as any)[0].value;
        const nome = (event.target as any)[1].value;
        const cognome = (event.target as any)[2].value;
        const password = (event.target as any)[3].value;
        const confermaPassword = (event.target as any)[4].value;
        if (password !== confermaPassword) {
            alert("Le password non coincidono");
            return;
        }
        try {
            await api.post("/utenti", {
                newRowValues: { username, nome, cognome, password }
            });
            props.onRequestClose();
        } catch (error) {
            console.error("Errore nella registrazione:", error);
        }
    }

    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.onRequestClose}
            className="max-w-[400px] w-full mx-auto"
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
