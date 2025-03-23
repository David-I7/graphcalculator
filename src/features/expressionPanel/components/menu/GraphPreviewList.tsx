import React, { ReactNode } from "react";
import { GraphData } from "../../../../state/graph/types";

const GraphPreviewList = ({
  data,
  children,
}: {
  data: GraphData[];
  children: ReactNode;
}) => {
  return (
    <ul onClick={(e) => {}} className="preview-list">
      {children}
    </ul>
  );
};

export const PreviewListItem = ({
  item,
  body,
}: {
  item: GraphData;
  body: string;
}) => {
  return (
    <li className="preview-list-item">
      <div className="preview-list-item-left">
        <img src={item.graphSnapshot.image} loading="lazy" />
      </div>
      <div className="preview-list-item-right">
        <h3>{item.name}</h3>
        {body}
      </div>
    </li>
  );
};

export default GraphPreviewList;
