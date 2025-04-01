import AuthDialog from "./auth/AuthDialog";

const GraphMenuHeader = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <>
      {!isAuthenticated && (
        <header>
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
