import React from "react";

const SmartText = ({ value, placeholder = "", className = "", isExporting = false }) => {
  if (isExporting) {
    return (
      <div className={className + " whitespace-pre-wrap break-words"}>
        {value && value.trim() !== "" ? value : placeholder}
      </div>
    );
  }

  return (
    <textarea
      value={value || ""}
      placeholder={placeholder}
      onChange={() => {}} // có thể để read-only nếu chỉ hiển thị
      className={className + " whitespace-pre-wrap"}
      rows={3}
    />
  );
};

export default SmartText;
