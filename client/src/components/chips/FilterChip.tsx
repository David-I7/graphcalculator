import { ButtonHTMLAttributes, ReactNode, useMemo } from "react";
import styles from "./chips.module.scss";

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  isSelected: boolean;
};

const FilterChip = ({ children, isSelected, ...btnProps }: FilterChipProps) => {
  const mergeClassnames = (isSelected: boolean) => {
    let mergedClassname = "";
    mergedClassname = btnProps.className ? btnProps.className : "";
    mergedClassname = isSelected
      ? mergedClassname + " " + styles.filterChipSelected
      : mergedClassname + " " + styles.filterChip;

    return mergedClassname;
  };
  const mergedClassname = useMemo(
    () => mergeClassnames(isSelected),
    [btnProps.className, isSelected]
  );

  return (
    <button {...btnProps} className={mergedClassname}>
      {children}
    </button>
  );
};

export default FilterChip;
