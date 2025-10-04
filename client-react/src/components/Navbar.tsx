import { useState } from "react";
import CardUtenteLoggato from "./cards/CardUtenteLoggato";
import Consolle from "./modals/Consolle";
import { useNavigate } from "react-router-dom";
import { HelpCircle, Search, Sliders } from "react-feather";
import { Tooltip } from "react-tooltip";
import MixtoLogo from "./icons/MixtoLogo";

function Navbar() {
  const [isConsolleOpen, setIsConsolleOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  return (
    <>
      <div className="w-full bg-gray-100 text-center flex flex-row justify-center shadow-lg">
        <nav className="p-4 flex flex-row justify-between items-center">
          <MixtoLogo />
          <div className="flex flex-row items-center gap-2 md:gap-4">
            <div>
              <button onClick={() => navigate("/ricerca")} className="card-button rounded-lg p-1 md:p-3"><Search size={24} /></button>
            </div>
            <div>
              <button onClick={() => setIsConsolleOpen(true)} className="card-button rounded-lg p-1 md:p-3"><Sliders size={24} /></button>
            </div>
            <div>
              <button onClick={() => { alert("Guida presto disponibile"); }} className="card-button rounded-lg p-1 md:p-3"><HelpCircle size={24} /></button>
            </div>
            <CardUtenteLoggato />
          </div>
        </nav>
      </div>
      {isConsolleOpen &&
        <Consolle onRequestClose={() => setIsConsolleOpen(false)} />
      }
    </>
  );
}
export default Navbar;