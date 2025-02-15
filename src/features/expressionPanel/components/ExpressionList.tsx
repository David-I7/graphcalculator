import ButtonTarget from "../../../components/buttons/target/ButtonTarget";
import { Close } from "../../../components/svgs";

type ExpressionListData = {
  type: "note" | "expression" | "table";
  payload: string;
  id: number;
};

const mockData: ExpressionListData[] = [
  { type: "expression", payload: "f(x) = 3x", id: 1 },
  { type: "expression", payload: "f(x) = x", id: 2 },
];

const ExpressionList = () => {
  return (
    <div className="expression-list">
      <ul>
        {mockData.map((item, index) => {
          return (
            <li key={item.id} className="expression-list__li">
              <div className="dynamic-island">
                <div className="dynamic-island__index">{index + 1}</div>
                <div className="dynamic-island__type">
                  {item.type === "expression" ? "f(x)" : '""'}
                </div>
              </div>

              <input defaultValue={item.payload}></input>

              <ButtonTarget
                title={`Delete ${item.type}`}
                className="button--hovered"
              >
                <Close width={24} height={24} />
              </ButtonTarget>
            </li>
          );
        })}
        <li key={"newExpression"} className="expression-list__li--faded">
          <div className="dynamic-island">
            <div className="dynamic-island__index">{mockData.length + 1}</div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default ExpressionList;
