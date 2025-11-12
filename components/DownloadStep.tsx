import React, { useMemo } from 'react';
import { RestartIcon } from './icons/RestartIcon';
import JSZip from 'jszip';
import { VaultAsset } from '../services/zipReader';


interface DownloadStepProps {
  htmlContent: string;
  assets: VaultAsset[];
  onStartOver: () => void;
}

// Helper to get MIME type from filename
const getMimeType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    default:
      // Fallback for unknown types
      return 'application/octet-stream';
  }
};

// Helper to convert Uint8Array to a Base64 string
const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};


const DownloadStep: React.FC<DownloadStepProps> = ({ htmlContent, assets, onStartOver }) => {

  const previewHtml = useMemo(() => {
    if (!htmlContent || assets.length === 0) {
      return htmlContent;
    }

    let processedHtml = htmlContent;

    for (const asset of assets) {
      try {
        const base64Data = toBase64(asset.data);
        const mimeType = getMimeType(asset.name);
        const dataUri = `data:${mimeType};base64,${base64Data}`;
        
        // Create a regex to safely replace the asset path.
        // This escapes special characters in the filename.
        const assetNameRegex = asset.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`src=["']assets/${assetNameRegex}["']`, 'g');
        
        processedHtml = processedHtml.replace(regex, `src="${dataUri}"`);
      } catch (error) {
          console.error(`Failed to process asset ${asset.name} for preview:`, error);
      }
    }

    return processedHtml;
  }, [htmlContent, assets]);


  const handleDownload = async () => {
    const zip = new JSZip();
    // Use the original htmlContent with relative paths for the download
    zip.file('index.html', htmlContent);

    if (assets.length > 0) {
      const assetsFolder = zip.folder('assets');
      if (assetsFolder) {
        for (const asset of assets) {
            assetsFolder.file(asset.name, asset.data);
        }
      }
    }
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-3xl font-bold text-gray-100 mb-4">Your Website is Ready!</h2>
      <p className="text-gray-400 mb-6">Here's a preview of your new site. Download the zip file to host it anywhere.</p>

      <div className="w-full h-96 bg-gray-900 rounded-lg shadow-inner border border-gray-700 mb-6 overflow-hidden">
        <iframe
          srcDoc={previewHtml}
          title="Website Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={handleDownload}
          className="flex-1 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition-transform transform hover:scale-105 text-white font-bold text-lg"
        >
          Download website.zip
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

export default DownloadStep;