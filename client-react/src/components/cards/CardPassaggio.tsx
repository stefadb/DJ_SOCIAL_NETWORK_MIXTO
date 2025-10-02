import { useDispatch } from "react-redux";
import type { BranoDb, PassaggioDb, UtenteDb } from "../../types/db_types";
import CardBrano from "./CardBrano";
import { useEffect, useState } from "react";
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
import { blackBoxShadow, grayBoxShadow, largePadding, smallPadding } from "../../functions/functions";

type CardPassaggioProps = {
  passaggio: PassaggioDb;
  brano1: BranoDb;
  brano2: BranoDb;
  utente: UtenteDb | null;
  size: "small" | "large";
  insideModal?: boolean;
};

const ValutazioniMedieSchema = z.object({ id_passaggio: z.number(), voto_medio: z.number(), numero_voti: z.number() });
type ValutazioniMedie = z.infer<typeof ValutazioniMedieSchema>;

function CardPassaggio(props: CardPassaggioProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [valutazioneMedia, setValutazioneMedia] = useState<ValutazioniMedie | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const scales = {
    small: 1,
    large: 1.5
  };

  const scale = scales[props.size] || 1;

  async function loadValutazioneMedia() {
    try {
      const response = await api.get(`/valutazioni/media?passaggio=${props.passaggio.id}`, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" } });
      const responseData: ValutazioniMedie[] = z.array(ValutazioniMedieSchema).parse(response.data);
      if (responseData.length === 1 && responseData[0] !== undefined) {
        setValutazioneMedia(responseData[0]);
      } else {
        setValutazioneMedia(null);
      }
    } catch (error) {
      console.error("Error loading valutazioni:", error);
    }
  }

  //Quando il passaggio cambia, carica i commenti e le valutazioni
  useEffect(() => {
    loadValutazioneMedia();
  }, [props.passaggio.id]);

  return (
  <div style={{ padding: largePadding(scale) }}>
  <div style={{ padding: largePadding(scale), borderRadius: 8 * scale, boxShadow: grayBoxShadow(scale) }}>
  <div className="flex justify-center items-center">
          {props.brano1 &&
            <CardBrano brano={props.brano1} size={props.insideModal ? "small" : "tiny"} noButtons={!props.insideModal}/>
          }
          <ArrowRight />
          {props.brano2 &&
            <CardBrano brano={props.brano2} size={props.insideModal ? "small" : "tiny"} noButtons={!props.insideModal}/>
          }
        </div>
        {props.insideModal !== true &&
          <div className="flex flex-row justify-between flex-wrap">
            <button className={"card-brano-button"} style={{ borderRadius: 4 * scale, padding: smallPadding(scale) }} onClick={() => { setShowModal(true); }}>Commenti e voti <ExternalLink size={14 * scale} /></button>
            <button className={"card-brano-button"} style={{ borderRadius: 4 * scale, padding: smallPadding(scale) }} onClick={() => {
              dispatch(setBrano1ToNuovoPassaggio(props.brano1));
              dispatch(setBrano2ToNuovoPassaggio(props.brano2));
              dispatch(closeModal())
              dispatch(openNuovoPassaggioModal());
            }}><Copy size={14 * scale} /> Crea passaggio come questo</button>
          </div>
        }
        {/* Stelle e azioni */}
        {valutazioneMedia !== null &&
          <div className="flex items-center" style={{ margin: "12px 16px 0 16px" }}>
            <Stelle
              rating={valutazioneMedia.voto_medio}
              bgColor="white"
            />
            <span className="ml-2 text-gray-500"><b>{valutazioneMedia.voto_medio}/{5}</b> ({valutazioneMedia.numero_voti} {valutazioneMedia.numero_voti === 1 ? "voto" : "voti"})</span>
            <div className="ml-auto">
            </div>
          </div>
        }
        {valutazioneMedia === null &&
          <div className="flex items-center" style={{ margin: "12px 16px 0 16px" }}>
            <span className="text-gray-500">Nessuna valutazione</span>
          </div>
        }
        {/* Autore e dettagli passaggio */}
  <div style={{ margin: "12px 16px 0 16px" }}>
          <div className={"flex items-center" + (props.utente ? " cursor-pointer" : " cursor-default")} onClick={props.utente ? () => { navigate("/utente?id=" + props.utente?.id) } : undefined}>
            {props.utente &&
              <>
                <img className="rounded-full" style={{ width: 32 * scale, height: 32 * scale, boxShadow: blackBoxShadow(scale) }} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo di " + props.utente.nome + " " + props.utente.cognome} />
                <b>&nbsp;&nbsp;{props.utente.nome} {props.utente.cognome}</b>
                <i>  (@{props.utente.username})</i>
              </>
            }
            {!props.utente &&
              <>
                <img className="rounded-full" style={{ width: 32 * scale, height: 32 * scale, boxShadow: blackBoxShadow(scale) }} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo vuota"} />
                <b>&nbsp;&nbsp;Utente eliminato</b>
                <span className="ml-2 text-gray-500 text-[13px]"></span>
              </>
            }
          </div>
          <div className="text-gray-800" style={{ marginTop: 8 }}>
            <div className="flex items-center gap-2 italic text-gray-500">
              <MessageSquare size={14 * scale} />
              {props.passaggio.testo}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14 * scale} />
              Posizione CUE secondo brano: <span className="text-blue-600">{props.passaggio.cue_secondo_brano}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14 * scale} />
              Partenza secondo brano: <span style={{ color: "#1976d2" }}>{props.passaggio.inizio_secondo_brano}</span>
            </div>
          </div>
        </div>
        {showModal &&
          <ModalPassaggio passaggio={props.passaggio} brano1={props.brano1} brano2={props.brano2} utente={props.utente} onClose={() => setShowModal(false)} />
        }
      </div>
    </div>
  );
}

export default CardPassaggio;
