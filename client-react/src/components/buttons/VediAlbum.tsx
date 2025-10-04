import { Tooltip } from "react-tooltip";
import { v4 as uuidv4 } from 'uuid';
import AlbumIcon from "../icons/AlbumIcon";
import { useNavigate } from "react-router-dom";
import { deezerColor, scaleTwProps} from "../../functions/functions";

function VediAlbum(props: { idAlbum: number, scale: number}) {
  // ID stabile che non cambia ad ogni render
  const randomId = `album-${uuidv4()}`;
  const navigate = useNavigate();

  return <div className="inline-block" style={scaleTwProps("p-1",props.scale)}>
    <button 
      id={randomId} 
  className="card-brano-button" style={scaleTwProps("py-2 px-1 rounded", props.scale)} 
       
      onClick={() => {navigate(`/album?id=${props.idAlbum}`);}}
    >
      <AlbumIcon 
        size={14*props.scale} 
        color={deezerColor()} 
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