import { useEffect, useState } from "react";
import { getContextoIdentifierFromWordleIdentifier, type ContextoData } from "../entities/types";
import { getWordleIdentifier } from "../entities/wordleHelper";
import { api } from "../utils/api";
import DataCard from "./cards/contexto/DataCard";
import InputResults from "./cards/contexto/InputResults";
import FlipCard from "./FlipCard";

interface ContextoCardProps {
  refreshGroups: () => Promise<void>;
}

const ContextoCard: React.FC<ContextoCardProps> = ({ refreshGroups }) => {
  const wordleIdentifier = getWordleIdentifier();
  const query = api.contexto.get.useQuery({ identifier: getContextoIdentifierFromWordleIdentifier(wordleIdentifier) });

  const [updatePanelOpen, setUpdatePanelOpen] = useState(false);
  const [data, setData] = useState<ContextoData>();

  useEffect(() => {
    if (query.data?.data) {
      setData(query.data.data);
    }
  }, [query.data]);

  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Error :(</div>;
  // const [data, setData] = useState<ContextoData>({
  //   id: 144,
  //   score: 35,
  //   scores: {
  //       green: 8,
  //       yellow: 12,
  //       red: 15
  //   }
  // });

  const front = <DataCard data={data} setUpdatePanelOpen={setUpdatePanelOpen} updatePanelOpen={updatePanelOpen} />;
  const back = (
    <InputResults
      setUpdatePanelOpen={setUpdatePanelOpen}
      updatePanelOpen={updatePanelOpen}
      // setData={setData}
      refreshQuery={async () => { await query.refetch() }}
      refreshGroups={refreshGroups}
      />
  );

  return (
    <FlipCard shown={back} hidden={front} selected={updatePanelOpen} setSelected={setUpdatePanelOpen} />
  );
};

export default ContextoCard;
