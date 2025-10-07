// @ts-nocheck

import { useRef } from "react";

export default function FaviconEditor({
  currentFavIconUrl,
  onFaviconChange,
  previousUploadedFavIconUrl,
  uploadedFavIconFile,
  url,
}) {
  // checks if the favIconUrl is obtained from chrome.storage
  const isFavIconStored = currentFavIconUrl.startsWith("data:");
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (1.5MB = 1.5 * 1024 * 1024 bytes)
    if (file.size > 1.5 * 1024 * 1024) {
      window.alert("Image size must be less than 1.5MB");
      return;
    }
    uploadedFavIconFile.current = file;
    // Revoke the previous object URL to avoid memory leaks
    if (previousUploadedFavIconUrl.current) {
      URL.revokeObjectURL(previousUploadedFavIconUrl.current);
    }
    const objectUrl = URL.createObjectURL(file);
    previousUploadedFavIconUrl.current = objectUrl;
    onFaviconChange?.(objectUrl);

    // Clean up the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.showPicker();
  };

  const handleResetFavIcon = () => {
    uploadedFavIconFile.current = null;
    if (previousUploadedFavIconUrl.current) {
      URL.revokeObjectURL(previousUploadedFavIconUrl.current);
      previousUploadedFavIconUrl.current = null;
    }
    try {
      const urlObj = new URL(url);
      const favicon = `https://www.faviconextractor.com/favicon/${urlObj.hostname}?larger=true`;
      onFaviconChange?.(favicon);
    } catch {
      onFaviconChange("/Black.png");
    }
  };

  return (
    <div className="relative size-28 border-2 border-zinc-300 rounded-sm">
      <img
        src={currentFavIconUrl}
        className="size-full p-1 rounded-lg object-cover object-center"
        alt="favicon"
      />
      <button
        onClick={handleUploadClick}
        className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </button>
      {(previousUploadedFavIconUrl.current || isFavIconStored) && (
        <button
          className="absolute -bottom-2 -left-2 bg-white rounded-full p-1 shadow-md hover:bg-primary/90"
          type="button"
          onClick={handleResetFavIcon}
        >
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M10 11v6" data--h-bstatus="0OBSERVED" />
            <path d="M14 11v6" data--h-bstatus="0OBSERVED" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
              data--h-bstatus="0OBSERVED"
            />
            <path d="M3 6h18" data--h-bstatus="0OBSERVED" />
            <path
              d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              data--h-bstatus="0OBSERVED"
            />
          </svg>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
