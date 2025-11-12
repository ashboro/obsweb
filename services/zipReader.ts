
import JSZip from 'jszip';

export interface VaultAsset {
  name: string;
  data: Uint8Array;
}

export interface VaultContent {
  markdownContent: string;
  assets: VaultAsset[];
}

const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

/**
 * Extracts and concatenates .md file content and collects image assets from a zip archive.
 * @param zipFile The zip file to process.
 * @returns A promise that resolves to an object containing markdown content and an array of assets.
 */
export async function extractVaultContent(zipFile: File): Promise<VaultContent> {
  const zip = new JSZip();
  const content = await zip.loadAsync(zipFile);
  const files = (Object.values(content.files) as JSZip.JSZipObject[]).filter(file => !file.dir);

  const markdownFiles = files.filter(
    (file) => file.name.toLowerCase().endsWith('.md')
  );

  const assetFiles = files.filter((file) => {
    const lowerCaseName = file.name.toLowerCase();
    return SUPPORTED_IMAGE_EXTENSIONS.some(ext => lowerCaseName.endsWith(ext));
  });

  if (markdownFiles.length === 0) {
    throw new Error("No markdown (.md) files found in the zip archive.");
  }

  let combinedContent = `CONTEXT FROM OBSIDIAN VAULT (FILENAME: ${zipFile.name})\n\n`;

  for (const file of markdownFiles) {
    try {
      const fileContent = await file.async('string');
      combinedContent += `--- START OF FILE: ${file.name} ---\n\n`;
      combinedContent += `${fileContent.trim()}\n\n`;
      combinedContent += `--- END OF FILE: ${file.name} ---\n\n`;
    } catch (e) {
      console.warn(`Could not read file ${file.name} as text. Skipping.`, e);
    }
  }

  const MAX_PROMPT_LENGTH = 100000; 
  if (combinedContent.length > MAX_PROMPT_LENGTH) {
    combinedContent = combinedContent.substring(0, MAX_PROMPT_LENGTH) + "\n\n... (content truncated due to length)";
  }

  const assets: VaultAsset[] = [];
  for (const assetFile of assetFiles) {
    try {
      const data = await assetFile.async('uint8array');
      // Use just the basename of the file to simplify paths for the AI
      const name = assetFile.name.split('/').pop() || assetFile.name;
      assets.push({ name, data });
    } catch (e) {
      console.warn(`Could not read asset file ${assetFile.name}. Skipping.`, e);
    }
  }

  return { markdownContent: combinedContent, assets };
}
