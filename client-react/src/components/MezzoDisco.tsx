function MezzoDisco(props: {radius: number}) {
    const radius = Math.floor(props.radius);
    const minimumGreyScale = 32;
    const maximumGreyScale = 64;
    const widthReduce = Math.floor(radius * 0.06);
    const holeWidth = Math.floor(radius / 10); //Simula il buco del disco
    const segments = Array.from({ length: radius - holeWidth - widthReduce}, (_, i) => i + 1 + widthReduce);
    function getRandomGreyScale() {
        const greyValue = Math.floor(Math.random() * (maximumGreyScale - minimumGreyScale + 1)) + minimumGreyScale;
        return `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
    }
    return (
        <div>
            <svg width={radius * 2} height={radius * 2} viewBox={`${radius} 0 ${radius * 2} ${radius * 2}`}>
                {segments.map((segment) => (
                    <path
                        key={segment}
                        d={`M${radius},${segment} A${radius - segment},${radius - segment} 0 0,1 ${radius},${(radius*2) - segment}`}
                        fill="none"
                        stroke={getRandomGreyScale()}
                        strokeWidth="2"
                    />
                ))}
            </svg>
        </div>
    );
}

export default MezzoDisco;