// @ts-nocheck
import React, { useCallback, useEffect, useState } from "react";

export const useDotButton = (emblaApi) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onDotButtonClick = useCallback(
    (index) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onDotButtonClick,
  };
};

export const DotButton = (props) => {
  const { children, onClick, active } = props;

  return (
    <button type="button" onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "black"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        // className={`${active ? "fill-blue-600" : ""} stroke-blue-800`}
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
      {children}
    </button>
  );
};
