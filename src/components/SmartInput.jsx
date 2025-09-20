import React from "react";

const SmartInput = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  isExporting = false,
  type = "text",
  rows = 3,
}) => {
  // Export → chỉ text, email, textarea cần hiển thị tĩnh
  if (isExporting && (type === "text" || type === "email" || type === "textarea")) {
    return (
      <div
        className={`${className} whitespace-pre-wrap break-words`}
        style={{
          minHeight: type === "textarea" ? `${rows * 1.5}em` : "auto",
          lineHeight: "1.5",
          fontSize: "14px",
        }}
      >
        {value && value.trim() !== "" ? value : placeholder}
      </div>
    );
  }

  // Textarea
  if (type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} whitespace-pre-wrap w-full border rounded p-1`}
        rows={rows}
      />
    );
  }

  // Input (1 dòng, bao gồm file, text, email…)
  return (
    <input
      type={type}
      value={type === "file" ? undefined : value || ""}
      onChange={(e) => {
        if (type === "file") {
          onChange && onChange(e.target.files?.[0]);
        } else {
          onChange && onChange(e.target.value);
        }
      }}
      placeholder={placeholder}
      className={`${className} w-full border rounded p-1`}
      {...(type === "file" ? {} : { rows })}
    />
  );
};

export default SmartInput;
