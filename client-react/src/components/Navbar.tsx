import { useState } from "react";
import CardUtenteLoggato from "./cards/CardUtenteLoggato";
import Consolle from "./Consolle";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [isConsolleOpen, setIsConsolleOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  return (
    <>
  <nav className="bg-gray-200">
        <h4>DJ Social Network. Qui andranno tutte le cose della navbar</h4>
      </nav>
      <CardUtenteLoggato />
      <button onClick={() => setIsConsolleOpen(true)}>Apri consolle</button>
      <button onClick={() => navigate("/ricerca")}>Ricerca</button>
      <Consolle isOpen={isConsolleOpen} onRequestClose={() => setIsConsolleOpen(false)} />
    </>
  );
}
export default Navbar;