import { useDispatch } from "react-redux";
import type { BranoDb, PassaggioDb } from "../../types/db_types";
import BasicUl from "../BasicUl";
import CardBrano from "./CardBrano";
import { openModal } from "../../store/modalPassaggioSlice";

type CardPassaggioProps = {
  passaggio: PassaggioDb;
  brano1: BranoDb;
  brano2: BranoDb;
};

function CardPassaggio(props: CardPassaggioProps) {
  const dispatch = useDispatch();
  //Per ora falla brutta, poi sarà da abbellire

  return (
    <div style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
      <h5>PASSAGGIO:</h5>
      <h6>Informazioni sul passaggio</h6>
      <BasicUl entity={props.passaggio} />
      <h6>Brano 1</h6>
      <CardBrano brano={props.brano1} />
      <h6>Brano 2</h6>
      <CardBrano brano={props.brano2} />
      <button onClick={() => { dispatch(openModal(props.passaggio.id)); }}>Altre informazioni</button>
    </div>
  );
}

export default CardPassaggio;
