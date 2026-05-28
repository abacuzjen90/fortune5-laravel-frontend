import React, { useEffect, useRef } from "react";

const SuccessDisplay = ({ success, message = "✅ Operation successful!", className = "" }) => {
  const successRef = useRef(null);

  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [success]);

  if (!success) return null;

  return (
    <div
      ref={successRef}
      className={`animate-fade-pulse text-green-700 text-left border border-green-300 bg-green-100 p-4 rounded mb-2 scroll-mt-24 ${className}`}
    >
      {message}
    </div>
  );
};

export default SuccessDisplay;
