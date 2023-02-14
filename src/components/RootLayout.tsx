import React from "react";
import NavBar from "./NavBar";

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  // TODO: add a max-width to the main element
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C7B8EA] to-[#485696]">
      <NavBar />
      <main className="max-w-screen-md mx-auto pb-12">
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
