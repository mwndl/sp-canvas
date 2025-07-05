interface ErrorScreenProps {
  error: string;
  onBack: () => void;
}

export const ErrorScreen = ({ error, onBack }: ErrorScreenProps) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-xl mb-4">
          Error loading Canvas
        </div>
        <div className="text-gray-400 mb-4">{error}</div>
        <button
          onClick={onBack}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>
    </div>
  );
}; 