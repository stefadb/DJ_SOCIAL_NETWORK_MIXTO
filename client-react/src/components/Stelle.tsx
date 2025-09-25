import type { DigitDotDigit } from "../types/types";

function Stelle(props: { rating: DigitDotDigit}) {
    //Se rating è un numero decimale, le stelle devono essere riempite parzialmente
    return (
        <span>
            {Array.from({ length: 5}, (_, i) => (
                <span key={i} style={{ color: i < parseFloat(props.rating) ? "#FFD600" : "#CCC", fontSize: 20 }}>★</span>
            ))}
        </span>
    );
}


export default Stelle;