import { largePadding } from "../functions/functions";

function MainContainer(props: { children: React.ReactNode }) {
  return (
    <main style={{overflowY: "auto", overflowX: "hidden", padding: largePadding(), boxSizing: "border-box"}}>
      <div className="main-container min-h-screen">{props.children}</div>
    </main>
  );
}
export default MainContainer;