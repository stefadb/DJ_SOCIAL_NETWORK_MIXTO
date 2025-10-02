import { largePadding } from "../functions/functions";

function MainContainer(props: { children: React.ReactNode }) {
  return (
    <main style={{overflowY: "auto", overflowX: "hidden", padding: largePadding(), boxSizing: "border-box"}}>
      {props.children}
    </main>
  );
}
export default MainContainer;