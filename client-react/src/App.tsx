import "./App.css";
import MainContainer from "./components/MainContainer";
import Navbar from "./components/Navbar";
import SideContainer from "./components/SideContainer";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Brano from "./pages/Brano";
import Album from "./pages/Album";
import Artista from "./pages/Artista";
import Genere from "./pages/Genere";
import Utente from "./pages/Utente";
import ModalNuovoPassaggio from "./components/modals/ModalNuovoPassaggioNew";
import ScrollToTop from "./components/ScrollToTop";
import Ricerca from "./pages/Ricerca";
import { toast, ToastContainer, type Id, type ToastIcon } from 'react-toastify';
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "./store/store";
import { cleargenericMessage } from "./store/errorSlice";
import { AlertCircle, AlertTriangle, Clock, Info } from "react-feather";

function App() {
  const genericMessage: { message: string, type: 'error' | 'warning' | 'info' | 'no-autoclose' } | null = useSelector((state: RootState) => state.error.genericMessage as any);
  const genericMessageToast = useRef<Id>(null);
  const dispatch = useDispatch();
  const toastClassName = "shadow-md font-['Roboto_Condensed']";
  const modalNuovoPassaggioOpen = useSelector((state: RootState) => state.modalNuovoPassaggio.isOpen);

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
      }, 200);
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
            <Route path="*" element={<Navigate to="/ricerca" replace />} />
          </Routes>
        </MainContainer>
        <SideContainer />
      </div>
      {modalNuovoPassaggioOpen &&
        <ModalNuovoPassaggio />
      }
      <ToastContainer limit={1} />
    </div>

  );
}

export default App;
