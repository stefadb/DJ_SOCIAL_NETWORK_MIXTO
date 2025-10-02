import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { noPadding } from "../functions/functions";

function DynamicText(props: { text: string, width: number, scale: number}) {
    const fontFamily = "Roboto Condensed";
    const minFontSize = 10 * props.scale; //lascia cosi
    const maxFontSize = 18 * props.scale; //lascia cosi
    const [chosenFontSize, setChosenFontSize] = useState<number>(0);
    const [divHeight, setDivHeight] = useState<number>(0);
    const textRef = useRef<HTMLHeadingElement>(null);

    function getTextWidth(text: string, font: string, context : CanvasRenderingContext2D) {
        // font deve essere in formato CSS, es: "16px Arial"
        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
    }

    //Calcola l'altezza del div in modo che sia sufficiente a ospitare il testo con font size maxFontSize
    const calcDivHeight = useCallback(() => {
        if (textRef.current) {
            // Salva il contenuto originale
            const originalContent = textRef.current.textContent;
            // Imposta temporaneamente il testo di test con maxFontSize
            textRef.current.textContent = "Test";
            textRef.current.style.fontSize = `${maxFontSize}px`;
            
            const height = textRef.current.offsetHeight;
            
            // Ripristina il contenuto originale
            textRef.current.textContent = originalContent || "";
            textRef.current.style.fontSize = `${chosenFontSize}px`;
            
            if (height > 0) {
                setDivHeight(height);
            }
        }
    }, [chosenFontSize, maxFontSize]);

    //Calcola la font size in modo che il testo riempia perfettamente la larghezza data in props.width
    const calcFontSize = useCallback((text: string, width: number, context: CanvasRenderingContext2D) => {
        const minWidth = getTextWidth(text, `${minFontSize}px ${fontFamily}`, context);
        const maxWidth = getTextWidth(text, `${maxFontSize}px ${fontFamily}`, context);
        if (maxWidth <= width) {
            setChosenFontSize(maxFontSize);
        } else if (minWidth >= width) {
            setChosenFontSize(minFontSize);
        } else {
            //Calcola la font size con una formula di interpolazione lineare
            const newFontSize = minFontSize * ((props.width-2) / minWidth);
            setChosenFontSize(newFontSize);
        }
    }, [props.width]);

    const handleCalcFontSize = useCallback((text: string, width: number) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
            calcFontSize(text, width, context);
        } else {
            setTimeout(() => handleCalcFontSize(text, width), 10);
        }
    }, [calcFontSize]);

    useEffect(() => {
        handleCalcFontSize(props.text, (props.width-2));
    }, [props.text, props.width, handleCalcFontSize]);

    useEffect(() => {
        handleCalcFontSize(props.text, (props.width-2));
    }, [handleCalcFontSize, props.text, props.width]);

    // useLayoutEffect si esegue sincrono dopo il DOM update ma prima del paint
    useLayoutEffect(() => {
        calcDivHeight();
    }, [calcDivHeight]); // Ricalcola quando calcDivHeight cambia
    return (
    <div className="flex flex-col items-center justify-center transition-opacity duration-500" style={{ width: props.width, opacity: divHeight !== 0 && chosenFontSize !== 0 ? 1 : 0, height: divHeight }}>
            <div style={{ width: props.width }}>
                <h3 ref={textRef} className="overflow-x-hidden whitespace-nowrap break-keep" style={{ width: props.width, maxWidth: props.width, fontFamily: fontFamily, margin: 0, padding: noPadding(), fontSize: chosenFontSize, textOverflow: "ellipsis" }}>{props.text}</h3>
            </div>
        </div>);
}

export default DynamicText;