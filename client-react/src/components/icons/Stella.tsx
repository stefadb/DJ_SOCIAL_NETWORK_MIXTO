function Stella(props: { fill: number, size: number, bgColor: string}) {
    const fill = Math.max(0, Math.min(1, props.fill));
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24">
            <rect x="3" y="3" width={18*fill} height="18" fill="yellow" />
            <rect x={3 + (18*fill)} y="3" width={18*(1-fill)} height="18" fill="#eee" />
            <polygon points="12.001 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 11.999 2 11.999 0 0 0 0 24 24 24 24 0 12.001 0" fill={props.bgColor}>
            </polygon>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" strokeWidth="1" stroke="#888" strokeLinecap="round" strokeLinejoin="round">
            </polygon>
        </svg>
    );
}

export default Stella;