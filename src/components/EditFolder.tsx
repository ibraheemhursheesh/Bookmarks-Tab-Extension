// @ts-nocheck
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function parseFolderSvg(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { svg: "", error: "" };
  }

  const doc = new DOMParser().parseFromString(trimmedValue, "image/svg+xml");
  const parserError = doc.querySelector("parsererror");
  const svgElement = doc.documentElement;

  if (parserError || svgElement?.tagName?.toLowerCase() !== "svg") {
    return { svg: "", error: "Paste a valid SVG tag." };
  }

  svgElement.querySelectorAll("script").forEach((script) => script.remove());
  [svgElement, ...svgElement.querySelectorAll("*")].forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();

      if (name.startsWith("on") || value.startsWith("javascript:")) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return { svg: svgElement.outerHTML, error: "" };
}

export default function EditFolder({
  setIsHidden,
  editDialogRef,
  item,
  id,
  folderIconSvg,
}) {
  const [svgInput, setSvgInput] = useState(folderIconSvg || "");
  const [svgError, setSvgError] = useState("");
  const previewSvg = parseFolderSvg(svgInput).svg;

  async function saveFolderIconSvg(nextSvg) {
    const result = await chrome.storage.local.get(id);
    const currentItemStorage = result[id] || {};

    if (!nextSvg) {
      const { folderIconSvg, ...rest } = currentItemStorage;
      if (Object.keys(rest).length) {
        await chrome.storage.local.set({ [id]: rest });
      } else {
        await chrome.storage.local.remove(id);
      }
      return;
    }

    await chrome.storage.local.set({
      [id]: {
        ...currentItemStorage,
        folderIconSvg: nextSvg,
      },
    });
  }

  function handleCloseDialog() {
    setIsHidden(false);

    if (editDialogRef.current.returnValue !== "submit") {
      setSvgInput(folderIconSvg || "");
      setSvgError("");
      return;
    }

    const { svg, error } = parseFolderSvg(svgInput);
    if (error) {
      setSvgError(error);
      return;
    }

    saveFolderIconSvg(svg);
  }

  useEffect(
    function () {
      setSvgInput(folderIconSvg || "");
    },
    [folderIconSvg],
  );

  return (
    <dialog
      closedby="any"
      onClose={handleCloseDialog}
      className="w-[80%] max-w-[560px] px-5 py-7 m-auto inset-0 cursor-auto rounded-xl border-1 border-black/75 backdrop:bg-black/50 opacity-0 scale-95 starting:open:opacity-0 starting:open:scale-95 open:opacity-100 open:scale-100 transition-all duration-300 transition-discrete ease-out **:font-roboto"
      ref={editDialogRef}
    >
      <form className="flex flex-col gap-5">
        <div className="flex items-start gap-5">
          <div className="grid size-20 place-items-center">
            <div className="size-12 relative">
              <div
                className="w-full h-12
              4 absolute top-0 left-0"
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="#e6e6e6"
                  stroke=""
                  strokeWidth="2"
                  className="relative top-[6px]"
                >
                  <path d="M 0 20 L 0 8 Q 0 0 8 0 L 20 0 C 24 0 26 4 28 4 L 40 4 Q 48 4 48 12 L 48 20 z"></path>
                </svg>
              </div>
              <div className="w-full h-[34px] bg-white border-2 border-[#e6e6e6] rounded-sm mt-[14px] relative flex items-center justify-center">
                {previewSvg && (
                  <div
                    className="pointer-events-none absolute text-zinc-700"
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg leading-none font-semibold">Edit Folder</h3>
            <div className="mt-6">
              <Label htmlFor={`folder-svg-${id}`}>SVG</Label>
              <Input
                id={`folder-svg-${id}`}
                name={`folder-svg-${id}`}
                value={svgInput}
                autoComplete="off"
                spellCheck={false}
                type="text"
                className="mt-2 font-mono text-xs"
                onChange={(e) => {
                  setSvgInput(e.target.value);
                  setSvgError("");
                }}
              />
            </div>
            {svgError && (
              <div className="mt-2 text-[13px] text-red-500">{svgError}</div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            value="cancel"
            onClick={() => {
              editDialogRef.current.close("cancel");
            }}
            type="button"
            variant="outline"
            className="bg-zinc-200/50 border-none rounded-full cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            className="min-w-21 border-none rounded-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const { svg, error } = parseFolderSvg(svgInput);
              if (error) {
                setSvgError(error);
                return;
              }
              setSvgInput(svg);
              editDialogRef.current.close("submit");
            }}
            type="button"
          >
            Done
          </Button>
        </div>
      </form>
    </dialog>
  );
}
