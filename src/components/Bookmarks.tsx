// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from "react";
import BookmarkItem from "./BookmarkItem";
import { debounce } from "@/utils/debounce";
import "./Bookmarks.css";

export default function Bookmarks({
  stoppedScrollingDown,
  getDroppableContainers,
  allowUpdatingScrollTopAfterScroll,
  scrollableContainer,
  atTop,
  atBottom,
  setScrollTop,
  listGrid,
  bookmarkWidth,
  isProgrammaticScroll,
  children,
}) {
  function callback(e) {
    getDroppableContainers();

    if (allowUpdatingScrollTopAfterScroll.current) {
      const scrollTop = scrollableContainer.current.scrollTop;
      console.log("scrollTop new value", scrollTop);
      atTop.current = scrollTop === 0;
      atBottom.current =
        scrollTop + scrollableContainer.current.clientHeight ===
        scrollableContainer.current.scrollHeight;

      setScrollTop(scrollTop);
    }
  }

  const debouncedScrollEnd = debounce(callback, 1500);
  return (
    <div
      ref={scrollableContainer}
      className="*:font-fira bookmarks-grid w-full h-[415px]  mt-4 mx-[50px] max-w-[560px] overflow-y-auto custom-scrollbar sm:mx-auto "
      style={{
        overflowAnchor: "none",
        width: "stretch",
        viewTransitionName: "folder-view",
      }}
      onScrollEnd={(e) => {
        callback();
      }}
    >
      <ul
        className={`bookmarks-grid-container grid justify-center grid-cols-[repeat(auto-fill,${bookmarkWidth}px)] gap-[16px] mx-4 select-none`}
        ref={listGrid}
        style={{ gridTemplateColumns: `repeat(auto-fill, ${bookmarkWidth}px)` }}
      >
        {children}
      </ul>
    </div>
  );
}
