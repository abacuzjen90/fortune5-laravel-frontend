// components/RunningClock.js
import React, { useEffect, useState } from "react";

const RunningClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
      <span className="text-lg text-black font-bold">{formattedTime}</span>
  );
};

export default RunningClock;
