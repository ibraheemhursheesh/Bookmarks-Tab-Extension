// @ts-nocheck
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment, useMemo, useState } from "react";
import BookmarksActions from "./BookmarksActions";
import { debounce } from "@/utils/debounce";
import { SquareArrowOutUpRight } from "lucide-react";

interface BreadcrumbProps {
  path: Array<{ id: string; title: string }>;
  onNavigate: (folderId: string) => void;
  currentFolder: any[];
  setCurrentFolder: (folder: any[] | ((prev: any[]) => any[])) => void;
  scrollableContainer: React.RefObject<HTMLDivElement>;
}

export default function BreadCrumb({
  path,
  onNavigate,
  currentFolder,
  setCurrentFolder,
  scrollableContainer,
}: BreadcrumbProps) {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const runSearch = useMemo(
    () =>
      debounce(async (query) => {
        try {
          const results = await chrome.bookmarks.search({ query });
          const normalizedQuery = String(query || "").toLowerCase();
          const filtered = (results || []).filter(
            (node) =>
              !!node.url &&
              String(node.title || "")
                .toLowerCase()
                .includes(normalizedQuery)
          );
          setSearchResults(filtered);
        } catch (error) {
          setSearchResults([]);
        }
      }, 300),
    []
  );

  function handleSearch(e) {
    const value = e?.target?.value || "";
    setSearchQuery(value);
    if (value.length < 3) {
      // setSearchResults([]);
      return;
    }
    runSearch(value);
  }

  return (
    <div
      style={{ width: "stretch" }}
      className={`max-w-[576px] mx-[50px] md:mx-auto w-full flex items-center`}
    >
      {path.length === 1 ? (
        <div className="h-[19.28px]"></div>
      ) : (
        <Breadcrumb className="mx-9">
          <BreadcrumbList className="text-white ">
            {path.map((folder, index) => (
              <Fragment key={folder.id}>
                <BreadcrumbItem id={folder.id} data-path-droppable="true">
                  <BreadcrumbLink
                    className="cursor-pointer relative text-[13.5px] rounded-xs transition-colors duration-150  hover:bg-black/20 outline-2 px-1 outline-transparent hover:outline-black/20 after:absolute after:-inset-2"
                    onClick={() => onNavigate(folder.id)}
                  >
                    {folder.title === "" ? "_" : folder.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>{" "}
                {index < path.length - 1 && (
                  <BreadcrumbSeparator className="" />
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <dialog
        style={{ height: "stretch", width: "stretch" }}
        className=" mx-[25px] xs:mx-auto mt-[199px] mb-5 bg-white  max-w-[550px] rounded-lg opacity-0 scale-95 transition-discrete backdrop:hidden starting:open:opacity-0 starting:open:scale-95 transition-all duration-300 open:opacity-100 open:scale-100"
        id="searchResultDialog"
        closedby="any"
        onClose={() => {
          setSearchQuery("");
          setSearchResults([]);
        }}
      >
        {/* <div className=""> */}
        <div className="flex items-center gap-2 border-b-2 border-stone-500 mr-5 ml-7 mt-3 pb-1">
          <input
            className="flex-1 ml-1 text-black text-base border-none outline-none [&::-webkit-search-cancel-button]:hidden min-w-0"
            type="search"
            name=""
            id=""
            value={searchQuery}
            onChange={handleSearch}
          />
          <button onClick={() => setSearchQuery("")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="cursor-pointer"
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
          </button>
        </div>
        {searchQuery.length < 3 ? (
          <div className="h-[calc(100%-42px)] flex items-center justify-center text-base font-medium text-gray-800 italic text-center">
            Search through all of your bookmarks
          </div>
        ) : searchResults?.length > 0 ? (
          <ul
            style={{
              height: "calc(100% - 74px)",
              scrollbarWidth: "thin",
              scrollbarColor: "#333 #fff",
            }}
            className="m-3 h-[calc(100%-74px)] flex flex-col overflow-y-auto mr-3 ml-7"
          >
            {searchResults.map((node) => (
              <li
                key={node.id}
                className="cursor-pointer  border-b border-gray-200 mr-2 py-1"
              >
                <a
                  href={node.url}
                  // target="_blank"
                  // rel="noreferrer"
                  className="flex items-center gap-3 text-black hover:bg-gray-100 rounded-md py-1 px-2"
                >
                  <img
                    src={`https://www.faviconextractor.com/favicon/${
                      new URL(node.url).hostname
                    }?larger=true`}
                    alt="favicon"
                    className="size-7"
                  />
                  <span className="text-sm  whitespace-nowrap overflow-hidden overflow-ellipsis flex-1">
                    {node.title}
                  </span>
                  <SquareArrowOutUpRight size={16} />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-[calc(100%-42px)] flex flex-col gap-5 items-center justify-center text-base text-gray-800 italic text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="75"
              height="75"
              viewBox="0 0 24 24"
              fill="none"
              className="stroke-gray-800"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M 14 4 L 15 7 L 11 9 L 12 11 L 10 12" />
              <path d="m17 17 L 23 23" data--h-bstatus="0OBSERVED" />
              <circle cx="11" cy="11" r="8" data--h-bstatus="0OBSERVED" />
            </svg>
            <p className="font-medium">Could not find any bookmarks!</p>
          </div>
        )}
        {/* </div> */}
      </dialog>

      <BookmarksActions
        currentFolder={currentFolder}
        setCurrentFolder={setCurrentFolder}
        folderPath={path}
        scrollableContainer={scrollableContainer}
      />
    </div>
  );
}
