export default function Features() {
  const features = [
    {
      title: "Connect Web3 Wallet",
      description: "Easily connect MetaMask, WalletConnect or other Ethereum wallets with a single click.",
      icon: "👛",
    },
    {
      title: "Interact With Contracts",
      description: "Enter any contract address to view and interact with its functions and data.",
      icon: "🔄",
    },
    {
      title: "Search Contract History",
      description: "Find previously interacted contracts stored in your local device storage.",
      icon: "🔍",
    },
    {
      title: "Execute Contract Functions",
      description: "Call read-only functions or submit transactions to execute state-changing methods.",
      icon: "⚙️",
    },
  ];

  return (
    <div className="py-16 bg-white dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
