import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const GlobalErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-gray-600 mb-6">
                    We're sorry, but an unexpected error occurred while loading this page. Our team has been notified.
                </p>

                {/* Display actual error details in develop/non-prod environments if possible or hide behind an accordion */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-red-50 rounded-lg p-4 mb-6 text-left overflow-auto max-h-48 border border-red-100">
                        <p className="text-sm font-mono text-red-800 break-words font-semibold mb-1">
                            {error.name}: {error.message}
                        </p>
                        <pre className="text-xs font-mono text-red-600 overflow-x-auto whitespace-pre-wrap">
                            {error.stack}
                        </pre>
                    </div>
                )}

                <button
                    onClick={resetErrorBoundary}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#05431E] hover:bg-[#043818] text-white rounded-lg font-medium transition-colors w-full justify-center"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reload Application
                </button>
            </div>
        </div>
    );
};
