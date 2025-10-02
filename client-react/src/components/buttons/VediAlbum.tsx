import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from 'uuid';
import AlbumIcon from "../icons/AlbumIcon";
import { useNavigate } from "react-router-dom";
import { smallPadding } from "../../functions/functions";

function VediAlbum(props: { idAlbum: number, scale: number}) {
  // ID stabile che non cambia ad ogni render
  const randomId = `album-${uuidv4()}`;
  const buttonPadding = `${8*props.scale}px ${4*props.scale}px ${7*props.scale}px ${4*props.scale}px`;
  const navigate = useNavigate();

  return <div style={{ padding: smallPadding(props.scale), display: "inline-block" }}>
    <button 
      id={randomId} 
      style={{ padding: buttonPadding, borderRadius: 4*props.scale}} 
      className={"card-brano-button"} 
      onClick={() => {navigate(`/album?id=${props.idAlbum}`);}}
    >
      <AlbumIcon 
        size={14*props.scale} 
        color={"#A238FF"} 
      />
    </button>
    <Tooltip
      anchorSelect={`#${randomId}`}
      place="top"
      content={"Vai all'album del brano"}
    />
  </div>
}

export default VediAlbum;