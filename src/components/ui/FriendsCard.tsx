import { motion } from "framer-motion";
import { useState } from "react";
import { api } from "../../utils/api";
import FlexCard from "./FlexCard";
import { LoginInput } from "./LoginInput";

interface FriendsCardProps {
  friendsCount: number;
  refreshGroups: () => Promise<void>;
  refreshGroupCount: () => Promise<void>;
}

const cardVariants = {
  selected: {
    scaleY: 1,
    opacity: 1,
    display: "block",
  },
  notSelected: {
    scaleY: 0,
    opacity: 0,
    display: "none",
  },
}

const FriendsCard: React.FC<FriendsCardProps> = ({ friendsCount, refreshGroups, refreshGroupCount }) => {
  const mutation = api.group.create.useMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [name, setName] = useState("");

  const createNewUserGroup = () => {
    if (name.length === 0) { console.error("Comment is empty"); return; }

    mutation.mutate({ name }, {
      onSuccess: () => {
        setName("");
        setCreateDialogOpen(!createDialogOpen);
        Promise.all([refreshGroups(), refreshGroupCount()]).catch(e => console.error(e));
      },
    });
  }

  return (
    <FlexCard>
      <h3 className="text-2xl text-center w-[234px]">Groups</h3>
      <p className="text-center text-3xl">{friendsCount}</p>
      <motion.div
        initial={{ opacity: 0, scaleY: 0, display: "none" }}
        className="card"
        variants={cardVariants}
        animate={createDialogOpen ? "selected" : "notSelected"}
        >
        <LoginInput
          id={"name"}
          placeholder={"Name"}
          type={"text"}
          value={name}
          onChange={e => setName(e.target.value)}
          width={"w-[234px]"}
          />
      </motion.div>
      {createDialogOpen ? (
        <div className="flex flex-row gap-2">
          <div
            className="bg-red-500/40 text-white hover:bg-red-500/50 px-6 py-2 rounded-full hover:scale-x-[102.5%] transition cursor-pointer"
            onClick={() => setCreateDialogOpen(!createDialogOpen)}
            >
            Close
          </div>
          <div
            className="bg-green-500/40 text-white hover:bg-green-500/50 px-6 py-2 rounded-full hover:scale-x-[102.5%] transition cursor-pointer"
            onClick={() => createNewUserGroup()}
            >
            Create!
          </div>
        </div>
      ) : (
        <div
          className="bg-gray-300/10 text-white hover:bg-gray-100/10 flex space-between gap-4 px-6 py-2 rounded-full hover:scale-x-[102.5%] transition cursor-pointer"
          onClick={() => setCreateDialogOpen(!createDialogOpen)}
          >
          <span>{createDialogOpen ? "Create!" : "Create a new group!"}</span>
          <span>→</span>
        </div>
      )}
    </FlexCard>
  );
};

export default FriendsCard;
