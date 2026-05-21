// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import ContextMenu from "./ContextMenu";
import { useFolderIconSvg } from "../hooks/useFolderIconSvg";
export default function Folder({
  id,
  title,
  item,
  index,
  isLastItem,
  showContextMenu,
  handleFolderClick,
  isPointerDown,
  setIsPointerDown,
  pointerDownInfo,
  delta,
  handlePointerDown,
  setCurrentFolder,
  popoverRef,
  itemToDelete,
  setItemToDelete,
  transformValue,
  scale,
  visible,
  bookmarkWidth,
  isMoveElementsAnimated,
}) {
  const [isEditing, setIsEditing] = useState(isLastItem && item.isNewlyCreated);
  const { folderIconSvg, folderColor } = useFolderIconSvg(id);

  const titleRef = useRef(null);
  const folderIconRef = useRef(null);

  const handleRename = (setEditing) => {
    setIsEditing(setEditing);
  };

  useEffect(
    function () {
      if (isEditing) {
        titleRef.current?.focus();
        moveCursorToEnd(titleRef);
      }
    },
    [isEditing],
  );

  function moveCursorToEnd(titleRef) {
    const range = document.createRange();
    range.selectNodeContents(titleRef.current);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTitle = e.target.textContent;
      setIsEditing(false);
      const _ = await chrome.bookmarks.update(id, { title: newTitle });
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleBlur = async (e) => {
    const newTitle = e.target.textContent;
    setIsEditing(false);
    const _ = await chrome.bookmarks.update(id, { title: newTitle });
  };

  const handleFolderKeyDown = (e) => {
    if (
      isEditing ||
      e.target.isContentEditable ||
      e.target.closest("dialog") ||
      e.target.closest('[popover="auto"]')
    ) {
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      folderIconRef.current?.click();
    }
  };

  return (
    <li
      style={{
        transition: isMoveElementsAnimated ? "transform 300ms ease" : "",
        transform: transformValue,
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open folder ${title}`}
      id={id}
      className="rounded-sm focus-visible:outline-2 focus-visible:outline-white/70"
      onContextMenu={showContextMenu}
      onClick={handleFolderClick}
      onKeyDown={handleFolderKeyDown}

      // style={
      //   delta?.deltaX
      //     ? {
      //         zIndex: "1",
      //         transform: `translate(${delta?.deltaX}px, ${delta?.deltaY}px)`,
      //       }
      //     : {}
      // }
    >
      <div
        id="draggable"
        className=" relative h-[90.5px] flex flex-col items-center gap-[5px] text-white text-center cursor-pointer has-focus-visible:z-1"
        style={{
          position: delta?.deltaX !== undefined ? "absolute" : "relative",
          zIndex: delta?.deltaX !== undefined ? "11" : "auto",
          transform:
            delta?.deltaX !== undefined
              ? `translate(${delta?.deltaX}px, ${delta?.deltaY}px)`
              : "",

          transition: delta?.transition ? "150ms" : "",
          opacity: visible ? "1" : "0",
        }}
      >
        <div
          style={{
            transition: "scale 200ms",
            scale: scale ? "0.8" : "1",
            width: bookmarkWidth + "px",
          }}
        >
          <div
            ref={folderIconRef}
            style={{
              anchorName: `--anchor-${id}`,
              overflow: "hidden",
              pointerEvents: delta?.deltaX !== undefined ? "none" : "auto",
              scale: delta?.deltaX !== undefined ? "1" : "",
            }}
            className="size-12   mx-auto relative duration-150 active:scale-95"
            id={`folderIcon${id}`}
            data-droppable="true"
            onPointerDown={(e) => {
              handlePointerDown(e, id, index, item.parentId);
            }}
          >
            <div
              className="w-full h-12
            4 absolute top-0 left-0  "
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill={folderColor.outside}
                stroke=""
                // stroke="white"
                strokeWidth="2"
                className="relative top-[6px]"
              >
                <path d="M 0 20 L 0 8 Q 0 0 8 0 L 20 0 C 24 0 26 4 28 4 L 40 4 Q 48 4 48 12 L 48 20 z"></path>
              </svg>
            </div>
            <div
              className="w-full h-[34px] border-2 rounded-sm mt-[14px] relative flex items-center justify-center"
              style={{
                backgroundColor: folderColor.inside,
                borderColor: folderColor.outside,
              }}
            >
              {folderIconSvg && (
                <div
                  className="pointer-events-none absolute  text-zinc-700"
                  dangerouslySetInnerHTML={{ __html: folderIconSvg }}
                />
              )}
            </div>

            {/* <img
              src="/folder-images/folder2r.png"
              className="w-full mt-1"
              alt=""
            /> */}
          </div>
          <span
            className="text-[12.5px]/[17px] wrap-anywhere absolute w-full top-[53px] left-0"
            id={`folderTitle${id}`}
          >
            {!isEditing &&
              (title.length > 12 ? title.slice(0, 12) + ".." : title)}
            {isEditing && (
              <span
                ref={titleRef}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="block focus-visible:bg-[#333333ad] focus-visible:backdrop-blur-xs"
              >
                {title}
              </span>
            )}
          </span>

          <ContextMenu
            handleRename={handleRename}
            setCurrentFolder={setCurrentFolder}
            item={item}
            id={id}
            folderIconSvg={folderIconSvg}
            folderColor={folderColor}
            popoverRef={popoverRef}
            setWillBeDeleted={setItemToDelete}
          />
        </div>
      </div>
    </li>
  );
}
