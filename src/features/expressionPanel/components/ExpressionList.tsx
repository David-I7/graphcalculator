import { useState } from "react";
import ButtonTarget from "../../../components/buttons/target/ButtonTarget";
import { Close } from "../../../components/svgs";

type ExpressionListData = {
  type: "note" | "expression" | "table" | null;
  payload: string;
  id: number;
};

const mockData: ExpressionListData[] = [
  { type: "expression", payload: "f(x) = 3x", id: 1 },
  { type: "expression", payload: "f(x) = x", id: 2 },
];

const ExpressionList = () => {
  const [state, setState] = useState<ExpressionListData[]>(mockData);

  return (
    <div className="expression-list">
      <ul>
        {state.map((item, index) => {
          return (
            <li draggable key={item.id} className="expression-list__li">
              <div className="dynamic-island">
                <div className="dynamic-island__index">{index + 1}</div>
                <div className="dynamic-island__type">
                  {item.type === "expression"
                    ? "f(x)"
                    : item.type === "note"
                    ? '""'
                    : undefined}
                </div>
              </div>

              <input
                autoFocus={index === state.length - 1 ? true : false}
                defaultValue={item.payload}
              ></input>

              <ButtonTarget
                onClick={(e) => {
                  setState(
                    state.filter((filterdItem) => filterdItem.id !== item.id)
                  );
                }}
                title={`Delete ${item.type}`}
                className="button--hovered"
              >
                <Close width={24} height={24} />
              </ButtonTarget>
            </li>
          );
        })}
        <li
          role="button"
          onClick={() => {
            setState([
              ...state,
              { type: null, payload: "", id: state[state.length - 1].id + 1 },
            ]);
          }}
          className="expression-list__li--faded"
        >
          <div className="dynamic-island">
            <div className="dynamic-island__index">{state.length + 1}</div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default ExpressionList;
