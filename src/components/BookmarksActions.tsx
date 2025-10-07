// @ts-nocheck
import React, { useRef } from "react";

interface BookmarksActionsProps {
  currentFolder: any[];
  setCurrentFolder: (folder: any[] | ((prev: any[]) => any[])) => void;
  folderPath: Array<{ id: string; title: string }>;
  scrollableContainer: React.RefObject<HTMLDivElement>;
}

export default function BookmarksActions({
  currentFolder,
  setCurrentFolder,
  folderPath,
  scrollableContainer,
}: BookmarksActionsProps) {
  const createFolder = async () => {
    try {
      const currentFolderId =
        folderPath[folderPath.length - 1].id === "Home"
          ? "1"
          : folderPath[folderPath.length - 1].id;

      if (scrollableContainer.current) {
        scrollableContainer.current.scrollTo({
          top: scrollableContainer.current.scrollHeight,
        });
      }

      const newFolder = await chrome.bookmarks.create({
        parentId: currentFolderId,
        title: "",
      });

      setCurrentFolder((prev) => [
        ...prev,
        { ...newFolder, children: [], isNewlyCreated: true },
      ]);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  return (
    <div className="ml-auto flex gap-3 items-center">
      <button
        className="cursor-pointer relative rounded-xs hover:bg-black/20 outline-3 outline-transparent duration-150 hover:outline-black/20 after:absolute after:-inset-2 "
        onClick={createFolder}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-folder-plus-icon lucide-folder-plus"
        >
          <path d="M12 10v6" data--h-bstatus="0OBSERVED" />
          <path d="M9 13h6" data--h-bstatus="0OBSERVED" />
          <path
            d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
            data--h-bstatus="0OBSERVED"
          />
        </svg>
      </button>

      <button
        className="cursor-pointer relative rounded-xs hover:bg-black/20 outline-3 outline-transparent duration-150 hover:outline-black/20 after:absolute after:-inset-2 "
        onClick={() => {
          const dialog = document.getElementById("searchResultDialog");
          if (dialog) {
            dialog.showModal();
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m21 21-4.34-4.34" data--h-bstatus="0OBSERVED" />
          <circle cx="11" cy="11" r="8" data--h-bstatus="0OBSERVED" />
        </svg>
      </button>
    </div>
  );
}
