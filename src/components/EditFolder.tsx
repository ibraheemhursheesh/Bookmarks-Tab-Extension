// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { colors } from "../data/colors";

const defaultFolderColor = colors[0];

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

function isSameColor(firstColor, secondColor) {
  return (
    firstColor?.inside === secondColor?.inside &&
    firstColor?.outside === secondColor?.outside
  );
}

function FolderIconPreview({ folderIconSvg, folderColor }) {
  return (
    <div className="size-12 relative">
      <div
        className="w-full h-12
      4 absolute top-0 left-0"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill={folderColor.outside}
          stroke=""
          strokeWidth="2"
          className="relative top-[6px]"
        >
          <path d="M 0 20 L 0 8 Q 0 0 8 0 L 20 0 C 24 0 26 4 28 4 L 40 4 Q 48 4 48 12 L 48 20 z"></path>
        </svg>
      </div>
      <div
        className="w-full h-[34px] border-2 rounded-sm mt-[14px] relative flex items-center justify-center"
        style={{
          backgroundColor: folderColor.inside,
          borderColor: folderColor.outside,
        }}
      >
        {folderIconSvg && (
          <div
            className="pointer-events-none absolute text-zinc-700"
            dangerouslySetInnerHTML={{ __html: folderIconSvg }}
          />
        )}
      </div>
    </div>
  );
}

function FolderColorPickerDialog({
  colorDialogRef,
  selectedFolderColor,
  onSelectColor,
  onPreviewColor,
  onClearPreviewColor,
}) {
  return (
    <dialog
      style={{
        positionAnchor: "--color-picker",
        top: "anchor(bottom)",
        left: "anchor(right)",
      }}
      ref={colorDialogRef}
      closedby="any"
      onClose={(e) => {
        e.stopPropagation();
        onClearPreviewColor();
      }}
      className="w-[260px] p-4 inset-0 cursor-auto rounded-xl border-1 border-black/75  opacity-0 scale-95 starting:open:opacity-0 backdrop:bg-transparent starting:open:scale-95 open:opacity-100 open:scale-100 transition-all duration-300 transition-discrete ease-out **:font-roboto"
    >
      <div
        className="grid grid-cols-4 gap-3"
        onMouseLeave={onClearPreviewColor}
      >
        {colors.map((color) => {
          const isSelected = isSameColor(color, selectedFolderColor);

          return (
            <button
              key={`${color.inside}-${color.outside}`}
              type="button"
              aria-label="Choose folder color"
              className="grid size-10 place-items-center rounded-md border border-black/10 bg-white cursor-pointer outline-2 outline-offset-2 outline-transparent focus-visible:outline-black/50"
              style={{
                outlineColor: isSelected ? color.outside : "",
              }}
              onMouseEnter={() => onPreviewColor(color)}
              onFocus={() => onPreviewColor(color)}
              onClick={() => {
                onSelectColor(color);
                colorDialogRef.current.close();
              }}
            >
              <span
                className="size-6 rounded-sm border-2"
                style={{
                  backgroundColor: color.inside,
                  borderColor: color.outside,
                }}
              />
            </button>
          );
        })}
      </div>
    </dialog>
  );
}

