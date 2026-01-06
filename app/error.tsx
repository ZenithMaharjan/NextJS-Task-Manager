"use client";

import { useState, useCallback } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showStack, setShowStack] = useState(false);

  const handleToggleStack = useCallback(() => {
    setShowStack(prev => !prev);
  }, []);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 px-4 py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-100/20 via-transparent to-transparent dark:from-red-950/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-100/20 via-transparent to-transparent dark:from-orange-950/20"></div>
          <div className="max-w-2xl w-full relative z-10">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400"></div>
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-red-500 to-orange-500 p-5 rounded-full shadow-lg">
                    <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                    Something Went Wrong
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    We encountered an unexpected error
                  </p>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <div className="space-y-3">
                    <button
                      onClick={handleToggleStack}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mx-auto"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${showStack ? "rotate-90" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {showStack ? "Hide" : "Show"} Error Details
                    </button>
                    {showStack && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Error Message</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-mono text-gray-900 dark:text-gray-100 leading-relaxed">{error.message}</p>
                          </div>
                        </div>
                        {error.stack && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Stack Trace</p>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                              <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{error.stack}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={reset}
                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                </div>
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">If this problem persists, please contact support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
