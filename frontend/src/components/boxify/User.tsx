import { useUser } from "@/contexts/UserContext";

function User() {
  const { user, contract } = useUser();

  if (!user) {
    return (
      <div className="rounded-lg shadow p-4">
        <div className="text-red-500 font-semibold">No user found</div>
        <p>Something went wrong: contact vctrubio@gmail.com</p>
      </div>
    );
  }

  const userData = {
    account: user.address,
    balance: user.network.balance,
    network: user.network.name,
    contractAddress: contract?.address,
  };

  return (
    <div className="">
      <div className="dark:bg-gray-800 rounded-lg shadow p-4">
        {Object.entries(userData).map(([label, value]) => (
          <div key={label} className="mb-3 py-2 px-1 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200">
            <p className="text-sm text-gray-500 capitalize">{label}</p>
            <p className="font-mono font-medium truncate">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default User;
