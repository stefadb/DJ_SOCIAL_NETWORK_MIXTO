import "./App.css";
import MainContainer from "./components/MainContainer";
import Navbar from "./components/Navbar";
import SideContainer from "./components/SideContainer";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Brano from "./pages/Brano";
import Album from "./pages/Album";
import Artista from "./pages/Artista";

function App() {
  return (
    <BrowserRouter>
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
                <Route path="/brano" element={<Brano />} />
                <Route path="/album" element={<Album />} />
                <Route path="/artista" element={<Artista />} />
                <Route path="*" element={<></>} />
              </Routes>
            </>
          </MainContainer>
          <SideContainer>
            <img
              src="src/assets/turntable.png"
              alt="Immagine giradischi di prova"
              style={{ width: "100%", height: "auto" }}
            />
          </SideContainer>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
