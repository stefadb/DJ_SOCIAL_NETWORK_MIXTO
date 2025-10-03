import { useState } from "react";
import { type PassaggioDb, type BranoDb, type UtenteDb} from "../../types/db_types";
import CardCommento from "../cards/CardCommento";
import api from "../../api";
import Modal from 'react-modal';
import { useSelector} from 'react-redux';
import type { RootState } from '../../store/store';
import { CommentoEUtenteSchema, ValutazioneEUtenteSchema, type CommentoEUtente, type ValutazioneEUtente } from "../../types/types";
import PagedList from "../PagedList";
import CardValutazione from "../cards/CardValutazione";
import CardPassaggio from "../cards/CardPassaggio";

function ModalPassaggio(props: {passaggio: PassaggioDb, brano1: BranoDb | null, brano2: BranoDb | null, utente: UtenteDb | null, onClose: () => void}) {
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
    const [commentoInput, setCommentoInput] = useState<string>("");
    const [votoInput, setVotoInput] = useState<string>("");
    const [showValutazioni, setShowValutazioni] = useState<boolean>(false);
    const [savingCommento, setSavingCommento] = useState<boolean>(false);
    const [savingValutazione, setSavingValutazione] = useState<boolean>(false);

    async function inviaCommento() {
        if (commentoInput.length > 0 && loggedUtente) {
            try {
                setSavingCommento(true);
                await api.post("/commenti", {
                    newRowValues: {
                        testo: commentoInput,
                        data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        id_utente: loggedUtente.id,
                        id_passaggio: props.passaggio.id,
                        id_commento_padre: null
                    }
                });
                setCommentoInput("");
                setSavingCommento(false);
            } catch (error) {
                console.error("Errore durante l'invio della risposta:", error);
                setSavingCommento(false);
            }
        }
        if (!loggedUtente) {
            alert("Accedi per commentare il passaggio.");
        }
    }

    async function inviaValutazione() {
        if (votoInput.length > 0 && loggedUtente && !isNaN(parseInt(votoInput)) && parseInt(votoInput) >= 1 && parseInt(votoInput) <= 5) {
            try {
                setSavingValutazione(true);
                await api.post("/valutazioni", {
                    newRowValues: {
                        voto: parseInt(votoInput),
                        id_utente: loggedUtente.id,
                        id_passaggio: props.passaggio.id
                    }
                });
                setVotoInput("");
                setSavingValutazione(false);
            } catch (error) {
                console.error("Errore durante l'invio della valutazione:", error);
                setSavingValutazione(false);
            }
        }
        if (!loggedUtente) {
            alert("Accedi per valutare il passaggio.");
        }
    }

    async function eliminaPassaggio() {
        if (loggedUtente) {
            //Chiedi conferma prima di eliminare
            if (!confirm("Sei sicuro di voler eliminare questo passaggio dalla community?")) return;
            try {
                await api.delete(`/passaggi/${props.passaggio.id}`);
                props.onClose();
            } catch (error) {
                console.error("Errore durante l'eliminazione del passaggio:", error);
            }
        }
    }

    return (
        <Modal
            isOpen={true}
            onRequestClose={props.onClose}
            className="max-w-[400px] w-full mx-auto"
        >
            <button onClick={props.onClose} className="absolute top-2 right-2 bg-none border-none text-[22px] cursor-pointer">×</button>

            {props.brano1 && props.brano2 &&
                <CardPassaggio insideModal passaggio={props.passaggio} brano1={props.brano1} brano2={props.brano2} utente={props.utente} size={"small"}/>
            }

            {/* Commenti o valutazioni */}
            <div className="mt-4 mx-4 mb-0 border border-[#eee] rounded-lg bg-[#fafafa]">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#eee]">
                    <b className="text-base">{showValutazioni ? "Valutazioni" : "Commenti"}</b>
                    <button className="text-xs bg-none border-none text-[#1976d2] cursor-pointer" onClick={() => setShowValutazioni(v => !v)}>
                        {showValutazioni ? "Torna ai commenti" : "Dai un voto anche tu"}
                    </button>
                </div>
                {!showValutazioni &&
                    <div className="p-3">
                        {savingCommento && <div>Salvataggio in corso...</div>}
                        {!savingCommento &&
                            <PagedList itemsPerPage={10} apiCall={`/commenti?passaggio=${props.passaggio.id}`} schema={CommentoEUtenteSchema} scrollMode="vertical" component={(element: CommentoEUtente) => {
                                return <CardCommento commento={element} livello={1} />;
                            }} showMoreButton={(onClick) => <button className="w-full" onClick={onClick}>Carica altri commenti</button>}
                                emptyMessage="😮 Non c'è ancora nessun commento qui" />
                        }
                        <div className={"flex items-center mt-3"}>
                            <input
                                type="text"
                                value={commentoInput}
                                onChange={e => setCommentoInput(e.target.value)}
                                placeholder="Aggiungi un commento"
                               className="flex-1 border border-[#ccc] rounded p-1 text-base"
                            />
                            <button disabled={commentoInput.length === 0} onClick={inviaCommento} className="ml-2 px-4 py-2 bg-[#1976d2] text-white border-none rounded text-base cursor-pointer">Invia</button>
                        </div>
                    </div>
                }
                {showValutazioni &&
                    <div className="p-3">
                        {savingValutazione && <div>Salvataggio in corso...</div>}
                        {!savingValutazione &&
                            <PagedList itemsPerPage={10} apiCall={`/valutazioni?passaggio=${props.passaggio.id}`} schema={ValutazioneEUtenteSchema} scrollMode="vertical" component={(element: ValutazioneEUtente) => {
                                return <CardValutazione valutazione={element} />;
                            }} showMoreButton={(onClick) => <button onClick={onClick}>Carica altre valutazioni</button>}
                                emptyMessage="😮 Nessuno ha ancora valutato questo passaggio" />
                        }
                        <div className="flex items-center mt-3">
                            <input type="number" min={1} max={5} value={votoInput} onChange={e => setVotoInput(e.target.value)} />
                            <button className="ml-2 px-[16px] py-2 bg-[#1976d2] text-white border-none rounded text-base cursor-pointer" disabled={votoInput.length === 0} onClick={inviaValutazione}>Vota</button>
                        </div>
                    </div>
                }
            </div>
            {loggedUtente && props.passaggio.id_utente === loggedUtente.id &&
                <button onClick={eliminaPassaggio} className="m-4 px-3 py-2 bg-red-500 text-white border-none rounded cursor-pointer">Elimina il passaggio dalla community</button>
            }
            <div className="h-4" />
        </Modal>
    );
};


export default ModalPassaggio;