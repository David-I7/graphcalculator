import { useEffect, useState } from "react";
import MobileState from "./mobile/MobileState";

const Globalstate = () => {
  return (
    <>
      <MobileState />
      {/* <TestState /> */}
    </>
  );
};

export default Globalstate;

function TestState() {
  const [primitive, setPrimitive] = useState<number>(0);
  const [mutable, setMutable] = useState<number[]>([1, 2, 3]);

  useEffect(() => {
    console.log("Effect with no dep running");
  });

  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: "white",
        bottom: "1rem",
        left: "50%",
        padding: "1rem",
        zIndex: 10000,
      }}
    >
      <button
        style={{ background: "grey" }}
        className="button--hovered"
        onClick={() => {
          setPrimitive(0);
        }}
      >
        Update primitve
      </button>
      <button
        style={{ background: "grey" }}
        className="button--hovered"
        onClick={() => {
          setMutable([...mutable]);
        }}
      >
        Update mutable
      </button>
    </div>
  );
}
