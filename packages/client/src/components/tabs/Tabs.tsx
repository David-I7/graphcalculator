import React, { ReactElement, useState } from "react";
import { Tab } from "./Tab";
import { TabButton } from "./TabButton";
import styles from "./tabs.module.scss";

type TabProps = {
  children: (ReactElement<any, typeof Tab> | null | undefined)[];
  initialActiveTab?: number;
};

const Tabs = ({ children, initialActiveTab = 0 }: TabProps) => {
  const [activeTab, setActiveTab] = useState<number>(initialActiveTab);

  const header = children.map((child, idx) => {
    if (!child) return;
    if (child.type !== Tab) throw new Error("Children must be Tab instances");

    return (
      <TabButton
        activeTab={activeTab}
        key={child.props.label}
        label={child.props.label}
        idx={idx}
        icon={child.props.icon}
        setActiveTab={setActiveTab}
      />
    );
  });

  return (
    <div className={styles.tabs}>
      <div className={styles.tabsHeader}>{header}</div>
      {children[activeTab]?.props.content}
    </div>
  );
};

export default Tabs;
