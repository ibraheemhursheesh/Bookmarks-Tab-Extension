// @ts-nocheck
import { useMemo, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useUploadedImages } from "../hooks/useChromeStorage";
import SettingsFooter from "./SettingsFooter";
import SettingsIcons from "./SettingsIcons";
import CarouselDialog from "./CarouselDialog";

export default function BackgroundImageWrapper({ children }) {
  const dialog = useRef(null);
  const [backgroundImage, setBackgroundImage] = useLocalStorage(
    "backgroundImage",
    "background1.jpeg"
  );
  const { uploadedImages, getImageById } = useUploadedImages();

  const backgroundImages = useMemo(
    () => [
      "background1.jpeg",
      "background3.jpg",
      "background4.jpg",
      "background5.jpg",
      "background6.jpg",
    ],
    []
  );

  const getBackgroundImageUrl = () => {
    if (backgroundImage.startsWith("data:image")) {
      return backgroundImage;
    }
    return `/${backgroundImage}`;
  };
  return (
    <div
      className="App h-dvh  bg-no-repeat bg-cover bg-center flex flex-col"
      style={{ backgroundImage: `url(${getBackgroundImageUrl()})` }}
      id="App"
    >
      {children}
      <SettingsFooter>
        <SettingsIcons
          setBackgroundImage={setBackgroundImage}
          dialogRef={dialog}
        />
        <CarouselDialog
          dialogRef={dialog}
          currentBackgroundImage={backgroundImage}
          backgroundImages={backgroundImages}
          setBackgroundImage={setBackgroundImage}
        />
      </SettingsFooter>
    </div>
  );
}
