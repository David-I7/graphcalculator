import { SVGProps } from "../../svgs";
import styles from "./timeout.module.scss";

type TimeoutProps = SVGProps & {
  duration: number;
};

const Timeout = ({ duration, ...svgProps }: TimeoutProps) => {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      stroke="black"
      fill="none"
      transform="rotate(-90)"
      strokeWidth={3}
      strokeLinecap="round"
      {...svgProps}
      style={{
        ...svgProps.style,
        //@ts-ignore
        "--duration": `${Math.floor(duration / 1000)}s`,
      }}
    >
      <circle
        className={styles.circleOutline}
        cx="50%"
        cy="50%"
        r="10"
        fill="none"
        stroke="grey"
        strokeOpacity={0.3}
      />
      <circle className={styles.circle} cx="50%" cy="50%" r="10" />
    </svg>
  );
};

export default Timeout;
