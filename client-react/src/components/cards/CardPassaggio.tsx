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
    <div style={{ padding: 10 * scale }}>
      <div style={{ padding: 10 * scale, borderRadius: 8 * scale, boxShadow: `0 0 ${scale * 5}px rgba(192,192,192,0.5)` }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
          {props.brano1 &&
            <CardBrano brano={props.brano1} size={props.insideModal ? "small" : "tiny"} noButtons={!props.insideModal}/>
          }
          <ArrowRight />
          {props.brano2 &&
            <CardBrano brano={props.brano2} size={props.insideModal ? "small" : "tiny"} noButtons={!props.insideModal}/>
          }
        </div>
        {props.insideModal !== true &&
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
            <button className={"card-brano-button"} style={{ borderRadius: 4 * scale, padding: 4 * scale }} onClick={() => { setShowModal(true); }}>Commenti e voti <ExternalLink size={14 * scale} /></button>
            <button className={"card-brano-button"} style={{ borderRadius: 4 * scale, padding: 4 * scale }} onClick={() => {
              dispatch(setBrano1ToNuovoPassaggio(props.brano1));
              dispatch(setBrano2ToNuovoPassaggio(props.brano2));
              dispatch(closeModal())
              dispatch(openNuovoPassaggioModal());
            }}><Copy size={14 * scale} /> Crea passaggio come questo</button>
          </div>
        }
        {/* Stelle e azioni */}
        {valutazioneMedia !== null &&
          <div style={{ display: "flex", alignItems: "center", margin: "12px 16px 0 16px" }}>
            <Stelle
              rating={valutazioneMedia.voto_medio}
              bgColor="white"
            />
            <span style={{ marginLeft: 8, color: "#888" }}><b>{valutazioneMedia.voto_medio}/{5}</b> ({valutazioneMedia.numero_voti} {valutazioneMedia.numero_voti === 1 ? "voto" : "voti"})</span>
            <div style={{ marginLeft: "auto" }}>
            </div>
          </div>
        }
        {valutazioneMedia === null &&
          <div style={{ display: "flex", alignItems: "center", margin: "12px 16px 0 16px" }}>
            <span style={{ color: "#888" }}>Nessuna valutazione</span>
          </div>
        }
        {/* Autore e dettagli passaggio */}
        <div style={{ margin: "12px 16px 0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", cursor: props.utente ? "pointer" : "default" }} onClick={props.utente ? () => { navigate("/utente?id=" + props.utente?.id) } : undefined}>
            {props.utente &&
              <>
                <img style={{ width: 32 * scale, height: 32 * scale, borderRadius: "50%", boxShadow: `0 0 ${5 * scale}px rgba(0,0,0,0.5)` }} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo di " + props.utente.nome + " " + props.utente.cognome} />
                <b>&nbsp;&nbsp;{props.utente.nome} {props.utente.cognome}</b>
                <i>  (@{props.utente.username})</i>
              </>
            }
            {!props.utente &&
              <>
                <img style={{ width: 32 * scale, height: 32 * scale, borderRadius: "50%", boxShadow: `0 0 ${5 * scale}px rgba(0,0,0,0.5)` }} src={"src/assets/artista_empty.jpg"} alt={"Immagine di profilo vuota"} />
                <b>&nbsp;&nbsp;Utente eliminato</b>
                <span style={{ marginLeft: 8, color: "#888", fontSize: 13 }}></span>
              </>
            }
          </div>
          <div style={{ marginTop: 8, color: "#222" }}>
            <div style={{ color: "#888", fontStyle: "italic", display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={14 * scale} />
              {props.passaggio.testo}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={14 * scale} />
              Posizione CUE secondo brano: <span style={{ color: "#1976d2" }}>{props.passaggio.cue_secondo_brano}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
