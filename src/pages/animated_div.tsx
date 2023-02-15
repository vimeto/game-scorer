import { useState } from "react";
import FlipCard from "../components/FlipCard"

const AnimatedDiv = () => {
  const [selected, setSelected] = useState(false);

  return (
    <FlipCard shown={<div>Shown</div>} hidden={<div>Hidden</div>} selected={selected} setSelected={setSelected} />
  );
}

export default AnimatedDiv;
