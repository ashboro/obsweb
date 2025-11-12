import React, { useState, useCallback } from 'react';
import { ZipIcon } from './icons/ZipIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface UploadStepProps {
  onFileUploaded: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
}

const UploadStep: React.FC<UploadStepProps> = ({ onFileUploaded, isProcessing, error: processingError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileValidation = (file: File | undefined | null) => {
    // A more robust check for zip files by extension or mime type
    if (file && (file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
      setValidationError(null);
      onFileUploaded(file);
    } else {
      setValidationError('Please upload a valid .zip file.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    handleFileValidation(event.target.files?.[0]);
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessing) return;
    setIsDragging(dragging);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    if (isProcessing) return;
    handleFileValidation(e.dataTransfer.files?.[0]);
  }, [onFileUploaded, isProcessing]);

  const displayError = processingError || validationError;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
        className={`relative w-full max-w-lg p-10 border-2 border-dashed rounded-lg text-center transition-all duration-300 
          ${isDragging ? 'border-purple-500 bg-gray-700/50' : 'border-gray-600'} 
          ${displayError ? '!border-red-500' : ''}
          ${isProcessing ? 'cursor-wait bg-gray-700/50 border-gray-500' : 'cursor-pointer hover:border-purple-400'}`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".zip,application/zip,application/x-zip-compressed"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <SpinnerIcon className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-300">
              Reading your notes...
            </p>
          </div>
        ) : (
          <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
            <ZipIcon className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-300">
              Drag & drop your Obsidian .zip file here
            </p>
            <p className="text-gray-500 mt-1">or</p>
            <span className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
              Browse Files
            </span>
          </label>
        )}
      </div>
      {displayError && <p className="mt-4 text-sm text-red-400 font-medium">{displayError}</p>}
      <p className="mt-6 text-sm text-gray-500">
        Your notes will be processed to generate a website. They are not stored.
      </p>
    </div>
  );
};

export default UploadStep;