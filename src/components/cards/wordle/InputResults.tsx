import { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import { api } from "../../../utils/api";
import { LoginInput } from "../../ui/LoginInput";

interface InputResultsProps {
  setUpdatePanelOpen: (value: boolean) => void;
  updatePanelOpen: boolean;
  // setData: (value: WordleData) => void;
  refreshGroups: () => Promise<void>;
  refreshQuery: () => Promise<void>;
}

const InputResults: React.FC<InputResultsProps> = ({ updatePanelOpen, setUpdatePanelOpen, refreshQuery, refreshGroups }) => {
  const [inputValue, setInputValue] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputWordleResults = api.wordle.update.useMutation();

  const onSubmit = async () => {
    try {
      // TODO: do smth with the data (don't refresh query if not needed)
      await inputWordleResults.mutateAsync({ data: inputValue, comment });
      // const { data } = await inputWordleResults.mutateAsync({ data: inputValue, comment });
      await refreshQuery();
      setUpdatePanelOpen(!updatePanelOpen);
      // setData(data);
      await refreshGroups();
    }
    catch (e: unknown) {
      if (e instanceof TRPCClientError) {
        const { message } = e;
        setError(message);
        setTimeout(() => setError(null), 7000);
      }
    }
  }

  return (
    <div className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex flex-col items-center w-[250px] p-2 rounded gap-2">
      <h3 className="text-2xl text-center">Wordle</h3>
      <h3 className="text-md text-center">Input results</h3>
      {error && (
        <div className="bg-red-400/70 p-2 rounded outline-1 outline-red-400 outline w-full text-center">
          {error}
        </div>
      )}
      <textarea
        className="p-2.5 w-full text-white bg-gray-600/10 rounded-lg border-1 border-gray-100/60 appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={8}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Input results here"
        />
      <LoginInput id={"wordle-comment"} type={"text"} placeholder={"Comment"} value={comment} onChange={e => setComment(e.target.value)} />
      <div
        className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex space-between gap-4 px-6 py-2 rounded-full hover:gap-6 transition-all cursor-pointer"
        onClick={() => { onSubmit().catch(e => console.error(e)) }}
        >
        <span>Update!</span>
        <span>→</span>
      </div>
    </div>
  );
}

export default InputResults;
