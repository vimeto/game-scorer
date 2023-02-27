import { Fragment, useEffect, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";

import { type GroupResultType } from "../../../entities/types";
import { getWordleIdentifierForDate } from "../../../entities/wordleHelper";
import { api } from "../../../utils/api";
import WordleResultsCell from "./ResultCards/Wordle";
import ContextoResultsCell from "./ResultCards/Contexto";




const getStartValue = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  return {
    startDate,
    endDate,
  };
}

// const getInputObject = () => {
//   const toWordleIdentifier = getWordleIdentifier();
//   const fromWordleIdentifier = toWordleIdentifier - 6;
//   return {
//     fromWordleIdentifier,
//     toWordleIdentifier,
//   }
// }

interface DateValues {
  startDate: Date;
  endDate: Date;
}

interface DateValuesForMethod {
  startDate: Date | string | null;
  endDate: Date | string | null;
}

const convertDateObjectToWordleRange = (dateValues: DateValues) => {
  const { startDate, endDate } = dateValues;
  const wordleIdentifierStart = getWordleIdentifierForDate(startDate);
  const wordleIdentifierEnd = getWordleIdentifierForDate(endDate);
  return {
    fromWordleIdentifier: wordleIdentifierStart,
    toWordleIdentifier: wordleIdentifierEnd,
  };
}

const ResultsCard: React.FC<{ id: string }> = ({ id }) => {
  const [dateValues, setDateValues] = useState<DateValues>(getStartValue());
  const [loading, setLoading] = useState(false);
  const [myResults, setMyResults] = useState<Record<string, GroupResultType>>({});
  const [bestResults, setBestResults] = useState<Record<string, GroupResultType>>({});

  const mutation = api.group.weekResults.useMutation();

  const handleDateValueChange = (newValue: DateValuesForMethod | null) => {
    if (!newValue) return;

    const { startDate, endDate } = newValue;
    if (!startDate || !endDate) return;

    const datesParsed = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
    setDateValues(datesParsed);
  }

  useEffect(() => {
    const refetchQuery = async () => {
      try {
        setLoading(true);
        const res = await mutation.mutateAsync({ ...convertDateObjectToWordleRange(dateValues), id });
        setMyResults(res.myResults);
        setBestResults(res.bestResults);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };

    refetchQuery().catch(e => console.error(e));
  }, [id, dateValues]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || (Object.keys(myResults).length === 0 && Object.keys(bestResults).length === 0)) return <div>Loading...</div>

  return (
    <div className="text-white max-w-screen-sm mx-auto mt-12 rounded flex flex-col gap-4">
      <Datepicker
        value={dateValues}
        onChange={(data,) => handleDateValueChange(data)}
        maxDate={new Date()}
        startWeekOn={"mon"}
        inputClassName="bg-gray-500/10 text-white rounded"
        readOnly
        />
      <table className="table-auto w-full text-left">
        <thead>
        <tr className="bg-gray-500/10 text-white">
          <th className="border-b px-4 py-2">Date</th>
          <th className="border-b px-4 py-2">Me</th>
          <th className="border-b px-4 py-2">Winner</th>
        </tr>
      </thead>
      <tbody>
        {bestResults && Object.keys(bestResults).map((date, index) => (
          <Fragment key={index}>
            <tr className={`${index % 2 ? "bg-gray-300/10" : "bg-white/10"}`}>
              <td className={`border-r px-4 py-2`}>{date}</td>
              <WordleResultsCell data={myResults[date]?.Wordle} className={'px-4 py-2 border-x'} bestResults={false} />
              <WordleResultsCell data={bestResults[date]?.Wordle} className={'px-4 py-2'} bestResults={true} />
            </tr>
            <tr className={`${index % 2 ? "bg-gray-300/10" : "bg-white/10"}`}>
              <td className={`border-r px-4 py-2 ${index === Object.keys(bestResults).length - 1 ? "rounded-bl" : ""}`} />
              <ContextoResultsCell data={myResults[date]?.Contexto} className={'px-4 py-2 border-x'} bestResults={false} />
              <ContextoResultsCell data={bestResults[date]?.Contexto} className={`px-4 py-2 ${index === Object.keys(bestResults).length - 1 ? "rounded-br" : ""}`} bestResults={true} />
            </tr>
          </Fragment>
        ))}
      </tbody>
      </table>
    </div>
  )
}

export default ResultsCard;
