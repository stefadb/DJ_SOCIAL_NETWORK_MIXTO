import { useState } from "react";
import CardUtenteLoggato from "./cards/CardUtenteLoggato";
import Consolle from "./modals/Consolle";
import { useNavigate } from "react-router-dom";
import { HelpCircle, Search, Sliders } from "react-feather";
import { Tooltip } from "react-tooltip";
import MixtoLogo from "./icons/MixtoLogo";
import { useSelector } from "react-redux";
import type { BranoDb } from "../types/db_types";
import type { RootState } from "../store/store";
import ConsolleIcon from "./icons/ConsolleIcon";

function Navbar() {
  const [isConsolleOpen, setIsConsolleOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const brano1: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano1);
  const brano2: BranoDb | null = useSelector((state: RootState) => (state.giradischi as any).brano2);
  return (
    <>
      <div className="w-full bg-gray-100 text-center flex flex-row justify-center shadow-lg">
        <nav className="p-4 flex flex-row justify-between items-center">
          <MixtoLogo />
          <div className="flex flex-row items-center gap-2 md:gap-4">
            <div>
              <button onClick={() => navigate("/ricerca")} className="card-button rounded-lg p-1 md:p-3"><Search size={24} /></button>
            </div>
            <div className="relative">
              <button onClick={() => setIsConsolleOpen(true)} className="card-button rounded-lg p-1 md:p-3"><ConsolleIcon size={24} /></button>
              {brano1 && brano2 &&
                <div className="flex justify-center items-center rounded-full bg-blue-500 absolute text-white shadow-sm -top-2 -right-2 w-4 h-4 text-xs md:-top-2 md:-right-2 md:w-6 md:h-6 md:text-base">
                  <div>2</div>
                </div>
              }
              {((brano1 && !brano2) || (!brano1 && brano2)) &&
                <div className="flex justify-center items-center rounded-full bg-blue-500 absolute text-white shadow-sm -top-2 -right-2 w-4 h-4 text-xs md:-top-2 md:-right-2 md:w-6 md:h-6 md:text-base">
                  <div>1</div>
                </div>
              }
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