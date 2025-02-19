import React, { ReactNode, useMemo, useRef } from "react";
import {
  FunctionLiteral,
  Plus,
  Quotes,
  SVGProps,
  Table,
} from "../../../../components/svgs";
import { useAppDispatch } from "../../../../state/hooks";
import Dropdown, {
  DropdownButton,
} from "../../../../components/dropdown/Dropdown";
import { ExpressionType } from "../../../../lib/api/graph";
import { CSS_VARIABLES } from "../../../../data/css/variables";
import { useSetDynamicProp } from "../../../../hooks/dom";

type NewItemPair = [ExpressionType, (props: SVGProps) => ReactNode];

const NewItemDropdownMap = new Map<NewItemPair[0], NewItemPair[1]>([
  ["expression", FunctionLiteral],
  ["note", Quotes],
  ["table", Table],
]);

const ExpressionPanelNewItem = () => {
  const dispatch = useAppDispatch();
  const data = useMemo(() => [...NewItemDropdownMap.entries()], []);
  // const ref = useRef<HTMLButtonElement>(null);
  // useSetDynamicProp(ref, "--dynamic-color", CSS_VARIABLES.surfaceContainer);
  return (
    <>
      <DropdownButton
      // ref={ref}
      >
        <Dropdown.Button className="button--hovered bg-surface-container-low">
          <Plus />
        </Dropdown.Button>

        <Dropdown.Menu data={data} ListItem={DropdowmMenuItem} />
      </DropdownButton>
    </>
  );
};

export default ExpressionPanelNewItem;

function DropdowmMenuItem({ data: [label, SVG] }: { data: NewItemPair }) {
  return (
    <li className="new-graph-item">
      <SVG />
      {label}
    </li>
  );
}
