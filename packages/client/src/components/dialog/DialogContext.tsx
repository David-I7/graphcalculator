import {
  ReactNode,
  useContext,
  createContext,
  useState,
  useRef,
  useEffect,
  RefObject,
} from "react";

type DialogContextState = {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  ref: RefObject<HTMLDialogElement | null>;
  isOpen: boolean;
};

const DialogContext = createContext<DialogContextState | undefined>(undefined);

function initDialogContext(): DialogContextState {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  return { ref, setIsOpen, isOpen };
}

export function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (ctx === undefined)
    throw new Error("Dialog context can be accessed only by its children.");
  return ctx;
}

type DialogProviderProps = {
  children: ReactNode;
};

export function DialogProvider({ children }: DialogProviderProps) {
  return (
    <DialogContext.Provider value={initDialogContext()}>
      {children}
    </DialogContext.Provider>
  );
}
