import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// ✅ Chỉ rõ worker nằm trong thư mục public
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

const CVViewerModal = ({ cvUrl, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const baseWidth = containerRef.current.offsetWidth - 20;

        if (window.innerWidth >= 1024) {
          setPageWidth(baseWidth * 0.85);
        } else if (window.innerWidth >= 768) {
          setPageWidth(baseWidth * 0.9);
        } else {
          setPageWidth(baseWidth * 0.95);
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!cvUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[95%] h-[90%] md:w-[85%] lg:w-[70%] flex flex-col">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-semibold">Xem CV</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div ref={containerRef} className="flex-1 overflow-auto p-2 flex justify-center items-start">
          <Document
            file={cvUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(err) => console.error("PDF load error:", err)}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={pageWidth}
                className="mx-auto"
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};

export default CVViewerModal;
