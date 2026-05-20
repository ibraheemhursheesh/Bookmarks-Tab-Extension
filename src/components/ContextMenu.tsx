// @ts-nocheck
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import styles from "./ContextMenu.module.css";
import EditBookmark from "./EditBookmark";
import EditFolder from "./EditFolder";
import DeleteBookmark from "./DeleteBookmark";
import MoveBookmarkDialog from "./MoveBookmarkDialog";

export default function ContextMenu({
  faviconUrl,
  id,
  popoverRef,
  item,
  setCurrentFolder,
  handleRename,
  setItemToDelete,
  index,
  actions,
  folderIconSvg,
}) {
  const editDialogRef = useRef(null);
  const removeDialogRef = useRef(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isFolder = !item.url;

  async function handleDelete() {
    await chrome.bookmarks.removeTree(id);
  }

  const handleMoveClick = (e) => {
    e.preventDefault();
    // e.stopPropagation();
    // popoverRef.current?.hidePopover();
    setIsMoveDialogOpen(true);
  };

  const handleMove = async (targetFolderId: string) => {
    try {
      await chrome.bookmarks.move(id, { parentId: targetFolderId });
    } catch {}
  };

  return actions && actions.length ? (
    <div
      style={{
        top: "anchor(bottom)",
        right: "anchor(left)",
        positionAnchor: `--anchor-${id}`,
      }}
      className="border-none p-1 rounded-md inset-auto origin-top-right opacity-0 scale-[70%] duration-150 ease-out transition-discrete open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-[70%]"
      ref={popoverRef}
      popover="auto"
      id={`contextMenu${id}`}
    >
      <ul>
        {actions.map((action, actionIndex) => (
          <li
            className="py-[6px] px-3 text-sm flex items-center gap-2 cursor-pointer rounded-sm hover:bg-[#eee]"
            key={`${String(action.name)}-${actionIndex}`}
            onClick={(e) => {
              action.onClick(e);
            }}
          >
            {action.icon}
            <span>{action.name}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div
      style={{
        top: "anchor(bottom)",
        left: "anchor(right)",
        positionTryFallbacks: "flip-inline",
        positionAnchor: `--anchor-${id}`,
        opacity: isHidden ? "0" : "",
      }}
      className={`border-none p-1 rounded-md inset-auto origin-top-left opacity-0 scale-[70%] duration-150 ease-out transition-discrete open:opacity-100 open:scale-100 starting:open:opacity-0  starting:open:scale-[70%]`}
      ref={popoverRef}
      popover="auto"
      id={`contextMenu${id}`}
    >
      <ul>
        <li
          className="py-[6px] pl-[13px] pr-10 text-sm flex items-center gap-3 rounded-sm hover:text-black hover:bg-zinc-200/50"
          onClick={() => {
            popoverRef.current.hidePopover();
            handleRename(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-pencil-line-icon lucide-pencil-line"
          >
            <path d="M13 21h8" data--h-bstatus="0OBSERVED" />
            <path d="m15 5 4 4" data--h-bstatus="0OBSERVED" />
            <path
              d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
              data--h-bstatus="0OBSERVED"
            />
          </svg>
          <span>Rename</span>
        </li>
        {(faviconUrl || isFolder) && (
          <li
            className="py-[6px] pl-[13px] pr-10 text-sm flex items-center gap-3 rounded-sm hover:text-black hover:bg-zinc-200/50"
            onClick={(e) => {
              if (!e.target.closest("dialog")) {
                setIsHidden(true);
                editDialogRef.current.showModal();
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-settings2-icon lucide-settings-2"
            >
              <path d="M14 17H5" data--h-bstatus="0OBSERVED" />
              <path d="M19 7h-9" data--h-bstatus="0OBSERVED" />
              <circle cx="17" cy="17" r="3" data--h-bstatus="0OBSERVED" />
              <circle cx="7" cy="7" r="3" data--h-bstatus="0OBSERVED" />
            </svg>
            <span>Edit</span>{" "}
            {isFolder ? (
              <EditFolder
                setIsHidden={setIsHidden}
                id={id}
                item={item}
                folderIconSvg={folderIconSvg}
                editDialogRef={editDialogRef}
              />
            ) : (
              <EditBookmark
                setIsHidden={setIsHidden}
                id={id}
                item={item}
                faviconUrl={faviconUrl}
                editDialogRef={editDialogRef}
                setCurrentFolder={setCurrentFolder}
              />
            )}
          </li>
        )}

        <li
          className="py-[6px] pl-[13px] pr-10 text-sm flex items-center gap-3 rounded-sm hover:text-black hover:bg-zinc-200/50"
          onClick={handleMoveClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-folder-input-icon lucide-folder-input"
          >
            <path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1" />
            <path d="M2 13h10" />
            <path d="m9 16 3-3-3-3" />
          </svg>
          <span>Move</span>
        </li>

        <li
          className="py-[6px] pl-[13px] pr-10 text-sm flex items-center gap-3 rounded-sm hover:text-[#e7000b] hover:bg-[#e7000b1a]"
          onClick={handleDelete}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-trash2-icon lucide-trash-2"
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
          <span>Delete</span>
          {/* <DeleteBookmark id={id} removeDialogRef={removeDialogRef} /> */}
        </li>
      </ul>
      <MoveBookmarkDialog
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
        onMove={handleMove}
      />
    </div>
  );
}
