import { useEffect, useState } from "react";

export function useFolderIconSvg(itemId) {
  const [folderIconSvg, setFolderIconSvg] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadFolderIconSvg = async () => {
      try {
        const result = await chrome.storage.local.get(itemId);
        if (!mounted) return;
        setFolderIconSvg(result[itemId]?.folderIconSvg || "");
      } catch (error) {
        console.error("Error loading folder icon SVG:", error);
      }
    };

    const handleStorageChange = (changes, area) => {
      const itemChanges = changes[itemId];
      if (area === "local" && itemChanges && mounted) {
        setFolderIconSvg(itemChanges.newValue?.folderIconSvg || "");
      }
    };

    loadFolderIconSvg();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [itemId]);

  return folderIconSvg;
}
