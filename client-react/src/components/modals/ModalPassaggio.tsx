import { useEffect, useState } from "react";
import { type PassaggioDb, type BranoDb, type UtenteDb, PassaggioDbSchema, UtenteDbSchema, BranoDbSchema } from "../../types/db_types";
import CardCommento from "../cards/CardCommento";
import z from "zod";
import api from "../../api";
import Modal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { closeModal } from '../../store/modalPassaggioSlice';
import Stelle from "../Stelle";
import { CommentoEUtenteSchema, DigitDotDigitSchema, ValutazioneEUtenteSchema, type CommentoEUtente, type DigitDotDigit, type ValutazioneEUtente } from "../../types/types";
import PagedList from "../PagedList";
import CardValutazione from "../cards/CardValutazione";
import { openModal } from "../../store/modalNuovoPassaggioSlice";
import { setBrano1 as setBrano1ToNuovoPassaggio } from "../../store/giradischiSlice";
import { setBrano2 as setBrano2ToNuovoPassaggio } from "../../store/giradischiSlice";


const PLACEHOLDER_USER = undefined;

function ModalPassaggio() {
    const dispatch = useDispatch();
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
    const idPassaggio = useSelector((state: RootState) => state.modalPassaggio.idPassaggio);
    const isOpen = useSelector((state: RootState) => state.modalPassaggio.isOpen);
    const [passaggio, setPassaggio] = useState<PassaggioDb | null>(null);
    const [brano1, setBrano1] = useState<BranoDb | null>(null);
    const [brano2, setBrano2] = useState<BranoDb | null>(null);
    const [utente, setUtente] = useState<UtenteDb | null>(null);
    const [commentoInput, setCommentoInput] = useState<string>("");
    const [votoInput, setVotoInput] = useState<string>("");
    const [showValutazioni, setShowValutazioni] = useState<boolean>(false);
    const [valutazioneMedia, setValutazioneMedia] = useState<DigitDotDigit | null>(null);
    const [savingCommento, setSavingCommento] = useState<boolean>(false);
    const [savingValutazione, setSavingValutazione] = useState<boolean>(false);

    useEffect(() => {
        if (idPassaggio) {
            loadPassaggio();
        }
    }, []);

    useEffect(() => {
        if (idPassaggio) {
            loadPassaggio();
        }
    }, [idPassaggio]);

    async function loadPassaggio() {
        try {
            const response = await api.get(`/passaggi/${idPassaggio}?include_utente`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            const apiSchema = PassaggioDbSchema.extend({
                utente: UtenteDbSchema.optional(),
            });
            type APIType = z.infer<typeof apiSchema>;
            const responseData: APIType = apiSchema.parse(response.data) as APIType;
            const responseBrano1 = await api.get(`/brani/esistenti/${responseData.id_brano_1}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            const responseBrano2 = await api.get(`/brani/esistenti/${responseData.id_brano_2}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            setPassaggio(responseData);
            BranoDbSchema.parse(responseBrano1.data);
            BranoDbSchema.parse(responseBrano2.data);
            setBrano1(responseBrano1.data);
            setBrano2(responseBrano2.data);
            setUtente(responseData.utente ? responseData.utente : null);
        } catch (error) {
            console.error("Errore nel recupero del passaggio:", error);
        }
    }

    //Quando il passaggio cambia, carica i commenti e le valutazioni
    useEffect(() => {
        loadValutazioneMedia();
    }, [passaggio?.id]);

    async function loadValutazioneMedia() {
        if (passaggio != null) {
            try {
                const response = await api.get(`/valutazioni/media?passaggio=${passaggio.id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
                const ValutazioniMedieSchema = z.array(z.object({ id_passaggio: z.number(), voto_medio: DigitDotDigitSchema }));
                //L'array deve contenere esattamente un elemento perche stiamo considerando un passaggio
                type ValutazioniMedie = z.infer<typeof ValutazioniMedieSchema>;
                const responseData: ValutazioniMedie = ValutazioniMedieSchema.parse(response.data);
                if (responseData.length === 1) {
                    setValutazioneMedia(responseData[0].voto_medio);
                } else {
                    setValutazioneMedia(null);
                }
            } catch (error) {
                console.error("Error loading valutazioni:", error);
            }
        }
    }

    /*
    function handleAggiungiCommento() {
        if (!commentoInput.trim()) return;
        // Qui dovresti fare una POST API, ma per ora aggiorniamo localmente
        setCommenti([
            ...commenti,
            {
                id: Date.now(),
                        autore: {
                            id: 0,
                            nome: "Tu",
                            username: "tu",
                            cognome: "",
                            password: "",
                        } as UtenteDb,
                testo: commentoInput,
                rating: 0,
                data: new Date().toISOString(),
            },
        ]);
        setCommentoInput("");
    }
    */

    async function inviaCommento() {
        if (commentoInput.length > 0 && loggedUtente) {
            try {
                setSavingCommento(true);
                await api.post("/commenti", {
                    newRowValues: {
                        testo: commentoInput,
                        data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        id_utente: loggedUtente.id,
                        id_passaggio: idPassaggio,
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
        if (votoInput.length > 0 && loggedUtente && passaggio && !isNaN(parseInt(votoInput)) && parseInt(votoInput) >= 1 && parseInt(votoInput) <= 5) {
            try {
                setSavingValutazione(true);
                await api.post("/valutazioni", {
                    newRowValues: {
                        voto: parseInt(votoInput),
                        id_utente: loggedUtente.id,
                        id_passaggio: passaggio.id
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
        if (loggedUtente && passaggio) {
            //Chiedi conferma prima di eliminare
            if (!confirm("Sei sicuro di voler eliminare questo passaggio dalla community?")) return;
            try {
                await api.delete(`/passaggi/${passaggio.id}`);
                dispatch(closeModal());
            } catch (error) {
                console.error("Errore durante l'eliminazione del passaggio:", error);
            }
        }
    }

    if (!passaggio) return <div style={{ padding: 32 }}>Caricamento...</div>;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => dispatch(closeModal())}
            style={{ content: { maxWidth: "400px", width: "100%", margin: "auto" } }}
        >
            {/* Chiudi */}
            <button onClick={() => dispatch(closeModal())} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>×</button>

            {/* Cover art */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
                <img src={brano1 ? `http://localhost:3000/album_pictures/${brano1.id_album}.jpg` : undefined} alt="cover1" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4, background: "#eee" }} />
                <span style={{ fontWeight: 500, color: "#888" }}>con</span>
                <img src={brano2 ? `http://localhost:3000/album_pictures/${brano2.id_album}.jpg` : undefined} alt="cover2" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4, background: "#eee" }} />
            </div>

            {/* Stelle e azioni */}
            {valutazioneMedia !== null &&
                <div style={{ display: "flex", alignItems: "center", margin: "12px 16px 0 16px" }}>
                    <Stelle rating={valutazioneMedia} />
                    <span style={{ marginLeft: 8, color: "#888" }}>{valutazioneMedia}/{5}</span>
                    <div style={{ marginLeft: "auto" }}>
                        <button onClick={() => {
                            dispatch(setBrano1ToNuovoPassaggio(brano1));
                            dispatch(setBrano2ToNuovoPassaggio(brano2));
                            dispatch(closeModal())
                            dispatch(openModal());
                        }}>Crea un nuovo passaggio con questi brani</button>
                    </div>
                </div>
            }
            {valutazioneMedia === null &&
                <div style={{ display: "flex", alignItems: "center", margin: "12px 16px 0 16px" }}>
                    <span style={{ color: "#888" }}>Nessuna valutazione</span>
                </div>
            }
            {/* Autore e dettagli passaggio */}
            <div style={{ margin: "12px 16px 0 16px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    {utente &&
                        <>
                            <img src={PLACEHOLDER_USER} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 8 }} />
                            <b>{utente.nome}</b>
                            <span style={{ marginLeft: 8, color: "#888", fontSize: 13 }}>ha pubblicato questo passaggio</span>
                        </>
                    }
                    {!utente &&
                        <>
                            <img src={PLACEHOLDER_USER} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 8 }} />
                            <b>...</b>
                            <span style={{ marginLeft: 8, color: "#888", fontSize: 13 }}>...</span>
                        </>
                    }
                </div>
                <div style={{ marginTop: 8, color: "#222" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span role="img" aria-label="cue">⏱️</span>
                        Posizione CUE secondo brano: <span style={{ color: "#1976d2", cursor: "pointer" }}>{passaggio.cue_secondo_brano}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span role="img" aria-label="partenza">⏰</span>
                        Partenza secondo brano: <span style={{ color: "#1976d2", cursor: "pointer" }}>{passaggio.inizio_secondo_brano}</span>
                    </div>
                    <div style={{ marginLeft: 24, color: "#888", fontStyle: "italic", fontSize: 13 }}>{passaggio.testo}</div>
                </div>
            </div>

            {/* Commenti o valutazioni */}
            <div style={{ margin: "16px 16px 0 16px", border: "1px solid #eee", borderRadius: 8, background: "#fafafa" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                    <b style={{ fontSize: 15 }}>{showValutazioni ? "Valutazioni" : "Commenti"}</b>
                    <button style={{ fontSize: 13, background: "none", border: "none", color: "#1976d2", cursor: "pointer" }} onClick={() => setShowValutazioni(v => !v)}>
                        {showValutazioni ? "Torna ai commenti" : "Dai un voto anche tu"}
                    </button>
                </div>
                {!showValutazioni &&
                    <div style={{ padding: 12 }}>
                        {savingCommento && <div>Salvataggio in corso...</div>}
                        {!savingCommento &&
                            <PagedList itemsPerPage={10} apiCall={`/commenti?passaggio=${passaggio.id}`} schema={CommentoEUtenteSchema} component={(element: CommentoEUtente) => {
                                return <CardCommento commento={element} livello={1} />;
                            }} showMoreButton={(onClick) => <button style={{ width: "100%" }} onClick={onClick}>Carica altri commenti</button>} />
                        }
                        <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
                            <input
                                type="text"
                                value={commentoInput}
                                onChange={e => setCommentoInput(e.target.value)}
                                placeholder="Aggiungi un commento"
                                style={{ flex: 1, border: "1px solid #ccc", borderRadius: 4, padding: 6, fontSize: 14 }}
                            />
                            <button disabled={commentoInput.length === 0} onClick={inviaCommento} style={{ marginLeft: 8, padding: "6px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}>Invia</button>
                        </div>
                    </div>
                }
                {showValutazioni &&
                    <div style={{ padding: 12 }}>
                        {savingValutazione && <div>Salvataggio in corso...</div>}
                        {!savingValutazione &&
                            <PagedList itemsPerPage={10} apiCall={`/valutazioni?passaggio=${passaggio.id}`} schema={ValutazioneEUtenteSchema} component={(element: ValutazioneEUtente) => {
                                return <CardValutazione valutazione={element} />;
                            }} showMoreButton={(onClick) => <button onClick={onClick}>Carica altre valutazioni</button>} />
                        }
                        <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
                            <input type="number" min={1} max={5} value={votoInput} onChange={e => setVotoInput(e.target.value)} />
                            <button disabled={votoInput.length === 0} onClick={inviaValutazione} style={{ marginLeft: 8, padding: "6px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}>Vota</button>
                        </div>
                    </div>
                }
            </div>
            {loggedUtente && passaggio.id_utente === loggedUtente.id &&
                <button onClick={eliminaPassaggio} style={{ margin: "16px", padding: "8px 12px", background: "red", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Elimina il passaggio dalla community</button>
            }
            <div style={{ height: 16 }} />
        </Modal>
    );
};


export default ModalPassaggio;