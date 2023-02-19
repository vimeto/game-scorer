import { type NextPage } from "next";
import { signOut } from "next-auth/react";

import WordleCard from "../components/WordleCard";
import ContextoCard from "../components/ContextoCard";
import HeaderCards from "../components/cards/index/HeaderCards";
import GroupCards from "../components/cards/index/GroupCards";
import { useEffect, useState } from "react";
import { type GroupedUserGroupScoreValueTypes } from "../entities/types";
import { api } from "../utils/api";
import { getWordleIdentifier } from "../entities/wordleHelper";

const Index: NextPage = () => {
  const wordleIdentifier = getWordleIdentifier();
  const [groups, setGroups] = useState<Record<string, GroupedUserGroupScoreValueTypes>>()
  const query = api.group.getTodayIndexSelection.useQuery({ wordleIdentifier: wordleIdentifier });

  useEffect(() => {
    if (query.data?.resultsByUserGroup) setGroups(query.data.resultsByUserGroup);
  }, [query.data]);


  return (
    <div>
      <div className="pt-40">
        <h1
          className="text-4xl font-extrabold tracking-tight text-white sm:text-[5rem] text-center leading-normal"
          onClick={() => { signOut().catch(e => console.error(e)) }}>
          Game scorer
        </h1>
        <HeaderCards refreshGroups={async () => { await query.refetch() }} />
      </div>
      <div className="pt-20">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-[4rem] text-center leading-normal">
          Today
        </h1>
        <div className="grid grid-flow-row sm:grid-flow-col gap-4 justify-center items-start pt-16">
        {/* <div className="grid grid-flow-row sm:grid-flow-col gap-2 justify-center items-start pt-16"> */}
          <WordleCard refreshGroups={async () => { await query.refetch() }} />
          <ContextoCard refreshGroups={async () => { await query.refetch() }} />
        </div>
      </div>
      <div className="pt-20">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-[4rem] text-center leading-normal">
          Groups
        </h1>
        <GroupCards groups={groups} isLoading={query.isLoading} isError={query.isError} />
      </div>
    </div>
  );
};

export default Index;
