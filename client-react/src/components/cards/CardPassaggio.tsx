import { useDispatch } from "react-redux";
import type { BranoDb, PassaggioDb, UtenteDb } from "../../types/db_types";
import CardBrano from "./CardBrano";
import { useEffect, useState, useRef } from "react";
import { setBrano1 as setBrano1ToNuovoPassaggio } from "../../store/giradischiSlice";
import { setBrano2 as setBrano2ToNuovoPassaggio } from "../../store/giradischiSlice";
import { openModal as openNuovoPassaggioModal } from "../../store/modalNuovoPassaggioSlice";
import { closeModal } from '../../store/modalPassaggioSlice';
import Stelle from "../Stelle";
import api from "../../api";
import z from "zod";
import ModalPassaggio from "../modals/ModalPassaggio";
import { ArrowRight, Clock, Copy, ExternalLink, MessageSquare } from "react-feather";
import { useNavigate } from "react-router-dom";
import { dataItaliana, scaleTwProps } from "../../functions/functions";
import ReactTimeAgo from "react-time-ago";

type CardPassaggioProps = {
  passaggio: PassaggioDb;
  brano1: BranoDb;
  brano2: BranoDb;
  utente: UtenteDb | null;
  insideModal?: boolean;
};

const ValutazioniMedieSchema = z.object({ id_passaggio: z.number(), voto_medio: z.number(), numero_voti: z.number() });
type ValutazioniMedie = z.infer<typeof ValutazioniMedieSchema>;

