import { useEffect, useState, useRef } from "react";
import type { BranoDb, UtenteDb } from "../../types/db_types";
import { useDispatch, useSelector } from "react-redux";
import { setBrano1 } from "../../store/giradischiSlice";
import { setBrano2 } from "../../store/giradischiSlice";
import CardBrano from "../cards/CardBrano";
import type { RootState } from "../../store/store";
import Modal from "react-modal";
import { checkConnError, checkUserNotLoggedError, getNoConnMessage, getUserNotLoggedMessage, inputTextClassName, modalsContentClassName, modalsOverlayClassName } from "../../functions/functions";
import ModalWrapper from "./ModalWrapper";
import { ArrowRight, Info, UploadCloud, X } from "react-feather";
import { closeModal } from "../../store/modalNuovoPassaggioSlice";
import { setGenericAlert } from "../../store/errorSlice";
import api from "../../api";

function ModalNuovoPassaggio() {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
    const arrowSize = 16;
    const combinedCardBranoWidth = 396 + arrowSize; //+16 perchè rispetto alla Consolle qui c'è anche l'icona della stella
    const [scale, setScale] = useState<number>(1);
    const riferimentoRef = useRef<HTMLDivElement>(null);
    const brano1: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano1);
    const brano2: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano2);
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);
    const [testo, setTesto] = useState<string>('');
    const [pubblicaDisabled, setPubblicaDisabled] = useState<boolean>(false);
    const [inizioSecondoBrano, setInizioSecondoBrano] = useState<string>('');
    const [cueSecondoBrano, setCueSecondoBrano] = useState<string>('');

    // ResizeObserver per aggiornare scale
    useEffect(configureResizeObserver, []);

    function configureResizeObserver() {
        const node = riferimentoRef.current;
        if (!node) {
            setTimeout(configureResizeObserver, 10);
        } else {
            const updateScale = () => {
                const width = node.offsetWidth;
                setScale(Math.min(width / combinedCardBranoWidth, 1));
            };

            updateScale(); // iniziale

            const resizeObserver = new window.ResizeObserver(() => {
                updateScale();
            });

            resizeObserver.observe(node);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }

    useEffect(() => {
        const savedBrano1 = localStorage.getItem('brano1');
        const savedBrano2 = localStorage.getItem('brano2');
        if (savedBrano1) {
            const brano1: BranoDb = JSON.parse(savedBrano1);
            dispatch(setBrano1(brano1));
        }
        if (savedBrano2) {
            const brano2: BranoDb = JSON.parse(savedBrano2);
            dispatch(setBrano2(brano2));
        }
    }, []);

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!brano1 || !brano2) {
            dispatch(setGenericAlert({ message: "Devi selezionare entrambi i brani sulla consolle prima di pubblicare un passaggio", type: "info" }));
            return;
        }
        if (loggedUtente === null) {
            dispatch(setGenericAlert({ message: "Devi essere loggato per pubblicare un passaggio", type: "info" }));
            return;
        }
        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            setPubblicaDisabled(true);
            dispatch(setGenericAlert({ message: "Pubblicazione del passaggio in corso...", type: "no-autoclose" }));
            await api.post('/passaggi', {
                newRowValues: {
                    testo: testo !== "" ? testo : null,
                    inizio_secondo_brano: inizioSecondoBrano !== "" ? inizioSecondoBrano : null,
                    cue_secondo_brano: cueSecondoBrano !== "" ? cueSecondoBrano : null,
                    data_pubblicazione: timestamp,
                    id_utente: loggedUtente.id,
                    id_brano_1: brano1.id,
                    id_brano_2: brano2.id
                }
            });
            dispatch(setBrano2(null));
            dispatch(setBrano1(null));
            dispatch(setGenericAlert({ message: "Passaggio pubblicato con successo. Lo trovi nella pagina del tuo profilo!", type: "info" }));
            setPubblicaDisabled(false);
            // Resetta i campi del form
            setTesto('');
            setInizioSecondoBrano('');
            setCueSecondoBrano('');
            dispatch(closeModal());
        } catch (error) {
            setPubblicaDisabled(false);
            if (checkConnError(error)) {
                dispatch(setGenericAlert({ message: getNoConnMessage(), type: "error" }));
            } else if (checkUserNotLoggedError(error)) {
                dispatch(setGenericAlert({ message: getUserNotLoggedMessage(), type: "error" }))
            } else {
                dispatch(setGenericAlert({ message: "Impossibile pubblicare il passaggio. Si è verificato un errore.", type: "error" }));
            }
        }
    }

    return <Modal isOpen={true} onRequestClose={() => dispatch(closeModal())}
        overlayClassName={modalsOverlayClassName()}
        className={modalsContentClassName()}
    >
        <ModalWrapper title="Pubblica un nuovo passaggio" onRequestClose={() => dispatch(closeModal())}>
            <div
                id="riferimento"
                ref={riferimentoRef}
                style={{ maxWidth: combinedCardBranoWidth + "px" }}
                className={`flex flex-col overflow-hidden`}
            >
                <div className="flex flex-col">
                    <div className={`flex flex-row`}>
                        <div>
                            {brano1 !== null &&
                                <CardBrano brano={brano1} noDeckButtons scale={scale} />
                            }
                            {brano1 === null &&
                                <div className="p-3">
                                    <div className="p-3 w-full box-border border border-blue-500 border-solid rounded">
                                        <span className="text-blue-500"><Info /> Il deck 1 è vuoto. Fai un giro su Mixto per trovare il primo brano del tuo passaggio!</span>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className={`flex flex-col justify-center`}>
                            <ArrowRight size={arrowSize * scale} />
                        </div>
                        <div >
                            {brano2 !== null &&
                                <CardBrano brano={brano2} noDeckButtons scale={scale} />
                            }
                            {brano2 === null &&
                                <div className="p-3">
                                    <div className="p-3 w-full box-border border border-blue-500 border-solid rounded">
                                        <span className="text-blue-500"><Info /> Il deck 2 è vuoto. Fai un giro su Mixto per trovare il secondo brano del tuo passaggio!</span>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="p-3">

                    </div>
                    <div >
                        <form onSubmit={onSubmit}>
                            <div className={`flex flex-col mb-4`}>
                                <label htmlFor="inizioSecondoBrano">Descrivi come eseguire questo passaggio:</label>
                                <textarea className={inputTextClassName()}
                                    id="testo"
                                    value={testo}
                                    onChange={(e) => setTesto(e.target.value)}
                                    placeholder="es: (Si fa entrare il secondo brano al punto di CUE, poi si effettua il crossfade...)"
                                    rows={2}
                                />
                            </div>

                            <div className={`flex flex-col mb-4`}>
                                <label htmlFor="inizioSecondoBrano">A quale istante del primo brano deve partire il secondo?:</label>
                                <input className={inputTextClassName()}
                                    type="text"
                                    id="inizioSecondoBrano"
                                    value={inizioSecondoBrano}
                                    onChange={(e) => setInizioSecondoBrano(e.target.value)}
                                    placeholder="Formato: HH:MM:SS (es. 00:02:30)"
                                    pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                                />
                            </div>

                            <div className={`flex flex-col mb-4`}>
                                <label htmlFor="inizioSecondoBrano">Quando il secondo brano parte, a quale istante si deve trovare (punto di CUE)?:</label>
                                <input className={inputTextClassName()}
                                    type="text"
                                    id="cueSecondoBrano"
                                    value={cueSecondoBrano}
                                    onChange={(e) => setCueSecondoBrano(e.target.value)}
                                    placeholder="Formato: HH:MM:SS (es. 00:01:45)"
                                    pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                                />
                            </div>

                            <div className="flex flex-row flex-wrap gap-2">
                                <button type="button" onClick={() => dispatch(closeModal())} className="card-button p-2 rounded">
                                    <X size={16} />Annulla
                                </button>
                                <button type="submit" disabled={!brano1 || !brano2 || !loggedUtente || pubblicaDisabled} className="card-button p-2 rounded">
                                    <UploadCloud size={16} />  Pubblica Passaggio
                                </button>
                            </div>
                        </form>
                    </div>
                    <div style={{ width: combinedCardBranoWidth + "px" }}></div>
                </div>
            </div>
        </ModalWrapper>
    </Modal >;
}

export default ModalNuovoPassaggio;