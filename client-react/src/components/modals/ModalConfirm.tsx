import Modal from 'react-modal';
import { modalsContentClassName, modalsOverlayClassName } from '../../functions/functions';

function ModalConfirm(props: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, description: string, confirmText?: string, cancelText?: string }) {
    Modal.setAppElement('#root');
    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.onClose}
            contentLabel={props.title}
            overlayClassName={modalsOverlayClassName()}
            className={modalsContentClassName()}
        >
            <h2>{props.title}</h2>
            <p>{props.description}</p>
            <div className="inline-block p-1">
                <button className="card-brano-button py-2 px-1 rounded" onClick={props.onConfirm}>
                    {props.confirmText || 'Sì'}
                </button>
            </div>
            <div className="inline-block p-1">
                <button className="card-brano-button py-2 px-1 rounded" onClick={props.onClose}>
                    {props.cancelText || 'Annulla'}
                </button>
            </div>
        </Modal >
    );
}

export default ModalConfirm;