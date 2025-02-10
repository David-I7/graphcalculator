import Graph from "../components/graph/Graph";
import Navbar from "../layout/navbar/Navbar";
import ControlPanel from "../layout/panel/ControlPanel";

const Home = () => {
  return (
    <>
      <main>
        <Navbar />
        <ControlPanel />
        <Graph />
      </main>
    </>
  );
};

export default Home;
