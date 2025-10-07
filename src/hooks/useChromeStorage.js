import { useState, useEffect } from "react";

export function useChromeStorage(key, initialState) {
  const [value, setValue] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial value from chrome.storage.local
    chrome.storage.local.get([key], (result) => {
      if (result[key]) {
        setValue(result[key]);
      }
      setIsLoading(false);
    });
  }, [key]);

  const updateValue = (newValue) => {
    setValue(newValue);
    chrome.storage.local.set({ [key]: newValue });
  };

  return [value, updateValue, isLoading];
}

export function useUploadedImages() {
  const [uploadedImages, setUploadedImages, isLoading] = useChromeStorage(
    "uploadedImages",
    []
  );


  const addImage = (imageData) => {
    const newImage = {
      id: Date.now().toString(),
      preview: imageData.preview,
      background: imageData.background,
      timestamp: Date.now(),
    };

    let updatedImages = [newImage, ...uploadedImages];

    // Maintain 5 image limit - remove oldest if exceeding
    if (updatedImages.length > 5) {
      //   updatedImages.sort((a, b) => a.timestamp - b.timestamp);
      updatedImages = updatedImages.slice(0, 5);

    }

    setUploadedImages(updatedImages);
    return newImage.id;
  };

  const deleteImage = (imageId) => {
    const updatedImages = uploadedImages.filter((img) => img.id !== imageId);
    setUploadedImages(updatedImages);
  };

  const getImageById = (imageId) => {
    return uploadedImages.find((img) => img.id === imageId);
  };

  return {
    uploadedImages,
    addImage,
    deleteImage,
    getImageById,
    isLoading,
  };
}
