import { Link } from "../../ui/Link";

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 group">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl p-2 -ml-2 transition-all duration-300 hover:bg-blue-100/50 dark:hover:bg-blue-800/30"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              Mockify
            </h1>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">
              Test Platform
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};
