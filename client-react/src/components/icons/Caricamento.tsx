import { useRef } from "react";
import { scaleTwProps } from "../../functions/functions";

function Caricamento(props: {size: "tiny" | "small" | "large" | "giant"}) {
    const scales = {
        tiny: 0.75,
        small: 1,
        large: 1.5,
        giant: 2
    }
    
    const scale = scales[props.size] || 1;

    const radius = Math.floor(40 * scale);

    const h4Ref = useRef<HTMLHeadingElement>(null);

    const innerCircleRadius = radius * 0.35;
    const QuarterCircleBR = (startX: number, startY: number, radius: number) => {
        // Calcolo del punto finale
        const endX = startX - radius;
        const endY = startY + radius;
        // Path SVG: usa 'a' per disegnare un arco
        const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
        return pathData;
    };

    function cambiaPuntiHeading(){
        if(h4Ref.current){
            if(h4Ref.current.innerText == "Caricamento..."){
                h4Ref.current.innerText = "Caricamento.";
            } else {
                h4Ref.current.innerText += ".";
            }
        }
    }

    //Eesegui cambiaPuntiHeading 3 volte al secondo

    setInterval(cambiaPuntiHeading, 1000/3);

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

    const sqrt2 = Math.sqrt(2);

    const mPoints: number[] = [
        0.2, 0.2,
        0.3,0.2,
        0.5,0.4,
        0.7,0.2,
        0.8,0.2,
        0.8,0.8,
        0.7,0.8,
        0.7,0.2 + sqrt2 * 0.1,
        0.5,0.4 + sqrt2 * 0.1,
        0.3,0.2 + sqrt2 * 0.1,
        0.3,0.8,
        0.2,0.8
    ];

    const minimumGreyScale = 32;
    const maximumGreyScale = 64;
    const holeWidth = Math.floor(radius / 10); //Simula il buco del disco
    const segments = Array.from({ length: radius - holeWidth }, (_, i) => i + 1);
    function getRandomGreyScale() {
        const greyValue = Math.floor(Math.random() * (maximumGreyScale - minimumGreyScale + 1)) + minimumGreyScale;
        return `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
    }
    return (<div id="guardami" style={scaleTwProps("w-[125px] h-[100px] rounded-[10px] bg-[#ddd] [border-style:inset] border-[4px] border-[#eee]",scale)}>
        <div style={scaleTwProps("relative left-[10px] top-[10px] w-[80px] h-[80px]",scale)}>
            <div>
                <svg width={radius * 3} height={radius * 2} viewBox={`0 0 ${radius * 3} ${radius * 2}`}>
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
                    <g className="swing1" style={{ transformOrigin: `${0}px ${0}px` }}>
                        <path
                            d={QuarterCircleBR((radius * 1.8), (radius), radius * 0.8)}
                            fill="none"
                            stroke="white"
                            strokeWidth={1}
                        />
                    </g>
                    <g className="swing2" style={{ transformOrigin: `${0}px ${0}px` }}>
                        <path
                            d={QuarterCircleBR((radius * 1.6), (radius), radius * 0.6)}
                            fill="none"
                            stroke="white"
                            strokeWidth={1}
                        />
                    </g>
                    <circle cx={radius} cy={radius} r={innerCircleRadius} fill="white">
                    </circle>
                    <g className="discRotation" style={{ transformOrigin: `${0.6 * (innerCircleRadius)}px ${0.6 * (innerCircleRadius)}px` }}>
                        <polygon points={mPoints.map(point => (radius - innerCircleRadius) + (point * (2*innerCircleRadius))).join(" ")} fill="black" />
                    </g>
                    <g className="swing3" style={{ transformOrigin: `${(88 - 72 + 4.6)* scale}px ${4.5* scale}px` }}>
                        <polygon points={testinaPoints.map(point => point * scale).join(" ")} fill="#A238FF" />
                    </g>
                </svg>
            </div >
        </div>
        <h4 ref={h4Ref} style={scaleTwProps("text-[21.3333px]",scale)}>Caricamento.</h4>
    </div>);
}

export default Caricamento;