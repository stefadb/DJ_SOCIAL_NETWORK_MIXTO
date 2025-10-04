import React, { useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../api';
import { type UtenteDb } from '../../types/db_types';
import { closeModal } from '../../store/modalNuovoPassaggioSlice';
import { checkConnError, modalsContentClassName, modalsOverlayClassName, scaleTwProps } from '../../functions/functions';
import { setGenericAlert } from '../../store/errorSlice';

function ModalNuovoPassaggio() {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
    const isOpen = useSelector((state: RootState) => state.modalNuovoPassaggio.isOpen);
    const brano1 = useSelector((state: RootState) => state.giradischi.brano1);
    const brano2 = useSelector((state: RootState) => state.giradischi.brano2);
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
    const [testo, setTesto] = useState<string>('');
    const [inizioSecondoBrano, setInizioSecondoBrano] = useState<string>('00:00:00');
    const [cueSecondoBrano, setCueSecondoBrano] = useState<string>('00:00:00');

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!brano1 || !brano2) {
            dispatch(setGenericAlert({ message: "Devi selezionare entrambi i brani sulla consolle prima di pubblicare un passaggio", type: "info" }));
            return;
        }
        if (!loggedUtente) {
            dispatch(setGenericAlert({ message: "Devi essere loggato per pubblicare un passaggio", type: "info" }));
            return;
        }
        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            await api.post('/passaggi', {
                newRowValues: {
                    testo,
                    inizio_secondo_brano: inizioSecondoBrano,
                    cue_secondo_brano: cueSecondoBrano,
                    data_pubblicazione: timestamp,
                    id_utente: loggedUtente.id,
                    id_brano_1: brano1.id,
                    id_brano_2: brano2.id
                }
            });
            setTesto('');
            setInizioSecondoBrano('00:00:00');
            setCueSecondoBrano('00:00:00');
            dispatch(closeModal());
            dispatch(setGenericAlert({ message: "Passaggio pubblicato con successo. Lo trovi nella pagina dedicata al tuo utente!", type: "info" }));
        } catch (error) {
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: "Impossibile connettersi al server. Controlla la tua connessione ad internet.", type: "error" }));
            } else {
                dispatch(setGenericAlert({ message: "Impossibile salvare le informazioni del tuo utente. Si è verificato un errore.", type: "error" }));
            }
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => dispatch(closeModal())}
            overlayClassName={modalsOverlayClassName()}
            className={modalsContentClassName()}
        >
            <h2>Pubblica Nuovo Passaggio</h2>

            {(!brano1 || !brano2) && (
                <div className="text-red-500 mb-3">
                    ⚠️ Seleziona entrambi i brani sulla consolle prima di continuare
                </div>
            )}

            {brano1 && brano2 && (
                <div className="mb-[20px] p-3 border border-[#ccc]">
                    <h4>Brani selezionati:</h4>
                    <p><strong>Brano 1:</strong> {brano1.titolo}</p>
                    <p><strong>Brano 2:</strong> {brano2.titolo}</p>
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div className="mb-4">
                    <label htmlFor="testo">Descrizione del passaggio:</label>
                    <textarea className="p-2 w-full"
                        id="testo"
                        value={testo}
                        onChange={(e) => setTesto(e.target.value)}
                        placeholder="Descrivi come eseguire questo passaggio..."
                        required
                        rows={4}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="inizioSecondoBrano">Inizio secondo brano (HH:MM:SS):</label>
                    <input className="p-2 w-full"
                        type="text"
                        id="inizioSecondoBrano"
                        value={inizioSecondoBrano}
                        onChange={(e) => setInizioSecondoBrano(e.target.value)}
                        placeholder="es. 00:02:30"
                        pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="cueSecondoBrano">Cue secondo brano (HH:MM:SS):</label>
                    <input className="p-2 w-full"
                        type="text"
                        id="cueSecondoBrano"
                        value={cueSecondoBrano}
                        onChange={(e) => setCueSecondoBrano(e.target.value)}
                        placeholder="es. 00:01:45"
                        pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => dispatch(closeModal())}>
                        Annulla
                    </button>
                    <button type="submit" disabled={!brano1 || !brano2 || !loggedUtente}>
                        Pubblica Passaggio
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ModalNuovoPassaggio;