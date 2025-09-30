function AlbumIcon(props: {size: number,color: string}){
    function drawRightHalfCirclePath(startX: number, startY: number, radius: number) {
      const endX = startX;
      const endY = startY + 2 * radius;
      return `M${startX},${startY} A${radius},${radius} 0 0,1 ${endX},${endY}`;
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke={props.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="12" r="9"></circle>
            <circle cx="10" cy="12" r="3"></circle>
            <path d={drawRightHalfCirclePath(14, 3, 9)}></path>
        </svg>
    );
}

export default AlbumIcon;