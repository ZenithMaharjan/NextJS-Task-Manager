'use client'

import { useCallback } from "react";

import API from "services/api";

const ExamplePage = () => {
    const handleHealthCheck = useCallback(async () => {
        const response = await API.health();
        console.log('Health Check Response:', response);
    },[]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="max-w-4xl mx-auto " >
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        API Health Check
                    </h1>
                    <button
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 text-left w-full cursor-pointer"
                        onClick={handleHealthCheck}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Check Health</span>
                            <span className="text-indigo-600 dark:text-indigo-400">→</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ExamplePage;