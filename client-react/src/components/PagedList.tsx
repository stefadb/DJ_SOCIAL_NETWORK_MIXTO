import axios from "axios";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import type { ZodObject } from "zod";

function PagedList<T>(props: { itemsPerPage: number; apiCall: string; schema?: ZodObject<any>; component: (element: T, index: number) => ReactNode, showMoreButton: (onClick: () => void) => ReactNode }) {
    //TODO: risolvere un bug in questo componente, legato al cambiamento dei parametri
    const [elements, setElements] = useState<T[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [showMoreItemsButton, setShowMoreItemsButton] = useState<boolean>(true);

    const disableValidation = true;

    function loadElements() {
        axios.get(`${props.apiCall}${props.apiCall.includes("?") ? "&" : "?"}limit=${props.itemsPerPage}&index=${(currentPage - 1) * props.itemsPerPage}`, { headers: {"Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } })
            .then(response => {
                if (response.status === 200) {
                    if (response.data.length == 0) {
                        setShowMoreItemsButton(false);
                        return;
                    }
                    //Riempi l'array elements solo nelle posizioni da (currentPage-1)*itemsPerPage a currentPage*itemsPerPage-1
                    const newElements = [...elements];
                    let maxIndex = -1;
                    for (let i = 0; i < props.itemsPerPage; i++) {
                        if (response.data[i]) {
                            if (!disableValidation && props.schema !== undefined && !props.schema.safeParse(response.data[i]).success) {
                                //TODO: Gestire errore
                                console.error("Errore di validazione dei dati dell'elemento:", props.schema.safeParse(response.data[i]).error);
                                return;
                            }
                            if(maxIndex < (currentPage - 1) * props.itemsPerPage + i){
                                maxIndex = (currentPage - 1) * props.itemsPerPage + i;
                            }
                            newElements[(currentPage - 1) * props.itemsPerPage + i] = response.data[i];
                        }
                    }
                    setElements(newElements.slice(0, maxIndex + 1));
                } else {
                    //TODO: mostrare errore giusto a schermo
                    console.error(`Error loading elements: ${response.data}`);
                }
            }).catch(error => {
                //TODO: mostrare errore a schermo
                console.error(`Error loading elements: ${error}`);
            });
    }

    useEffect(() => {
        if (currentPage !== 1) setCurrentPage(1);
    }, [props.apiCall, props.itemsPerPage]);

    useEffect(() => {
        loadElements();
    }, [props.apiCall, currentPage, props.itemsPerPage]);

    return <>
        {elements.map((element, index) => <Fragment key={index}>{props.component(element, index)}</Fragment>)}
        {showMoreItemsButton && <Fragment>{props.showMoreButton(() => setCurrentPage(currentPage + 1))}</Fragment>}
    </>;
}

export default PagedList;