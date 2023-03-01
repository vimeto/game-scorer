import { Tooltip } from "@material-tailwind/react";
import { Fragment } from "react";
import { type JSONValue } from "superjson/dist/types";
import { z } from "zod";

import { type GroupResultType, WordleEmojiMap } from "../../../../entities/types";
import { truncateStringToLength } from "../../../../utils/string";


const WordleResultsTooltipContent: React.FC<{ data: JSONValue | undefined, comment?: string | null }> = ({ data, comment }) => {
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

const WordleResultsCell: React.FC<{ data: GroupResultType["Wordle"] | undefined, className: string, bestResults: boolean }> = ({ data, className, bestResults }) => {
  if (!data || data?.length === 0 || !data[0]) return <td className={className} />;

  if (!bestResults) {
    const wordleData = data[0];

    return (
      <Tooltip content={<WordleResultsTooltipContent data={wordleData.data} comment={wordleData.comment} />} className="bg-gray-400 p-1">
        <td className={className}>
          {wordleData?.score && (
            <p>Wordle #{wordleData?.identifier} <span className="font-bold">{`${wordleData?.score}/6`}</span></p>
          )}
        </td>
      </Tooltip>
    );
  }

  const firstWordleData = data[0];
  return (
    <td className={className}>
      {firstWordleData?.score && (
        <>
          <p>Wordle #{firstWordleData?.identifier} <span className="font-bold">{`${firstWordleData?.score}/6`}</span></p>
          {data.map((wordleData, index) => (
             <Tooltip key={index} content={<WordleResultsTooltipContent data={wordleData.data} comment={wordleData.comment} />} className="bg-gray-400 p-1">
                <div style={{ backgroundColor: `${wordleData.userBgColor}99` }} className="inline-flex flex-row gap-1 px-1.5 py-0.5 rounded-full mt-1">
                  <p>-</p>
                  <p className="">{truncateStringToLength(wordleData.username, 12)}</p>
                </div>
             </Tooltip>
          ))}
        </>
      )}
    </td>
  );
}

export default WordleResultsCell;
