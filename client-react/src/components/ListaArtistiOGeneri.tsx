import { Fragment } from "react/jsx-runtime";
import type { ArtistaDb, GenereDb } from "../types/db_types";
import { Link } from "react-router-dom";
import { useLayoutEffect, useRef, useState } from "react";
import Modal from "react-modal";
import Badge from "./Badge";
import { Music, User } from "react-feather";
import { mediumPadding, smallPadding } from "../functions/functions";

function ListaArtistiOGeneri(props: { list: ArtistaDb[], noClick?: boolean, entity: "artista", fontSize: number, lines: number } | { list: GenereDb[], noClick?: boolean, entity: "genere", fontSize: number, lines: number }) {
    const lines = props.lines;
    //ARRAY DI NUMERI DA 1 a lines
    const lineNumbers = Array.from({ length: lines }, (_, i) => i + 1);
    const [shownList, setShownList] = useState<ArtistaDb[] | GenereDb[]>(props.list);
    const [showingMore, setShowingMore] = useState<boolean>(false);

    const testDivRef = useRef<HTMLDivElement>(null);
    const actualDivRef = useRef<HTMLDivElement>(null);
    const maxHeightDivRef = useRef<HTMLDivElement>(null);

    const linksStyle = {
        fontSize: props.fontSize,
        fontFamily: "Roboto Condensed"
    }

    const maxHeight = useRef<number>(0);

    //Scrivere una funzione che, quando il testDivRef è completamente renderizzato, calcola la sua altezza e la salva in maxHeight

    // Funzione che accorcia shownArtisti finché actualDivRef non supera maxHeight
    function adjustListToFitHeight() {
        if (!actualDivRef.current || maxHeight.current === 0) return;

        // Mostra temporaneamente actualDivRef per misurarlo
        actualDivRef.current.style.display = "flex";
        //testDivRef.current!.style.display = "none";
        // Continua a rimuovere artisti finché l'altezza non rientra nel limite
        const checkAndAdjust = () => {
            //console.log("checkAndAdjust chiamata su questi artisti: " + props.artisti.map(a => a.nome).join(", "));
            if (!actualDivRef.current) return;

            const currentHeight = actualDivRef.current.scrollHeight;
            //console.log(`Altezza attuale: ${currentHeight}, Max: ${maxHeight.current}`);

            if (currentHeight > maxHeight.current && shownList.length > 1) {
                //console.log("Devo ridurre!!");
                // Rimuovi l'ultimo artista
                setShownList(prev => prev.slice(0, -1));

                // Usa requestAnimationFrame per aspettare il re-render prima di controllare di nuovo
                requestAnimationFrame(() => {
                    setTimeout(checkAndAdjust, 0); // setTimeout per garantire che il DOM sia aggiornato
                });
            } else {
                // L'altezza è corretta, mantieni actualDivRef visibile
                //console.log(`Adattamento completato. Artisti mostrati: ${shownArtisti.length}/${props.artisti.length}`);
                actualDivRef.current!.style.height = maxHeight.current + "px";
                testDivRef.current!.style.display = "none";
            }
        };

        // Inizia il processo di adattamento
        requestAnimationFrame(() => {
            setTimeout(checkAndAdjust, 0);
        });
    }

    useLayoutEffect(() => {
        const measureHeight = () => {
            if (testDivRef.current) {
                const height = testDivRef.current.scrollHeight;
                if (height > 0) {
                    maxHeight.current = height;
                    maxHeightDivRef.current!.style.height = height + "px";
                    maxHeightDivRef.current!.style.maxHeight = height + "px";
                    //console.log("Altezza del div di test:", height);
                    adjustListToFitHeight();
                } else {
                    //console.log("ScrollHeight ancora 0, riprovo...");
                    // Riprova dopo un frame
                    requestAnimationFrame(() => {
                        setTimeout(measureHeight, 10);
                    });
                }
            } else {
                //console.log("testDivRef non disponibile, riprovo...");
                setTimeout(measureHeight, 10);
            }
        };

        measureHeight();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Deve eseguire solo al mount

    return <>
        <div ref={maxHeightDivRef} style={{ overflowY: "hidden" }}>
            <div ref={actualDivRef} style={{ display: "none" /* diventa "flex" quando è tutto pronto*/, flexDirection: "column", justifyContent: "center" }}>
                <div>
                    {shownList.map((element, index) => {
                        return <Fragment key={element.id}><Link style={linksStyle} to={props.noClick ? "" : "/" + props.entity + "?id=" + element.id}>{element.nome}</Link>
                            {index < shownList.length - 1 && ", "}</Fragment>
                    })}
                    {shownList.length < props.list.length &&
                        <span onClick={() => setShowingMore(true)} style={{ cursor: "pointer", fontSize: 14, fontFamily: "Roboto Condensed" }}> e altri {props.list.length - shownList.length}</span>
                    }
                </div>
            </div>
            <div ref={testDivRef} style={{ opacity: 0 }}>
                {lineNumbers.map((lineNumber) => {
                    return <div style={{ display: "block" }} key={lineNumber}><Link style={linksStyle} to={"blablabla"}>Test</Link></div>
                })}
            </div>
            {showingMore &&
                <Modal style={{
                    content: {
                        maxWidth: "400px",
                        width: "100%",
                        margin: "auto"
                    }
                }} isOpen={true} onRequestClose={() => setShowingMore(false)}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => setShowingMore(false)} style={{ position: "absolute", padding: mediumPadding(), background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>×</button>
                    </div>
                    <h2>Tutti {props.entity == "artista" ? "gli artisti" : "i generi"} di questo {props.entity == "artista" ? "brano" : "album"}</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {props.list.map((element) => {
                            return <div key={element.id} style={{ display: "flex", flexDirection: "row" }}>
                                <div style={{ padding: smallPadding(), position: "relative", width: 24, height: 24 }}>
                                    <Badge scale={1}>
                                        {props.entity == "artista" &&
                                            <User size={14} color={"#A238FF"} />
                                        }
                                        {props.entity == "genere" &&
                                            <Music size={14} color={"#A238FF"} />
                                        }
                                    </Badge>
                                </div>
                                <div style={{ padding: smallPadding() }}>
                                    <Link style={linksStyle} to={"/" + props.entity + "?id=" + element.id}>{element.nome}</Link>
                                </div>
                            </div>
                        })}
                    </div>
                </Modal>
            }
        </div>
    </>;
}

export default ListaArtistiOGeneri;