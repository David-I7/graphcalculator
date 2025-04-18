import { ReactElement, SetStateAction } from "react";
import styles from "./tabs.module.scss";

export function TabButton({
  idx,
  setActiveTab,
  icon,
  label,
  activeTab,
}: {
  idx: number;
  activeTab: number;
  setActiveTab: React.Dispatch<SetStateAction<number>>;
  label: string;
  icon?: ReactElement;
}) {
  return (
    <button
      className={activeTab === idx ? styles.activeTab : styles.tab}
      onClick={() => {
        if (activeTab === idx) return;
        setActiveTab(idx);
      }}
    >
      {icon}
      {label}
    </button>
  );
}
