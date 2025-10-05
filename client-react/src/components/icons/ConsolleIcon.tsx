function ConsolleIcon(props: {size: number}) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={props.size * 1.75} height={props.size} viewBox="0 0 42 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Un quadrato che occupa tutta l'immagine*/}
        <rect fill="none" stroke="currentColor" x="1" y="1" width="40" height="22" rx="2" ry="2"></rect>
        {/* Due cerchi, uno a sinistra e uno a destra, ciascuno contenente un cerchio più piccolo all'interno*/}
        <circle cx="9" cy="12" r="6" fill="none" stroke="currentColor"></circle>
        <circle cx="9" cy="12" r="2" fill="none" stroke="currentColor"></circle>
        <circle cx="33" cy="12" r="6" fill="none" stroke="currentColor"></circle>
        <circle cx="33" cy="12" r="2" fill="none" stroke="currentColor"></circle>
        {/* Due linee verticali in mezzo ai due cerchi più grandi*/}
        <line x1="19" y1="6" x2="19" y2="18" stroke="currentColor"></line>
        <line x1="18" y1="9" x2="20" y2="9" stroke="currentColor"></line>

        <line x1="23" y1="6" x2="23" y2="18" stroke="currentColor"></line>
        <line x1="22" y1="15" x2="24" y2="15" stroke="currentColor"></line>
    </svg>
}

export default ConsolleIcon;