export default function EditFolder({
  setIsHidden,
  editDialogRef,
  item,
  id,
  folderIconSvg,
  folderColor = defaultFolderColor,
}) {
  const [svgInput, setSvgInput] = useState(folderIconSvg || "");
  const [svgError, setSvgError] = useState("");
  const [selectedFolderColor, setSelectedFolderColor] = useState(folderColor);
  const [hoveredFolderColor, setHoveredFolderColor] = useState(null);
  const colorDialogRef = useRef(null);
  const svgHelpPopoverRef = useRef(null);
  const previewSvg = parseFolderSvg(svgInput).svg;
  const previewFolderColor = hoveredFolderColor || selectedFolderColor;
  const svgHelpAnchorName = `--folder-svg-help-${id}`;

  function showSvgHelpPopover() {
    if (!svgHelpPopoverRef.current?.matches(":popover-open")) {
      svgHelpPopoverRef.current?.showPopover();
    }
  }

  function hideSvgHelpPopover() {
    if (svgHelpPopoverRef.current?.matches(":popover-open")) {
      svgHelpPopoverRef.current?.hidePopover();
    }
  }

  async function saveFolderSettings(nextSvg, nextFolderColor) {
    const result = await chrome.storage.local.get(id);
    const currentItemStorage = result[id] || {};
    const nextItemStorage = { ...currentItemStorage };

    if (nextSvg) {
      nextItemStorage.folderIconSvg = nextSvg;
    } else {
      delete nextItemStorage.folderIconSvg;
    }

    if (isSameColor(nextFolderColor, defaultFolderColor)) {
      delete nextItemStorage.folderColor;
    } else {
      nextItemStorage.folderColor = nextFolderColor;
    }

    if (Object.keys(nextItemStorage).length) {
      await chrome.storage.local.set({ [id]: nextItemStorage });
    } else {
      await chrome.storage.local.remove(id);
    }
  }

  function handleCloseDialog() {
    setIsHidden(false);

    if (editDialogRef.current.returnValue !== "submit") {
      setSvgInput(folderIconSvg || "");
      setSelectedFolderColor(folderColor);
      setHoveredFolderColor(null);
      setSvgError("");
      return;
    }

    const { svg, error } = parseFolderSvg(svgInput);
    if (error) {
      setSvgError(error);
      return;
    }

    saveFolderSettings(svg, selectedFolderColor);
  }

  useEffect(
    function () {
      setSvgInput(folderIconSvg || "");
    },
    [folderIconSvg],
  );

  useEffect(
    function () {
      setSelectedFolderColor(folderColor);
    },
    [folderColor],
  );

  return (
    <dialog
      closedby="any"
      onClose={handleCloseDialog}
      className="w-[80%] max-w-[560px] px-5 py-7 m-auto inset-0 cursor-auto rounded-xl border-1 border-black/75 backdrop:bg-black/50 opacity-0 scale-95 starting:open:opacity-0 starting:open:scale-95 open:opacity-100 open:scale-100 transition-all duration-300 transition-discrete ease-out **:font-roboto"
      ref={editDialogRef}
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex items-start gap-5">
          <div className="flex flex-col items-center gap-3">
            <div className="grid size-20 place-items-center">
              <FolderIconPreview
                folderIconSvg={previewSvg}
                folderColor={previewFolderColor}
              />
            </div>
            <button
              style={{ anchorName: "--color-picker" }}
              type="button"
              aria-label="Change folder color"
              title="Change folder color"
              className="grid size-8 place-items-center rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-black/50 cursor-pointer"
              onClick={() => {
                colorDialogRef.current.showModal();
              }}
            >
              <Palette size={17} />
            </button>
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg leading-none font-semibold">Edit Folder</h3>
            <div className="mt-6">
              <Label htmlFor={`folder-svg-${id}`}>SVG</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id={`folder-svg-${id}`}
                  name={`folder-svg-${id}`}
                  value={svgInput}
                  autoComplete="off"
                  spellCheck={false}
                  type="text"
                  dir="ltr"
                  className="font-mono text-xs"
                  onChange={(e) => {
                    setSvgInput(e.target.value);
                    setSvgError("");
                  }}
                />
                <button
                  type="button"
                  aria-label="SVG icon help"
                  aria-describedby={`folder-svg-help-${id}`}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[#333] hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-black/40"
                  style={{ anchorName: svgHelpAnchorName }}
                  onMouseEnter={showSvgHelpPopover}
                  onMouseLeave={hideSvgHelpPopover}
                  onFocus={showSvgHelpPopover}
                  onBlur={hideSvgHelpPopover}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-info-icon lucide-info"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </button>
                <div
                  id={`folder-svg-help-${id}`}
                  ref={svgHelpPopoverRef}
                  popover="manual"
                  style={{
                    positionAnchor: svgHelpAnchorName,
                    bottom: "anchor(top)",
                    left: "anchor(center)",
                    transform: "translateX(-50%)",
                  }}
                  className="inset-auto mb-2 max-w-54 rounded-md border border-black/10 bg-[#333] px-3 py-1.5 text-xs leading-snug text-white shadow-md"
                >
                  Visit https://lucide.dev to find a good icon to use
                </div>
              </div>
            </div>
            {svgError && (
              <div className="mt-2 text-[13px] text-red-500">{svgError}</div>
            )}
          </div>
        </div>
        <FolderColorPickerDialog
          colorDialogRef={colorDialogRef}
          selectedFolderColor={selectedFolderColor}
          onSelectColor={(color) => {
            setSelectedFolderColor(color);
            setHoveredFolderColor(null);
          }}
          onPreviewColor={setHoveredFolderColor}
          onClearPreviewColor={() => setHoveredFolderColor(null)}
        />
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
