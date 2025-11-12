
import React from 'react';
import { WebsiteIcon } from './icons/WebsiteIcon';
import { RestartIcon } from './icons/RestartIcon';
import { ZipIcon } from './icons/ZipIcon';
import { ScormIcon } from './icons/ScormIcon';

interface MenuStepProps {
  fileName: string;
  onGenerateWebsite: () => void;
  onGenerateScorm: () => void;
  onStartOver: () => void;
  error: string | null;
}

const MenuStep: React.FC<MenuStepProps> = ({ fileName, onGenerateWebsite, onGenerateScorm, onStartOver, error }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="flex items-center p-4 bg-gray-700 rounded-lg w-full max-w-md mb-6">
        <ZipIcon className="w-8 h-8 text-purple-400 mr-4 flex-shrink-0" />
        <p className="font-mono text-gray-300 truncate" title={fileName}>{fileName}</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative w-full max-w-md mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-gray-200 mb-6">What would you like to do?</h2>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={onGenerateWebsite}
          className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          <WebsiteIcon className="w-6 h-6 mr-3" />
          <span className="font-bold text-lg">Build Website</span>
        </button>
        <button
          onClick={onGenerateScorm}
          className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          <ScormIcon className="w-6 h-6 mr-3" />
          <span className="font-bold text-lg">Build SCORM Package</span>
        </button>
        <button
          onClick={onStartOver}
          className="flex items-center justify-center p-4 bg-gray-600 hover:bg-gray-500 rounded-lg shadow-md transition-transform transform hover:scale-105 mt-4"
        >
          <RestartIcon className="w-6 h-6 mr-3" />
          <span className="font-bold text-lg">Start Over</span>
        </button>
      </div>
    </div>
  );
};

export default MenuStep;