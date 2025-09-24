


import React, { useEffect, useState } from "react";
import axios from "axios";
import { type PassaggioDb, type BranoDb, type UtenteDb, type CommentoDb, type ValutazioneDb, PassaggioDbSchema, UtenteDbSchema, BranoDbSchema, ValutazioneDbSchema, CommentoDbSchema } from "../../types/db_types";
import CardCommento from "../cards/CardCommento";
import z from "zod";


const PLACEHOLDER_USER = undefined;

function ModalPassaggio(props: { idPassaggio?: number; onClose: () => void }) {
    const [passaggio, setPassaggio] = useState<PassaggioDb | null>(null);
    const [brano1, setBrano1] = useState<BranoDb | null>(null);
    const [brano2, setBrano2] = useState<BranoDb | null>(null);
    const [utente, setUtente] = useState<UtenteDb | null>(null);
    const [commentiEUtenti, setCommentiEUtenti] = useState<{ commento: CommentoDb; utente: UtenteDb }[]>([]);
    const [valutazioniEUtenti, setValutazioniEUtenti] = useState<{ valutazione: ValutazioneDb; utente: UtenteDb }[]>([]);
    const [commentoInput, setCommentoInput] = useState<string>("");
    const [showValutazioni, setShowValutazioni] = useState<boolean>(false);
    const [valutazioneMedia, setValutazioneMedia] = useState<number>(0);

    useEffect(() => {
        loadPassaggio();
    }, []);

    useEffect(() => {
        if (props.idPassaggio) {
            loadPassaggio();
        }
    }, [props.idPassaggio]);

    async function loadPassaggio() {
        try {
            const response = await axios.get(`http://localhost:3000/passaggi/${props.idPassaggio}?include_utente`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            const apiSchema = PassaggioDbSchema.extend({
                utente: UtenteDbSchema.optional(),
            });
            type APIType = z.infer<typeof apiSchema>;
            const responseData: APIType = apiSchema.parse(response.data) as APIType;
            const responseBrano1 = await axios.get(`http://localhost:3000/brani/${responseData.id_brano_1}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
            const responseBrano2 = await axios.get(`http://localhost:3000/brani/${responseData.id_brano_2}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
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
        loadValutazioni();
        loadCommenti();
        loadValutazioneMedia();
    }, [passaggio?.id]);

    async function loadValutazioni() {
        if (passaggio !== null) {
            try {
                const response = await axios.get(`http://localhost:3000/valutazioni?passaggio=${passaggio.id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
                const apiSchema = z.array(ValutazioneDbSchema.extend({
                    utente: UtenteDbSchema.optional(),
                }));
                type APIType = z.infer<typeof apiSchema>;
                const responseData: APIType = apiSchema.parse(response.data) as APIType;
                setValutazioniEUtenti(responseData.map((item) => ({ valutazione: item as ValutazioneDb, utente: item.utente as UtenteDb })));
            } catch (error) {
                console.error("Error loading valutazioni:", error);
            }
        }
    }

    async function loadCommenti() {
        if (passaggio !== null) {
            try {
                const response = await axios.get(`http://localhost:3000/commenti?passaggio=${passaggio.id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
                const apiSchema = z.array(CommentoDbSchema.extend({
                    utente: UtenteDbSchema.optional(),
                }));
                type APIType = z.infer<typeof apiSchema>;
                const responseData: APIType = apiSchema.parse(response.data) as APIType;
                setCommentiEUtenti(responseData.map((item) => ({ commento: item as CommentoDb, utente: item.utente as UtenteDb })));
            } catch (error) {
                console.error("Error loading commenti:", error);
            }
        }
    }

    async function loadValutazioneMedia() {
        if (passaggio != null) {
            try {
                const response = await axios.get(`http://localhost:3000/valutazioni?mediaPassaggio=${passaggio.id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
                const responseData = z.number().parse(response.data);
                setValutazioneMedia(responseData);
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

    function renderStars(rating: number, max: number = 5) {
        //Se rating è un numero decimale, le stelle devono essere riempite parzialmente
        return (
            <span>
                {Array.from({ length: max }, (_, i) => (
                    <span key={i} style={{ color: i < rating ? "#FFD600" : "#CCC", fontSize: 20 }}>★</span>
                ))}
            </span>
        );
    }



    if (!passaggio) return <div style={{ padding: 32 }}>Caricamento...</div>;

    return (
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0002", maxWidth: 420, margin: "32px auto", padding: 0, position: "relative" }}>
            {/* Chiudi */}
            <button onClick={props.onClose} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>×</button>

            {/* Cover art */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
                <img src={brano1 ? `http://localhost:3000/album_pictures/${brano1.id_album}.jpg` : undefined} alt="cover1" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4, background: "#eee" }} />
                <span style={{ fontWeight: 500, color: "#888" }}>con</span>
                <img src={brano2 ? `http://localhost:3000/album_pictures/${brano2.id_album}.jpg` : undefined} alt="cover2" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4, background: "#eee" }} />
            </div>

            {/* Stelle e azioni */}
            <div style={{ display: "flex", alignItems: "center", margin: "12px 16px 0 16px" }}>
                {renderStars(valutazioneMedia, 5)}
                <span style={{ marginLeft: 8, color: "#888" }}>{valutazioneMedia}/{5}</span>
                <div style={{ marginLeft: "auto" }}>
                    <button style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>⋮</button>
                </div>
            </div>

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
                {!showValutazioni ? (
                    <div style={{ padding: 12 }}>
                        {commentiEUtenti.length === 0 && <div style={{ color: "#888", fontSize: 14 }}>Nessun commento</div>}
                        {commentiEUtenti.map((item) => {
                            return <CardCommento key={item.commento.id} commento={item.commento} utente={item.utente} />;
                        })}
                        <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
                            <input
                                type="text"
                                value={commentoInput}
                                onChange={e => setCommentoInput(e.target.value)}
                                placeholder="Aggiungi un commento"
                                style={{ flex: 1, border: "1px solid #ccc", borderRadius: 4, padding: 6, fontSize: 14 }}
                            />
                            <button onClick={() => { }} style={{ marginLeft: 8, padding: "6px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, cursor: "pointer" }}>Invia</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: 12 }}>
                        {valutazioniEUtenti.length === 0 && <div style={{ color: "#888", fontSize: 14 }}>Nessuna valutazione</div>}
                        {valutazioniEUtenti.map(item => (
                            <div key={item.valutazione.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                                <img src={PLACEHOLDER_USER} alt="avatar" style={{ width: 28, height: 28, borderRadius: "50%", marginRight: 8 }} />
                                <b>{item.utente.nome}</b>
                                <span style={{ marginLeft: 8 }}>{renderStars(item.valutazione.voto)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ height: 16 }} />
        </div>
    );
};


export default ModalPassaggio;