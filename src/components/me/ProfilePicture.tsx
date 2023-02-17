import { FaCrown } from 'react-icons/fa';

const ProfilePicture: React.FC<{ backgroundColor: string, firstLetter: string, hasStreak: boolean }> = ({ backgroundColor, firstLetter, hasStreak }) => {
  return (
    <div className="relative">
      <div style={{ backgroundColor: `${backgroundColor}99` }} className={`w-60 h-60 text-9xl font-semibold flex justify-center items-center rounded-full drop-shadow-2xl text-white`}>
        {firstLetter}
      </div>
      {hasStreak && (
        <div className="absolute top-0 right-0 w-14 h-14 bg-amber-300 rounded-full flex items-center justify-center">
          <FaCrown className="text-4xl text-amber-600" />
        </div>
      )}
    </div>
  );
}

export default ProfilePicture;
