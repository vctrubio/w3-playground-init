import { useUser } from "@/contexts/UserContext";

function User() {
  const { user,contract } = useUser();

  const userData = {
    account: user?.address,
    balance: user?.network.balance,
    network: user?.network.name,
    contractAddress: contract?.address,
  };

  return (
    <div className="">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {Object.entries(userData).map(([label, value]) => (
          <div key={label} className="mb-3 pb-3 border-b dark:border-gray-700 last:border-b-0">
            <p className="text-sm text-gray-500 capitalize">{label}</p>
            <p className="font-mono font-medium truncate">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default User;
