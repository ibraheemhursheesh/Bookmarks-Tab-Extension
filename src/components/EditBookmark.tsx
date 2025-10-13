// @ts-nocheck
import { debounce } from "../utils/debounce";
import { useCurrentFavIconUrl } from "../hooks/useCurrentFavIconUrl";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useRef, useState } from "react";
import FaviconEditor from "./FaviconEditor";
export default function EditBookmark({
  setIsHidden,
  faviconUrl,
  editDialogRef,
  item,
  id,
}) {
  const [currentFavIconUrl, setCurrentFavIconUrl] =
    useCurrentFavIconUrl(faviconUrl);

  // when the user uploaded a file and then reseted/deleted it, we need to keep track of the entered url favicon in order to fall back on it.
  // try changing the url and then uploading a file, then reset the file, it should fall back to the entered url favicon

  const [formData, setFormData] = useState({
    title: item.title,
    url: item.url,
  });
  const [urlError, setUrlError] = useState("");

  const uploadedFavIconFile = useRef(null);
  const previousUploadedFavIconUrl = useRef(null);

  function hanldeUrlChange(e) {
    const value = e.target.value;

    try {
      const urlObj = new URL(value);
      setCurrentFavIconUrl(
        `https://www.faviconextractor.com/favicon/${urlObj.hostname}?larger=true`
      );
      // enteredUrlfavIcon.current = `https://www.faviconextractor.com/favicon/${urlObj.hostname}?larger=true`;
      setUrlError("");
    } catch {
      setCurrentFavIconUrl("/Black.png");
      // enteredUrlfavIcon.current = "/Black.png";
      setUrlError("Please enter a valid url");
    } finally {
      uploadedFavIconFile.current = null;
      if (previousUploadedFavIconUrl.current) {
        URL.revokeObjectURL(previousUploadedFavIconUrl.current);
        previousUploadedFavIconUrl.current = null;
      }
    }
  }

  function handleNameChange(e) {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, title: value }));
  }

  async function handleFormSubmit(data) {
    const updatedBookmark = await chrome.bookmarks.update(data.id, {
      title: data.title,
      url: data.url,
    });

    if (currentFavIconUrl.startsWith("https")) {
      chrome.storage.local.remove(id);
    }

    if (data.uploadedFavIconFile) {
      const reader = new FileReader();
      reader.readAsDataURL(data.uploadedFavIconFile);

      reader.addEventListener("load", function (evt) {
        let file = evt.target.result;
        chrome.storage.local.set({
          [id]: { uploadedFavIconFile: file },
        });
      });
    }

    //   chrome.bookmarks
    // .update(data.id, {
    //   title: data.title,
    //   url: data.url,
    // })
    // .then(() => {
    //   if (data.uploadedFavIconFile) {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(data.uploadedFavIconFile);

    //     reader.addEventListener("load", function (evt) {
    //       let file = evt.target.result;
    //       chrome.storage.local.set({
    //         [id]: { uploadedFavIconFile: file },
    //       });
    //     });
    //   }
    // });
  }

  function handleFormClose() {
    setCurrentFavIconUrl(faviconUrl);

    // enteredUrlfavIcon.current = faviconUrl;
    setFormData({
      title: item.title,
      url: item.url,
    });
    setUrlError("");
  }

  function handleCloseDialog(e) {
    setIsHidden(false);

    if (editDialogRef.current.returnValue === "submit") {
      handleFormSubmit({
        ...formData,
        uploadedFavIconFile: uploadedFavIconFile.current,
        id,
      });
    } else {
      handleFormClose();
    }

    uploadedFavIconFile.current = null;
    if (previousUploadedFavIconUrl.current) {
      URL.revokeObjectURL(previousUploadedFavIconUrl.current);
      previousUploadedFavIconUrl.current = null;
    }
  }

  const debouncedHandleUrlChange = useMemo(
    () => debounce(hanldeUrlChange, 300),
    []
  );

  useEffect(
    function () {
      setFormData({
        title: item.title,
        url: item.url,
      });
    },
    [item]
  );

  return (
    <dialog
      closedby="any"
      onClose={handleCloseDialog}
      className=" w-[70%] max-w-[535px] px-5 py-7 m-auto inset-0 cursor-auto rounded-xl border-1 border-black/75 backdrop:bg-black/50 opacity-0 scale-95 starting:open:opacity-0 starting:open:scale-95 open:opacity-100 open:scale-100 transition-all duration-300 transition-discrete ease-out **:font-roboto"
      ref={editDialogRef}
    >
      <form className="flex flex-col gap-5">
        <div className="flex gap-5 ">
          <FaviconEditor
            url={formData.url}
            currentFavIconUrl={currentFavIconUrl}
            onFaviconChange={setCurrentFavIconUrl}
            // enteredUrlFavIcon={enteredUrlfavIcon}
            previousUploadedFavIconUrl={previousUploadedFavIconUrl}
            uploadedFavIconFile={uploadedFavIconFile}
          />
          <div className="flex-1">
            {" "}
            <h3 className="text-lg leading-none font-semibold text-left">
              Edit Bookmark
            </h3>
            <div className="flex gap-2 items-center mt-6">
              <Label className=" min-w-8.5" htmlFor={`name-${id}`}>
                Name
              </Label>
              <Input
                autoComplete="off"
                value={formData.title}
                type="text"
                id={`name-${id}`}
                name={`name-${id}`}
                onChange={handleNameChange}
                // className="selection:bg-blue-500"
              />{" "}
            </div>
            <div className="flex gap-2 items-center mt-3">
              <Label className=" min-w-8" htmlFor={`url-${id}`}>
                URL
              </Label>
              <Input
                // className={`selection:bg-blue-500`}
                aria-invalid={urlError ? "true" : "false"}
                value={formData.url}
                autoComplete="off"
                type="url"
                id={`url-${id}`}
                name={`url-${id}`}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, url: e.target.value }));
                  debouncedHandleUrlChange(e);
                }}
              />
            </div>
            {urlError && (
              <div className="text-red-500 text-[13px] mt-2 text-left ml-10">
                {urlError}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            value="cancel"
            onClick={(e) => {
              // e.preventDefault();
              editDialogRef.current.close("cancel");
            }}
            type="button"
            variant="outline"
            className="bg-zinc-200/50 border-none rounded-full  cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            className=" min-w-21 border-none rounded-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault();

              let valid = true;
              try {
                new URL(formData.url);
              } catch {
                valid = false;
              }
              if (!valid) return;
              editDialogRef.current.close("submit");
            }}
            type="button"
            // className=""
          >
            Done
          </Button>
        </div>
      </form>
    </dialog>
  );
}