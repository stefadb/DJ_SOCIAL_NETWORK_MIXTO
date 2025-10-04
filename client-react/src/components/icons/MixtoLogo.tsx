import { mPoints } from "../../functions/functions";

function MixtoLogo() {
    return (
        <div className="flex flex-row items-center gap-2">
            <div>
                <svg viewBox="0 0 1 1" className="rounded-full bg-white w-8 h-8 md:w-12 md:h-12">
                    <polygon points={mPoints().join(" ")} fill="black" />
                </svg>
            </div>
            <div>
                <h1 className="my-0 text-xl md:text-3xl">Mixto</h1>
            </div>
        </div>
    );
}

export default MixtoLogo;