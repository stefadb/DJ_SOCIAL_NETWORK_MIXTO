import { scaleTwProps } from "../functions/functions";

function Badge(props: { children: React.ReactNode, scale: number }) {
    return (
        <div
            className="absolute"
            style={scaleTwProps("bottom-1 right-1", props.scale)}
        >
            <div
                className="flex items-center justify-center bg-white rounded-full"
                style={scaleTwProps("w-6 h-6 shadow-md", props.scale)}
            >
                {props.children}
            </div>
        </div>
    );
}

export default Badge;