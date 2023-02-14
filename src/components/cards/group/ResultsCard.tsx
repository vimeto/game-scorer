import { Tooltip } from "@material-tailwind/react";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { Fragment } from "react";
import { type JSONValue } from "superjson/dist/types";
import { z } from "zod";
import { type GroupResultType, WordleEmojiMap } from "../../../entities/types";
import { api } from "../../../utils/api";

const MyResultsWordleTooltipContent: React.FC<{ data: JSONValue | undefined, comment?: string | null }> = ({ data, comment }) => {
  const arrayShape = z.array(z.array(z.number()));
  const a = arrayShape.safeParse(data);

  if (!a.success) return <></>;

  return (
    <div>
      {a.data.map((v, index) => (
        <p key={index}>
          {v.map((num, numIndex) => (
            <Fragment key={numIndex}>
              {Object.keys(WordleEmojiMap).find(e => WordleEmojiMap[e as keyof typeof WordleEmojiMap] === num)}
            </Fragment>
          ))}
        </p>
      ))}
      {comment && (
        <p className="italic">{`"${comment}"`}</p>
      )}
    </div>
  );
}

const MyResultsWordleCell: React.FC<{ data: GroupResultType["Wordle"] | undefined, className: string, showUsername: boolean }> = ({ data, className, showUsername }) => {
  if (!data) return <td className={className} />;

  return (
    <Tooltip content={<MyResultsWordleTooltipContent data={data.data} comment={data.comment} />} className="bg-gray-400 p-1">
      <td className={className}>
        {data?.score && (
          <>
            <p>Wordle #{data?.identifier} <span className="font-bold">{`${data?.score}/6`}</span></p>
            {showUsername && (
              <div>
                <span style={{ backgroundColor: `${data.userBgColor}99` }} className={`px-1.5 py-0.5 rounded-full`}>- {data.username}</span>
              </div>
            )}
          </>
        )}
      </td>
    </Tooltip>
  );
}

const MyResultsContextoTooltipContent: React.FC<{ data: JSONValue | undefined, comment?: string | null }> = ({ data, comment }) => {
  const contextoDataShape = z.object({
    green: z.number().nullable(),
    yellow: z.number().nullable(),
    red: z.number().nullable(),
  });
  const res = contextoDataShape.safeParse(data);

  if (!res.success) return <></>;

  return (
    <div>
      <div>{`🟥 ${res.data.red || 0}`}</div>
      <div>{`🟨 ${res.data.yellow || 0}`}</div>
      <div>{`🟩 ${res.data.green || 0}`}</div>
      {comment && (
        <p className="italic">{`"${comment}"`}</p>
      )}
    </div>
  );
}

const MyResultsContextoCell: React.FC<{ data: GroupResultType["Contexto"] | undefined, className: string, showUsername: boolean }> = ({ data, className, showUsername }) => {
  if (!data) return <td className={className} />;

  return (
    <Tooltip content={<MyResultsContextoTooltipContent data={data.data} comment={data.comment} />} className="bg-gray-400 p-1">
     <td className={className}>
        {data?.score && (
          <>
            <p>Contexto #{data?.identifier} <span className="font-bold">{`${data?.score}`}</span></p>
            {showUsername && (
              <div>
                <span style={{ backgroundColor: `${data.userBgColor}99` }} className={`px-1.5 py-0.5 rounded-full`}>- {data.username}</span>
              </div>
            )}
          </>
        )}
      </td>
    </Tooltip>
  );
}

const getDateObject: () => { fromDate: Date, toDate: Date } = () => {
  const today = new Date();
  const startDate = subDays(today, 7);

  return { fromDate: startOfDay(startDate), toDate: endOfDay(today) }
}

const ResultsCard: React.FC<{ id: string }> = ({ id }) => {
  const query = api.group.weekResults.useQuery({ ...getDateObject(), id });

  if (query.isLoading || !query.data) return <div>Loading...</div>
  if (query.isError) return <div>Error :(</div>

  console.log(query.data);

  return (
    <div className="bg-gray-300/10 text-white max-w-screen-sm mx-auto mt-12 rounded">
      <table className="table-auto w-full text-left">
        <thead>
        <tr className="bg-gray-500/10 text-white">
          <th className="border-b px-4 py-2">Date</th>
          <th className="border-b px-4 py-2">Me</th>
          <th className="border-b px-4 py-2">Winner</th>
        </tr>
      </thead>
      <tbody>
        {query.data.bestResults && Object.keys(query.data.bestResults).map((date, index) => (
          <Fragment key={index}>
            <tr className={`${index % 2 ? "bg-gray-300/10" : "bg-white/10"}`}>
              <td className={`border-r px-4 py-2`}>{date}</td>
              <MyResultsWordleCell data={query.data.myResults[date]?.Wordle} className={'px-4 py-2 border-x'} showUsername={false} />
              <MyResultsWordleCell data={query.data.bestResults[date]?.Wordle} className={'px-4 py-2'} showUsername={true} />
              {/* <td className={`border-l px-4 py-2 ${index === rows.length - 1 ? "rounded-br" : ""}`}>{query.data.bestResults[date]?.Wordle?.username}</td> */}
            </tr>
            <tr className={`${index % 2 ? "bg-gray-300/10" : "bg-white/10"}`}>
              <td className={`border-r px-4 py-2 ${index === Object.keys(query.data.bestResults).length - 1 ? "rounded-bl" : ""}`} />
              <MyResultsContextoCell data={query.data.myResults[date]?.Contexto} className={'px-4 py-2 border-x'} showUsername={false} />
              <MyResultsContextoCell data={query.data.bestResults[date]?.Contexto} className={`px-4 py-2 ${index === Object.keys(query.data.bestResults).length - 1 ? "rounded-br" : ""}`} showUsername={true} />
              {/* <td className={`border-l px-4 py-2 ${index === rows.length - 1 ? "rounded-br" : ""}`}>{query.data.bestResults[date]?.Wordle?.username}</td> */}
            </tr>
          </Fragment>
        ))}
      </tbody>
      </table>
    </div>
  )
}

export default ResultsCard;
