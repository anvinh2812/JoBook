import React from "react";

const SmartInput = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  isExporting = false,
  type = "text",
}) => {
  // Nếu đang export thì hiển thị text tĩnh
  if (isExporting) {
    return (
      <div className={className + " whitespace-pre-wrap break-words"}>
        {value && value.trim() !== "" ? value : placeholder}
      </div>
    );
  }

  // Còn không thì hiển thị input có value + onChange
  const isMultiline = type === "textarea";

  if (isMultiline) {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className={className + " whitespace-pre-wrap"}
        rows={3}
      />
    );
  }
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );

};

export default SmartInput;
