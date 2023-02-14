const FriendsCard: React.FC<{ friendsCount: number }> = ({ friendsCount }) => {
  return (
    <div className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex flex-col items-center max-w-[250px] p-2 rounded gap-2">
      <h3 className="text-2xl text-center w-[200px]">Groups</h3>
      <p className="text-center text-3xl">{friendsCount}</p>
      <div className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex space-between gap-4 px-6 py-2 rounded-full hover:gap-6 transition-all cursor-pointer">
        <span>Create a new group!</span>
        <span>→</span>
      </div>
    </div>
  );
};

export default FriendsCard;
