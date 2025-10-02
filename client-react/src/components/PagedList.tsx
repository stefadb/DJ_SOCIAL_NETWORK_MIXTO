import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { ZodObject } from "zod";
import api from "../api";
import Caricamento from "./icons/Caricamento";

function PagedList<T>(props: { itemsPerPage: number; apiCall: string; schema?: ZodObject<any>; component: (element: T, index: number) => ReactNode, showMoreButton?: (onClick: () => void) => ReactNode, scrollMode: "horizontal" | "vertical", noPaging?: boolean, emptyMessage: ReactNode }) {
    const [elements, setElements] = useState<T[]>([]);
    const [empty, setEmpty] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const lastLoadedPage = useRef<number>(0);
    const [endNotReached, setEndNotReached] = useState<boolean>(true);
    const loading = useRef<boolean>(false);
    const caricamentoRef = useRef<HTMLDivElement>(null);

    const disableValidation = false; //In produzione deve essere false
    async function loadElements() {
        loading.current = true;
        if (caricamentoRef.current) {
            caricamentoRef.current.style.display = "block";
        }
        try {
            const response = await api.get(`${props.apiCall}${props.apiCall.includes("?") ? "&" : "?"}` + (!props.noPaging ? `limit=${props.itemsPerPage}&index=${(currentPage - 1) * props.itemsPerPage}` : ""), { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } })
            if (response.data.length == 0) {
                setEndNotReached(false);
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
                    if (!disableValidation && props.schema !== undefined && !props.schema.safeParse(response.data[i]).success) {
                        //TODO: Gestire errore
                        console.error("Errore di validazione dei dati dell'elemento:", props.schema.safeParse(response.data[i]).error);
                        return;
                    }
                    if (maxIndex < (currentPage - 1) * itemsPerPage + i) {
                        maxIndex = (currentPage - 1) * itemsPerPage + i;
                    }
                    newElements[(currentPage - 1) * itemsPerPage + i] = response.data[i];
                }
            }
            const newElementsTemp = newElements.slice(0, maxIndex + 1);
            setElements(newElementsTemp);
            lastLoadedPage.current = currentPage;
            loading.current = false;
            if (caricamentoRef.current) {
                caricamentoRef.current.style.display = "none";
            }
            handleScroll();
        } catch (error) {
            console.error(`Error loading elements: ${error}`);
            loading.current = false;
            if (caricamentoRef.current) {
                caricamentoRef.current.style.display = "none";
            }
            handleScroll();
        }
    }

    function nextPage() {
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

    const handleScroll = () => {
        if (!props.noPaging && !loading.current && endNotReached && props.showMoreButton === undefined) { // Se non c'è il bottone "Carica altri", carica automaticamente quando si arriva alla fine
            const div = containerRef.current;
            if (!div) return;
            // Controlla se siamo alla fine
            if (div.scrollLeft + div.clientWidth >= div.scrollWidth - 1) {
                nextPage();
            }
        }
    };

    return <div ref={containerRef} onScroll={handleScroll} className="flex" style={{ flexDirection: props.scrollMode === "vertical" ? "column" : "row", [props.scrollMode === "vertical" ? "overflowY" : "overflowX"]: "auto", justifyContent: "flex-start", overscrollBehaviorX: "contain" }}>
        {elements.map((element, index) => <Fragment key={index}>{props.component(element, index)}</Fragment>)}
        {empty && <>{props.emptyMessage}</>}
        {!props.noPaging && endNotReached && <Fragment>
            {props.showMoreButton &&
                props.showMoreButton(() => nextPage())
            }
            <div ref={caricamentoRef} style={{display: "none", justifyContent: "center", alignItems: "center", [props.scrollMode === "vertical" ? "width" : "height"]: "100%"}}>
                <Caricamento size={"tiny"} />
            </div>
        </Fragment>
        }
    </div >;
}

export default PagedList;