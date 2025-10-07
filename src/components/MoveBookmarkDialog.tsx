// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

interface BookmarkTreeNode {
  id: string;
  title: string;
  children?: BookmarkTreeNode[];
  url?: string;
  parentId?: string;
}

interface FolderNode extends BookmarkTreeNode {
  isExpanded?: boolean;
}

interface MoveBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (folderId: string) => void;
}

const FolderTree = ({
  folder,
  level = 1,
  selectedFolderId,
  onSelect,
  onToggle,
}: {
  folder: FolderNode;
  level?: number;
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) => {
  const hasChildren = folder.children?.some((child) => !child.url);
  const marginLeft = `${level * 10}px`;
  const isSelected = folder.id === selectedFolderId;

  return (
    <li>
      <div
        className={`flex items-center p-2  rounded-sm cursor-pointer gap-4`}
        style={{
          backgroundColor: isSelected ? "#d4d4d8  " : "",
        }}
        onClick={(e) => {
          e.preventDefault();
          onSelect(folder.id);
        }}
      >
        <Folder size="22" />
        <span className="text-sm">{folder.title}</span>
        {hasChildren && (
          <button
            className="p-0 rounded-sm ml-auto"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(folder.id);
            }}
          >
            {folder.isExpanded ? (
              <ChevronDown className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </button>
        )}
      </div>
      {folder.isExpanded && folder.children && (
        <ul
          style={{
            marginLeft,
            borderLeft: "2px solid #333",
          }}
        >
          {folder.children
            .filter((child) => !child.url) // Only show folders, not bookmarks
            .map((child) => (
              <FolderTree
                key={child.id}
                folder={child}
                level={level + 1}
                selectedFolderId={selectedFolderId}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ))}
        </ul>
      )}
    </li>
  );
};

export default function MoveBookmarkDialog({
  isOpen,
  onClose,
  onMove,
}: MoveBookmarkDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [rootFolders, setRootFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const mainFolders = bookmarkTreeNodes[0].children;
        setRootFolders(mainFolders);
      });

      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      // Reset selection when dialog closes
      setSelectedFolderId(null);
    }
  }, [isOpen]);

  const updateFolderRecursive = (folders, folderId) => {
    return folders.map((folder) => {
      if (folder.id === folderId) {
        return {
          ...folder,
          isExpanded: !folder.isExpanded,
        };
      }

      if (folder.children) {
        return {
          ...folder,
          children: updateFolderRecursive(folder.children, folderId),
        };
      }

      return folder;
    });
  };

  const handleToggleFolder = (folderId: string) => {
    setRootFolders((prevFolders) => {
      return updateFolderRecursive(prevFolders, folderId);
    });
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className=" opacity-0 scale-95  transition-discrete   open:backdrop:backdrop-blur-sm starting:open:opacity-0 starting:open:scale-95 transition-all duration-300 open:opacity-100 open:scale-100 p-0 cursor-auto rounded-xl border-1 border-black/50  mx-auto mt-8 w-xl bg-white backdrop:bg-black/50"
      onClick={handleDialogClick}
    >
      <div className=" flex flex-col gap-5 h-[420px] px-7 py-4">
        <div className="text-left ">
          <h2 className="text-lg font-semibold">Move to Folder</h2>
        </div>

        <ul
          style={{ scrollbarWidth: "thin", scrollbarColor: "#333 #e4e4e7" }}
          className="flex-1 overflow-y-auto max-w-md mx-9 flex flex-col gap-2"
        >
          {rootFolders.map((folder) => (
            <FolderTree
              key={folder.id}
              folder={folder}
              onSelect={setSelectedFolderId}
              onToggle={handleToggleFolder}
              selectedFolderId={selectedFolderId}
            />
          ))}
        </ul>

        <div className=" flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="bg-zinc-200 border-none rounded-full  cursor-pointer"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="min-w-21 border-none rounded-full cursor-pointer"
            onClick={() => {
              if (selectedFolderId) {
                onMove(selectedFolderId);
                onClose();
              }
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </dialog>
  );
}
