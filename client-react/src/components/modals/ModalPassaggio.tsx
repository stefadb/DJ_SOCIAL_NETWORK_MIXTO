import { useEffect, useState } from "react";
import { type PassaggioDb, type BranoDb, type UtenteDb, BranoDbSchema } from "../../types/db_types";
import CardCommento from "../cards/CardCommento";
import api from "../../api";
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { CommentoEUtenteSchema, PassaggioConUtenteSchema, ValutazioneEUtenteSchema, type CommentoEUtente, type PassaggioConBraniEUtente, type PassaggioConUtente, type ValutazioneEUtente } from "../../types/types";
import PagedList from "../PagedList";
import CardValutazione from "../cards/CardValutazione";
import CardPassaggio from "../cards/CardPassaggio";
import { check404, checkConnError, checkUserNotLoggedError, getNoConnMessage, getUserNotLoggedMessage, inputTextClassName, modalsContentClassName, modalsOverlayClassName } from "../../functions/functions";
import { cleargenericMessage, setGenericAlert } from "../../store/errorSlice";
import ModalWrapper from "./ModalWrapper";
import { Check, MessageCircle, Star } from "react-feather";
import Caricamento from "../icons/Caricamento";
import Stella from "../icons/Stella";

function ModalPassaggio(props: { idPassaggio: number, onClose: () => void }) {
    Modal.setAppElement('#root');
    const [status, setStatus] = useState<"error" | "not-found" | "loading" | null>(null);
    const [passaggio, setPassaggio] = useState<PassaggioDb | null>(null);
    const [brano1, setBrano1] = useState<BranoDb | null>(null);
    const [brano2, setBrano2] = useState<BranoDb | null>(null);
    const [utente, setUtente] = useState<UtenteDb | null>(null);

    async function loadAll() {
        setStatus("loading");
        setPassaggio(null);
        setBrano1(null);
        setBrano2(null);
        setUtente(null);
        //E ora puoi caricare tutto quanto
        try {
            const responsePassaggio = await api.get("/passaggi/" + props.idPassaggio + "?include_utente");
            PassaggioConUtenteSchema.parse(responsePassaggio.data) as PassaggioConUtente;
            setPassaggio(responsePassaggio.data as PassaggioDb);
            setUtente(responsePassaggio.data.utente);
            const responseBrano1 = await api.get("/brani/esistenti/" + responsePassaggio.data.id_brano_1, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            BranoDbSchema.parse(responseBrano1.data);
            setBrano1(responseBrano1.data as BranoDb);
            const responseBrano2 = await api.get("/brani/esistenti/" + responsePassaggio.data.id_brano_2, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            BranoDbSchema.parse(responseBrano2.data);
            setBrano2(responseBrano2.data as BranoDb);
            setStatus(null);
        } catch (error) {
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
                setStatus("error");
            } else if (check404(error)) {
                setStatus("not-found");
            } else {
                setStatus("error");
            }
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    useEffect(() => {
        loadAll();
    }, []);

    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
    const [commentoInput, setCommentoInput] = useState<string>("");
    const [votoInput, setVotoInput] = useState<number>(5);
    const [showValutazioni, setShowValutazioni] = useState<boolean>(false);
    const [valutazioni, setValutazioni] = useState<ValutazioneEUtente[]>([]);
    const [savingCommento, setSavingCommento] = useState<boolean>(false);
    const [savingValutazione, setSavingValutazione] = useState<boolean>(false);
    const [salvaCommentoDisabled, setSalvaCommentoDisabled] = useState<boolean>(false);
    const [salvaValutazioneDisabled, setSalvaValutazioneDisabled] = useState<boolean>(false);
    const [eliminaDisabled, setEliminaDisabled] = useState<boolean>(false);
    const nonPuoiVotare = (loggedUtente !== null && valutazioni.some(valutazione => valutazione.utente_array[0].id === loggedUtente.id));
    const dispatch = useDispatch();
    async function inviaCommento() {
        if (commentoInput.length > 0 && loggedUtente && passaggio) {
            try {
                setSavingCommento(true);
                setSalvaCommentoDisabled(true);
                dispatch(setGenericAlert({ message: "Salvataggio del commento in corso...", type: "no-autoclose" }));
                await api.post("/commenti", {
                    newRowValues: {
                        testo: commentoInput,
                        data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        id_utente: loggedUtente.id,
                        id_passaggio: passaggio.id,
                        id_commento_padre: null
                    }
                });
                dispatch(cleargenericMessage());
                setCommentoInput("");
                setSavingCommento(false);
                setSalvaCommentoDisabled(false);
            } catch (error) {
                setSavingCommento(false);
                setSalvaCommentoDisabled(false);
                if (checkConnError(error)) {
                    dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
                } else if (checkUserNotLoggedError(error)) {
                    dispatch(setGenericAlert({ message: getUserNotLoggedMessage(), type: "error" }))
                } else {
                    dispatch(setGenericAlert({ message: "Impossibile salvare il commento. Si è verificato un errore.", type: "error" }));
                }
            }
        }
        if (!loggedUtente) {
            dispatch(setGenericAlert({ message: "Accedi per commentare il mix.", type: "info" }));
        }
    }

    async function inviaValutazione() {
        if (passaggio && loggedUtente) {
            try {
                setSavingValutazione(true);
                setSalvaValutazioneDisabled(true);
                dispatch(setGenericAlert({ message: "Salvataggio della valutazione in corso...", type: "no-autoclose" }));
                await api.post("/valutazioni", {
                    newRowValues: {
                        voto: votoInput,
                        id_utente: loggedUtente.id,
                        id_passaggio: passaggio.id
                    }
                });
                dispatch(cleargenericMessage());
                setSalvaValutazioneDisabled(false);
                //setVotoInput(5);
                setSavingValutazione(false);
            } catch (error) {
                setSalvaValutazioneDisabled(false);
                if (checkConnError(error)) {
                    dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
                } else if (checkUserNotLoggedError(error)) {
                    dispatch(setGenericAlert({ message: getUserNotLoggedMessage(), type: "error" }))
                } else {
                    dispatch(setGenericAlert({ message: "Impossibile salvare la valutazione. Si è verificato un errore.", type: "error" }));
                }
                setSavingValutazione(false);
            }
        }
        if (!loggedUtente) {
            dispatch(setGenericAlert({ message: "Accedi per valutare il mix.", type: "info" }));
        }
    }

    async function eliminaPassaggio() {
        if (loggedUtente && passaggio) {
            //Chiedi conferma prima di eliminare
            if (!confirm("Sei sicuro di voler eliminare questo mix dalla community?")) return;
            try {
                setEliminaDisabled(true);
                dispatch(setGenericAlert({ message: "Eliminazione del mix in corso...", type: "no-autoclose" }));
                await api.delete(`/passaggi/${passaggio.id}`);
                dispatch(cleargenericMessage());
                setEliminaDisabled(false);
                props.onClose();
            } catch (error) {
                setEliminaDisabled(false);
                if (checkConnError(error)) {
                    dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
                } else if (checkUserNotLoggedError(error)) {
                    dispatch(setGenericAlert({ message: getUserNotLoggedMessage(), type: "error" }))
                } else {
                    dispatch(setGenericAlert({ message: "Impossibile eliminare il mix dalla community. Si è verificato un errore.", type: "error" }));
                }

            }
        }
    }

    return (
        <Modal
            isOpen={true}
            onRequestClose={props.onClose}
            overlayClassName={modalsOverlayClassName()}
            className={modalsContentClassName()}
        >
            <ModalWrapper title="Passaggio" onRequestClose={props.onClose}>
                {!(passaggio && brano1 && brano2 && utente) &&
                    <div className="flex flex-row justify-center">
                        <Caricamento size="large" status={status !== null ? status : "loading"} />
                    </div>
                }
                {passaggio && brano1 && brano2 && utente &&
                    <>
                        {brano1 && brano2 &&
                            <CardPassaggio insideModal passaggio={passaggio} brano1={brano1} brano2={brano2} utente={utente} />
                        }
                        <div className="p-1">

                        </div>

                        {/* Commenti o valutazioni */}
                        <div className="border rounded-lg shadow-md-custom">
                            <div className="flex items-center justify-between px-3 pt-2 border-b border-[#eee]">
                                <b className="text-base">{showValutazioni ? "Voti" : "Commenti"}</b>
                                <button className="card-button rounded p-1" onClick={() => setShowValutazioni(v => !v)}>
                                    {showValutazioni ? <MessageCircle size={16} /> : <Star size={16} />}
                                    {showValutazioni ? "  Mostra i commenti" : "  Mostra i voti"}
                                </button>
                            </div>
                            {!showValutazioni &&
                                <div className="p-3">
                                    {savingCommento && <div>Salvataggio in corso...</div>}
                                    {!savingCommento &&
                                        <PagedList itemsPerPage={5} apiCall={`/commenti?passaggio=${passaggio.id}`} schema={CommentoEUtenteSchema} scrollMode="vertical" component={(element: CommentoEUtente) => {
                                            return <CardCommento commento={element} livello={0} />;
                                        }} showMoreButton={(onClick) => <div className="px-3 pb-2 pt-0"><button className="w-full card-button rounded rounded-tl-none p-1" onClick={onClick}>Carica altri commenti</button></div>}
                                            emptyMessage="😮 Non c'è ancora nessun commento qui"
                                            customLoading={<p>Caricamento...</p>}
                                            customError={<p>Impossibile caricare le risposte. Si è verificato un errore.</p>}
                                        />
                                    }
                                    <div className={"flex flex-row items-center pt-3"}>
                                        <div className="flex-grow">
                                            <textarea
                                                value={commentoInput}
                                                onChange={e => setCommentoInput(e.target.value)}
                                                placeholder="Aggiungi un commento"
                                                className={inputTextClassName()}
                                                rows={1}
                                            />
                                        </div>
                                        <div className="p-1">
                                            <button disabled={commentoInput.length === 0 || salvaCommentoDisabled} onClick={inviaCommento} className="card-button rounded p-2"><Check size={16} />  Invia</button>
                                        </div>
                                    </div>
                                </div>
                            }
                            {showValutazioni &&
                                <div className="p-3">
                                    {savingValutazione && <div>Salvataggio in corso...</div>}
                                    {!savingValutazione &&
                                        <PagedList itemsPerPage={10} apiCall={`/valutazioni?passaggio=${passaggio.id}`} schema={ValutazioneEUtenteSchema} scrollMode="vertical" passElementsToParent={setValutazioni} component={(element: ValutazioneEUtente) => {
                                            return <CardValutazione valutazione={element} />;
                                        }} showMoreButton={(onClick) => <div className="px-3"><button className="w-full card-button rounded p-1" onClick={onClick}>Carica altre valutazioni</button></div>}
                                            emptyMessage="😮 Nessuno ha ancora valutato questo mix"
                                            customLoading={<p>Caricamento...</p>}
                                            customError={<p>Impossibile caricare le risposte. Si è verificato un errore.</p>}
                                        />
                                    }
                                    {!nonPuoiVotare &&
                                        <>
                                            <p>Dai qui il tuo voto:</p>
                                            <div className="flex flex-row items-center mt-3">
                                                <div className="flex-grow flex flex-row">
                                                    <div onClick={() => setVotoInput(1)} className="w-[20%] cursor-pointer flex flex-row justify-center">
                                                        <Stella fill={votoInput >= 1 ? 1 : 0} size={24} bgColor="white" />
                                                    </div>
                                                    <div onClick={() => setVotoInput(2)} className="w-[20%] cursor-pointer flex flex-row justify-center">
                                                        <Stella fill={votoInput >= 2 ? 1 : 0} size={24} bgColor="white" />
                                                    </div>
                                                    <div onClick={() => setVotoInput(3)} className="w-[20%] cursor-pointer flex flex-row justify-center">
                                                        <Stella fill={votoInput >= 3 ? 1 : 0} size={24} bgColor="white" />
                                                    </div>
                                                    <div onClick={() => setVotoInput(4)} className="w-[20%] cursor-pointer flex flex-row justify-center">
                                                        <Stella fill={votoInput >= 4 ? 1 : 0} size={24} bgColor="white" />
                                                    </div>
                                                    <div onClick={() => setVotoInput(5)} className="w-[20%] cursor-pointer flex flex-row justify-center">
                                                        <Stella fill={votoInput >= 5 ? 1 : 0} size={24} bgColor="white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <button className="card-button rounded p-2" disabled={salvaValutazioneDisabled} onClick={inviaValutazione}><Check size={16} />Vota</button>
                                                </div>
                                            </div>
                                        </>
                                    }
                                    {nonPuoiVotare &&
                                        <p className="text-gray-500">Hai già valutato questo mix. Grazie!</p>
                                    }
                                </div>
                            }
                        </div>
                        {loggedUtente && passaggio.id_utente === loggedUtente.id &&
                            <button disabled={eliminaDisabled} onClick={eliminaPassaggio} className="m-4 px-3 py-2 bg-red-500 text-white border-none rounded cursor-pointer">Elimina il mix dalla community</button>
                        }
                        <div className="h-4" />
                    </>
                }
            </ModalWrapper>
        </Modal>
    );
};


export default ModalPassaggio;