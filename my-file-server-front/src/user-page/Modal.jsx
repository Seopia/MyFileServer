import {useState} from "react";
import './Modal.css';
function Modal({isOpen, closeModal}){
   
    return(
        <div className="modal" style={{display: isOpen ? "block" : "none"}}>
            <ul>
                <li>게시물1</li>
            </ul>
            <button onClick={closeModal}>닫기</button>
        </div>
    )
}export default Modal;