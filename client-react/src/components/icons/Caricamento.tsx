import { useEffect, useState } from "react";
import { deezerColor, getRandomGreyScale, mPoints, scaleTwProps } from "../../functions/functions";
import type { Scratch } from "../../types/types";

function Caricamento(props: { size: "veryTiny" | "tiny" | "small" | "large" | "giant", status: "loading" | "error" | "not-found" }) {
    const scales = {
        veryTiny: 0.5,
        tiny: 0.75,
        small: 1,
        large: 1.5,
        giant: 2
    }

    const scale = scales[props.size] || 1;

    const radius = Math.floor(40 * scale);

    const innerCircleRadiusRatio = 0.35;

    const innerCircleRadius = radius * innerCircleRadiusRatio;
    const QuarterCircleBR = (startX: number, startY: number, radius: number) => {
        // Calcolo del punto finale
        const endX = startX - radius;
        const endY = startY + radius;
        // Path SVG: usa 'a' per disegnare un arco
        const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
        return pathData;
    };

    //DISEGNO DELLA TESTINA DEL GIRADISCHI
    const curvePoint = 60;
    const testinaStartX = (94 - 10);
    const testinaStartY = curvePoint + 10;
    const manigliaTestinaStartX = testinaStartX - 2;
    const manigliaTestinaStartY = testinaStartY + 4;
    const testinaPoints: number[] = [
        97, 3,
        97, 12,
        94, 12,
        94, curvePoint,
        testinaStartX, testinaStartY,
        testinaStartX + 1, testinaStartY + 1,
        manigliaTestinaStartX, manigliaTestinaStartY,
        manigliaTestinaStartX + 4, manigliaTestinaStartY + 4,
        manigliaTestinaStartX + 3, manigliaTestinaStartY + 5,
        manigliaTestinaStartX - 1, manigliaTestinaStartY + 1,
        testinaStartX - 8, testinaStartY + 10,
        testinaStartX - 12, testinaStartY + 6,
        testinaStartX - 3, testinaStartY - 3,
        testinaStartX - 2, testinaStartY - 2,
        91, curvePoint - 2,
        91, 12,
        88, 12,
        88, 3
    ];

    const scratchesNumber = 128;
    const holeWidth = Math.floor(radius / 10); //Simula il buco del disco
    const segments = Array.from({ length: radius - holeWidth }, (_, i) => i + 1);
    const [scratches, setScratches] = useState<Scratch[]>([]);

    useEffect(() => {
        if (props.status == "error") {
            setScratches(Array.from({ length: scratchesNumber }, () => getScratch()));
        }
    }, [props.status]);

    useEffect(() => {
        if (props.status == "error") {
            setScratches(Array.from({ length: scratchesNumber }, () => getScratch()));
        }
    }, []);

    function getScratch(): Scratch {
        const p1 = generateScratchPoint();
        const p2 = generateScratchPoint();
        return {
            x1: p1.x,
            x2: p2.x,
            y1: p1.y,
            y2: p2.y,
            scratchDepth: Math.random() * 0.2 + 0.1
        }
    }

    function generateScratchPoint(): { x: number, y: number } {
        let x = 1;
        let y = 1;
        while (Math.sqrt(x * x + y * y) > 1) {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
        }
        return { x: x, y: y };
    }
    return (<div>
        <div id="guardami" style={scaleTwProps("w-[125px] h-[100px] rounded-[10px] bg-[#ddd] [border-style:inset] border-[4px] border-[#eee]", scale)}>
            <div style={scaleTwProps("relative left-[10px] top-[10px] w-[80px] h-[80px]", scale)}>
                <div>
                    <svg width={radius * 3} height={radius * 2} viewBox={`0 0 ${radius * 3} ${radius * 2}`}>
                        {segments.map((segment) => (
                            <circle
                                key={segment}
                                cx={radius}
                                cy={radius}
                                r={radius - segment}
                                fill="none"
                                stroke={props.status != "not-found" ? getRandomGreyScale() : "gray"}
                                strokeWidth="2"
                            />
                        ))}
                        {props.status == "not-found" &&
                            <text x={radius} y={radius + radius * 0.1} textAnchor="middle" dominantBaseline="middle" fontSize={radius} fill="#999">404</text>
                        }
                        {props.status != "not-found" &&
                            <>
                                <g className={props.status == "loading" ? "swing1" : undefined} style={{ transformOrigin: `${0}px ${0}px` }}>
                                    <path
                                        d={QuarterCircleBR((radius * 1.8), (radius), radius * 0.8)}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth={1}
                                    />
                                </g>
                                <g className={props.status == "loading" ? "swing2" : undefined} style={{ transformOrigin: `${0}px ${0}px` }}>
                                    <path
                                        d={QuarterCircleBR((radius * 1.6), (radius), radius * 0.6)}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth={1}
                                    />
                                </g>
                            </>
                        }
                        {props.status != "not-found" &&
                            <>
                                <circle cx={radius} cy={radius} r={innerCircleRadius} fill="white">
                                </circle>
                                <g className={props.status == "loading" ? "discRotation" : undefined} style={{ transformOrigin: `${0.6 * (innerCircleRadius)}px ${0.6 * (innerCircleRadius)}px` }}>
                                    <polygon points={mPoints().map(point => (radius - innerCircleRadius) + (point * (2 * innerCircleRadius))).join(" ")} fill="black" />
                                </g>
                            </>
                        }

                        <g className={props.status == "loading" ? "swing3" : undefined} style={{ transformOrigin: `${(88 - 72 + 4.6) * scale}px ${4.5 * scale}px` }}>
                            <polygon points={testinaPoints.map(point => point * scale).join(" ")} fill={deezerColor()} />
                        </g>
                        {props.status == "error" &&
                            <>
                                {scratches.map((scratch, index) => {
                                    return <line
                                        key={index}
                                        x1={radius + scratch.x1 * radius}
                                        x2={radius + scratch.x2 * radius}
                                        y1={radius + scratch.y1 * radius}
                                        y2={radius + scratch.y2 * radius}
                                        stroke={"#fff"}
                                        strokeWidth={scratch.scratchDepth}
                                        strokeLinecap={"round"}
                                    />;
                                })}
                            </>
                        }
                    </svg>
                </div >
            </div>
        </div>
        {props.status == "loading" &&
            <h4 style={scaleTwProps("w-[125px] my-1 text-[21.3333px] text-center", scale)}>Caricamento...</h4>
        }
        {props.status == "error" &&
            <h6 style={scaleTwProps("w-[125px] my-1 text-base text-red-500 text-center", scale)}>😢 Si è verificato un errore nel caricamento. Controlla la tua connessione a internet</h6>
        }
        {props.status == "not-found" &&
            <h5 style={scaleTwProps("w-[125px] my-1 text-base text-red-500 text-center", scale)}>😲 Quello che stavi cercando non c'è. Ci dispiace!</h5>
        }
    </div>);
}

export default Caricamento;