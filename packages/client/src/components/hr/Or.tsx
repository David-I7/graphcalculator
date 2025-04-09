import styles from "./hr.module.scss";

const Or = ({ style }: { style?: React.CSSProperties }) => {
  return (
    <div role="separator" style={style} className={styles.orSeparator}>
      <div></div>
      or
      <div></div>
    </div>
  );
};

export default Or;
