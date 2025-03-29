import React from "react";
import OutlinedButton from "../../../../components/buttons/common/OutlineButton";
import FilledButton from "../../../../components/buttons/common/FilledButton";

const GraphMenuHeader = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <>
      {!isAuthenticated && (
        <header className="graph-menu-unauthenticated">
          <div>
            <OutlinedButton>Log in</OutlinedButton>
            or
            <FilledButton>Sign up</FilledButton>
          </div>
          to save your graphs!
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
