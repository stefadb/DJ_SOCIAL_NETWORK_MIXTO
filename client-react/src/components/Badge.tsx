import { blackBoxShadow } from "../functions/functions";

function Badge(props: { children: React.ReactNode, scale: number }) {
    return (
        <div
            className="absolute z-10"
            style={{ bottom: 4 * props.scale, right: 4 * props.scale }}
        >
            <div
                className="flex items-center justify-center bg-white rounded-full"
                style={{ width: 24 * props.scale, height: 24 * props.scale, boxShadow: blackBoxShadow(props.scale) }}
            >
                {props.children}
            </div>
        </div>
    );
}

export default Badge;