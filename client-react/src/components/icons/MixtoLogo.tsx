import { deezerColor, getRandomGreyScale, mPoints } from "../../functions/functions";
import DeezerLogo from "./DeezerLogo";

function MixtoLogo() {
    const radius = 24;
    const segments = Array.from({ length: radius }, (_, i) => i + 1);

    return (
        <div className="flex flex-row items-center gap-2">
            <div>
                <svg viewBox="0 0 48 48" className="rounded-full bg-white w-8 h-8 md:w-12 md:h-12">
                    {segments.map((segment) => (
                        <circle
                            key={segment}
                            cx={radius}
                            cy={radius}
                            r={radius - segment}
                            fill="none"
                            stroke={getRandomGreyScale()}
                            strokeWidth="2"
                        />
                    ))}
                    <circle cx={radius} cy={radius} r={12} fill="white" />
                    <polygon points={mPoints().map((point) => point * 24 + 12).join(" ")} fill="black" />
                </svg>
            </div>
            <div className="flex flex-col">
                <div>
                    <h1 className="text-left my-0 text-xl md:text-3xl">MixTo</h1>
                </div>
                <a target="_blank" href="https://developers.deezer.com/api" style={{color: deezerColor()}} className={`text-xs md:text-sm`}>
                    <DeezerLogo size={12} /> Uses <b>DEEZER</b> API
                </a>
            </div>
        </div>
    );
}

export default MixtoLogo;