import { X } from "react-feather";

function ModalWrapper(props: { children: React.ReactNode; title: string; onRequestClose: () => void; }) {
    return <div className="h-full w-full">
        <div className="flex flex-row w-full h-[30px]">
            <div className="flex-grow truncate text-xl">
                {props.title}
            </div>
            <div>
                <button className="card-brano-button rounded" onClick={props.onRequestClose} ><X size={24} /></button>
            </div>
        </div>
        <div className="w-full h-[calc(100%-30px)]">
            {props.children}
        </div>
    </div>;
}

export default ModalWrapper;