
function CommentoTree(props: { livello: number }) {
    const levelWidthStep = 10;
    //Array di numeri che vanno da 1 a props.livello
    const levels = Array.from({ length: props.livello }, (_, i) => i + 1);
    return <div className="box-border flex flex-row" style={{ width: (props.livello * levelWidthStep) + "%" }}>
        {levels.map((level) => {
            return (
                <div key={level} className="overflow-hidden" style={{ width: (100 / props.livello) + "%"}}>
                    <div style={{borderLeft: "1px solid #f0f0f0"}} className="relative left-3 h-full w-full"></div>
                </div>
            );
        })}
    </div>;
}

export default CommentoTree;