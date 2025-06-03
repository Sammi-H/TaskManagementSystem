import react from "react";



export default function Modal({message, onClose}) {
    return(
        <div className="modal-backdrop">
            <div className="modal-content">
                <p>{message}</p>
                <button className="modal-btn" onClick={onClose}>OK</button>
            </div>
        </div>
    );
}