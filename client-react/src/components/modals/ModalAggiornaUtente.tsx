import Modal from 'react-modal';
import { UtenteDbSchema, type UtenteDb } from '../../types/db_types';
import { useDispatch } from 'react-redux';
import { setUtente } from '../../store/userSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../api';
import { scaleTwProps } from '../../functions/functions';

function ModalAggiornaUtente(props: { isOpen: boolean; onRequestClose: () => void; }) {
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
                alert("Le password non coincidono");
                return;
            }
            if (vecchiaPassword == "" && (password !== "" || confermaPassword !== "")) {
                alert("Per modificare la password, inserire anche la password attuale");
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
                console.error("Errore nell'aggiornamento utente:", error);
            }
        } else {
            alert("Errore: utente non loggato");
        }
    }

    async function logout() {
        try {
            await api.delete("/logout", { withCredentials: true });
            dispatch(setUtente(null));
            props.onRequestClose();
        } catch (error) {
            console.error("Errore nel logout:", error);
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
        </Modal>
    );
}

export default ModalAggiornaUtente;
