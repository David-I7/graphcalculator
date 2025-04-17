import FilledButton from "../../../../../components/buttons/common/FilledButton";
import { useDialogContext } from "../../../../../components/dialog/DialogContext";
import { useAppSelector } from "../../../../../state/hooks";
import AuthDialog from "../../menu/auth/AuthDialog";

const SaveGraphUnauthorized = () => {
  const currentGraph = useAppSelector((state) => state.graphSlice.currentGraph);
  const { isOpen, setIsOpen } = useDialogContext();

  return (
    <>
      <FilledButton
        aria-live="polite"
        disabled={!currentGraph.isModified}
        style={{ padding: "0 1rem" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        Save
      </FilledButton>
      <AuthDialog />
    </>
  );
};

export default SaveGraphUnauthorized;
