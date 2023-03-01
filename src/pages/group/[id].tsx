import { useRouter } from "next/router";
import AddUsersCard from "../../components/cards/group/AddUsersCard";
import ResultsCard from "../../components/cards/group/ResultsCard";
import { api } from "../../utils/api";

const Group = () => {
  const router = useRouter();
  const { id } = router.query;

  const query = api.group.me.useQuery({ id: id ? id.toString() : "" });

  if (query.isLoading || !query.data) return <div>Loading...</div>;
  if (query.isError) return <div>Error :(</div>;

  console.log(query.data);

  return (
    <div className="pt-40">
        <h1 className="text-4xl font-extrabold leading-normal tracking-tight text-white sm:text-[5rem] text-center">
          {query.data.group.name}
        </h1>
        {query.data.group.userGroupRoles.filter(member => member.user).length > 0 && (
          <div className="text-center pt-14">
            {query.data.group.userGroupRoles.filter(member => member.user).map((member, index) => (
              <div key={index} className="inline-flex py-2 pl-2 pr-4 bg-gray-300/10 text-white hover:bg-gray-100/10 m-2 flex-row gap-2 rounded items-center">
                <div style={{ backgroundColor: `${member.user?.bgColor ? member.user.bgColor : '#ff0000'}99` }} className={`w-12 h-12 bg-gray-700 rounded-full`} />
                <div className="text-left">
                  <div className="text-xl">{`${member.user?.firstName || ""} ${member.user?.lastName || ""}`}</div>
                  <div className="italic leading-tight">{`@${member.user?.username || ""}`}</div>
                  <div className="leading-tight text-sm">{member.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {query.data.group.userGroupRoles.filter(member => !member.user).length > 0 && (
          <div className="text-center pt-3">
            <h3 className="text-3xl text-white">Pending</h3>
            {query.data.group.userGroupRoles.filter(member => !member.user && member.userInvitation).map((member, index) => (
              <div key={index} className="inline-flex py-2 pl-2 pr-4 bg-gray-300/10 text-white hover:bg-gray-100/10 m-2 flex-row gap-2 rounded items-center">
                <div className="text-md">{`${member.userInvitation?.email || ""}`}</div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center pt-2">
          <AddUsersCard id={id ? id.toString() : ""} refreshMeQuery={async () => { await query.refetch() }} />
        </div>
        <div className="pt-20">

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-[4rem] text-center leading-normal">
            Results
          </h1>
          <ResultsCard id={id ? id.toString() : ""} />
        </div>
    </div>
  );
}

export default Group;
