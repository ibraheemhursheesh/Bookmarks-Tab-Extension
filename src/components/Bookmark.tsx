// @ts-nocheck
import { memo, useEffect, useState, useRef } from "react";
import ContextMenu from "./ContextMenu";

import { useFaviconUrl } from "../hooks/useFaviconUrl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { it } from "node:test";

function faviconURL(u) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

const Bookmark = memo(function ({
  item,
  showContextMenu,
  pointerDownInfo,
  delta,
  handlePointerDown,
  popoverRef,
  setCurrentFolder,
  itemToDelete,
  setItemToDelete,
  index,
  gridColumnNumber,
  transformValue,
  scale,
  visible,
  bookmarkWidth,
  isMoveElementsAnimated,
}) {
  // console.log(item);
  const defaultFaviconUrl = `https://www.faviconextractor.com/favicon/${
    new URL(item.url).hostname
  }?larger=true`;
  const faviconUrl = useFaviconUrl(item.id, defaultFaviconUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isTitleTruncated = item.title.length > 12;
  const displayedTitle = isTitleTruncated
    ? item.title.slice(0, 12) + ".."
    : item.title;
  const titleRef = useRef(null);

  function isAtEdge(index) {
    // console.log(index);
    // console.log(Number.isInteger(index / gridColumnNumber));
    return Number.isInteger(index / gridColumnNumber);
  }

  const handleRename = (setEditing) => {
    setIsEditing(setEditing);
  };

  function moveCursorToEnd(titleRef) {
    const range = document.createRange();
    range.selectNodeContents(titleRef.current);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function calcXMove() {
    return (gridColumnNumber - 1) * move;
  }

  useEffect(
    function () {
      if (isEditing) {
        titleRef.current?.focus();
        moveCursorToEnd(titleRef);
      }
    },
    [isEditing],
  );

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTitle = e.target.textContent;
      setIsEditing(false);
      const _ = await chrome.bookmarks.update(item.id, { title: newTitle });
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleBlur = async (e) => {
    // console.log("blur");
    const newTitle = e.target.textContent;
    setIsEditing(false);
    const _ = await chrome.bookmarks.update(item.id, { title: newTitle });
  };

  function handleAnchorClick(e) {
    if (e.target.closest(`[popover="auto"]`) || isEditing) {
      e.preventDefault();
      return;
    }
    setIsRedirecting(true);
  }

  return (
    <li
      style={{
        transition: isMoveElementsAnimated ? "transform 300ms ease" : "",
        transform: transformValue,
      }}
      id={item.id}
      onContextMenu={showContextMenu}
    >
      <div
        id="draggable"
        style={{
          position: delta?.deltaX !== undefined ? "absolute" : "relative",
          zIndex: delta?.deltaX !== undefined ? "11" : "auto",
          transform:
            delta?.deltaX !== undefined
              ? `translate(${delta?.deltaX}px, ${delta?.deltaY}px)`
              : "",

          transition: delta?.transition ? "150ms" : "",
          opacity: visible ? "1" : "0",
          width: bookmarkWidth + "px",
        }}
      >
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <a
              href={item.url}
              onClick={handleAnchorClick}
              draggable="false"
              className=" relative h-[90.5px] flex flex-col items-center gap-[5px] text-white text-center cursor-pointer has-focus-visible:z-1"
              style={{
                transition: "scale 200ms",
                scale: scale ? "0.8" : "1",
                pointerEvents: delta?.deltaX !== undefined ? "none" : "auto",
              }}
            >
              <img
                onPointerDown={(e) =>
                  handlePointerDown(e, item.id, index, item.parentId)
                }
                style={{
                  anchorName: `--anchor-${item.id}`,
                  scale: delta?.deltaX !== undefined ? "1" : "",
                }}
                src={faviconUrl}
                className="size-12 object-cover object-center rounded-sm select-none transition-all active:scale-95 "
                id={`bookmarkIcon${item.id}`}
                alt="Favicon"
                draggable="false"
                data-droppable="true"
              />
              {isRedirecting && (
                <div
                  style={{
                    maskImage: `url(${faviconUrl})`,
                  }}
                  className={`size-12 absolute flex bg-black/50 items-center justify-center rounded-sm mask-no-repeat mask-cover`}
                >
                  <div className="size-9 border-3 border-white border-b-transparent rounded-[50%] shrink-0 animate-loading"></div>
                </div>
              )}
              <span
                className="wrap-anywhere text-[12.5px]/[17px] absolute w-full top-[53px] left-0 select-none"
                id={`bookmarkTitle${item.id}`}
              >
                {!isEditing && displayedTitle}
                {isEditing && (
                  <span
                    ref={titleRef}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    className="block focus-visible:bg-[#333333ad] focus-visible:backdrop-blur-xs"
                  >
                    {item.title}
                  </span>
                )}
              </span>{" "}
              <ContextMenu
                index={index}
                handleRename={handleRename}
                faviconUrl={faviconUrl}
                id={item.id}
                item={item}
                popoverRef={popoverRef}
                setCurrentFolder={setCurrentFolder}
                setItemToDelete={setItemToDelete}
              />
            </a>
          </TooltipTrigger>
          {isTitleTruncated && !isEditing && (
            <TooltipContent side="top">{item.title}</TooltipContent>
          )}
        </Tooltip>
      </div>
    </li>
  );
});
export default Bookmark;
