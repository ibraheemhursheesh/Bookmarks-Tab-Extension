// @ts-nocheck
import React, { useRef, useState } from "react";
import MoveBookmarkDialog from "./MoveBookmarkDialog";

interface BookmarksActionsProps {
  currentFolder: any[];
  setCurrentFolder: (folder: any[] | ((prev: any[]) => any[])) => void;
  folderPath: Array<{ id: string; title: string }>;
  sourceFolder: { id: string; title: string };
  onSourceFolderChange: (folder: { id: string; title: string }) => void;
  scrollableContainer: React.RefObject<HTMLDivElement>;
}

export default function BookmarksActions({
  currentFolder,
  setCurrentFolder,
  folderPath,
  sourceFolder,
  onSourceFolderChange,
  scrollableContainer,
}: BookmarksActionsProps) {
  const [isSourceFolderDialogOpen, setIsSourceFolderDialogOpen] =
    useState(false);

  const createFolder = async () => {
    try {
      const currentFolderId =
        folderPath[folderPath.length - 1].id === "Home"
          ? sourceFolder.id
          : folderPath[folderPath.length - 1].id;

      if (scrollableContainer.current) {
        scrollableContainer.current.scrollTo({
          top: scrollableContainer.current.scrollHeight,
        });
      }

      await chrome.bookmarks.create({
        parentId: currentFolderId,
        title: "",
      });
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleSourceFolderChange = async (folderId: string) => {
    const [folder] = await chrome.bookmarks.get(folderId);
    onSourceFolderChange({
      id: folderId,
      title: folder?.title || "Home",
    });
  };

  return (
    <div className="ml-auto flex gap-3 items-center">
      <button
        className="cursor-pointer relative rounded-xs hover:bg-black/20 outline-3 outline-transparent duration-150 hover:outline-black/20 after:absolute after:-inset-2 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        onClick={() => setIsSourceFolderDialogOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-sliders-vertical-icon lucide-sliders-vertical"
        >
          <path d="M10 8h4" />
          <path d="M12 21v-9" />
          <path d="M12 8V3" />
          <path d="M17 16h4" />
          <path d="M19 12V3" />
          <path d="M19 21v-5" />
          <path d="M3 14h4" />
          <path d="M5 10V3" />
          <path d="M5 21v-7" />
        </svg>
      </button>

      <button
        className="cursor-pointer relative rounded-xs hover:bg-black/20 outline-3 outline-transparent duration-150 hover:outline-black/20 after:absolute after:-inset-2 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
        className="cursor-pointer relative rounded-xs hover:bg-black/20 outline-3 outline-transparent duration-150 hover:outline-black/20 after:absolute after:-inset-2 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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

      <MoveBookmarkDialog
        isOpen={isSourceFolderDialogOpen}
        onClose={() => setIsSourceFolderDialogOpen(false)}
        onMove={handleSourceFolderChange}
        initialSelectedFolderId={sourceFolder.id}
        buttonLabel="Save"
      />
    </div>
  );
}
