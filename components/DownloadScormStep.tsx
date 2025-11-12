import React from 'react';
import { RestartIcon } from './icons/RestartIcon';
import { ScormIcon } from './icons/ScormIcon';

interface DownloadScormStepProps {
  zipBlob: Blob | null;
  onStartOver: () => void;
}

const DownloadScormStep: React.FC<DownloadScormStepProps> = ({ zipBlob, onStartOver }) => {

  const handleDownload = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scorm_package.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center p-4 text-center">
      <ScormIcon className="w-20 h-20 text-blue-400 mb-4" />
      <h2 className="text-3xl font-bold text-gray-100 mb-4">Your SCORM Package is Ready!</h2>
      <p className="text-gray-400 mb-6 max-w-lg">
        Download the .zip file below and upload it to your Learning Management System (LMS).
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-4">
        <button
          onClick={handleDownload}
          disabled={!zipBlob}
          className="flex-1 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg shadow-md transition-transform transform hover:scale-105 text-white font-bold text-lg"
        >
          Download scorm_package.zip
        </button>
        <button
          onClick={onStartOver}
          className="flex-1 flex items-center justify-center p-4 bg-gray-600 hover:bg-gray-500 rounded-lg shadow-md transition-transform transform hover:scale-105 text-white font-bold text-lg"
        >
          <RestartIcon className="w-6 h-6 mr-3" />
          Start Over
        </button>
      </div>
    </div>
  );
};

export default DownloadScormStep;
