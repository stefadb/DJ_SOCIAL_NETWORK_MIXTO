import { useEffect, useState } from "react";
import type { ArtistaDb, BranoDb, PassaggioDb } from "../types/db_types";
import BasicUl from "./BasicUl";

type CardPassaggioProps = {
  passaggio: PassaggioDb;
  brano1: BranoDb;
  brano2: BranoDb;
  getNomiArtistiBrano: (id: number) => Promise<ArtistaDb[]>;
};

function CardPassaggio(props: CardPassaggioProps) {
  const [artistiBrano1, setArtistiBrano1] = useState<ArtistaDb[]>([]);
  const [artistiBrano2, setArtistiBrano2] = useState<ArtistaDb[]>([]);
  const [cardIsReady, setCardIsReady] = useState(false);

  useEffect(() => {
    setCardIsReady(false);
    loadArtisti();
  }, []);

  useEffect(() => {
    setCardIsReady(false);
    loadArtisti();
  }, [props.passaggio]);

  async function loadArtisti() {
    try {
      setArtistiBrano1(
        await props.getNomiArtistiBrano(props.passaggio.id_brano_1)
      );
      setArtistiBrano2(
        await props.getNomiArtistiBrano(props.passaggio.id_brano_2)
      );
      setCardIsReady(true);
    } catch (error) {
      console.log(error);
      //TODO: gestisci errore
      console.error("Error loading brani:", error);
    }
  }

  //Per ora falla brutta, poi sarà da abbellire

  return (
    <div style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
      <h5>PASSAGGIO:</h5>
      <h6>Informazioni sul passaggio</h6>
      <BasicUl entity={props.passaggio} />
      <h6>Informazioni sul brano 1</h6>
      <BasicUl entity={props.brano1} />
      <p>
        Artisti del brano 1:{" "}
        {cardIsReady
          ? artistiBrano1.map((artista) => artista.nome).join(", ")
          : "Caricamento..."}
      </p>
      <h6>Informazioni sul brano 2</h6>
      <BasicUl entity={props.brano2} />
      <p>
        Artisti del brano 2:{" "}
        {cardIsReady
          ? artistiBrano2.map((artista) => artista.nome).join(", ")
          : "Caricamento..."}
      </p>
      {/* Dovrai far vedere anche le copertine di entrambi i brani e probabilmente anche gli artisti*/}
      <img
        style={{ width: "100px", height: "100px" }}
        src={
          cardIsReady
            ? "http://localhost:3000/album_pictures/" +
              props.brano1.id_album +
              ".jpg"
            : "Caricamento..."
        }
        alt={cardIsReady ? "Cover " + props.brano1.titolo : "Caricamento..."}
      ></img>
      <img
        style={{ width: "100px", height: "100px" }}
        src={
          cardIsReady
            ? "http://localhost:3000/album_pictures/" +
              props.brano2.id_album +
              ".jpg"
            : "Caricamento..."
        }
        alt={cardIsReady ? "Cover " + props.brano2.titolo : "Caricamento..."}
      ></img>
    </div>
  );
}

export default CardPassaggio;
