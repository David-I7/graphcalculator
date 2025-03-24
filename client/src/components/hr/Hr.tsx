import { CSSProperties } from "react";
import styles from "./hr.module.scss";

const Hr = ({ style }: { style?: CSSProperties }) => {
  return <hr style={style} className={styles.hr} />;
};

export default Hr;
