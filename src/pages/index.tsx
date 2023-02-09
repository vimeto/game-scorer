import { GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { getSession, signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import WordleCard from "../components/WordleCard";
import ContextoCard from "../components/ContextoCard";
import StreakCard from "../components/ui/StreakCard";
import FriendsCard from "../components/ui/FriendsCard";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  console.log(session);

  return {
    props: { ass: true }
  }
};

const wordledata = {
  identifier: 123,
  score: 4,
  guesses: [
    [1, 1, 2, 2, 1],
    [1, 1, 0, 2, 1],
    [0, 0, 0, 0, 0],
  ]
}

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Game scorer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div className="pt-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[5rem] text-center">
            Game scorer
          </h1>
          <div className="grid grid-flow-row sm:grid-flow-col gap-2 justify-center items-baseline pt-20">
            <StreakCard streak={1} maxStreak={3} />
            <FriendsCard friendsCount={2} />
          </div>
        </div>
        <div className="pt-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[5rem] text-center">
            Today
          </h1>
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-20 items-baseline"> */}
          <div className="grid grid-flow-row sm:grid-flow-col gap-2 justify-center items-start pt-20">
            <WordleCard />
            {/* <WordleCard /> */}
            <ContextoCard />
          </div>
        </div>
        <div className="w-60 h-60"></div>
      </div>
    </>
  );
};

export default Home;
