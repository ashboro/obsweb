
import React, { useState, useCallback } from 'react';
import { AppState } from './types';
import UploadStep from './components/UploadStep';
import MenuStep from './components/MenuStep';
import GeneratingStep from './components/GeneratingStep';
import DownloadStep from './components/DownloadStep';
import DownloadScormStep from './components/DownloadScormStep';
import { generateWebsiteFromNotes, generateScormPackageFromNotes } from './services/geminiService';
import { extractVaultContent, VaultAsset } from './services/zipReader';
import JSZip from 'jszip';

export default function App(): React.ReactElement {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedContent, setExtractedContent] = useState<string | null>(null);
  const [extractedAssets, setExtractedAssets] = useState<VaultAsset[]>([]);
  const [isProcessingZip, setIsProcessingZip] = useState<boolean>(false);
  const [scormZipBlob, setScormZipBlob] = useState<Blob | null>(null);


  const handleFileUploaded = async (file: File) => {
    setUploadedFile(file);
    setIsProcessingZip(true);
    setError(null);

    try {
      const { markdownContent, assets } = await extractVaultContent(file);
      setExtractedContent(markdownContent);
      setExtractedAssets(assets);
      setAppState(AppState.MENU);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while reading the zip file.';
      console.error("Zip processing failed:", errorMessage);
      setError(`Failed to process zip file. ${errorMessage}`);
      setAppState(AppState.UPLOAD); // Revert to upload on failure
    } finally {
      setIsProcessingZip(false);
    }
  };

  const handleStartOver = () => {
    setAppState(AppState.UPLOAD);
    setUploadedFile(null);
    setGeneratedHtml(null);
    setExtractedContent(null);
    setExtractedAssets([]);
    setError(null);
    setScormZipBlob(null);
  };

  const handleGenerateWebsite = useCallback(async () => {
    if (!uploadedFile || !extractedContent) {
      setError('File content was not processed correctly. Please try uploading again.');
      setAppState(AppState.MENU);
      return;
    }

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const assetFileNames = extractedAssets.map(asset => asset.name);
      const htmlContent = await generateWebsiteFromNotes(uploadedFile.name, extractedContent, assetFileNames);
      if (!htmlContent) {
          throw new Error("Received empty content from the AI. Please try again.");
      }
      setGeneratedHtml(htmlContent);
      setAppState(AppState.DOWNLOAD);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error("Generation failed:", errorMessage);
      setError(`Failed to generate website. ${errorMessage}`);
      setAppState(AppState.MENU); // Revert to menu on failure
    }
  }, [uploadedFile, extractedContent, extractedAssets]);
  
  const handleGenerateScorm = useCallback(async () => {
    if (!uploadedFile || !extractedContent) {
      setError('File content was not processed correctly. Please try uploading again.');
      setAppState(AppState.MENU);
      return;
    }

    setAppState(AppState.GENERATING_SCORM);
    setError(null);

    try {
      const scormFiles = await generateScormPackageFromNotes(uploadedFile.name, extractedContent);
      if (!scormFiles || !scormFiles['index.html'] || !scormFiles['imsmanifest.xml']) {
          throw new Error("Received incomplete SCORM package from the AI. Please try again.");
      }
      
      const zip = new JSZip();
      zip.file('index.html', scormFiles['index.html']);
      zip.file('imsmanifest.xml', scormFiles['imsmanifest.xml']);
      if(scormFiles['scorm_api_wrapper.js']) {
        zip.file('scorm_api_wrapper.js', scormFiles['scorm_api_wrapper.js']);
      }
      
      const blob = await zip.generateAsync({ type: 'blob' });
      setScormZipBlob(blob);
      setAppState(AppState.DOWNLOAD_SCORM);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error("SCORM Generation failed:", errorMessage);
      setError(`Failed to generate SCORM package. ${errorMessage}`);
      setAppState(AppState.MENU); // Revert to menu on failure
    }
  }, [uploadedFile, extractedContent]);


  const renderStep = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return <UploadStep onFileUploaded={handleFileUploaded} isProcessing={isProcessingZip} error={error} />;
      case AppState.MENU:
        return (
          <MenuStep
            fileName={uploadedFile?.name || 'Unknown File'}
            onGenerateWebsite={handleGenerateWebsite}
            onGenerateScorm={handleGenerateScorm}
            onStartOver={handleStartOver}
            error={error}
          />
        );
      case AppState.GENERATING:
      case AppState.GENERATING_SCORM:
        return <GeneratingStep isScorm={appState === AppState.GENERATING_SCORM} />;
      case AppState.DOWNLOAD:
        return (
          <DownloadStep
            htmlContent={generatedHtml || ''}
            assets={extractedAssets}
            onStartOver={handleStartOver}
          />
        );
      case AppState.DOWNLOAD_SCORM:
        return (
          <DownloadScormStep
            zipBlob={scormZipBlob}
            onStartOver={handleStartOver}
          />
        );
      default:
        return <UploadStep onFileUploaded={handleFileUploaded} isProcessing={isProcessingZip} error={error} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          Obsidian Site Builder
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Transform your Obsidian notes into a stunning website with AI.
        </p>
      </header>
      <main className="w-full max-w-4xl p-4 md:p-8 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
        {renderStep()}
      </main>
    </div>
  );
}
