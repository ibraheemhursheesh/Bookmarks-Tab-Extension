// @ts-nocheck

import { React, useCallback, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  useButtons,
  PrevButton,
  NextButton,
} from "./CarouselDialogArrowButtons";
import { DotButton, useDotButton } from "./CarouselDialogDotButton";
import { ImagePlus, X } from "lucide-react";
import ImageBlobReduce from "image-blob-reduce";
import { useUploadedImages } from "../hooks/useChromeStorage";

import { Spinner } from "@/components/ui/spinner";

const reduce = ImageBlobReduce();

interface CarouselDilaogProp {
  dialogRef: React.RefObject<HTMLDialogElement>;
  currentBackgroundImage: string;
  setBackgroundImage: (image: string) => void;
  backgroundImages: string[];
}

export default function CarouselDialog({
  dialogRef,
  currentBackgroundImage,
  setBackgroundImage,
  backgroundImages,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
  });

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = useButtons(emblaApi);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const fileInputRef = useRef(null);

  const { uploadedImages, addImage, deleteImage } = useUploadedImages();
  const [isAddingImage, setIsAddingImage] = useState(false);

  const uploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // console.log(file.size * 0.001);

    setIsAddingImage(true);
    let resizedBlob = await reduce.toBlob(file, { max: 1200 });
    const previewBlob = await reduce.toBlob(file, { max: 200 });
    // console.log("Resized blob:", resizedBlob.size * 0.001);

    const targetSize = 1 * 1024 * 1024; // 1MB
    let quality = 0.9;

    while (resizedBlob.size > targetSize && quality > 0.1) {
      resizedBlob = await reduce.toBlob(file, {
        max: 1200,
        quality: quality,
        type: "image/jpeg",
      });
      quality -= 0.1;
    }

    // Convert both blobs to data URLs
    const backgroundImageReader = new FileReader();
    const previewReader = new FileReader();

    const backgroundPromise = new Promise((resolve) => {
      backgroundImageReader.onload = (evt) => resolve(evt.target.result);
      backgroundImageReader.readAsDataURL(resizedBlob);
    });

    const previewPromise = new Promise((resolve) => {
      previewReader.onload = (evt) => resolve(evt.target.result);
      previewReader.readAsDataURL(previewBlob);
    });

    try {
      const [backgroundDataUrl, previewDataUrl] = await Promise.all([
        backgroundPromise,
        previewPromise,
      ]);

      // // console.log(backgroundDataUrl, previewDataUrl);
      // Store both images in chrome.storage.local
      const imageId = addImage({
        preview: previewDataUrl,
        background: backgroundDataUrl,
      });

      setIsAddingImage(false);

      // Set the newly uploaded image as current background
      // setBackgroundImage(`uploaded_${imageId}`);

      // console.log("Image uploaded, stored, and adaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
    }

    // Reset file input
    event.target.value = "";
  };

  // function closeDialog(e) {
  //   if (e.target.closest(".embla") === null) {
  //     dialogRef.current.close();
  //   }
  // }

  return (
    <dialog
      className=" bottom-5 top-auto w-[95%] max-w-[799px] mx-auto border-none rounded-xl bg-transparent transition-[translate,display,opacity] duration-350 transition-discrete translate-y-[calc(50%)] opacity-0 open:translate-y-[0%] open:opacity-100 starting:open:translate-y-[calc(50%)] starting:open:opacity-0 backdrop:bg-transparent group text-white"
      ref={dialogRef}
      // onClick={closeDialog}
      closedBy="any"
      id="carouselDialog"
    >
      <div className=" pt-[14px] px-1 pb-[5px]">
        <div className=" flex items-center">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />

          <div
            className="overflow-x-hidden rounded-md flex-grow mx-[5px]"
            ref={emblaRef}
          >
            <ul className=" flex gap-1.5">
              {/* Upload Item */}
              <li
                className={`flex-[0_0_80%] flex items-center justify-center max-w-[174px] min-w-0 aspect-video rounded-md cursor-pointer bg-gradient-to-r from-white/70 to-white/70 ${
                  false ? "border-2 border-dashed border-zinc-900" : ""
                } `}
                onClick={() => fileInputRef.current.showPicker()}
              >
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  onChange={uploadImage}
                />
                <ImagePlus className="stroke-black" />
              </li>
              {/* <li className="flex-[0_0_80%] max-w-[174px] min-w-0 aspect-video rounded-md flex flex-col justify-center items-center gap-0.5 font-medium   bg-white/70">
                <Spinner className="size-5.5 stroke-zinc-950" />
              </li> */}
              {/* Loading Spinner */}
              {isAddingImage && (
                <li className="flex-[0_0_80%] max-w-[174px] min-w-0 aspect-video rounded-md flex flex-col justify-center items-center gap-0.5 font-medium   bg-white/70">
                  <Spinner className="size-5.5 stroke-zinc-950" />
                </li>
              )}
              {/* Uploaded Images */}
              {uploadedImages.map((uploadedImage, index) => {
                const { id, preview, background } = uploadedImage;
                return (
                  <li
                    key={id}
                    className={` flex-[0_0_80%] max-w-[174px] min-w-0 aspect-video rounded-md bg-cover bg-center cursor-pointer transition-discrete transition-[opacity,display] duration-300 group-open:starting:opacity-0 group-open:opacity-100 opacity-0 relative border border-zinc-100/50  ${
                      background === currentBackgroundImage
                        ? "border-2 border-black shadow-xl"
                        : ""
                    }`}
                    style={{ backgroundImage: `url(${preview})` }}
                    onClick={() => setBackgroundImage(background)}
                  >
                    {/* Delete button for uploaded images */}
                    <button
                      className="absolute top-1 right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center hover:bg-zinc-900 duration-150"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(id);
                        // If deleting current background, switch to default
                        if (currentBackgroundImage === background) {
                          // setBackgroundImage(backgroundImages[0]);

                          const nextBackgroundImage =
                            index + 1 === uploadedImages.length
                              ? backgroundImages[0]
                              : uploadedImages[index + 1].background;

                          setBackgroundImage(nextBackgroundImage);
                        }
                      }}
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </li>
                );
              })}
              {/* Default Images */}
              {backgroundImages.map((backgroundImage) => (
                <li
                  key={backgroundImage}
                  className={`flex-[0_0_80%] max-w-[174px] min-w-0 aspect-video rounded-md bg-cover bg-center cursor-pointer transition-discrete transition-[opacity,display] duration-300 group-open:starting:opacity-0 group-open:opacity-100 opacity-0  border border-zinc-100/50 ${
                    backgroundImage === currentBackgroundImage
                      ? "border-2 border-zinc-300"
                      : ""
                  }`}
                  style={{ backgroundImage: `url(/${backgroundImage})` }}
                  onClick={() => setBackgroundImage(backgroundImage)}
                ></li>
              ))}
            </ul>
          </div>

          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>
        <div className="flex flex-wrap justify-center items-center mt-1.5 gap-0.25">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              active={index === selectedIndex}
              className={"embla__dot".concat()}
            />
          ))}
        </div>
      </div>
    </dialog>
  );
}
