function SideContainer(props: { children: React.ReactNode }) {
    return (
        <aside>
            {props.children}
        </aside>
    );
}

export default SideContainer;