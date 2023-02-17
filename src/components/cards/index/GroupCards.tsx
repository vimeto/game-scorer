import { useRouter } from "next/router";
import { type GroupedUserGroupScoreValueTypes } from "../../../entities/types";
import CircularBadge from "../../ui/CircularBadge";
import FlexCard from "../../ui/FlexCard";

// const groups = [
//   {
//     id: 1,
//     name: 'Aapo & Vilhelm',
//     wordleWinner: 'Aapo', // string || null
//     contextoWinner: 'Vilhelm', // string || null
//   },
//   {
//     id: 2,
//     name: 'Vilhelm & Viivi',
//     wordleWinner: 'Viivi', // string || null
//     contextoWinner: 'Viivi', // string || null
//   },
//   {
//     id: 3,
//     name: 'Aapo & Viivi',
//     wordleWinner: 'Aapo', // string || null
//     contextoWinner: 'Viivi', // string || null
//   },
// ]

// interface Group {
//   id: string;
//   name: string;
//   wordleWinner: string | null;
//   contextoWinner: string | null;
// }

interface GroupCardsProps {
  groups: Record<string, GroupedUserGroupScoreValueTypes> | undefined;
  isLoading: boolean;
  isError: boolean;
}

const GroupCards: React.FC<GroupCardsProps> = ({ groups, isLoading, isError }) => {
  const router = useRouter();

  const navigateToGroup = async (groupId: string) => {
    await router.push(`/group/${groupId}`);
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error</div>


  return (
    <div
      className="text-center pt-16 max-w-screen-sm mx-auto w-auto"
      // className="grid grid-cols-1 grid-flow-row sm:grid-cols-2 gap-2 justify-items-center justify-center items-start pt-16 sm:w-[508px] mx-auto w-auto"
      >
      {groups && Object.keys(groups).map((groupId, index) => (
        <FlexCard key={index}>
        {/* <div key={index} className="bg-gray-300/10 text-white hover:bg-gray-100/10 p-2 rounded w-[250px]"> */}
          <h3 className="text-2xl text-center">{groups[groupId]?.name}</h3>
          <div className="flex flex-row justify-between items-center gap-1 text-left">
            <div>
              <div className="flex flex-row items-center gap-2 pt-1">
                <CircularBadge width={'w-6'} height={'h-6'} bgColor={'amber-300'} textColor={'amber-600'}>C</CircularBadge>{" "}
                {groups[groupId]?.contextoWinner?.username ? `@${groups[groupId]?.contextoWinner?.username || ""} (${groups[groupId]?.contextoWinner?.score || "0"})` : "no results yet..."}
              </div>
              <div className="flex flex-row items-center gap-2 pt-2">
                <CircularBadge width={'w-6'} height={'h-6'} bgColor={'amber-300'} textColor={'amber-600'}>W</CircularBadge>{" "}
                {groups[groupId]?.wordleWinner?.username ? `@${groups[groupId]?.wordleWinner?.username || ""} (${groups[groupId]?.wordleWinner?.score || "0"}/6)` : "no results yet..."}
              </div>
            </div>
            <div
              className="leading-none text-5xl w-[60px] h-[60px] rounded-full bg-gray-300/10 text-white hover:bg-gray-100/10 flex items-center justify-center hover:scale-105 transition"
              onClick={() => { navigateToGroup(groupId).catch(e => console.error(e)) }}
              >
              →
            </div>
          </div>
        </FlexCard>
      ))}
    </div>
  );
}

export default GroupCards;
