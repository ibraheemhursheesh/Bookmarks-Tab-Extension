import { useEffect, useState } from "react";
import { colors } from "../data/colors";

const defaultFolderColor = colors[0];

export function useFolderIconSvg(itemId) {
  const [folderIconSvg, setFolderIconSvg] = useState("");
  const [folderColor, setFolderColor] = useState(defaultFolderColor);

  useEffect(() => {
    let mounted = true;

    const loadFolderIconSvg = async () => {
      try {
        const result = await chrome.storage.local.get(itemId);
        if (!mounted) return;
        setFolderIconSvg(result[itemId]?.folderIconSvg || "");
        setFolderColor(result[itemId]?.folderColor || defaultFolderColor);
      } catch (error) {
        console.error("Error loading folder icon settings:", error);
      }
    };

    const handleStorageChange = (changes, area) => {
      const itemChanges = changes[itemId];
      if (area === "local" && itemChanges && mounted) {
        setFolderIconSvg(itemChanges.newValue?.folderIconSvg || "");
        setFolderColor(itemChanges.newValue?.folderColor || defaultFolderColor);
      }
    };

    loadFolderIconSvg();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [itemId]);

  return { folderIconSvg, folderColor };
}
