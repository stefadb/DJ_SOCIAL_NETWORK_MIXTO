function MainContainer(props: { children: React.ReactNode }) {
  return (
    <main className="overflow-y-auto overflow-x-hidden p-3 box-border">
      <div className="main-container min-h-screen">
        {props.children}
        <div className="h-8"></div>
      </div>
    </main>
  );
}
export default MainContainer;