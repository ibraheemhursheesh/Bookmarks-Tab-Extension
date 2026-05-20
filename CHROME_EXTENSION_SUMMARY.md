# Chrome Extension Summary

## What It Does

**Bookmarks Tab** is a Chrome Manifest V3 extension that replaces Chrome's new tab page with a visual bookmark dashboard. Instead of using Chrome's default bookmarks UI, it reads the user's bookmarks bar and presents it as a centered grid over a customizable background image, with date/time display, folder navigation, search, editing tools, and drag-and-drop organization.

The extension is configured in `manifest.config.ts` with:

- `chrome_url_overrides.newtab`: points the new tab page to `src/index.html`
- Permissions: `bookmarks`, `storage`, and `unlimitedStorage`
- Icons: `icon48.png` and `icon128.png`

## Main User Features

### New Tab Bookmark Dashboard

When a new tab opens, `src/main.tsx` renders `App`, which loads bookmark data through `useBookmarks`.

The first view shows the Chrome bookmarks bar contents as a grid:

- Bookmark nodes render as favicon tiles with truncated titles.
- Folder nodes render as custom folder icons with truncated titles.
- The grid is scrollable and uses a custom scrollbar.
- The UI sits over a full-window background image.
- A clock and date display appear above the bookmark grid.

The app treats the Chrome bookmarks bar as the home/root folder by reading:

```js
bookmarkTreeNodes[0].children[0].children
```

Navigation back to home maps to Chrome bookmark folder id `"1"`.

### Folder Navigation And Breadcrumbs

Folders can be opened from the grid. The app updates `currentFolder` to the clicked folder's children and appends the folder to `folderPath`.

The breadcrumb component lets the user jump back to any folder in the current path. It uses `chrome.bookmarks.getSubTree` to reload that folder's children.

Where supported, the app wraps folder changes in `document.startViewTransition` for animated folder transitions. `src/components/Bookmarks.css` defines the fade-in and fade-out view transition animations.

### Bookmark Search

The breadcrumb/action area includes a search button that opens a modal dialog.

Search behavior:

- Starts after the user enters at least 3 characters.
- Uses `chrome.bookmarks.search({ query })`.
- Filters results to URL bookmarks only.
- Further filters by title match.
- Shows favicon, title, and an external/open icon for each result.
- Clicking a result navigates to the bookmark URL.

### Create Folder

`BookmarksActions` includes a folder-plus action.

When clicked:

- It determines the current folder id from `folderPath`.
- It calls `chrome.bookmarks.create`.
- It appends the new folder to local UI state.
- The new folder is marked with `isNewlyCreated: true`, which causes `Folder` to enter rename mode immediately.

### Rename Bookmarks And Folders

Right-clicking a bookmark or folder opens a context menu. The Rename action makes the title text editable with `contentEditable`.

Rename behavior:

- `Enter`: saves the new title with `chrome.bookmarks.update`.
- Blur/click outside: saves the new title.
- `Escape`: exits editing without saving.
- Empty titles are allowed.
- Works for both bookmarks and folders.

### Edit Bookmark Details

Bookmarks, but not folders, get an Edit action in the context menu.

The edit dialog allows changing:

- Bookmark title
- Bookmark URL
- Bookmark favicon

Saving calls `chrome.bookmarks.update` with the new title and URL.

The favicon editor supports:

- Showing a favicon based on the current URL.
- Uploading a custom image file under 1.5 MB.
- Previewing the uploaded image.
- Resetting back to the URL-derived favicon.

Custom favicons are stored in `chrome.storage.local` under the bookmark id:

```js
{
  [bookmarkId]: {
    uploadedFavIconFile: "data:image/..."
  }
}
```

`useFaviconUrl` listens to `chrome.storage.onChanged` so favicon changes update the UI reactively.

### Delete Bookmarks And Folders

The Delete context menu action calls:

```js
chrome.bookmarks.removeTree(id)
```

Because it uses `removeTree`, deleting a folder also deletes its children.

### Move Dialog

The Move context menu action opens a folder tree dialog.

The dialog:

- Loads the full Chrome bookmarks tree with `chrome.bookmarks.getTree`.
- Displays only folders, not URL bookmarks.
- Supports expanding and collapsing nested folders.
- Lets the user pick a target folder.
- Calls `chrome.bookmarks.move(id, { parentId: targetFolderId })`.

### Drag And Drop Organization

The app implements custom pointer-based drag and drop in `App.tsx`.

Supported drag behaviors:

- Reorder bookmarks and folders within the current folder.
- Drag an item over a folder to move it into that folder.
- Drag an item over a breadcrumb path item to move it back to an ancestor folder.
- Auto-scroll the bookmark grid while dragging near the top or bottom.
- Animate displaced grid items while dragging.

The drag system measures DOM elements marked with:

- `data-droppable="true"` for bookmark and folder tiles
- `data-path-droppable="true"` for breadcrumb folders

On pointer release, the app decides between these actions:

