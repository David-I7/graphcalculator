import styles from "./spinner.module.scss";

const Spinner = ({ style }: { style?: React.CSSProperties }) => {
  return <div style={style} className={styles.spinner}></div>;
};

export default Spinner;
