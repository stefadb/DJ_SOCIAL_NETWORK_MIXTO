import { useState } from "react";
import { CommentoEUtenteSchema, type CommentoEUtente } from "../../types/types";
import PagedList from "../PagedList";
import api from "../../api";
import type { UtenteDb } from "../../types/db_types";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from 'javascript-time-ago';
import it from 'javascript-time-ago/locale/it';

TimeAgo.addLocale(it);

function CardCommento(props: { commento: CommentoEUtente, livello: number }) {
    const [commento, setCommento] = useState(props.commento);
    const minWidth = 60; // dimensione percentuale minima del commento (per il livello più profondo)
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
    const [showAnswerBox, setShowAnswerBox] = useState(false);
    const [editing, setEditing] = useState(false);
    const [answer, setAnswer] = useState(""); // Stato per il contenuto della risposta
    const [nuovoTesto, setNuovoTesto] = useState(commento.testo); // Stato per il testo modificato del commento
    const [sendingAnswer, setSendingAnswer] = useState(false); // Stato per indicare se la risposta è in fase di invio

    async function sendAnswer(){
        if (loggedUtente) {
            try {
                setSendingAnswer(true);
                await api.post("/commenti", {
                    newRowValues: {
                        testo: answer,
                        data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        id_utente: loggedUtente.id,
                        id_passaggio: commento.id_passaggio,
                        id_commento_padre: commento.id
                    }
                });
                setShowAnswerBox(false);
                setAnswer("");
                setSendingAnswer(false);
            } catch (error) {
                console.error("Errore durante l'invio della risposta:", error);
                setSendingAnswer(false);
            }
        }
    }

    async function salvaCommento(){
        // Logica per salvare il commento modificato
        if (loggedUtente) {
            try {
                const newData = new Date().toISOString().slice(0, 19).replace('T', ' ');
                await api.put(`/commenti/${commento.id}`, {
                    newRowValues: {
                        testo: nuovoTesto,
                        data_pubblicazione: newData,
                        id_utente: commento.id_utente,
                        id_passaggio: commento.id_passaggio,
                        id_commento_padre: commento.id_commento_padre
                    }
                });
                setCommento({ ...commento, testo: nuovoTesto, data_pubblicazione: newData });
                setEditing(false);
            } catch (error) {
                console.error("Errore durante il salvataggio del commento:", error);
            }
        }
    }

    function openAnswerBox() {
        if (loggedUtente) {
            setShowAnswerBox(true);
        } else {
            alert("Accedi per rispondere a questo commento");
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
            <div className="flex flex-col">
                <div className="w-full flex justify-end box-border py-1 px-0">
                    <div className="border border-black rounded-lg bg-[#f0f0f0] box-border p-2" style={{ width: minWidth + ((1.0 / props.livello) * (100 - minWidth)) + "%" }}>
                        {!editing &&
                            <>
                                <p>{commento.testo}</p>
                                <ReactTimeAgo date={new Date(commento.data_pubblicazione)} locale="it" />
                                {mioCommento() &&
                                    <button onClick={() => { setEditing(true); }}>Modifica</button>
                                }
                            </>
                        }
                        {editing &&
                            <>
                                <textarea className="w-full h-[100px]" value={nuovoTesto} onChange={(e) => { setNuovoTesto(e.target.value); }} />
                                <br />
                                <button onClick={() => { salvaCommento();}}>Salva</button>
                                <button onClick={() => { setEditing(false); setNuovoTesto(commento.testo);}}>Annulla</button>
                            </>
                        }
                        <br />
                        <b>{getNomeUtente()}</b>
                        <br />
                        {!showAnswerBox &&
                            <a className="hover-underline cursor-pointer text-blue-500" onClick={openAnswerBox}>Rispondi</a>
                        }
                    </div>
                </div>
                {showAnswerBox &&
                    <div className="w-full flex justify-end box-border pt-1 pb-1 pl-0 pr-0">
                        <div className="box-border p-2" style={{ width: minWidth + ((1.0 / (props.livello + 1)) * (100 - minWidth)) + "%" }}>
                            <textarea className="w-full h-[100px]" placeholder="Scrivi una risposta..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
                            <br />
                            <button onClick={() => { sendAnswer(); }} className="mt-4">Invia</button>
                            <button onClick={() => { setShowAnswerBox(false); setAnswer(""); }} className="mt-4">Annulla</button>
                        </div>
                    </div>
                }
                {!sendingAnswer &&
                    <PagedList itemsPerPage={5} apiCall={`/commenti?commentoPadre=${commento.id}`} schema={CommentoEUtenteSchema} scrollMode="vertical" component={(element: CommentoEUtente) => {
                        return <CardCommento commento={element} livello={props.livello + 1} />;
                    }} showMoreButton={(onClick) => <div className="flex justify-end"><button style={{ width: minWidth + ((1.0 / (props.livello + 1)) * (100 - minWidth)) + "%" }} onClick={onClick}>Carica altre risposte</button></div>
                    } emptyMessage={<></>}/>
                }
            </div>
        </>
    );

}

export default CardCommento;