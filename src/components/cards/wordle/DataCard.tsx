import { WordleEmojiMap, type WordleData } from "../../../entities/types";

interface DataCardProps {
  data?: WordleData;
  setUpdatePanelOpen: (a: boolean) => void;
  updatePanelOpen: boolean;
}

const DataCard: React.FC<DataCardProps> = ({ data, setUpdatePanelOpen, updatePanelOpen }) => {
  if (!data) {
    return (
      <div className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex flex-col items-center w-[250px] p-2 rounded gap-2">
        <h3 className="text-xl text-center">Wordle</h3>
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
      <h3 className="text-xl text-center">Wordle</h3>
      <div className="">
        {`Game #${data.id}, ${data.score}/6`}
      </div>
      {data.rows.map((row, index) => (
        <div key={index}>
          {row.map((cell, index) => (
            <span key={index}>
              {Object.keys(WordleEmojiMap).find(key => WordleEmojiMap[key as keyof typeof WordleEmojiMap] === cell) || " "}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
};

export default DataCard;
