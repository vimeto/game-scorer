import { useState } from "react";
import { type WordleData } from "../entities/types";
import DataCard from "./cards/wordle/DataCard";
import InputResults from "./cards/wordle/InputResults";
import FlipCard from "./FlipCard";

const WordleCard: React.FC = () => {
  const [updatePanelOpen, setUpdatePanelOpen] = useState(false);
  const [data, setData] = useState<WordleData>();
  // const [data, setData] = useState<WordleData>({
  //   id: 600,
  //   score: 2,
  //   rows: [[2, 0, 2, 1, 2], [ 2, 2, 2, 2, 2]]
  // });

  const front = <DataCard data={data} setUpdatePanelOpen={setUpdatePanelOpen} updatePanelOpen={updatePanelOpen} />;
  const back = <InputResults setUpdatePanelOpen={setUpdatePanelOpen} updatePanelOpen={updatePanelOpen} setData={setData} />;

  return (
    <FlipCard shown={back} hidden={front} selected={updatePanelOpen} setSelected={setUpdatePanelOpen} />
  );
};

export default WordleCard;
