import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { useAppDispatch } from "../../../../state/hooks";
import {
  resetFocusedItem,
  setFocusedItem,
  updateItemContent,
} from "../../../../state/graph/graph";
import ResizableTextarea from "../../../../components/input/ResizableTextarea";
import { useClickOutside, useFocus } from "../../../../hooks/dom";
import { Item, ItemType } from "../../../../state/graph/types";
import { ApplicationError } from "../../../../state/error/error";
import { clampNumber } from "../../../graph/lib/graph/utils";

type ExpressionTextAreaProps<T extends ItemType = ItemType> = {
  focused: boolean;
  item: Item<T>;
  dispatch: ReturnType<typeof useAppDispatch>;
  idx: number;
  error: ApplicationError | null;
};

const handleFocus = (id: number) => {
  const listItem = document.querySelector(`[expr-id="${id}"]`) as HTMLLIElement;
  listItem.classList.add("expression-list__li--focused");
};

const handleBlur = (id: number) => {
  const listItem = document.querySelector(`[expr-id="${id}"]`) as HTMLLIElement;
  listItem.classList.remove("expression-list__li--focused");
};

const ExpressionTextArea = (props: ExpressionTextAreaProps) => {
  switch (props.item.type) {
    case "expression":
      return (
        <FunctionTextArea
          {...(props as ExpressionTextAreaProps<"expression">)}
        />
      );
    case "note":
      return <NoteTextArea {...(props as ExpressionTextAreaProps<"note">)} />;
  }
};

export default ExpressionTextArea;

const isValidValue = (item: Item<"expression">): boolean => {
  return (
    item.data.parsedContent !== undefined &&
    (item.data.parsedContent?.scopeDeps.length > 0 ||
      item.data.parsedContent?.node.search(/e|pi/) !== -1)
  );
};

const FunctionTextArea = ({
  focused,
  item,
  dispatch,
  idx,
  error,
}: ExpressionTextAreaProps<"expression">) => {
  const ref = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string>(item.data.content);
  const deferredInput = useDeferredValue(input);
  const onFocus = useCallback(() => handleFocus(item.id), [item.id]);
  const onBlur = useCallback(() => {
    ref.current?.blur();
    handleBlur(item.id);
  }, [item.id]);

  useFocus(focused, ref, onFocus, onBlur);

  useEffect(() => {
    if (item.data.content !== deferredInput) {
      dispatch(
        updateItemContent({
          id: item.id,
          content: deferredInput,
          idx: idx,
        })
      );
    }
  }, [deferredInput]);

  useEffect(() => {
    if (item.data.content !== input) {
      setInput(item.data.content);
    }
  }, [item.data]);

  return (
    <div
      style={{
        display: "grid",
        flex: 1,
      }}
    >
      <div className="function-input-container">
        <input
          className="function-input"
          ref={ref}
          autoFocus={focused}
          value={input}
          onFocus={() => {
            if (!focused) {
              dispatch(setFocusedItem(item.id));
            }
          }}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        ></input>
      </div>

      {!error && item.data.type === "variable" && isValidValue(item) && (
        <div className="function-input-value-container">
          ={" "}
          <div className="function-input-value">
            {clampNumber(item.data.parsedContent!.value, 8)}
          </div>
        </div>
      )}
    </div>
  );
};
const NoteTextArea = ({
  focused,
  item,
  dispatch,
  idx,
}: ExpressionTextAreaProps<"note">) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState<string>(item.data.content);
  const deferredInput = useDeferredValue(input);

  const onFocus = useCallback(() => {
    handleFocus(item.id);
  }, [item.id]);
  const onBlur = useCallback(() => {
    handleBlur(item.id);
  }, [item.id]);

  useFocus(focused, ref, onFocus, onBlur);

  useEffect(() => {
    if (item.data.content !== deferredInput) {
      dispatch(
        updateItemContent({
          id: item.id,
          content: deferredInput,
          idx: idx,
        })
      );
    }
  }, [deferredInput]);

  useEffect(() => {
    if (item.data.content !== input) {
      setInput(item.data.content);
    }
  }, [item.data]);

  return (
    <ResizableTextarea
      ref={ref}
      container={{
        className: "font-medium",
        style: {
          fontSize: "1rem",
          color: CSS_VARIABLES.onSurfaceBodyHigh,
          paddingRight: "3.5rem",
          paddingLeft: "1rem",
        },
      }}
      textarea={{
        onFocus: () => {
          if (!focused) dispatch(setFocusedItem(item.id));
        },
        autoFocus: focused,
        value: input,
        onChange: (e) => setInput(e.target.value),
      }}
    />
  );
};
