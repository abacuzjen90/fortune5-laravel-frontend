import React, { useEffect, useRef, useState } from "react";

const ErrorDisplay = ({ errors, clearErrors }) => {
  const errorRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length > 0 && errorRef.current) {
      // Reset fade state
      setFadeOut(false);

      // Scroll into view
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

      // Start fade after 4 seconds
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 4000);

      // Clear from parent after fade (1s after fade starts)
      const clearTimer = setTimeout(() => {
        clearErrors && clearErrors();
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [errors, clearErrors]);

  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  const [firstKey, firstMessages] = entries[0];

  return (
    <div
      ref={errorRef}
      className={`error text-red-700 text-left border bg-red-100 p-4 rounded mb-2 scroll-mt-24 transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {firstMessages[0]}{" "}
      {entries.length > 1 && (
        <span className="ml-2 text-sm text-red-500">
          (+{entries.length - 1} more error
          {entries.length - 1 > 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
};

export default ErrorDisplay;
