import "./App.css";
import MainContainer from "./components/MainContainer";
import Navbar from "./components/Navbar";
import SideContainer from "./components/SideContainer";
import { Routes, Route, useLocation, Navigate, useSearchParams } from "react-router-dom";
import Brano from "./pages/Brano";
import Album from "./pages/Album";
import Artista from "./pages/Artista";
import Genere from "./pages/Genere";
import Utente from "./pages/Utente";
import ModalNuovoPassaggio from "./components/modals/ModalNuovoPassaggio";
import ScrollToTop from "./components/ScrollToTop";
import Ricerca from "./pages/Ricerca";
import { toast, ToastContainer, type Id, type ToastIcon } from 'react-toastify';
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "./store/store";
import { cleargenericMessage } from "./store/errorSlice";
import { AlertCircle, AlertTriangle, Clock, Info } from "react-feather";
import ModalPassaggio from "./components/modals/ModalPassaggio";
import ModalArtistiOGeneri from "./components/modals/ModalArtistiOGeneri";
import Consolle from "./components/modals/Consolle";
import ModalAggiornaUtente from "./components/modals/ModalAggiornaUtente";
import ModalSignUp from "./components/modals/ModalSignUp";
import ModalSignIn from "./components/modals/ModalSignIn";
import type { BranoDb, UtenteDb } from "./types/db_types";
import { setBrano1, setBrano2 } from "./store/giradischiSlice";

function App() {
  const genericMessage: { message: string, type: 'error' | 'warning' | 'info' | 'no-autoclose' } | null = useSelector((state: RootState) => state.error.genericMessage as any);
  const genericMessageToast = useRef<Id>(null);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const idInModal = searchParams.get("idInModal");
  const toastClassName = "shadow-md font-['Roboto_Condensed']";
  const loggedUtente: UtenteDb | null = useSelector((state: RootState) => (state.user as any).utente as UtenteDb | null);

  function getToastIcon(messageType: 'error' | 'warning' | 'info' | 'no-autoclose'): ToastIcon {
    switch (messageType) {
      case 'error':
        return <AlertCircle size={24} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-yellow-600" />;
      case 'info':
        return <Info size={24} className="text-blue-600" />;
      case 'no-autoclose':
        return <Clock size={24} className="text-gray-600" />;
      default:
        return <></>;
    }
  }

  useEffect(() => {
    const savedBrano1 = localStorage.getItem('brano1');
    const savedBrano2 = localStorage.getItem('brano2');
    if (savedBrano1) {
      const brano1: BranoDb = JSON.parse(savedBrano1);
      dispatch(setBrano1(brano1));
    }
    if (savedBrano2) {
      const brano2: BranoDb = JSON.parse(savedBrano2);
      dispatch(setBrano2(brano2));
    }
  }, [])

  function closeAnyModal() {
    setSearchParams((prev) => {
      prev.delete("modal");
      prev.delete("idInModal");
      return prev;
    });
  }

  function openSignUp() {
    setSearchParams((prev) => {
      prev.set("modal", "signUp");
      prev.delete("idInModal");
      return prev;
    });
  }

  useEffect(() => {
    if (genericMessage != null) {
      if (!genericMessageToast.current) {
        genericMessageToast.current = toast(genericMessage.message, {
          type: genericMessage.type == 'no-autoclose' ? 'info' : genericMessage.type,
          autoClose: genericMessage.type == 'no-autoclose' ? false : 5000,
          closeButton: genericMessage.type !== 'no-autoclose',
          closeOnClick: genericMessage.type !== 'no-autoclose',
          draggable: genericMessage.type !== 'no-autoclose',
          className: toastClassName,
          onClose: () => { dispatch(cleargenericMessage()); genericMessageToast.current = null; },
          icon: getToastIcon(genericMessage.type)
        });
      } else {
        toast.update(genericMessageToast.current, {
          render: genericMessage.message,
          type: genericMessage.type == 'no-autoclose' ? 'info' : genericMessage.type,
          autoClose: genericMessage.type == 'no-autoclose' ? false : 5000,
          closeButton: genericMessage.type !== 'no-autoclose',
          closeOnClick: genericMessage.type !== 'no-autoclose',
          draggable: genericMessage.type !== 'no-autoclose',
          className: toastClassName,
          onClose: () => { dispatch(cleargenericMessage()); genericMessageToast.current = null; },
          icon: getToastIcon(genericMessage.type)
        });
      }
    } else {
      setTimeout(() => {
        if (genericMessageToast.current) {
          toast.dismiss(genericMessageToast.current);
        }
      }, 500);
    }
  }, [genericMessage, dispatch]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-row flex-1 overflow-hidden">
        <SideContainer />
        <MainContainer>
          <ScrollToTop />
          <Routes>
            <Route path="/brano" element={<Brano key={new URLSearchParams(useLocation().search).get("id")} />} />
            <Route path="/album" element={<Album key={new URLSearchParams(useLocation().search).get("id")} />} />
            <Route path="/artista" element={<Artista key={new URLSearchParams(useLocation().search).get("id")} />} />
            <Route path="/genere" element={<Genere key={new URLSearchParams(useLocation().search).get("id")} />} />
            <Route path="/utente" element={<Utente key={new URLSearchParams(useLocation().search).get("id")} />} />
            <Route path="/ricerca" element={<Ricerca key={new URLSearchParams(useLocation().search).get("id")} />} />
            <Route path="*" element={<Ricerca key={new URLSearchParams(useLocation().search).get("id")} />} />
          </Routes>
        </MainContainer>
        <SideContainer />
      </div>
      {searchParams.get("modal") == "nuovoPassaggio" &&
        <ModalNuovoPassaggio onRequestClose={closeAnyModal} />
      }
      {searchParams.get("modal") == "passaggio" && typeof idInModal === "string" &&
        <ModalPassaggio idPassaggio={!Number.isNaN(Number(idInModal)) ? parseInt(idInModal) : 0} onClose={closeAnyModal} />
      }
      {searchParams.get("modal") == "artistiBrano" && typeof idInModal === "string" &&
        <ModalArtistiOGeneri entity="artista" id={!Number.isNaN(Number(idInModal)) ? parseInt(idInModal) : 0} />
      }
      {searchParams.get("modal") == "generiAlbum" && typeof idInModal === "string" &&
        <ModalArtistiOGeneri entity="genere" id={!Number.isNaN(Number(idInModal)) ? parseInt(idInModal) : 0} />
      }
      {searchParams.get("modal") == "consolle" &&
        <Consolle onRequestClose={closeAnyModal} />
      }
      {searchParams.get("modal") == "signIn" && loggedUtente == null &&
        <ModalSignIn isOpen={true} onRequestClose={closeAnyModal} openSignUp={openSignUp} />
      }
      {searchParams.get("modal") == "utente" && loggedUtente !== null &&
        <ModalAggiornaUtente isOpen={true} onRequestClose={closeAnyModal} />
      }
      {searchParams.get("modal") == "signUp" && loggedUtente == null &&
        <ModalSignUp isOpen={true} onRequestClose={closeAnyModal} />
      }
      <ToastContainer limit={1} />
    </div>

  );
}

export default App;
