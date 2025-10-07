// @ts-nocheck

import React from "react";

export default function InfoDialog({ infoDialogRef }) {
  return (
    <dialog
      ref={infoDialogRef}
      closedBy="any"
      style={{ height: "stretch", width: "stretch" }}
      className="mx-[25px] xs:mx-auto my-44 bg-white  max-w-[550px] rounded-lg opacity-0 scale-95 transition-discrete   open:backdrop:backdrop-blur-sm  starting:open:opacity-0 starting:open:scale-95 transition-all duration-300 open:opacity-100 open:scale-100 py-10 px-4"
    >
      <div className="overflow-auto h-full flex flex-col items-center px-6 custom-scrollbar">
        <button
          className="absolute top-3 right-3 cursor-pointer  rounded-xs hover:bg-black/10 outline-3 outline-transparent duration-150 hover:outline-black/10 after:absolute after:-inset-2"
          onClick={() => infoDialogRef.current.close()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" data--h-bstatus="0OBSERVED" />
            <path d="m6 6 12 12" data--h-bstatus="0OBSERVED" />
          </svg>{" "}
        </button>
        <img src="/avatar.png" alt="" className="size-32" />
        <div className="flex gap-3 items-center">
          <a href="https://www.upwork.com/freelancers/~014ce4d152e17b2b6a">
            <svg
              className="size-8"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Upwork"
              role="img"
              viewBox="0 0 512 512"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <rect width="512" height="512" rx="15%" fill="#6fda44"></rect>
                <path
                  fill="#ffffff"
                  d="M357.2,296.9c-17,0-33-7.2-47.4-18.9l3.5-16.6l0.1-.6c3.2-17.6,13.1-47.2,43.8-47.2c23,0,41.7,18.7,41.7,41.7S380.2,296.9,357.2,296.9L357.2,296.9z M357.2,171.4c-39.2,0-69.5,25.4-81.9,67.3c-18.8-28.3-33.1-62.2-41.4-90.8h-42.2v109.7c0,21.7-17.6,39.3-39.3,39.3s-39.3-17.6-39.3-39.3V147.8H71v109.7c0,44.9,36.5,81.8,81.4,81.8s81.4-36.9,81.4-81.8v-18.4c8.2,17.1,18.2,34.4,30.4,49.6l-25.8,121.4h43.1l18.7-88c16.4,10.5,35.2,17.1,56.8,17.1c46.2,0,83.8-37.8,83.8-84.1C440.9,209,403.4,171.4,357.2,171.4"
                ></path>
              </g>
            </svg>
          </a>
          <a
            href="https://x.com/ibrahim_hrsh"
            className="w-[31px] overflow-hidden"
          >
            <img className="w-11 h-[33px] object-cover" src="/x.png" alt="" />
          </a>
          <a href="https://www.facebook.com/abrahym.hrshysh">
            {" "}
            <svg
              className="size-8"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Facebook"
              role="img"
              viewBox="0 0 512 512"
              fill="#000000"
              data--h-bstatus="0OBSERVED"
            >
              <g
                id="SVGRepo_bgCarrier"
                stroke-width="0"
                data--h-bstatus="0OBSERVED"
              ></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
                data--h-bstatus="0OBSERVED"
              ></g>
              <g id="SVGRepo_iconCarrier" data--h-bstatus="0OBSERVED">
                <rect
                  width="512"
                  height="512"
                  rx="15%"
                  fill="#1877f2"
                  data--h-bstatus="0OBSERVED"
                ></rect>
                <path
                  d="M355.6 330l11.4-74h-71v-48c0-20.2 9.9-40 41.7-40H370v-63s-29.3-5-57.3-5c-58.5 0-96.7 35.4-96.7 99.6V256h-65v74h65v182h80V330h59.6z"
                  fill="#ffffff"
                  data--h-bstatus="0OBSERVED"
                ></path>
              </g>
            </svg>
          </a>
          <a className="" href="mailto:ibraheemhursheesh33@gmail.com">
            <svg
              className="size-11.5"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Gmail"
              role="img"
              viewBox="0 0 512 512"
              fill="#000000"
              data--h-bstatus="0OBSERVED"
            >
              <g
                id="SVGRepo_bgCarrier"
                stroke-width="0"
                data--h-bstatus="0OBSERVED"
              ></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
                data--h-bstatus="0OBSERVED"
              ></g>
              <g id="SVGRepo_iconCarrier" data--h-bstatus="0OBSERVED">
                <rect
                  width="512"
                  height="512"
                  rx="15%"
                  fill="#ffffff"
                  data--h-bstatus="0OBSERVED"
                ></rect>
                <path
                  d="M158 391v-142l-82-63V361q0 30 30 30"
                  fill="#4285f4"
                  data--h-bstatus="0OBSERVED"
                ></path>
                <path
                  d="M 154 248l102 77l102-77v-98l-102 77l-102-77"
                  fill="#ea4335"
                  data--h-bstatus="0OBSERVED"
                ></path>
                <path
                  d="M354 391v-142l82-63V361q0 30-30 30"
                  fill="#34a853"
                  data--h-bstatus="0OBSERVED"
                ></path>
                <path
                  d="M76 188l82 63v-98l-30-23c-27-21-52 0-52 26"
                  fill="#c5221f"
                  data--h-bstatus="0OBSERVED"
                ></path>
                <path
                  d="M436 188l-82 63v-98l30-23c27-21 52 0 52 26"
                  fill="#fbbc04"
                  data--h-bstatus="0OBSERVED"
                ></path>
              </g>
            </svg>
          </a>
        </div>

        <div className="mt-5">
          <p
            style={{ lineHeight: "22px" }}
            className=""
            className="text-sm text-center"
          >
            Hi, I&apos;m Ibrahim, a web developer who enjoys building
            nice-looking experiences on the web, if you're facing any issues or
            have any questions about this extension you can just{" "}
            <a
              href="mailto:home.your.bookmarks@gmail.com"
              className="font-medium underline underline-offset-4"
            >
              contact us
            </a>
          </p>
          <p
            style={{ lineHeight: "22px" }}
            className="text-sm  text-center mt-4"
          >
            Also, if you're interested in me building you an extension or a
            website, I'm avaiable for hire, you can either{" "}
            <a
              href="mailto:ibraheemhursheesh33@gmail.com"
              className="font-medium underline underline-offset-4"
            >
              mail me
            </a>{" "}
            or find me on{" "}
            <a
              href="https://www.upwork.com/freelancers/~014ce4d152e17b2b6a"
              className="font-medium underline underline-offset-4"
            >
              Upwork doing freelance
            </a>
            .
          </p>
        </div>
      </div>
    </dialog>
  );
}
