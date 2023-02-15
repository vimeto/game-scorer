import { useMemo, useState } from "react";
import _debounce from "lodash.debounce";
import { LoginInput } from "../../ui/LoginInput";
import { api } from "../../../utils/api";
import { UserGroupRoleNames } from "../../../entities/types";

interface AddUsersCardProps {
  id: string;
  refreshMeQuery: () => Promise<void>;
}


const AddUsersCard: React.FC<AddUsersCardProps> = ({ id, refreshMeQuery }) => {
  const mutation = api.group.autocompleteAddUser.useMutation();
  const addUserMutation = api.group.addUserToGroup.useMutation();
  const sendInvitationMutation = api.group.inviteUserToUserGroup.useMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [addUsersCardOpen, setAddUsersCardOpen] = useState(false);

  const addUserAsRole = async (userId: string, role: "ADMIN" | "MEMBER") => {
    const res = await addUserMutation.mutateAsync({ id, userId, role: UserGroupRoleNames[role] });
    if (res.userGroupRole) {
      setSearchTerm("");
      setAddUsersCardOpen(false);
      mutation.reset();
      refreshMeQuery().catch(e => console.error(e));
    }
  }

  const inviteUser = async (email: string) => {
    const res = await sendInvitationMutation.mutateAsync({ id, email });
    if (res.userGroupRole) {
      setSearchTerm("");
      setAddUsersCardOpen(false);
      mutation.reset();
      refreshMeQuery().catch(e => console.error(e));
    }
  }


  const debouncedSearch = useMemo(() => _debounce(async (value: string) => {
    await mutation.mutateAsync({ id, inputValue: value });
  }, 500), [id, mutation]);

  return (
    <>
      {addUsersCardOpen ? (
        <div className="bg-gray-300/10 max-w-[350px] mx-auto rounded p-2">
          <h3 className="text-xl text-white leading-normal pb-2">Add more users</h3>
          <div className="flex justify-center">
            <LoginInput
              id={"name"}
              placeholder={"username or email"}
              type={"text"}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); debouncedSearch(e.target.value)?.catch(e => console.error(e)) }}
              // width={"w-[234px]"}
              />
          </div>
          {mutation.data?.users?.map(user => (
            <div key={user.id} className="bg-gray-300/10 w-60 mx-auto text-start p-2 rounded mt-2">
              <h3 className="italic text-white">@{user.username}</h3>
              <h3 className=" text-white">{user.email}</h3>
              <div className="flex flex-row justify-between">
                <button
                  className="bg-gray-300/10 text-white hover:bg-gray-100/10 mt-1 px-2 py-1 rounded-full hover:scale-x-[102.5%] transition cursor-pointer text-sm"
                  onClick={() => { addUserAsRole(user.id, "ADMIN").catch(e => console.error(e)) }}
                  >
                  Add as <span className="text-orange-600">admin</span>
                </button>
                <button
                  className="bg-gray-300/10 text-white hover:bg-gray-100/10 mt-1 px-2 py-1 rounded-full hover:scale-x-[102.5%] transition cursor-pointer text-sm"
                  onClick={() => { addUserAsRole(user.id, "MEMBER").catch(e => console.error(e)) }}
                  >
                  Add as <span className="text-green-600">member</span>
                </button>
              </div>
            </div>
          ))}
          {mutation.data?.users?.length === 0 && searchTerm.length > 0 && (
            <div className="bg-gray-300/10 w-60 mx-auto text-start p-2 rounded mt-2">
              <h3 className="italic text-white">No users found...</h3>
              <div className="flex justify-center">
                <button
                  className="bg-gray-300/10 text-white hover:bg-gray-100/10 mt-1 px-2 py-1 rounded-full hover:scale-x-[102.5%] transition cursor-pointer text-sm break-all"
                  onClick={() => { inviteUser(searchTerm).catch(e => console.error(e)) }}
                  >
                  {`Invite ${searchTerm} to join!`}
                </button>
              </div>
            </div>
          )}
          <div>
            <div
              className="bg-red-500/40 text-white hover:bg-red-500/50 px-6 py-2 rounded-full hover:scale-x-[102.5%] transition cursor-pointer inline-block mx-1 mt-2"
              onClick={() => setAddUsersCardOpen(!addUsersCardOpen)}
              >
              Close
            </div>
          </div>
        </div>
      ) : (
        <button
          className="bg-gray-300/10 text-white hover:bg-gray-100/10 px-6 py-2 rounded-full hover:scale-x-[102.5%] transition cursor-pointer"
          onClick={() => setAddUsersCardOpen(!addUsersCardOpen)}
          >
          Add more! →
        </button>
      )}
    </>
  );
}

export default AddUsersCard;
