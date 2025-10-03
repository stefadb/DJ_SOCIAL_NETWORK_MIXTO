import "./App.css";
import MainContainer from "./components/MainContainer";
import Navbar from "./components/Navbar";
import SideContainer from "./components/SideContainer";
import { Routes, Route, useLocation } from "react-router-dom";
import Brano from "./pages/Brano";
import Album from "./pages/Album";
import Artista from "./pages/Artista";
import Genere from "./pages/Genere";
import Utente from "./pages/Utente";
import ModalNuovoPassaggio from "./components/modals/ModalNuovoPassaggio";
import ScrollToTop from "./components/ScrollToTop";
import Ricerca from "./pages/Ricerca";

function App() {

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-row flex-grow">
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
            <Route path="*" element={<></>} />
          </Routes>
        </MainContainer>
        <SideContainer />
      </div>
      <ModalNuovoPassaggio />
    </div>

  );
}

export default App;
