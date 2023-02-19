import { useEffect, useState } from "react";
import { type WordleData } from "../entities/types";
import { getWordleIdentifier } from "../entities/wordleHelper";
import { api } from "../utils/api";
import DataCard from "./cards/wordle/DataCard";
import InputResults from "./cards/wordle/InputResults";
import FlipCard from "./FlipCard";

interface WordleCardProps {
  refreshGroups: () => Promise<void>;
}

const WordleCard: React.FC<WordleCardProps> = ({ refreshGroups }) => {
  const wordleIdentifier = getWordleIdentifier();
  const query = api.wordle.get.useQuery({ identifier: wordleIdentifier });

  const [updatePanelOpen, setUpdatePanelOpen] = useState(false);
  const [data, setData] = useState<WordleData>();

  useEffect(() => {
    if (query.data?.data) {
      setData(query.data.data);
    }
  }, [query.data]);

  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Error :(</div>;

  const front = <DataCard data={data} setUpdatePanelOpen={setUpdatePanelOpen} updatePanelOpen={updatePanelOpen} />;
  const back = <InputResults
    setUpdatePanelOpen={setUpdatePanelOpen}
    updatePanelOpen={updatePanelOpen}
    setData={setData}
    refreshGroups={refreshGroups}
    />;

  return (
    <FlipCard shown={back} hidden={front} selected={updatePanelOpen} setSelected={setUpdatePanelOpen} />
  );
};

export default WordleCard;
