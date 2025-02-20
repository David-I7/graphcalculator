import React, { ReactNode, useMemo, useRef } from "react";
import {
  FunctionLiteral,
  Plus,
  Quotes,
  SVGProps,
  Table,
} from "../../../../components/svgs";
import { useAppDispatch, useAppSelector } from "../../../../state/hooks";
import Dropdown, {
  DropdownButton,
} from "../../../../components/dropdown/Dropdown";
import { ExpressionType } from "../../../../lib/api/graph";
import { createExpression } from "../../../../state/graph/graph";
import { incrementNextId } from "../../../../state/graph/nextId";

type NewItemPair = [ExpressionType, (props: SVGProps) => ReactNode];

const NewItemDropdownMap = new Map<NewItemPair[0], NewItemPair[1]>([
  ["expression", FunctionLiteral],
  ["note", Quotes],
  ["table", Table],
]);

const ExpressionPanelNewItem = () => {
  const dispatch = useAppDispatch();
  const data = useMemo(() => [...NewItemDropdownMap.entries()], []);
  const nextId = useAppSelector((state) => state.nextIdSlice.nextId);
  return (
    <>
      <DropdownButton>
        <Dropdown.Button className="button--hovered bg-surface-container-low">
          <Plus />
        </Dropdown.Button>

        <Dropdown.Menu
          onClick={(arg) => {
            dispatch(
              createExpression({ id: nextId, type: arg[0], loc: "start" })
            );
            dispatch(incrementNextId());
          }}
          data={data}
          ListItem={DropdowmMenuItem}
        />
      </DropdownButton>
    </>
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
