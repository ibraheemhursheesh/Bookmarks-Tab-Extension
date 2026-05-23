import { useCallback, useEffect, useRef, useState } from "react";

function getBookmarksBarChildren(bookmarkTreeNodes) {
  return bookmarkTreeNodes?.[0]?.children?.[0]?.children || [];
}

export function useBookmarks(activeFolderId = "1", enabled = true) {
  const [bookmarks, setBookmarks] = useState([]);
  const allBookmarks = useRef([]);
  const activeFolderIdRef = useRef(activeFolderId);
  const refreshTimeoutRef = useRef(null);

  const loadFolder = useCallback((folderId, options = {}) => {
    if (folderId === "1") {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const bookmarksBar = getBookmarksBarChildren(bookmarkTreeNodes);
        const nextBookmarks = bookmarksBar.map((bookmark) =>
          bookmark.id === options.newlyCreatedId
            ? { ...bookmark, isNewlyCreated: true }
            : bookmark
        );
        setBookmarks(nextBookmarks);
        allBookmarks.current = bookmarksBar;
      });
      return;
    }

    chrome.bookmarks.getSubTree(folderId, (subTree) => {
      if (chrome.runtime.lastError || !subTree?.[0]) {
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
          const bookmarksBar = getBookmarksBarChildren(bookmarkTreeNodes);
          setBookmarks(bookmarksBar);
          allBookmarks.current = bookmarksBar;
        });
        return;
      }

      const nextBookmarks = (subTree[0].children || []).map((bookmark) =>
        bookmark.id === options.newlyCreatedId
          ? { ...bookmark, isNewlyCreated: true }
          : bookmark
      );
      setBookmarks(nextBookmarks);
    });
  }, []);

  const refreshCurrentFolder = useCallback(
    (options = {}) => {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = window.setTimeout(() => {
        loadFolder(activeFolderIdRef.current, options);
      }, 50);
    },
    [loadFolder]
  );

  useEffect(
    function () {
      if (!enabled) return;

      activeFolderIdRef.current = activeFolderId;
      loadFolder(activeFolderId);
    },
    [activeFolderId, enabled, loadFolder]
  );

  useEffect(
    function () {
      if (!enabled) return;

      const handleCreated = (id, node) => {
        refreshCurrentFolder({
          newlyCreatedId:
            node.parentId === activeFolderIdRef.current && node.title === ""
              ? id
              : null,
        });
      };
      const handleChanged = () => refreshCurrentFolder();
      const handleRemoved = () => refreshCurrentFolder();
      const handleMoved = () => refreshCurrentFolder();
      const handleChildrenReordered = () => refreshCurrentFolder();

      chrome.bookmarks.onCreated.addListener(handleCreated);
      chrome.bookmarks.onChanged.addListener(handleChanged);
      chrome.bookmarks.onRemoved.addListener(handleRemoved);
      chrome.bookmarks.onMoved.addListener(handleMoved);
      chrome.bookmarks.onChildrenReordered.addListener(handleChildrenReordered);

      return () => {
        window.clearTimeout(refreshTimeoutRef.current);
        chrome.bookmarks.onCreated.removeListener(handleCreated);
        chrome.bookmarks.onChanged.removeListener(handleChanged);
        chrome.bookmarks.onRemoved.removeListener(handleRemoved);
        chrome.bookmarks.onMoved.removeListener(handleMoved);
        chrome.bookmarks.onChildrenReordered.removeListener(
          handleChildrenReordered
        );
      };
    },
    [enabled, refreshCurrentFolder]
  );

  return [bookmarks, setBookmarks, allBookmarks.current];
}