function CardPassaggio(props: CardPassaggioProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [valutazioneMedia, setValutazioneMedia] = useState<ValutazioniMedie | null | "error">(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [braniScale, setBraniScale] = useState<number>(1);

  const cardBranoScale = props.insideModal ? braniScale : 0.75;

  const cardPassaggioRef = useRef<HTMLDivElement>(null);

  const truncateClassName = props.insideModal ? "" : "truncate";

  const maxWidth = (150 * cardBranoScale + 12 * cardBranoScale * 4) + 16 * cardBranoScale + (150 * cardBranoScale + 12 * cardBranoScale * 4);

  // ResizeObserver per aggiornare braniScale
  useEffect(() => {
    const node = cardPassaggioRef.current;
    if (!node) return;

    const updateScale = () => {
      const width = node.offsetWidth;
      /* 412 = 150 + 12*4 + 150 + 12*4 + 16 (150 = larghezza card brano, 12*4 = padding totali delle card brano, 16 = dimensione icona freccia in mezzo)*/
      setBraniScale(Math.min(width / 412, 1));
    };

    updateScale(); // iniziale

    const resizeObserver = new window.ResizeObserver(() => {
      updateScale();
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  async function loadValutazioneMedia() {
    try {
      setValutazioneMedia(null);
      const response = await api.get(`/valutazioni/media?passaggio=${props.passaggio.id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
      const responseData: ValutazioniMedie[] = z.array(ValutazioniMedieSchema).parse(response.data);
      if (responseData.length === 1 && responseData[0] !== undefined) {
        setValutazioneMedia(responseData[0]);
      } else {
        setValutazioneMedia(null);
      }
    } catch {
      setValutazioneMedia("error");
    }
  }

  //Quando il passaggio cambia, carica i commenti e le valutazioni
  useEffect(() => {
    loadValutazioneMedia();
  }, [props.passaggio.id]);

  return (
    <div style={scaleTwProps("p-3", 1)}>
      <div style={scaleTwProps("p-3 rounded-lg shadow-md", 1)}>
        <div
          id="card-passaggio"
          className="flex justify-center items-center"
          ref={cardPassaggioRef}
        >
          {props.brano1 &&
            <CardBrano brano={props.brano1} scale={cardBranoScale} noButtons={props.insideModal} />
          }
          <ArrowRight size={16 * cardBranoScale} />
          {props.brano2 &&
            <CardBrano brano={props.brano2} scale={cardBranoScale} noButtons={props.insideModal} />
          }
        </div>
        {props.insideModal !== true &&
          <div style={{ maxWidth: maxWidth }} className="flex flex-row justify-between flex-wrap">
            <button className={"card-button"} style={scaleTwProps("p-1 rounded", 1)} onClick={() => { setShowModal(true); }}>Più dettagli <ExternalLink size={14} /></button>
            <button className={"card-button"} style={scaleTwProps("p-1 rounded", 1)} onClick={() => {
              dispatch(setBrano1ToNuovoPassaggio(props.brano1));
              dispatch(setBrano2ToNuovoPassaggio(props.brano2));
              dispatch(closeModal())
              dispatch(openNuovoPassaggioModal());
            }}><Copy size={14} /> Crea passaggio come questo</button>
          </div>
        }
        {/* Stelle e azioni */}
        {valutazioneMedia !== null && valutazioneMedia !== "error" &&
          <div style={{ maxWidth: maxWidth }} className="flex items-center box-border pt-3 px-4 pb-0">
            <Stelle
              rating={valutazioneMedia.voto_medio}
              bgColor="white"
            />
            <span className="ml-2 text-gray-500"><b>{String(valutazioneMedia.voto_medio).substring(0, 3)}/{5}</b> ({valutazioneMedia.numero_voti} {valutazioneMedia.numero_voti === 1 ? "voto" : "voti"})</span>
            <div className="ml-auto">
            </div>
          </div>
        }
        {valutazioneMedia === null && valutazioneMedia !== "error" &&
          <div style={{ maxWidth: maxWidth }} className="flex items-center box-border pt-3 px-4 pb-1">
            <span className={`text-gray-500 ${truncateClassName}`}>Nessuna valutazione</span>
          </div>
        }
        {valutazioneMedia === "error" &&
          <div style={{ maxWidth: maxWidth }} className="flex items-center box-border pt-3 px-4 pb-1">
            <span className={`text-red-500 ${truncateClassName}`}>Impossibile caricare le valutazioni</span>
          </div>
        }
        {/* Autore e dettagli passaggio */}
        <div style={{ maxWidth: maxWidth }} className="box-border pt-3 px-3 pb-0">
          <div className={(props.utente ? " cursor-pointer" : " cursor-default")} onClick={props.utente ? () => { navigate("/utente?id=" + props.utente?.id) } : undefined}>
            <span className={`${truncateClassName} pl-1`}>Pubblicato <ReactTimeAgo date={new Date(props.passaggio.data_pubblicazione)} locale="it" /> da</span>
            {props.utente &&
              <b className={`${truncateClassName} flex flex-row flex-wrap items-center`}><div className="pr-2 py-2 pl-1" ><img className="rounded-full" style={scaleTwProps("w-8 h-8 shadow-md", 1)} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo"} /></div>{props.utente.nome} {props.utente.cognome} <span className={"font-normal " + truncateClassName}>(@{props.utente.username})</span></b>
            }
            {!props.utente &&
              <b className={`${truncateClassName} flex flex-row flex-wrap items-center`}><div className="pr-2 py-2 pl-1"><img className="rounded-full" style={scaleTwProps("w-8 h-8 shadow-md", 1)} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo"} /></div>Utente eliminato</b>
            }
          </div>
          {props.insideModal &&
            <div className="text-gray-800 mt-2">
              <div className="flex items-center gap-2 italic text-gray-500">
                <MessageSquare size={14} />
                <span className={`${truncateClassName}`}>{props.passaggio.testo ? props.passaggio.testo : "Nessuna descrizione fornita"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span className={`${truncateClassName}`}>Posizione CUE secondo brano: <span className={"text-blue-600 " + truncateClassName}>{props.passaggio.cue_secondo_brano == null ? "Non specificato" : props.passaggio.cue_secondo_brano}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span className={`${truncateClassName}`}>Partenza secondo brano: <span className={"text-blue-600 " + truncateClassName}>{props.passaggio.inizio_secondo_brano == null ? "Non specificato" : props.passaggio.inizio_secondo_brano}</span></span>
              </div>
            </div>
          }
        </div>
        {showModal &&
          <ModalPassaggio passaggio={props.passaggio} brano1={props.brano1} brano2={props.brano2} utente={props.utente} onClose={() => setShowModal(false)} />
        }
      </div>
    </div>
  );
}

export default CardPassaggio;