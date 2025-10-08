import { useState } from "react";
import { CommentoEUtenteSchema, type CommentoEUtente } from "../../types/types";
import PagedList from "../PagedList";
import api from "../../api";
import type { UtenteDb } from "../../types/db_types";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from 'javascript-time-ago';
import it from 'javascript-time-ago/locale/it';
import { checkConnError, checkUserNotLoggedError, defaultArtistaPicture, getNoConnMessage, getUserNotLoggedMessage, inputTextClassName } from "../../functions/functions";
import { cleargenericMessage, setGenericAlert } from "../../store/errorSlice";
import { Check, Edit3, MessageCircle, X } from "react-feather";
import CommentoTree from "../CommentoTree";
import { useNavigate } from "react-router-dom";

TimeAgo.addLocale(it);

function CardCommento(props: { commento: CommentoEUtente, livello: number }) {
    const levelWidthStep = 10;
    const maxLivello = 4;
    const [commento, setCommento] = useState(props.commento);
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
    const [showAnswerBox, setShowAnswerBox] = useState(false);
    const [editing, setEditing] = useState(false);
    const [salvaCommentoDisabled, setSalvaCommentoDisabled] = useState<boolean>(false); // Stato per disabilitare il pulsante di salvataggio del commento
    const [inviaRispostaDisabled, setInviaRispostaDisabled] = useState<boolean>(false); // Stato per disabilitare il pulsante di invio risposta
    const [answer, setAnswer] = useState(""); // Stato per il contenuto della risposta
    const [nuovoTesto, setNuovoTesto] = useState(commento.testo); // Stato per il testo modificato del commento
    const [sendingAnswer, setSendingAnswer] = useState(false); // Stato per indicare se la risposta è in fase di invio
    const dispatch = useDispatch();
    const navigate = useNavigate();
    async function sendAnswer() {
        if (loggedUtente) {
            try {
                setSendingAnswer(true);
                setInviaRispostaDisabled(true);
                dispatch(setGenericAlert({ message: "Invio della risposta in corso...", type: "no-autoclose" }));
                await api.post("/commenti", {
                    newRowValues: {
                        testo: answer,
                        data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        id_utente: loggedUtente.id,
                        id_passaggio: commento.id_passaggio,
                        id_commento_padre: commento.id
                    }
                });
                dispatch(cleargenericMessage());
                setInviaRispostaDisabled(false);
                setShowAnswerBox(false);
                setAnswer("");
                setSendingAnswer(false);
            } catch (error) {
                setInviaRispostaDisabled(false);
                setSendingAnswer(false);
                if (checkConnError(error)) {
                    dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
                } else if (checkUserNotLoggedError(error)) {
                    dispatch(setGenericAlert({ message: getUserNotLoggedMessage(), type: "error" }))
                } else {
                    dispatch(setGenericAlert({ message: "Impossibile salvare il commento. Si è verificato un errore.", type: "error" }));
                }
            }
        }
    }

    async function salvaCommento() {
        // Logica per salvare il commento modificato
        if (loggedUtente) {
            try {
                const newData = new Date().toISOString().slice(0, 19).replace('T', ' ');
                setSalvaCommentoDisabled(true);
                dispatch(setGenericAlert({ message: "Salvataggio del commento in corso...", type: "no-autoclose" }));
                await api.put(`/commenti/${commento.id}`, {
                    newRowValues: {
                        testo: nuovoTesto,
                        data_pubblicazione: newData,
                        id_utente: commento.id_utente,
                        id_passaggio: commento.id_passaggio,
                        id_commento_padre: commento.id_commento_padre
                    }
                });
                dispatch(cleargenericMessage());
                setSalvaCommentoDisabled(false);
                setCommento({ ...commento, testo: nuovoTesto, data_pubblicazione: newData });
                setEditing(false);
            } catch (error) {
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
    }

    function openAnswerBox() {
        if (loggedUtente) {
            setShowAnswerBox(true);
        } else {
            dispatch(setGenericAlert({ message: "Accedi per rispondere a questo commento", type: "info" }));
        }
    }

    function mioCommento(): boolean {
        return commento.utente_array[0] !== undefined && commento.utente_array.length == 1 && commento.utente_array[0].id === loggedUtente?.id;
    }

    function getNomeUtente(): string {
        return commento.utente_array[0] !== undefined && commento.utente_array.length == 1 ? commento.utente_array[0].nome + " " + commento.utente_array[0].cognome + (mioCommento() ? " (tu)" : "") : "Utente sconosciuto";
    }

    return (
        <>
            <div className="flex flex-col w-full overflow-x-hidden">
                <div className="w-full flex flex-row items-stretch justify-end box-border px-0">
                    <CommentoTree livello={props.livello} />
                    <div className="box-border p-2" style={{ width: 100 - props.livello * levelWidthStep + "%" }}>
                        <div className={"flex flex-row items-center " + (commento.utente_array[0] ? ("cursor-pointer") : "")} onClick={commento.utente_array[0] ? () => {navigate(`/utente?id=${commento.utente_array[0].id}`); } : () => {}} >
                            <div className="pr-2">
                                <img onError={defaultArtistaPicture} className="rounded-full shadow-md w-8 h-8"/*no custom*/ src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo"} />
                            </div>
                            <div className="flex-grow">
                                <b>{getNomeUtente()} <span className="font-normal truncate">(<ReactTimeAgo date={new Date(commento.data_pubblicazione)} locale="it" />)</span></b>
                            </div>
                        </div>
                        {!editing &&
                            <>
                                <p className="my-0 italic text-gray-500"><MessageCircle size={16} /> {commento.testo}  {mioCommento() &&
                                    <button className="card-button rounded p-1" onClick={() => { setEditing(true); }}><Edit3 size={16} /></button>
                                }</p>
                            </>
                        }
                        {editing &&
                            <>
                                <textarea rows={1} className={inputTextClassName()} value={nuovoTesto} onChange={(e) => { setNuovoTesto(e.target.value); }} />
                                <br />
                                <div className="flex flex-row flex-wrap">
                                    <div className="p-1">
                                        <button className="card-button rounded p-1" disabled={salvaCommentoDisabled} onClick={() => { salvaCommento(); }}><Check size={16} />  Salva</button>
                                    </div>
                                    <div className="p-1">
                                        <button className="card-button rounded p-1" onClick={() => { setEditing(false); setNuovoTesto(commento.testo); }}><X size={16} />  Annulla</button>
                                    </div>
                                </div>
                            </>
                        }
                        {!showAnswerBox && !editing && props.livello < maxLivello &&
                            <a className="hover-underline cursor-pointer text-blue-500" onClick={openAnswerBox}>Rispondi</a>
                        }
                    </div>
                </div>
                {showAnswerBox &&
                    <div className="w-full flex justify-end items-stretch box-border px-0">
                        <CommentoTree livello={props.livello + 1} />
                        <div className="box-border p-2" style={{ width: 100 - (props.livello + 1) * levelWidthStep + "%" }}>
                            <textarea rows={1} className={inputTextClassName()} placeholder="Scrivi una risposta..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
                            <div className="flex flex-row flex-wrap">
                                <div className="p-1">
                                    <button className="card-button rounded p-1" disabled={inviaRispostaDisabled} onClick={() => { sendAnswer(); }}><Check size={16} />  Invia</button>
                                </div>
                                <div className="p-1">
                                    <button className="card-button rounded p-1" onClick={() => { setShowAnswerBox(false); setAnswer(""); }}><X size={16} />  Annulla</button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {!sendingAnswer &&
                    <PagedList itemsPerPage={5} apiCall={`/commenti?commentoPadre=${commento.id}`} schema={CommentoEUtenteSchema} scrollMode="vertical" component={(element: CommentoEUtente) => {
                        return <CardCommento commento={element} livello={props.livello + 1} />;
                    }} showMoreButton={(onClick) => <div className="flex items-stretch justify-end px-0">
                        <CommentoTree livello={props.livello + 1} />
                        <div style={{ width: 100 - (props.livello + 1) * levelWidthStep + "%" }} className="box-border px-3 pb-2 pt-0">
                            <button className="card-button rounded rounded-tl-none p-1 w-full" onClick={onClick}>Carica altre risposte</button>
                        </div>
                    </div>
                    } emptyMessage={<></>} 
                    customLoading={<p>Caricamento...</p>} 
                    customError={<p>Impossibile caricare le risposte. Si è verificato un errore.</p>}
                    />
                }
            </div >
        </>
    );

}

export default CardCommento;