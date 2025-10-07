import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { ZodObject } from "zod";
import api from "../api";
import Caricamento from "./icons/Caricamento";

function PagedList<T>(props: { itemsPerPage: number; apiCall: string; schema?: ZodObject<any>; component: (element: T, index: number, total: number) => ReactNode, showMoreButton?: (onClick: () => void) => ReactNode, scrollMode: "horizontal" | "vertical", noPaging?: boolean, emptyMessage: ReactNode, caricamentoSize?: "veryTiny" | "tiny" | "small" | "large" | "giant", setElementsLength?: (length: number) => void, setShowMoreButtonVisible?: (visible: boolean) => void, customLoading?: ReactNode, customError?: ReactNode, passElementsToParent?: (elements: T[]) => void }) {
    const [elements, setElements] = useState<T[]>([]);
    const [empty, setEmpty] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const lastLoadedPage = useRef<number>(0);
    const [endNotReached, setEndNotReached] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const disableValidation = false; //In produzione deve essere false
    async function loadElements() {
        setLoading(true);
        try {
            const response = await api.get(`${props.apiCall}${props.apiCall.includes("?") ? "&" : "?"}` + (!props.noPaging ? `limit=${props.itemsPerPage}&index=${(currentPage - 1) * props.itemsPerPage}` : ""), { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } })
            setError(false);
            if (response.data.length < props.itemsPerPage && !props.noPaging) {
                setEndNotReached(false);
            }
            if (response.data.length == 0) {
                if ((currentPage - 1) == 0 || props.noPaging) {
                    setEmpty(true);
                } else {
                    setEmpty(false);
                }
                return;
            } else {
                setEmpty(false);
            }
            //Riempi l'array elements solo nelle posizioni da (currentPage-1)*itemsPerPage a currentPage*itemsPerPage-1
            const newElements = [...elements];
            let maxIndex = -1;
            const itemsPerPage = props.noPaging ? response.data.length : props.itemsPerPage;
            for (let i = 0; i < itemsPerPage; i++) {
                if (response.data[i]) {
                    if (!disableValidation && props.schema !== undefined) {
                        props.schema.parse(response.data[i])
                    }
                    if (maxIndex < (currentPage - 1) * itemsPerPage + i) {
                        maxIndex = (currentPage - 1) * itemsPerPage + i;
                    }
                    newElements[(currentPage - 1) * itemsPerPage + i] = response.data[i];
                }
            }
            const newElementsTemp = newElements.slice(0, maxIndex + 1);
            setElements(newElementsTemp);
            if (props.passElementsToParent) {
                props.passElementsToParent(newElementsTemp);
            }
            props.setElementsLength?.(newElementsTemp.length);
            lastLoadedPage.current = currentPage;
            setLoading(false);
            handleScroll();
        } catch {
            //Errore già gestito
            setLoading(false);
            handleScroll();
            setError(true);
        }
    }

    function nextPage() {
        //alert("Next page chiamato!!");
        if (lastLoadedPage.current >= currentPage) {
            setCurrentPage(currentPage + 1);
        }
    }

    function firstPage() {
        setCurrentPage(1);
        lastLoadedPage.current = 0;
    }

    useEffect(() => {
        if (currentPage !== 1) {
            firstPage();
        }
    }, [props.apiCall, props.itemsPerPage]);

    useEffect(() => {
        loadElements();
    }, [props.apiCall, currentPage, props.itemsPerPage]);

    const containerRef = useRef<HTMLDivElement>(null);
    const innerContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!props.noPaging && endNotReached && props.showMoreButton === undefined) { // Se non c'è il bottone "Carica altri", carica automaticamente quando si arriva alla fine
            nextPageIfNecessary();
        }
    };

    function nextPageIfNecessary() {
        const div = containerRef.current;
        const innerDiv = innerContainerRef.current;
        if (!div || !innerDiv || div.clientWidth === 0 || innerDiv.scrollWidth === 0) {
            setTimeout(nextPageIfNecessary, 10);
        } else {
            // Controlla se siamo alla fine
            //Se la larghezza del contenuto è minore della larghezza del contenitore, allora devi caricare un'altra pagina per riempire lo spazio
            if (div.clientWidth > innerDiv.scrollWidth) {
                nextPage();
            } else if (div.scrollLeft !== 0 && div.scrollLeft + div.clientWidth >= innerDiv.scrollWidth - 10) { /*Il -10 è per essere sicuri che nextPage venga chiamata */
                nextPage();
            }
        }

    }

    //Quando il pulsante "Carica altri" cambia il suo stato di visibilità, chiama la funzione props.setShowMoreButtonVisible
    useEffect(() => {
        if (props.setShowMoreButtonVisible) {
            props.setShowMoreButtonVisible(props.showMoreButton !== undefined && !props.noPaging && endNotReached);
        }
    }, [props.noPaging, props.showMoreButton, endNotReached]);

    return <div ref={containerRef} onScroll={handleScroll} className={"overscroll-x-contain " + (props.scrollMode === "vertical" ? "overflow-y-auto" : "overflow-x-auto")}>
        <div ref={innerContainerRef} className={"inline-flex justify-start" + (props.scrollMode === "vertical" ? " flex-col" : " flex-row")}>
            {elements.map((element, index) => <Fragment key={index}>{props.component(element, index, elements.length)}</Fragment>)}
            {empty && <>{props.emptyMessage}</>}
            {!props.noPaging && endNotReached && <Fragment>
                {props.showMoreButton &&
                    <>
                        {props.showMoreButton(() => nextPage())}
                    </>
                }
                <div className={"m-auto flex justify-center " + (props.scrollMode === "vertical" ? "w-full flex-row" : "h-full flex-col") + (!loading ? " hidden" : "")}>
                    {!props.customLoading &&
                        <Caricamento size={props.caricamentoSize || "small"} status={"loading"} />
                    }
                    {props.customLoading &&
                        <>
                            {props.customLoading}
                        </>
                    }
                </div>
                <div className={"m-auto flex justify-center" + (props.scrollMode === "vertical" ? "w-full flex-row" : "h-full flex-col") + (!error ? " hidden" : "")}>
                    {!props.customError &&
                        <Caricamento size={props.caricamentoSize || "small"} status={"error"} />
                    }
                    {props.customError &&
                        <>
                            {props.customError}
                        </>
                    }
                </div>
            </Fragment>
            }
        </div>
    </div>;
}

export default PagedList;