import { getWordleIdentifier } from "../../../entities/wordleHelper";
import { api } from "../../../utils/api";
import FriendsCard from "../../ui/FriendsCard";
import StreakCard from "../../ui/StreakCard";

interface HeaderCardsProps {
  refreshGroups: () => Promise<void>;
}

const HeaderCards: React.FC<HeaderCardsProps> = ({ refreshGroups }) => {
  const wordleIdentifier = getWordleIdentifier();
  const query = api.cards.getStreakAndGroupsCount.useQuery({ wordleIdentifier });

  // TODO: add formatting to error and loading state
  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Error :(</div>;

  return (
    // <div className="grid grid-flow-row sm:grid-flow-col gap-2 justify-center items-baseline pt-16">
    <div className="pt-16 text-center">
      <StreakCard streak={query.data.streak} maxStreak={3} />
      <FriendsCard friendsCount={query.data.userGroups} refreshGroups={refreshGroups} refreshGroupCount={async () => { await query.refetch() }} />
    </div>
  );
}

export default HeaderCards;
