import Link from "next/link";

const NavBar: React.FC = () => {
  return (
    <div className="bg-white/20 fixed w-full">
      <nav className="h-20 flex flex-row justify-around items-center p-4 max-w-screen-sm mx-auto">
        <Link href="/" className="text-2xl font-bold text-white hover:text-white/80">
          HOME
        </Link>
        <Link href="/account/me" className="text-2xl font-bold text-white hover:text-white/80">
          ME
        </Link>
      </nav>
    </div>
  );
}

export default NavBar;
