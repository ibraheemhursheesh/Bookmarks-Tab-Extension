// @ts-nocheck
import React, { memo, useEffect, useRef, useState } from "react";
import BookmarkPreview from "./BookmarkPreview";
import FolderDialog from "./FolderDialog";

import Folder from "./Folder";
import Bookmark from "./Bookmark";

function BookmarkItemComponent({
  id,
  title,
  item,
  index,
  isLastItem,
  scrollableContainer,
  onFolderClick,
  setCurrentFolder,
  itemToDelete,
  setItemToDelete,
  gridColumnNumber,
  pointerDownInfo,
  delta,
  handlePointerDown,
  moveBackward,
  moveForward,
  scale,
  visible,
  move,
  bookmarkWidth,
  isMoveElementsAnimated,
}) {
  const [isPointerDown, setIsPointerDown] = useState(false);
  const popoverRef = useRef(null);

  function isAtEdge(index) {
    return Number.isInteger(index / gridColumnNumber);
  }
  function calcXMove() {
    return (gridColumnNumber - 1) * move;
  }

  const transformValue = moveForward
    ? isAtEdge(index + 1)
      ? `translate(-${calcXMove()}px, 106.5px)`
      : `translateX(${move}px)`
    : moveBackward
    ? isAtEdge(index)
      ? `translate(${calcXMove()}px, -106.5px)`
      : `translateX(-${move}px)`
    : "";

  async function handleFolderClick(e) {
    if (e.target.closest(`#folderIcon${id}`)) {
      if (!document.startViewTransition) {
        setCurrentFolder(
          (currentFolder) =>
            currentFolder.find((item) => item.id === id).children
        );
        onFolderClick(id, title);
        return;
      }

      await document.startViewTransition(() => {
        setCurrentFolder(
          (currentFolder) =>
            currentFolder.find((item) => item.id === id).children
        );
        scrollableContainer.current.scrollTo(0, 0);
        onFolderClick(id, title);
      }).finished;
    }
  }

  function showContextMenu(e) {
    e.preventDefault();
    popoverRef.current.showPopover();
  }

  if (!item.url) {
    return (
      <Folder
        bookmarkWidth={bookmarkWidth}
        item={item}
        id={id}
        title={title}
        index={index}
        isLastItem={isLastItem}
        showContextMenu={showContextMenu}
        handleFolderClick={handleFolderClick}
        isPointerDown={isPointerDown}
        setIsPointerDown={setIsPointerDown}
        delta={delta}
        handlePointerDown={handlePointerDown}
        setCurrentFolder={setCurrentFolder}
        popoverRef={popoverRef}
        itemToDelete={itemToDelete}
        setItemToDelete={setItemToDelete}
        transformValue={transformValue}
        scale={scale}
        visible={visible}
        isMoveElementsAnimated={isMoveElementsAnimated}
      />
    );
  } else {
    return (
      <Bookmark
        bookmarkWidth={bookmarkWidth}
        item={item}
        index={index}
        showContextMenu={showContextMenu}
        delta={delta}
        handlePointerDown={handlePointerDown}
        setCurrentFolder={setCurrentFolder}
        popoverRef={popoverRef}
        itemToDelete={itemToDelete}
        setItemToDelete={setItemToDelete}
        gridColumnNumber={gridColumnNumber}
        transformValue={transformValue}
        scale={scale}
        visible={visible}
        isMoveElementsAnimated={isMoveElementsAnimated}
      />
    );
  }
}

const BookmarkItem = memo(BookmarkItemComponent);

export default BookmarkItem;
