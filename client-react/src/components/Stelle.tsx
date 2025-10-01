import Stella from "./icons/Stella";

function Stelle(props: { rating: number, bgColor: string}) {
    //Se rating è un numero decimale, le stelle devono essere riempite parzialmente
    return (
        <>
        <Stella fill={props.rating} size={24} bgColor={props.bgColor} />
        <Stella fill={props.rating-1} size={24} bgColor={props.bgColor} />
        <Stella fill={props.rating-2} size={24} bgColor={props.bgColor} />
        <Stella fill={props.rating-3} size={24} bgColor={props.bgColor} />
        <Stella fill={props.rating-4} size={24} bgColor={props.bgColor} />
        </>
    );
}


export default Stelle;