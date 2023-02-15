import { getOuterStrokeStyle } from "../../entities/streakCardHelper";
import FlexCard from "./FlexCard";

// list six soft colors from bad to good
const colors = [
  "text-red-500",
  "text-yellow-500",
  "text-green-500",
  "text-blue-500",
  "text-indigo-500",
  "text-purple-500",
];

const getStrokeColor = (fraction: number) => (
  colors[Math.floor(fraction * colors.length - 1)]
);

const StreakCard: React.FC<{ streak: number, maxStreak: number }> = ({ streak, maxStreak }) => {
  return (
    <FlexCard>
      <h3 className="text-2xl text-center">Streak</h3>
      <div className="w-[150px] h-[150px] relative -mb-[60px]">
        <svg className="w-[150px] h-[150px] origin-center rotate-[170deg] absolute top-0 left-0">
          <circle
            className="text-gray-300"
            strokeWidth="10"
            style={getOuterStrokeStyle(70, 5/9)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="70"
            cx="75"
            cy="75"
          />
          <circle
            // className="text-emerald-300"
            className={getStrokeColor(Math.min(streak / maxStreak, 1))}
            strokeWidth="10"
            style={getOuterStrokeStyle(70, Math.min(streak / maxStreak, 1), true)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="70"
            cx="75"
            cy="75"
          />
        </svg>
        <p className="text-center absolute top-[50px] left-1/2 -translate-x-1/2 mx-auto text-3xl">{streak}</p>
      </div>
      <p className="text-center">{streak >= maxStreak ? `You have played ${streak} consecutive days!` : `Play ${maxStreak - streak} more days to get a crown in your profile picture`}</p>
    </FlexCard>
  );
};

export default StreakCard;
