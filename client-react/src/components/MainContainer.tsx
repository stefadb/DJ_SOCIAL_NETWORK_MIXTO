function MainContainer(props: { children: React.ReactNode }) {
  return (
    <main style={{overflowY: "auto", overflowX: "hidden"}}>
      {props.children}
    </main>
  );
}
export default MainContainer;