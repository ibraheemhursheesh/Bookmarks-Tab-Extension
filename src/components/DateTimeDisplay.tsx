import { useState, useEffect } from "react";

export default function DateTimeDisplay() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    // Calculate how many ms until the next minute starts
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;

    // First timeout: update at the exact start of the next minute
    const timeout = setTimeout(() => {
      setDateTime(new Date());

      // Then update every minute from now on
      const interval = setInterval(() => {
        setDateTime(new Date());
      }, 60 * 1000);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    // Cleanup timeout if component unmounts before next minute
    return () => clearTimeout(timeout);
  }, []);

  const timeString = dateTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateString = dateTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="*:font-fira mt-12 text-center text-white mb-10">
      <div className="text-[60px] font-semibold">{timeString}</div>
      <div className="-mt-[3px] text-base">{dateString}</div>
    </div>
  );
}