- `move`: reorder inside the current folder
- `insert`: move into another folder
- `move-back`: move into a folder from the breadcrumb path

Bookmark order changes are persisted with `chrome.bookmarks.move`. Same-folder reorders adjust the target index to match Chrome's bookmark move semantics.

### Background Customization

The bottom footer includes a background image button that opens a carousel dialog.

Background options:

- Built-in images from `public/background*.jpg` and `public/background1.jpeg`
- User-uploaded images

Uploaded image behavior:

- Uses `image-blob-reduce` to resize/compress images.
- Stores a smaller preview and a larger background image.
- Keeps at most 5 uploaded images.
- Stores uploaded images in `chrome.storage.local` under `uploadedImages`.
- Stores the currently selected background in `localStorage` under `backgroundImage`.

If a selected uploaded image is deleted, the app switches to the next uploaded image or falls back to the first built-in background.

### Info/About Dialog

The footer also has an info button. It opens a dialog with author/contact information and social links.

## Architecture Overview

### Entry And Build

- `src/index.html`: new tab HTML shell
- `src/main.tsx`: React root render
- `src/App.tsx`: main application state, bookmark navigation, drag-and-drop orchestration
- `manifest.config.ts`: Chrome extension manifest definition
- `vite.config.ts`: Vite, React, Tailwind, CRXJS, and zip packaging

Production build:

```bash
npm run build
```

The build emits the extension into `dist/` and creates a zip package in `release/`.

### Key Components

- `BackgroundImageWrapper`: full-page background, background persistence, settings footer
- `DateTimeDisplay`: live clock/date display
- `Breadcrumb`: folder path navigation and search dialog
- `BookmarksActions`: create-folder and search buttons
- `Bookmarks`: scrollable grid container
- `BookmarkItem`: decides whether a node renders as `Bookmark` or `Folder`
- `Bookmark`: bookmark tile, favicon, rename behavior, context menu
- `Folder`: folder tile, navigation, rename behavior, context menu
- `ContextMenu`: shared right-click menu for rename, edit, move, delete
- `EditBookmark`: bookmark edit dialog
- `FaviconEditor`: custom favicon upload/reset UI
- `MoveBookmarkDialog`: folder tree picker for moving bookmarks
- `CarouselDialog`: background picker and uploaded-image manager
- `SettingsIcons` / `SettingsFooter`: footer controls
- `InfoDialog`: about/contact modal

### Hooks And Utilities

- `useBookmarks`: loads the bookmarks bar and listens for bookmark changes/removals
- `useChromeStorage`: React state wrapper around `chrome.storage.local`
- `useUploadedImages`: manages uploaded background images with a 5-image cap
- `useLocalStorage`: React state wrapper around browser `localStorage`
- `useFaviconUrl`: resolves custom favicon data from Chrome storage
- `useCurrentFavIconUrl`: local favicon preview state
- `debounce`: simple timeout-based debouncer
- `arrayMove`: immutable array reorder helper
- `cn`: Tailwind class merge helper

## Data Storage

### Chrome Bookmarks API

Used for the real bookmark source of truth:

- Load bookmarks: `chrome.bookmarks.getTree`
- Load a folder: `chrome.bookmarks.getSubTree`
- Search bookmarks: `chrome.bookmarks.search`
- Create folders: `chrome.bookmarks.create`
- Rename/edit: `chrome.bookmarks.update`
- Move/reorder: `chrome.bookmarks.move`
- Delete: `chrome.bookmarks.removeTree`

### Chrome Storage

Used for extension-specific user customization:

- Uploaded background images: `uploadedImages`
- Custom favicon data: one key per bookmark id

### Local Storage

Used for the selected background image:

- Key: `backgroundImage`
- Value: either a built-in filename or a data URL

## Tech Stack

- React 19
- TypeScript
- Vite 7
- CRXJS Vite plugin
- Chrome Manifest V3
- Tailwind CSS 4
- shadcn-style UI primitives
- Radix Slot/Label
- Lucide icons
- Embla Carousel
- image-blob-reduce

## Implementation Notes

- Many source files use `// @ts-nocheck`, so TypeScript is not enforcing much of the app-level component code.
- The code includes some stale imports that are currently unused and tree-shaken in the production build:
  - `DraggedBookmarkClone` in `App.tsx`
  - `DeleteBookmark` and `ContextMenu.module.css` in `ContextMenu.tsx`
  - `it` from `node:test` in `Bookmark.tsx`
- `useBookmarks` registers Chrome bookmark listeners, but its cleanup calls `removeListener()` without passing the original listener functions. That means listener cleanup is likely ineffective if the hook is ever unmounted/remounted.
- The app relies on some modern browser features such as the Popover API, dialog elements, CSS anchor positioning, `scrollend`, and View Transitions. Chrome extension/new-tab usage makes that reasonable, but these APIs are worth remembering if browser support becomes a concern.
- Bookmark favicons are fetched through `https://www.faviconextractor.com/favicon/...` unless a custom favicon is stored locally.
- A production build was verified with `npm run build` and completed successfully.
