import { useEffect, useState } from "react";

export function useCurrentFavIconUrl(favIconUrl) {
  const [currentFavIconUrl, setCurrentFavIconUrl] = useState(favIconUrl);
  useEffect(
    function () {
      setCurrentFavIconUrl(favIconUrl);
    },
    [favIconUrl]
  );

  return [currentFavIconUrl, setCurrentFavIconUrl];
}
