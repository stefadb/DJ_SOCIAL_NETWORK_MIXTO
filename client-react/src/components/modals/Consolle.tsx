import { useEffect, useState, useRef } from "react";
import type { BranoDb, UtenteDb } from "../../types/db_types";
import { useDispatch, useSelector } from "react-redux";
import { setBrano1 } from "../../store/giradischiSlice";
import { setBrano2 } from "../../store/giradischiSlice";
import CardBrano from "../cards/CardBrano";
import type { RootState } from "../../store/store";
import Modal from "react-modal";
import { setGenericAlert } from "../../store/errorSlice";
import { modalsContentClassName, modalsOverlayClassName } from "../../functions/functions";
import ModalWrapper from "./ModalWrapper";
import { Info, Repeat, Trash, UploadCloud } from "react-feather";
import { useSearchParams } from "react-router-dom";

function Consolle(props: { onRequestClose: () => void }) {
    Modal.setAppElement('#root');
    const dispatch = useDispatch();
    const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente);
    const brano1: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano1);
    const brano2: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano2);
    const setSearchParams = useSearchParams()[1];
    const combinedCardBranoWidth = 396;
    const [scale, setScale] = useState<number>(1);
    const riferimentoRef = useRef<HTMLDivElement>(null);

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

    function scambia() {
        const temp = brano1;
        dispatch(setBrano1(brano2));
        dispatch(setBrano2(temp));
    }

    function openModalNuovoPassaggio() {
        setSearchParams((prev) => {
            prev.set("modal", "nuovoPassaggio");
            prev.delete("idInModal");
            return prev;
        });
    }

    return <Modal isOpen={true} onRequestClose={props.onRequestClose}
        overlayClassName={modalsOverlayClassName()}
        className={modalsContentClassName()}
    >
        <ModalWrapper title="La mia consolle" onRequestClose={props.onRequestClose}>
            <div
                id="riferimento"
                ref={riferimentoRef}
                style={{ maxWidth: combinedCardBranoWidth + "px" }}
                className={`flex flex-col overflow-hidden`}
            >
                <div>
                    <div className={`flex flex-row`}>
                        <div className={`flex flex-col justify-between`}>
                            <div>
                                <h3 className="pl-3 mb-0">Deck 1</h3>
                                {brano1 !== null &&
                                    <CardBrano brano={brano1} noDeckButtons scale={scale} insideModal/>
                                }
                                {brano1 === null &&
                                    <div className="p-3">
                                        <div className="p-3 w-full box-border border border-blue-500 border-solid rounded">
                                            <span className="text-blue-500"><Info /> Il deck 1 è vuoto. Fai un giro su MixTo per trovare il primo brano per questo mix!</span>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="px-3">
                                <button className="card-button rounded p-2 text-base w-full" onClick={() => { dispatch(setBrano1(null)); localStorage.removeItem('brano1'); }}><Trash size={16} />&nbsp;Libera il deck 1</button>
                            </div>
                        </div>
                        <div className={`flex flex-col justify-between`}>
                            <div>
                                <h3 className="pl-3 mb-0">Deck 2</h3>
                                {brano2 !== null &&
                                    <CardBrano brano={brano2} noDeckButtons scale={scale} insideModal/>
                                }
                                {brano2 === null &&
                                    <div className="p-3">
                                        <div className="p-3 w-full box-border border border-blue-500 border-solid rounded">
                                            <span className="text-blue-500"><Info /> Il deck 2 è vuoto. Fai un giro su MixTo per trovare il secondo brano per questo mix!</span>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="px-3">
                                <button className="card-button rounded p-2 text-base w-full box-border" onClick={() => { dispatch(setBrano2(null)); localStorage.removeItem('brano2'); }}><Trash size={16} />&nbsp;Libera il deck 2</button>
                            </div>
                        </div>
                    </div>
                    <div className={`pt-2 border-b border-t-0 border-x-0 border-gray-300 border-solid`} style={{ width: `${combinedCardBranoWidth * scale}px` }}>

                    </div>
                    <div className="flex flex-row flex-wrap pt-2" style={{ width: `${combinedCardBranoWidth * scale}px` }}>
                        <div className="p-1">
                            <button className="card-button rounded p-2 text-base" onClick={scambia}><Repeat size={16} />&nbsp;Scambia</button>
                        </div>
                        <div className="p-1">
                            <button className="card-button rounded p-2 text-base" onClick={() => { if (loggedUtente) { openModalNuovoPassaggio(); } else { dispatch(setGenericAlert({ message: "Accedi per pubblicare un mix", type: "info" })); } }}><UploadCloud size={16} />&nbsp;Pubblica un nuovo mix</button>
                        </div>
                        <div className="p-1">
                            <button className="card-button rounded p-2 text-base" onClick={() => { dispatch(setBrano1(null)); dispatch(setBrano2(null)); localStorage.removeItem('brano1'); localStorage.removeItem('brano2'); }}><Trash size={16} />&nbsp;Libera entrambi i deck</button>
                        </div>
                    </div>
                    <div style={{ width: combinedCardBranoWidth + "px" }}></div>
                </div>
            </div>
        </ModalWrapper>
    </Modal >;
}

export default Consolle;