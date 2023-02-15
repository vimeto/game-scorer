import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

const NavBar: React.FC = () => {
  const router = useRouter();
  const { data, status } = useSession();
  const iAmHome = router.pathname === "/";
  const iAmAccount = router.pathname.includes("/account");
  const a = data?.user;

  if (status !== "authenticated") return <></>;

  return (
    <div className="fixed w-full">
      <div className="mx-auto relative">
        <nav className="h-20">
          {/* <Link href="/" className="text-2xl font-bold text-white hover:text-white/80">
            HOME
          </Link> */}
          {!iAmAccount && (
            <Link href="/account/me" className="absolute right-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white hover:text-white/80">
              <div className="h-14 w-14 bg-green-200 flex items-center justify-center rounded-full shadow-lg">{data.user?.username?.slice(0, 1)?.toUpperCase() || "O"}</div>
            </Link>
          )}
          {!iAmHome && (
            <div
              className="absolute left-0 top-1/2 translate-x-1/4 -translate-y-1/2 text-xl font-bold text-white hover:text-white/80 px-4 py-2 bg-gray-600/10 flex items-center justify-center rounded-full shadow-lg cursor-pointer"
              onClick={() => router.back()}
              >
                ← BACK
            </div>
          )}
          {/* <Link href="/account/me" className="absolute left-0 top-1/2 translate-x-1/4 -translate-y-1/2 text-2xl font-bold text-white hover:text-white/80">
            <div className="px-4 py-2 bg-gray-600/10 flex items-center justify-center rounded-full shadow-lg">← BACK</div>
          </Link> */}
        </nav>
      </div>
    </div>
  );
}

export default NavBar;
