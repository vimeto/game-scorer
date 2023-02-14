import { type ContextoData } from "../../../entities/types";

interface DataCardProps {
  data?: ContextoData;
  setUpdatePanelOpen: (a: boolean) => void;
  updatePanelOpen: boolean;
}

const DataCard: React.FC<DataCardProps> = ({ data, setUpdatePanelOpen, updatePanelOpen }) => {
  if (!data) {
    return (
      <div className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex flex-col items-center w-[250px] p-2 rounded gap-2">
        <h3 className="text-2xl text-center">Contexto</h3>
        <h3 className="text-md text-center">No data yet for #xxx</h3>
        <div
          onClick={() => setUpdatePanelOpen(!updatePanelOpen)}
          className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex space-between gap-4 px-6 py-2 rounded-full hover:gap-6 transition-all cursor-pointer">
          <span>Add data!</span>
          <span>→</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex flex-col items-center w-[250px] p-2 rounded gap-2">
      <h3 className="text-2xl text-center">Contexto</h3>
      <div>
        {`Game #${data.id}, score ${data.score}`}
      </div>
      <div>
        <div>{data.scores.green && `🟩 ${data.scores.green}`}</div>
        <div>{data.scores.yellow && `🟨 ${data.scores.yellow}`}</div>
        <div>{data.scores.red && `🟥 ${data.scores.red}`}</div>
      </div>
      {data.comment && (
        <div className="bg-[#C7B8EA] text-white text-sm font-semibold rounded-t-xl rounded-br-xl p-2">
          {data.comment}
        </div>
      )}
    </div>
  )
};

export default DataCard;
