import { DialogProvider } from "../../../../../components/dialog/DialogContext";
import apiSlice from "../../../../../state/api/apiSlice";
import SaveGraphAuthorized from "./SaveGraphAuthorized";
import SaveGraphUnauthorized from "./SaveGraphUnauthorized";

const ExpressionPanelSaveGraph = () => {
  const userSession = apiSlice.endpoints.getUser.useQueryState(undefined);

  if (!userSession.data) {
    return (
      <DialogProvider>
        <SaveGraphUnauthorized />
      </DialogProvider>
    );
  }

  return <SaveGraphAuthorized />;
};

export default ExpressionPanelSaveGraph;
