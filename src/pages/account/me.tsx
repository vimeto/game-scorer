// create a page with profile picture, username, email, and a button to logout

import { signOut } from "next-auth/react";
import ProfilePicture from "../../components/me/ProfilePicture";
import { api } from "../../utils/api";

const MePage = () => {
  const me = api.user.me.useQuery();

  if (me.isLoading || !me.data) {
    return <p>loading...</p>
  }

  // const basevalue = 30;
  // const circumference = basevalue * 2 * Math.PI;
  // const array = `${circumference} ${circumference}`;
  // // const offset = `${circumference}`;

  // const percent = 500/9;
  // const offset = `${circumference - percent / 100 * circumference}`;

  // function setProgress(percent) {
  //   const offset = circumference - percent / 100 * circumference;
  //   circle.style.strokeDashoffset = offset;
  // }

  return (
    <div className="flex flex-col items-center pt-24 gap-4">
      {me.data.bgColor && me.data.firstName && (
        <ProfilePicture backgroundColor={me.data.bgColor} firstLetter={me.data.firstName.slice(0, 1)} hasStreak={false} />
      )}
      <h2 className="text-lg italic">{`@${me.data.username || ""}`}</h2>
      <h2 className="text-lg bg-[blue-600]">{`${me.data.firstName || ""} ${me.data.lastName || ""}`}</h2>
      <h2 className="text-lg bg-[blue-600]">{`${me.data.email || ""}`}</h2>
      <div className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex space-between gap-4 px-6 py-2 rounded-full hover:gap-6 transition-all cursor-pointer">
        <span>Reset password</span>
        <span>→</span>
      </div>
      <div
        className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex space-between gap-4 px-6 py-2 rounded-full hover:gap-6 transition-all cursor-pointer"
        onClick={() => { signOut().catch(e => console.error(e)) }}
        >
        <span>Logout</span>
        <span>→</span>
      </div>

      {/* <StreakCard streak={1} maxStreak={3} /> */}
    </div>
  );
};

export default MePage;
