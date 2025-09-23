import { useLocation } from "react-router-dom";
import ModalPassaggio from "../components/modals/ModalPassaggio";

function ModalPassaggioTest() {
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const id = query.get("id");
    return (
        <ModalPassaggio idPassaggio={id ? parseInt(id) : undefined} onClose={() => { window.history.back(); }} />
    );
}

export default ModalPassaggioTest;