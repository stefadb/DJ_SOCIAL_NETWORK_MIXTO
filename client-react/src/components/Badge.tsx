import { blackBoxShadow } from "../functions/functions";

function Badge(props: { children: React.ReactNode, scale: number }) {
    return (
        <div style={{ position: "absolute", bottom: 4 * props.scale, right: 4 * props.scale, zIndex: 10 }}>
            <div style={{ width: 24 * props.scale, height: 24 * props.scale, backgroundColor: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: blackBoxShadow(props.scale) }}>
                {props.children}
            </div>
        </div>
    );
}

export default Badge;