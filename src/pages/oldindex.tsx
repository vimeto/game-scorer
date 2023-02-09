import { GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { getSession, signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import WordleCard from "../components/WordleCard";
import ContextoCard from "../components/ContextoCard";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  console.log(session);

  return {
    props: { ass: true }
  }
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Game scorer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1
            className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]"
            onClick={() => { signOut().catch(e => console.error(e))}}
            >
            Game scorer
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <WordleCard />
            <ContextoCard />
          </div>
          <div className="flex flex-col items-center gap-2">
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
