import { useEffect, useState } from "react";
import MobileState from "./mobile/MobileState";
import { useFetch } from "../../hooks/api";
import { getGraphs } from "../../lib/api/graph";
import { parser } from "mathjs";

const Globalstate = () => {
  return (
    <>
      <MobileState />
      {/* <Test /> */}
    </>
  );
};

export default Globalstate;

function Test() {
  const mathParser = parser();
  mathParser.evaluate("b(x) = x");
  mathParser.evaluate("a=b");
  const f = mathParser.get("a");

  console.log(f(10));

  return null;
}

function TestState() {
  const [primitive, setPrimitive] = useState<number>(0);
  const [mutable, setMutable] = useState<number[]>([1, 2, 3]);

  // react batches these because they are synchronous
  // if (primitive === 0) {
  //   setPrimitive(1);
  // } else if (primitive === 1) {
  //   setPrimitive(2);
  // }
  useEffect(() => {
    console.log("Effect with no dep running");
  });

  useEffect(() => {
    if (primitive === 0) {
      setPrimitive(1);
    } else if (primitive === 1) {
      setPrimitive(2);
    }
  }, [primitive]);

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

// function FetchGraphs() {
//   const { isLoading, isError, data, error } = useFetch(getGraphs);

//   if (isLoading) return <div>Loading...</div>;

//   if (isError)
//     return (
//       <div>
//         Unexpected Error:
//         {JSON.stringify(error)}
//       </div>
//     );

//   return <pre>{JSON.stringify(data, null, 2)}</pre>;
// }

// function FetchWithSuspense({
//   fallback = "Loading...",
//   children,
// }: {
//   fallback?: ReactNode;
//   children: ReactNode;
// }) {
//   return <Suspense fallback={fallback}>{children}</Suspense>;
// }

// const FetchGraphsWithUse = <T,>({ p }: { p: Promise<T> }) => {
//   const data = use(p);

//   return <pre>{JSON.stringify(data, null, 2)}</pre>;
// };
