import Modal from "react-modal";
import { deezerColor, modalsContentClassName, modalsOverlayClassName } from "../../functions/functions";
import ModalWrapper from "./ModalWrapper";
import Caricamento from "../icons/Caricamento";
import { GitHub, HelpCircle, Linkedin, Mail, Search, User } from "react-feather";
import IncludiRisultatiDeezer from "../buttons/IncludiRisultatiDeezer";
import DeezerLogo from "../icons/DeezerLogo";
import PosizionaBrano from "../buttons/PosizionaBrano";
import ConsolleIcon from "../icons/ConsolleIcon";
import SalvaBranoPreferito from "../buttons/SalvaBranoPreferito";
import { useState } from "react";

function ModalHelp(props: { onClose: () => void }) {
    Modal.setAppElement('#root');
    const [mostraGuida, setMostraGuida] = useState<boolean>(true);
    return <Modal
        isOpen={true}
        onRequestClose={props.onClose}
        overlayClassName={modalsOverlayClassName()}
        className={modalsContentClassName()}
    >
        <ModalWrapper title="Guida e contatti MixTo" onRequestClose={props.onClose}>
            <div className="text-center">
                <div className="flex flex-row flex-wrap gap-2 justify-center pb-2">
                    <button onClick={() => { setMostraGuida(true); }} className={"flex flex-row items-center card-button rounded p-2 text-xl " + (mostraGuida ? "text-blue-500" : "text-black")}>
                        <HelpCircle size={32} />
                        &nbsp;Guida
                    </button>
                    <button onClick={() => { setMostraGuida(false); }} className={"flex flex-row items-center card-button rounded p-2 text-xl " + (!mostraGuida ? "text-blue-500" : "text-black")}>
                        <Mail size={32} />
                        &nbsp;Contatti
                    </button>
                </div>
                {mostraGuida &&
                    <>
                        <div className="flex flex-row justify-center">
                            <Caricamento size="large" status="loading" noText />
                        </div>
                        <h1>Benvenuto su MixTo!</h1>
                        <h3 style={{color: deezerColor()}}><a href="https://developers.deezer.com/api" target="_blank" ><DeezerLogo size={16} /> <b>Quest'app usa le DEEZER developers API</b></a></h3>
                        <div>
                            Sei un DJ e hai voglia di cercare nuovi <b>mix</b> e nuove <b>tracklist</b> da provare, oppure vuoi condividerli con gli altri DJ? MixTo ti permette di pubblicarli e ti da la possibilità di scoprire quelli condivisi dagli altri DJ.
                        </div>
                        <h2><i>Come navigare all'interno di MixTo?</i></h2>
                        <div>
                            Usa il pulsante <Search size={16} /> per entrare nella <b>pagina di ricerca</b>. Qui potrai <b>cercare quello che ti interessa</b>: un <b>brano</b>, un <b>album</b>, un <b>artista</b>, un <b>genere musicale</b> o un <b>DJ utente</b> di MixTo.
                            Se non trovi quello che cerchi, puoi <b>espandere la ricerca</b> usando il pulsante <IncludiRisultatiDeezer inclusi={false} onClick={() => { }} />. In questo modo, verranno aggiunti i risultati di ricerca di <b>DEEZER</b>
                        </div>
                        <div>
                            Dopo aver selezionato uno tra i risultati della ricerca, potrai vedere tutti i suoi dettagli, gli elementi correlati (come i brani di un album, o gli artisti simili) e tutti i mix pubblicati da te o dagli altri DJ che lo includono.
                        </div>
                        <h2><i>Come pubblicare un mix?</i></h2>
                        <div>Hai trovato il brano che ti interessa? Sulla sua scheda, puoi usare il pulsante <PosizionaBrano deck={1} scale={0.75} /> o <PosizionaBrano deck={2} scale={0.75} /> per posizionarlo sul primo o sul secondo <b>deck</b> della tua <b>consolle</b>.
                            <div>La tua <b>consolle</b>, può essere aperta con il pulsante <ConsolleIcon size={16} /> ed è il tuo spazio dove posizionare i due brani del <b>mix</b> che vuoi pubblicare.</div>
                            <div>Una volta scelti i due brani, puoi aprire la tua consolle e procedere con la pubblicazione del tuo mix!</div>
                        </div>
                        <h2><i>Dove trovo i mix che ho pubblicato? E i miei brani preferiti?</i></h2>
                        <div>La pagina del tuo profilo include tutti i mix che hai pubblicato e i brani che hai salvato come preferiti usando il pulsante <SalvaBranoPreferito scale={1} /> presente sulle schede di tutti i brani.</div>
                        <h2><i>Buon divertimento!</i></h2>
                        <div>Puoi riaprire questa guida in qualsiasi momento usando il pulsante <HelpCircle size={16} />.</div>
                    </>
                }
                {!mostraGuida &&
                    <>
                        <h1>Contatti</h1>
                        <img  width={180} height={180} className="rounded-full shadow-lg" src="src/assets/stefano_di_bisceglie.png" alt="Stefano Di Bisceglie. sviluppatore di MixTo" />
                        <h2 className="mb-0">Stefano Di Bisceglie</h2>
                        <h4 className="mt-2 mb-2"><User size={24} />  Sviluppatore di MixTo</h4>
                        <div className="flex flex-row flex-wrap justify-center">
                            <div className="p-1">
                                <a target="_blank" className="card-button rounded p-1 text-blue-500" href="https://www.linkedin.com/in/stefano-di-bisceglie-8a634b26b/"><Linkedin size={16} /> Profilo LinkedIn</a>
                            </div>
                            <div className="p-1">
                                <a target="_blank" href="https://github.com/stefadb" className="card-button rounded p-1 text-black"><GitHub size={16} /> Profilo GitHub</a>
                            </div>
                        </div>
                        <div className="flex flex-row flex-wrap justify-center pt-2">
                            <div className="p-1">
                                <a target="_blank" className="card-button rounded p-1 text-gray-600" href="mailto:stefano.dibisceglie.dev@gmail.com"><Mail size={16} /> stefano.dibisceglie.dev@gmail.com</a>
                            </div>
                        </div>
                        <h3 style={{color: deezerColor()}}><a href="https://developers.deezer.com/api" target="_blank" ><DeezerLogo size={16} /> <b>Quest'app usa le DEEZER developers API</b></a></h3>
                    </>
                }
            </div>
        </ModalWrapper>
    </Modal>;
}

export default ModalHelp;