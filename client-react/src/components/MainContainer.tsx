function MainContainer(props: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 box-border">
      {props.children}
      <div className="h-8"></div>
    </main>
  );
}
export default MainContainer;