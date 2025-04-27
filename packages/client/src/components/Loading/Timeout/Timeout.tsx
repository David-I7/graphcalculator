import { SVGProps } from "../../svgs";
import styles from "./timeout.module.scss";

type TimeoutProps = SVGProps & {
  duration: number;
};

const Timeout = ({ duration, ...svgProps }: TimeoutProps) => {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      {...svgProps}
      fill="none"
      style={{
        ...svgProps.style,
        //@ts-ignore
        "--duration": `${Math.floor(duration / 1000 / 4)}s`,
      }}
    >
      <circle className={styles.circle} cx="50%" cy="50%" r="10" />
    </svg>
  );
};

export default Timeout;
