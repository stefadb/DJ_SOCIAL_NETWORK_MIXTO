import "./App.css";
import MainContainer from "./components/MainContainer";
import Navbar from "./components/Navbar";
import SideContainer from "./components/SideContainer";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Brano from "./pages/Brano";

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
