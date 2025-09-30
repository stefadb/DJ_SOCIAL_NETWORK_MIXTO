function MainContainer(props: { children: React.ReactNode }) {
  return (
    <main style={{overflowY: "auto", overflowX: "hidden", padding: "10px"}}>
      {props.children}
    </main>
  );
}
export default MainContainer;