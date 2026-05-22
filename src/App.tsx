/* eslint-disable */
// @ts-nocheck
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useBookmarks } from "./hooks/useBookmarks";

import { debounce } from "./utils/debounce";
import { arrayMove } from "./utils/arrayMove";

import DateTimeDisplay from "./components/DateTimeDisplay";

import Bookmarks from "./components/Bookmarks";
import BreadCrumb from "./components/Breadcrumb";
import BackgroundImageWrapper from "./components/BackgroundImageWrapper";
import BookmarkItem from "./components/BookmarkItem";
import DraggedBookmarkClone from "./components/DraggedBookmarkClone";

const transitionDuration = 300;

export default function App() {
  const [folderPath, setFolderPath] = useState([{ id: "Home", title: "Home" }]);
  const activeFolderId =
    folderPath[folderPath.length - 1].id === "Home"
      ? "1"
      : folderPath[folderPath.length - 1].id;

  const [currentFolder, setCurrentFolder, allBookmarks] =
    useBookmarks(activeFolderId);
  const dialog = useRef(null);
  const [gridColumnNumber, setGridColumnNumber] = useState(null);
  const listGrid = useRef(null);

  const collisions = useRef(null);
  const newPosition = useRef([]);
  const pointerDownInfo = useRef(null);
  const [pointerUpAfterDrag, setPointerUpAfterDrag] = useState(false);
  const [delta, setDelta] = useState({});
  const [movedElements, setMovedElements] = useState([]);
  const [scale, setScale] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);

  const droppableContainers = useRef([]);
  const newDroppableArea = useRef(null);
  const isMoveElementsAnimated = useRef(false);
  const pathDroppableContainers = useRef([]);
  const scrollableContainer = useRef(null);
  const timeoutId = useRef(null);
  const intervalId = useRef(null);
  const allowUpdatingScrollTopAfterScroll = useRef(true);
  const isProgrammaticScroll = useRef(false);

  const bookmarkWidth = 70;
  const gridGap = 16;
  const move = bookmarkWidth + gridGap;

  const handleFolderNavigation = useCallback(function (folderId, folderTitle) {
    if (folderId === "Home") {
      setFolderPath([{ id: "Home", title: "Home" }]);
    } else {
      setFolderPath((prev) => [...prev, { id: folderId, title: folderTitle }]);
    }
  }, []);

  const handleBreadcrumbNav = (folderId: string) => {
    const index = folderPath.findIndex((folder) => folder.id === folderId);
    if (index !== -1) {
      const id = folderId === "Home" ? "1" : folderId;

      chrome.bookmarks.getSubTree(id, async (subTree) => {
        if (!document.startViewTransition) {
          setCurrentFolder(subTree[0].children || []);
          setFolderPath(folderPath.slice(0, index + 1));
          return;
        }

        await document.startViewTransition(() => {
          setCurrentFolder(subTree[0].children || []);
          setFolderPath(folderPath.slice(0, index + 1));
          scrollableContainer.current.scrollTo(0, 0);
        }).finished;
      });
    }
  };

  function findFolderPath(node, targetFolderId, path = []) {
    if (!node || node.url) return null;

    const nextPath = [...path, node];
    if (node.id === targetFolderId) return nextPath;

    for (const child of node.children || []) {
      const childPath = findFolderPath(child, targetFolderId, nextPath);
      if (childPath) return childPath;
    }

    return null;
  }

  const handleSearchFolderOpen = useCallback(function (folderId) {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const rootFolders = bookmarkTreeNodes[0]?.children || [];
      const targetPath =
        rootFolders
          .map((rootFolder) => findFolderPath(rootFolder, folderId))
          .find(Boolean) || [];

      const nextFolderPath = targetPath.map((folder, index) => {
        if (index === 0 && folder.id === "1") {
          return { id: "Home", title: "Home" };
        }

        return {
          id: folder.id,
          title: folder.title,
        };
      });

      chrome.bookmarks.getSubTree(folderId, async (subTree) => {
        const openFolder = () => {
          setCurrentFolder(subTree[0]?.children || []);
          setFolderPath(
            nextFolderPath.length
              ? nextFolderPath
              : [{ id: folderId, title: subTree[0]?.title || "" }]
          );
          scrollableContainer.current?.scrollTo(0, 0);
        };

        if (!document.startViewTransition) {
          openFolder();
          return;
        }

        await document.startViewTransition(openFolder).finished;
      });
    });
  }, []);

  // these useCallbacks saved 19 wasted render on every pointermove.
  const handlePointerDown = useCallback(function (e, id, index, parentId) {
    const element = e.target.closest(`[data-droppable="true"]`);
    if (e.button === 0) {
      setPointerUpAfterDrag(false);
      pointerDownInfo.current = {
        draggedElementIndex: index,
        id,
        parentId,
        pointerDownClientX: e.clientX,
        pointerDownClientY: e.clientY,
        target: element,
        tragetBoundingRect: element.getBoundingClientRect(),
      };
    }
  }, []);

  function resortBookmarks(collidingItem, draggedElementIndex) {
    const {
      coordinates,
      element,
      index: collidingElementIndex,
    } = collidingItem.collidingElement;

    const originalLeft = coordinates.left;

    const translatedLeft = element.getBoundingClientRect().left;

    const collidingElementPosition =
      collidingElementIndex < draggedElementIndex ? "before" : "after";

    const translate = Math.abs(originalLeft - translatedLeft);
    const state =
      translate === 0 ? "unmoved" : translate >= move ? "moved" : "moving";

    if (state !== "moving") {
      newDroppableArea.current = {
        collidingElementIndex,
        state,
        position: collidingElementPosition,
        action: "move",
        area: collidingItem.collidingElement.element.getBoundingClientRect(),
      };
    }

    if (state === "moved") {
      // // console.log(
      //   `${draggedElementIndex} colliding with an element that is already moved ${collidingElementIndex}`
      // );
      // // console.log(originalLeft - translatedLeft);
      // // console.log(movedElements);
      if (collidingElementPosition === "before") {
        setMovedElements((movedElements) =>
          movedElements.filter(
            (movedElement) => movedElement.index > collidingElementIndex
          )
        );
      } else {
        setMovedElements((movedElements) =>
          movedElements.filter(
            (movedElement) => movedElement.index < collidingElementIndex
          )
        );
      }
    } else if (state === "unmoved") {
      // // console.log("colliding wit an element that hasn't moved yet");
      const startIndex =
        collidingElementPosition === "before"
          ? collidingElementIndex
          : draggedElementIndex + 1;

      const endIndex =
        collidingElementPosition === "before"
          ? draggedElementIndex - 1
          : collidingElementIndex;

      let arr = [];

      for (let i = startIndex; i <= endIndex; i++) {
        const obj = {
          index: i,
          position: collidingElementPosition,
          state: "movin",
        };
        arr.push(obj);
      }

      setMovedElements(arr);
    }
  }

  function resortBookmarksAfterInsertion(collidingItem, draggedElementIndex) {
    let arr = [];

    for (
      let i = draggedElementIndex + 1;
      i < droppableContainers.current.length;
      i++
    ) {
      const obj = {
        index: i,
        position: "after",
        state: "movin",
      };
      arr.push(obj);
    }
    setVisible(false);
    setMovedElements(arr);
  }

  function checkCollisions(
    target,
    draggedElementIndex,
    droppableContainers,
    id,
    event
  ) {
    const draggedElementRect = target.getBoundingClientRect();
    let collidedWithPath = false;

    for (const droppable of pathDroppableContainers.current) {
      const targetRect = droppable.coordinates;
      const overlap = {
        width: Math.max(
          0,
          Math.min(draggedElementRect.right, targetRect.right) -
            Math.max(draggedElementRect.left, targetRect.left)
        ),
        height: Math.max(
          0,
          Math.min(draggedElementRect.bottom, targetRect.bottom) -
            Math.max(draggedElementRect.top, targetRect.top)
        ),
      };
      if (overlap.width > 0 && overlap.height > 0) {
        setScale(true);
        newDroppableArea.current = {
          action: "move-back",
          targetFolderId: droppable.id,
        };
        collidedWithPath = true;
        break;
      }
    }

    if (!collidedWithPath) {
      collisions.current = [];

      for (const droppable of droppableContainers.current) {
        if (droppable.id === id) continue;
        const targetRect = droppable.element.getBoundingClientRect();

        const overlap = {
          width: Math.max(
            0,
            Math.min(
              draggedElementRect.right,
              targetRect.right
              // tragetBoundingRect.right
            ) -
              Math.max(
                draggedElementRect.left,
                targetRect.left
                // tragetBoundingRect.left
              )
          ),
          height: Math.max(
            0,
            Math.min(
              draggedElementRect.bottom,
              targetRect.bottom
              // tragetBoundingRect.bottom
            ) -
              Math.max(
                draggedElementRect.top,
                targetRect.top
                // tragetBoundingRect.top
              )
          ),
        };
        // // console.log("overlap =>", overlap);

        // If there's any overlap, log the dimensions
        if (overlap.width > 0 && overlap.height > 0) {
          // console.clear();
          // // console.log("Overlap area:", overlap);
          collisions.current.push({
            collidingElement: droppable,
            width: overlap.width,
            height: overlap.height,
          });
        }
      }

      newPosition.current = [];
      // // console.log("droppableContainers while looping", droppableContainers);
      for (const droppable of droppableContainers.current) {
        const targetRect = droppable.coordinates;

        const overlap = {
          width: Math.max(
            0,
            Math.min(
              draggedElementRect.right,
              targetRect.right
              // tragetBoundingRect.right
            ) -
              Math.max(
                draggedElementRect.left,
                targetRect.left
                // tragetBoundingRect.left
              )
          ),
          height: Math.max(
            0,
            Math.min(
              draggedElementRect.bottom,
              targetRect.bottom
              // tragetBoundingRect.bottom
            ) -
              Math.max(
                draggedElementRect.top,
                targetRect.top
                // tragetBoundingRect.top
              )
          ),
        };
        // // console.log("overlap =>", overlap);
        if (overlap.width > 0 && overlap.height > 0) {
          newPosition.current.push(droppable);
        }
      }

      if (collisions.current.length === 0 && !newPosition.current.length) {
        isMoveElementsAnimated.current = true;

        setScale(false);

        // console.log(newDroppableArea.current);
      } else if (
        collisions.current.length === 0 &&
        newPosition.current.length
      ) {
        // console.log("zero collisions and one newPosition");
        const collidingItem =
          newPosition.current[newPosition.current.length - 1];

        // console.log("collidingItem", collidingItem);
        newDroppableArea.current = {
          state: "unmoved",
          position: "after",
          collidingElementIndex: collidingItem.index,
          action: "move",
          area: collidingItem.coordinates,
        };
        // console.log("newDroppableArea", newDroppableArea.current);
        setScale(false);
      } else if (collisions.current.length > 0) {
        const collidingItem = collisions.current[collisions.current.length - 1];

        isMoveElementsAnimated.current = true;
        if (collidingItem.collidingElement.type === "bookmark") {
          setScale(false);
          const returnedValue = resortBookmarks(
            collidingItem,
            draggedElementIndex
          );
        } else {
          // console.log("area");

          const { width, height } = collidingItem;

          // console.log(width, height);

          if (width > 24 && height > 24) {
            // console.log("insert");

            newDroppableArea.current = {
              action: "insert",
              draggedElementIndex,
              collidingElementId: collidingItem.collidingElement.id,
            };
            // console.log("newDroppableArea", newDroppableArea.current);
            setScale(true);
          } else {
            // console.log("move");

            setScale(false);

            const returnedValue = resortBookmarks(
              collidingItem,
              draggedElementIndex
            );
          }
        }
      } else {
        setScale(false);
      }

      // console.log(newDroppableArea.current);
    }
  }

  const debouncedCheckCollisions = useMemo(() => {
    return debounce(checkCollisions, 150);
  }, []);

  const atTop = useRef(false);
  const atBottom = useRef(false);

  function scrollContainer(pixelsToScroll) {
    const element = scrollableContainer.current;
    element.scrollBy(0, pixelsToScroll);
    // // console.log(element.scrollTopMax);
    // console.log("here are the values");
    // // console.log(element.scrollTop);
    // // console.log(element.clientHeight);
    // // console.log(element.scrollHeight);
    atTop.current = element.scrollTop === 0;
    atBottom.current =
      element.scrollTop + element.clientHeight === element.scrollHeight;

    const { draggedElementIndex, id, target } = pointerDownInfo.current;
    if (atTop.current) {
      window.clearInterval(intervalId.current);
      // checkCollisions(target, draggedElementIndex, droppableContainers, id);
    }
    if (atBottom.current) {
      window.clearInterval(intervalId.current);
      // checkCollisions(target, draggedElementIndex, droppableContainers, id);
    }
  }

  function handleScrollDown() {
    // // console.log("handleScrollDown");

    // // console.log("we're scrolling, bud");
    scrollContainer(5);

    const id = setInterval(() => {
      // // console.log("we're scrolling..");
      scrollContainer(5);
    }, 12);
    intervalId.current = id;
    // // console.log("interval id just set", intervalId.current);
  }

  function handleScrollUp() {
    // // console.log("handleScrollUp");
    scrollContainer(-5);
    const id = setInterval(() => {
      // // console.log("we're scrolling..");
      scrollContainer(-5);
    }, 12);
    intervalId.current = id;
    // // console.log("interval id just set", intervalId.current);
  }

  const stoppedScrollingDown = useRef(false);

  function handlePointerMove(e) {
    if (pointerDownInfo.current?.pointerDownClientX) {
      // // console.log("pointermove event fired white the pointer is down");
      const {
        draggedElementIndex,
        id,
        target,
        pointerDownClientX,
        pointerDownClientY,
        tragetBoundingRect,
      } = pointerDownInfo.current;
      // // console.log("pointermve");
      const pointerMoveClientX = e.clientX;
      const pointerMoveClientY = e.clientY;
      // // console.log("scrollTop value while dragging", scrollTop);
      const deltaX = pointerMoveClientX - pointerDownClientX;
      const deltaY = pointerMoveClientY - pointerDownClientY - scrollTop;

      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        setDelta({ deltaX, deltaY });

        const targetParentRect = target.parentElement.getBoundingClientRect();
        const gridRect = scrollableContainer.current.getBoundingClientRect();
        // // // console.log(targetParentRect);
        // // // console.log(gridRect);
        const isScrollingDown = targetParentRect.bottom > gridRect.bottom + 48;
        const isScrollingUp = targetParentRect.bottom < gridRect.top - 40;
        // // console.log("scrollDown value", scrollDown.current);

        // // console.log("interval id to be cleared", intervalId.current);

        window.clearInterval(intervalId.current);

        if (isScrollingDown || isScrollingUp) {
          // console.log("scrolling detected");
          // console.log("atTop", atTop.current);
          // console.log("atBottom", atBottom.current);
        }

        if (isScrollingDown && !atBottom.current) {
          allowUpdatingScrollTopAfterScroll.current = false;
          window.clearTimeout(timeoutId.current);
          handleScrollDown();
        } else if (isScrollingUp && !atTop.current) {
          allowUpdatingScrollTopAfterScroll.current = false;
          window.clearTimeout(timeoutId.current);
          handleScrollUp();
        } else {
          // console.log("no scrolling detected");

          const targetBoundingRect = target.getBoundingClientRect();

          // console.log("targetBoundingRect.top", targetBoundingRect.bottom);
          // console.log("gridRect.top", gridRect.top - 40);

          // console.log(
          //   "should checkCollisions?",
          //   targetBoundingRect.bottom > gridRect.top - 40
          // );

          const isTargetInsideScrollableContainerY =
            targetBoundingRect.bottom > gridRect.top - 40 &&
            targetBoundingRect.bottom < gridRect.bottom + 48;
          // const isTargetInsideScrollableContainerX =
          //   targetBoundingRect.left > scrollableContainerBoundingRect.left &&
          //   targetBoundingRect.right < scrollableContainerBoundingRect.right;

          // // console.log(
          //   isTargetInsideScrollableContainerY,
          //   isTargetInsideScrollableContainerX
          // );

          if (
            isTargetInsideScrollableContainerY
            // && isTargetInsideScrollableContainerX
          ) {
            // console.log("we're inside the scrollable container");
            timeoutId.current = debouncedCheckCollisions(
              target,
              draggedElementIndex,
              droppableContainers,
              id,
              "pointer-move"
            );
          } else {
            // console.log("we're outside the scrollable container");
            // setScale
            window.clearTimeout(timeoutId.current);
          }
        }
      }
    }
  }

  function handlePointerUp(e) {
    // console.clear();
    // // console.log("pointer up");
    if (pointerDownInfo.current) {
      window.clearInterval(intervalId.current);
      allowUpdatingScrollTopAfterScroll.current = true;
      // console.log("scrollTop new value", scrollableContainer.current.scrollTop);
      setScrollTop(scrollableContainer.current.scrollTop);
      atTop.current = false;
      atBottom.current = false;
      const {
        tragetBoundingRect: draggedItemOriginalCoordinates,
        target,
        draggedElementIndex,
        id,
        parentId,
      } = pointerDownInfo.current;

      // // console.log(parentId);

      pointerDownInfo.current = { id };
      // // console.log(timeoutId.current);
      window.clearTimeout(timeoutId.current);

      // // console.log(newDroppableArea.current);

      if (newDroppableArea.current) {
        const {
          action,
          state,
          position,
          area: collidingItemCurrentCoordinates,
          collidingElementIndex,
          collidingElementId,
        } = newDroppableArea.current;
        // console.log(newDroppableArea.current);
        if (action === "move") {
          // console.log(draggedItemOriginalCoordinates.y);
          // console.log(collidingItemCurrentCoordinates.y);
          // console.log(scrollTop);
          newDroppableArea.current = null;
          const deltaX =
            draggedItemOriginalCoordinates.x -
            collidingItemCurrentCoordinates.x;
          const deltaY =
            draggedItemOriginalCoordinates.y -
            collidingItemCurrentCoordinates.y +
            scrollTop;
          // console.log(deltaX, deltaY);

          // console.log(
          //   draggedItemOriginalCoordinates,
          //   collidingItemCurrentCoordinates
          // );

          // console.log("deltaY", -deltaY);

          setDelta({ deltaX: -deltaX, deltaY: -deltaY, transition: true });

          setTimeout(() => {
            isMoveElementsAnimated.current = false;
            pointerDownInfo.current = null;
            setDelta({});

            const newIndex =
              position === "before"
                ? state === "unmoved"
                  ? collidingElementIndex
                  : collidingElementIndex + 1
                : state === "unmoved"
                ? collidingElementIndex
                : collidingElementIndex - 1;
            setCurrentFolder((bookmarks) =>
              arrayMove(bookmarks, draggedElementIndex, newIndex)
            );
            setMovedElements([]);

            // console.log(draggedElementIndex > newIndex);
            chrome.bookmarks.move(id, {
              // https://stackoverflow.com/questions/13264060/chrome-bookmarks-api-using-move-to-reorder-bookmarks-in-the-same-folder
              index: draggedElementIndex > newIndex ? newIndex : newIndex + 1,
            });
          }, 300);
        } else if (action === "insert") {
          newDroppableArea.current = null;
          resortBookmarksAfterInsertion("", draggedElementIndex);
          setTimeout(() => {
            setVisible(true);
            setScale(false);
            isMoveElementsAnimated.current = false;
            pointerDownInfo.current = null;
            setDelta({});
            const oldParentId = parentId;
            const newParentId = collidingElementId;
            const oldIndex = draggedElementIndex;

            setCurrentFolder((bookmarks) => {
              return bookmarks
                .map((bookmark) =>
                  bookmark.id === newParentId
                    ? {
                        ...bookmark,
                        children: [...bookmark.children, bookmarks[oldIndex]],
                      }
                    : bookmark
                )
                .filter((bookmark) => bookmark.id !== id);
            });
            setMovedElements([]);
            chrome.bookmarks.move(id, {
              parentId: collidingElementId,
            });
          }, 300);
        } else if (action === "move-back") {
          const targetFolderId = newDroppableArea.current.targetFolderId;

          newDroppableArea.current = null;
          setScale(false);
          setVisible(false);

          setTimeout(() => {
            setVisible(true);
            isMoveElementsAnimated.current = false;
            pointerDownInfo.current = null;
            setDelta({});
            setCurrentFolder((bookmarks) =>
              bookmarks.filter((bookmark) => bookmark.id !== id)
            );
            setMovedElements([]);
            chrome.bookmarks.move(id, {
              parentId: targetFolderId === "Home" ? "1" : targetFolderId,
            });
            // update the view to target folder
            // const targetIdForView =
            //   targetFolderId === "Home" ? "1" : targetFolderId;
            // chrome.bookmarks.getSubTree(targetIdForView, (subTree) => {
            //   setCurrentFolder(subTree[0].children || []);
            // });
            // const idx = folderPath.findIndex((f) => f.id === targetFolderId);
            // if (idx !== -1) setFolderPath(folderPath.slice(0, idx + 1));
          }, 300);
        }
      } else {
        // console.log("null");
        // pointerDownInfo.current = null;
        // setDelta({});
        setDelta({ deltaX: 0, deltaY: -scrollTop, transition: true });
        setTimeout(() => {
          pointerDownInfo.current = null;
          setDelta({});
        }, 300);
      }
    }
  }

  const checkGridColumnNumber = useMemo(
    () =>
      debounce(function () {
        // console.log(
        //   Math.floor((listGrid.current.clientWidth - bookmarkWidth) / move + 1)
        // );
        setGridColumnNumber(
          Math.floor((listGrid.current.clientWidth - bookmarkWidth) / move + 1)
        );

        // console.log("grid column number resize");
        setScrollTop(scrollableContainer.current.scrollTop);
        // console.log("grid column number2", gridColumnNumber);
      }, 200),
    []
  );

  // grid column number
  useEffect(function () {
    // console.log(
    //   Math.floor((listGrid.current.clientWidth - bookmarkWidth) / move + 1)
    // );

    setGridColumnNumber(
      Math.floor((listGrid.current.clientWidth - bookmarkWidth) / move + 1)
    );

    // console.log("grid column number1", gridColumnNumber);
    window.addEventListener("resize", function () {
      checkGridColumnNumber();
    });
  }, []);

  const getDroppableContainers = useCallback(function () {
    droppableContainers.current = [];
    const droppables = document.querySelectorAll(`[data-droppable="true"]`);

    for (let index = 0; index < droppables.length; index++) {
      const element = droppables[index];
      droppableContainers.current.push({
        element,
        type: element.localName === "img" ? "bookmark" : "folder",
        parentElement: element.parentElement,
        index,
        id: element.closest("li").id,
        coordinates: element.getBoundingClientRect(),
        parentElementCoordinates: element.parentElement.getBoundingClientRect(),
      });
    }
  });

  // get droppable containers.
  useEffect(
    function () {
      // console.log("getDroppableContainers effect is executed");
      getDroppableContainers();
      return () => {
        droppableContainers.current = [];
      };
    },
    [currentFolder, gridColumnNumber, scrollTop]
  );

  // get paths dom nodes
  useEffect(
    function () {
      const pathDroppables = document.querySelectorAll(
        `[data-path-droppable="true"]`
      );
      const arr = [];
      for (let index = 0; index < pathDroppables.length; index++) {
        const element = pathDroppables[index];
        arr.push({
          element,
          id: element.id,
          coordinates: element.getBoundingClientRect(),
        });
      }
      pathDroppableContainers.current = arr;
    },
    [folderPath]
  );

  // scroll to top on folder and breadcrumb navigation.
  useEffect(
    function () {
      // every time you open a folder, the scroll degree from the past folder persist in the browser, this isn't just useless in our case but rather causes issues for no reason.
      // setTimeout(() => {
      // scrollableContainer.current.scrollTo(0, 0);
      // }, 400);
      // this method triggers a scrollEnd event on the scrollableContainer, which resets scrollTop ref value to 0,
      // we need this reset because if you moved from a scrolled folder (folder that can be scrolled and has a scrollTop value greater than 0) to a non-scrollale folder (folder that doesn't have an overflow), the scrollTop value from the scrolled folder will persist and if you tried to drag an item, it will use the scrollTop value in its delta state, resulting in the item being move a wrong position.
    },
    [folderPath]
  );

  return (
    <div onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <BackgroundImageWrapper>
        <DateTimeDisplay />
        <BreadCrumb
          path={folderPath}
          onNavigate={handleBreadcrumbNav}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          onOpenFolderResult={handleSearchFolderOpen}
          scrollableContainer={scrollableContainer}
        />
        <Bookmarks
          atTop={atTop}
          atBottom={atBottom}
          stoppedScrollingDown={stoppedScrollingDown}
          getDroppableContainers={getDroppableContainers}
          allowUpdatingScrollTopAfterScroll={allowUpdatingScrollTopAfterScroll}
          scrollableContainer={scrollableContainer}
          setScrollTop={setScrollTop}
          listGrid={listGrid}
          bookmarkWidth={bookmarkWidth}
          isProgrammaticScroll={isProgrammaticScroll}
        >
          {currentFolder.map((item, index) => {
            const movedEl = movedElements.find(
              (movedElement) => movedElement.index === index
            );
            // // console.log(movedEl);
            // if (movedEl?.index) // console.log(movedEl?.index);
            // // console.log(pointerDownInfo.current);
            // // console.log(movedEl?.index > pointerDownInfo.current?.index);
            return (
              <BookmarkItem
                scrollableContainer={scrollableContainer}
                move={move}
                bookmarkWidth={bookmarkWidth}
                key={item.id}
                id={item.id}
                title={item.title}
                item={item}
                index={index}
                isLastItem={index + 1 === currentFolder.length}
                onFolderClick={handleFolderNavigation}
                setCurrentFolder={setCurrentFolder}
                gridColumnNumber={gridColumnNumber}
                handlePointerDown={handlePointerDown}
                delta={pointerDownInfo.current?.id === item.id ? delta : null}
                scale={pointerDownInfo.current?.id === item.id ? scale : false}
                visible={
                  pointerDownInfo.current?.id === item.id ? visible : true
                }
                moveBackward={movedEl?.position === "after"}
                moveForward={movedEl?.position === "before"}
                isMoveElementsAnimated={isMoveElementsAnimated.current}
              />
            );
          })}
        </Bookmarks>
        {/* {delta.deltaX && (
          <DraggedBookmarkClone pointerDownInfo={pointerDownInfo} />
        )} */}
      </BackgroundImageWrapper>
    </div>
  );
}
