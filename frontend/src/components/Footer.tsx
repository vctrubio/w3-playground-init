export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white py-8 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex gap-6 mx-auto">
            <a href="https://github.com/vctrubio/w3-playground-init.git" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
