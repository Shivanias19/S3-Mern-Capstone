import { MdError } from 'react-icons/md';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center p-8">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <MdError className="text-red-400 text-3xl" />
      </div>
      <div>
        <h3 className="text-slate-700 font-semibold text-lg mb-1">Something went wrong</h3>
        <p className="text-slate-500 text-sm max-w-sm">{message || 'An unexpected error occurred. Please try again.'}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
