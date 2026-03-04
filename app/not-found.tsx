import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-violet-50 via-purple-50 to-fuchsia-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-violet-900/30 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl w-full space-y-6 md:space-y-8 p-6 sm:p-8 md:p-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl shadow-2xl border border-purple-100/50 dark:border-purple-500/20 text-center">
        <div className="relative w-full h-48 sm:h-56 md:h-72 lg:h-80 mx-auto mb-4 md:mb-6">
          <Image
            src="/page_not_found_illustration.png"
            alt="Page Not Found Illustration"
            fill
            className="object-contain drop-shadow-lg"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="space-y-2 md:space-y-4">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent drop-shadow-lg">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-slate-800 to-slate-600 dark:from-white dark:to-purple-200 bg-clip-text text-transparent">
            Page Not Found
          </h2>
        </div>

        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="pt-4 md:pt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center py-3 px-8 md:py-4 md:px-10 text-base md:text-lg font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 dark:ring-offset-gray-800 cursor-pointer"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to HomePage
          </Link>
        </div>
      </div>
    </div>
  );
}
