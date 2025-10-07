import { useEffect, useState } from "react";

export function useFaviconUrl(itemId, defaultUrl) {
  const [faviconUrl, setFaviconUrl] = useState(defaultUrl);

  useEffect(() => {
    let mounted = true;

    const loadFavicon = async () => {
      try {
        const result = await chrome.storage.local.get(itemId);
        if (!mounted) return;
        const uploadedFavIconFile = result[itemId]?.uploadedFavIconFile;
        if (uploadedFavIconFile) {
          setFaviconUrl(uploadedFavIconFile);
        }
      } catch (error) {
        console.error("Error loading favicon:", error);
      }
    };

    const handleStorageChange = (changes, area) => {

      const itemChanges = changes[itemId];
      if (area === "local" && itemChanges) {
        if (itemChanges.newValue?.uploadedFavIconFile && mounted) {
          setFaviconUrl(itemChanges.newValue.uploadedFavIconFile);
        } else if (itemChanges.oldValue) {
          setFaviconUrl(defaultUrl);
        }
      }
    };

    loadFavicon();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [itemId]);

  useEffect(
    function () {
      setFaviconUrl(defaultUrl);
    },
    [defaultUrl]
  );

  return faviconUrl;
}
