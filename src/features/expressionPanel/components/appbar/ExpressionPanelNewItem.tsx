import { ReactNode, useMemo } from "react";
import {
  FunctionLiteral,
  Plus,
  Quotes,
  SVGProps,
} from "../../../../components/svgs";
import { useAppDispatch } from "../../../../state/hooks";
import Dropdown, {
  DropdownButton,
} from "../../../../components/dropdown/Dropdown";
import { createItem } from "../../../../state/graph/graph";
import { ItemType } from "../../../../state/graph/types";
import Tooltip from "../../../../components/tooltip/Tooltip";

type NewItemPair = [ItemType, (props: SVGProps) => ReactNode];

const NewItemDropdownMap = new Map<NewItemPair[0], NewItemPair[1]>([
  ["expression", FunctionLiteral],
  ["note", Quotes],
]);

const ExpressionPanelNewItem = () => {
  const dispatch = useAppDispatch();
  const data = useMemo(() => [...NewItemDropdownMap.entries()], []);

  return (
    <Tooltip
      message="New Item"
      content={(id) => (
        <DropdownButton>
          <Dropdown.Button
            aria-label="New Item"
            aria-describedby={id}
            className="button--hovered bg-surface-container-low"
          >
            <Plus />
          </Dropdown.Button>

          <Dropdown.Menu
            onClick={(arg) => {
              dispatch(createItem({ type: arg[0], loc: "start" }));
            }}
            data={data}
            ListItem={DropdowmMenuItem}
          />
        </DropdownButton>
      )}
    />
  );
};

export default ExpressionPanelNewItem;

function DropdowmMenuItem({
  data: [label, SVG],
  handleClick,
}: {
  data: NewItemPair;
  handleClick: (arg: NewItemPair) => void;
}) {
  return (
    <li className="new-graph-item">
      <button
        onClick={() => {
          handleClick([label, SVG]);
        }}
      >
        <SVG />
        {label}
      </button>
    </li>
  );
}
