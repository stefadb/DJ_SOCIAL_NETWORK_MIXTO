function MainContainer(props: { children: React.ReactNode }) {
  return (
    <main style={{overflowY: "auto", overflowX: "hidden", padding: "10px", boxSizing: "border-box"}}>
      {props.children}
    </main>
  );
}
export default MainContainer;