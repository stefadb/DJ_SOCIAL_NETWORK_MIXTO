import "./App.css";
import MainContainer from "./components/MainContainer";
import Navbar from "./components/Navbar";
import SideContainer from "./components/SideContainer";
import { Routes, Route, useLocation} from "react-router-dom";
import Brano from "./pages/Brano";
import Album from "./pages/Album";
import Artista from "./pages/Artista";
import RicercaDeezer from "./pages/RicercaDeezer";
import RicercaLocale from "./pages/RicercaLocale";
import Generi from "./pages/Generi";
import Genere from "./pages/Genere";
import Utente from "./pages/Utente";
import ModalPassaggioTest from "./pages/ModalPassaggioTest";
import Consolle from "./components/Consolle";

function App() {
  return (
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Navbar />
        <div style={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
          <SideContainer>
            <></>
          </SideContainer>
          <MainContainer>
            <>
              {/* Qui va messo il React Router con la scelta della pagina*/}
              <Routes>
                <Route path="/brano" element={<Brano key={new URLSearchParams(useLocation().search).get("id")} />} />
                <Route path="/album" element={<Album key={new URLSearchParams(useLocation().search).get("id")} />} />
                <Route path="/artista" element={<Artista key={new URLSearchParams(useLocation().search).get("id")} />} />
                <Route path="/genere" element={<Genere key={new URLSearchParams(useLocation().search).get("id")} />} />
                <Route path="/utente" element={<Utente key={new URLSearchParams(useLocation().search).get("id")} />} />
                <Route path="/generi" element={<Generi/>} />
                {/* Route provvisoria che poi andrà eliminata */}
                <Route path="/passaggio" element={<ModalPassaggioTest key={new URLSearchParams(useLocation().search).get("id")} />} />
                <Route path="/ricerca" element={<RicercaDeezer key={new URLSearchParams(useLocation().search).get("id")} />} />
                <Route path="/ricerca_locale" element={<RicercaLocale key={new URLSearchParams(useLocation().search).get("id")} />} />
                <Route path="*" element={<></>} />
              </Routes>
            </>
          </MainContainer>
          <SideContainer>
            <Consolle />
          </SideContainer>
        </div>
      </div>
  );
}

export default App;
