import AuthDialog from "./AuthDialog";

const GraphMenuHeader = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <>
      {!isAuthenticated && (
        <header className="graph-menu-unauthenticated">
          <AuthDialog />
        </header>
      )}
      {isAuthenticated && (
        <header className="graph-menu-authenticated">
          Logout controls; Search controls
        </header>
      )}
    </>
  );
};

export default GraphMenuHeader;
