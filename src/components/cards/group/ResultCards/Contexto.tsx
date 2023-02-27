import { Tooltip } from "@material-tailwind/react";
import { Fragment } from "react";
import { type JSONValue } from "superjson/dist/types";
import { z } from "zod";

import { type GroupResultType } from "../../../../entities/types";

const ContextoResultsTooltipContent: React.FC<{ data: JSONValue | undefined, comment?: string | null }> = ({ data, comment }) => {
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


const ContextoResultsCell: React.FC<{ data: GroupResultType["Contexto"] | undefined, className: string, bestResults: boolean }> = ({ data, className, bestResults }) => {
  const contextoData = (data || [])[0];
  if (!contextoData) return <td className={className} />;

  return (
    <Tooltip content={<ContextoResultsTooltipContent data={contextoData.data} comment={contextoData.comment} />} className="bg-gray-400 p-1">
     <td className={className}>
        {contextoData?.score && (
          <>
            <p>Contexto #{contextoData?.identifier} <span className="font-bold">{`${contextoData?.score}`}</span></p>
            {bestResults && (
              <div>
                <span style={{ backgroundColor: `${contextoData.userBgColor}99` }} className={`px-1.5 py-0.5 rounded-full`}>- {contextoData.username}</span>
              </div>
            )}
          </>
        )}
      </td>
    </Tooltip>
  );
}

export default ContextoResultsCell;
