import { useEffect, useRef, useState } from "react";

import { arrayMove } from "../utils/arrayMove";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const allBookmarks = useRef([]);

  useEffect(function () {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const bookmarksBar = bookmarkTreeNodes[0].children[0].children;
      setBookmarks(bookmarksBar);
      allBookmarks.current = bookmarksBar;
    });

    chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
      const { title, url } = changeInfo;
      setBookmarks((prevBookmarks) => {
        return prevBookmarks.map((bookmark) =>
          bookmark.id === id ? { ...bookmark, title, url } : bookmark
        );
      });
    });

    chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
      setBookmarks((prevBookmarks) =>
        prevBookmarks.filter((bookmark) => bookmark.id !== id)
      );
    });

    chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
      const { index, oldIndex, parentId, oldParentId } = moveInfo;
      if (parentId === oldParentId) {
        // setBookmarks((bookmarks) => arrayMove(bookmarks, oldIndex, index));
      } else {
        // setBookmarks((bookmarks) => {
        //   return bookmarks
        //     .map((bookmark) =>
        //       bookmark.id === parentId
        //         ? {
        //             ...bookmark,
        //             children: [...bookmark.children, bookmarks[oldIndex]],
        //           }
        //         : bookmark
        //     )
        //     .filter((bookmark) => bookmark.id !== id);
        // });
      }
    });

    return () => {
      chrome.bookmarks.onChanged.removeListener();
      chrome.bookmarks.onRemoved.removeListener();
      chrome.bookmarks.onMoved.removeListener();
    };
  }, []);

  return [bookmarks, setBookmarks, allBookmarks.current];
}
