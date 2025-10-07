// @ts-nocheck
import { memo, useRef, useState } from "react";
import InfoDialog from "./InfoDialog";

const SettingsIcons = memo(function ({ dialogRef, setBackgroundImage }) {
  const infoDialogRef = useRef(null);

  return (
    <div className="settings-icons flex items-center gap-5 group-has-[#carouselDialog:open]:hidden">
      {/* <button onClick={() => fileInputRef.current.showPicker()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          // className="hover:-rotate-[1.5turn] transition-transform duration-700 ease-out"
        >
          <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button> */}

      <button
        className="cursor-pointer relative rounded-xs hover:bg-black/20 outline-3 outline-transparent duration-150 hover:outline-black/20 after:absolute after:-inset-2 ml-auto "
        onClick={() => dialogRef.current.showModal()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-image-icon lucide-image"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </button>

      <InfoDialog infoDialogRef={infoDialogRef} />
      <button
        className="cursor-pointer relative rounded-xs hover:bg-black/20 outline-3 outline-transparent duration-150 hover:outline-black/20 after:absolute after:-inset-2 "
        onClick={() => infoDialogRef.current.showModal()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-circle-question-mark-icon lucide-circle-question-mark"
        >
          <circle cx="12" cy="12" r="10" data--h-bstatus="0OBSERVED" />
          <path
            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
            data--h-bstatus="0OBSERVED"
          />
          <path d="M12 17h.01" data--h-bstatus="0OBSERVED" />
        </svg>
      </button>
    </div>
  );
});
export default SettingsIcons;
