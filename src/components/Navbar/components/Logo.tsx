import { Link } from "../../ui/Link";

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 group">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl p-2 -ml-2 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 dark:from-blue-400 dark:via-blue-300 dark:to-blue-400 bg-clip-text text-transparent">
            Mockify
          </h1>
        </Link>
      </div>
    </div>
  );
};
