import { faBackward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const BackButton = ({moveTo}) =>{
    const nav = useNavigate();
    return(
        <div className='faBackword' onClick={()=>nav(moveTo)}>
                <FontAwesomeIcon icon={faBackward}/>
                <div className='back-button'>뒤로가기</div>
        </div>
    )
}

export default BackButton;