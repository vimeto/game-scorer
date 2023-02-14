import { api } from "../../../utils/api";
import FriendsCard from "../../ui/FriendsCard";
import StreakCard from "../../ui/StreakCard";

const HeaderCards: React.FC = () => {
  const query = api.cards.getStreakAndGroupsCount.useQuery();

  // TODO: add formatting to error and loading state
  if (query.isLoading) return <div>Loading...</div>;
  if (query.isError) return <div>Error :(</div>;

  return (
    <div className="grid grid-flow-row sm:grid-flow-col gap-2 justify-center items-baseline pt-16">
      <StreakCard streak={query.data.streak} maxStreak={3} />
      <FriendsCard friendsCount={query.data.friendGroups} />
    </div>
  );
}

export default HeaderCards;
