import React from "react";
import { useNavigate } from "react-router-dom";
import cvTemplates from "../components/cvTemplates";

const CreateCV = () => {
  const navigate = useNavigate();

  const handleTemplateSelect = (tpl) => {
    navigate("/generate-cv", { state: { template: tpl } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 px-4 sm:px-8 py-6">
      {/* BANNER HEADER */}
      <section className="relative bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 py-20 px-6 text-white text-center rounded-2xl mb-14 shadow-2xl overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
            Tạo thế giới CV hiện đại <br /> chỉ bằng một cú nhấp chuột
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl leading-relaxed">
            Với <span className="font-semibold">JoBook</span>, bạn có thể dễ dàng tạo CV đẹp mắt
            chỉ bằng vài bước đơn giản. Chọn mẫu, chỉnh sửa thông tin, và tải về ngay lập tức —
            tất cả đều miễn phí và tiện lợi.
          </p>
        </div>
        {/* Background hiệu ứng gradient mờ */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_#fff,_transparent_50%)]"></div>
      </section>

      {/* Tiêu đề */}
      {/* Tiêu đề */}
      <div className="flex flex-col items-center mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-wide text-gray-800">
          🚀 Chọn mẫu CV hot trend để bắt đầu
        </h2>
        <p className="mt-2 text-sm text-gray-600 italic">
          ⚡ Hiện tại{" "}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
            Classic One
          </span>{" "}
          là mẫu hoàn chỉnh. Các mẫu khác đang được JoBook cập nhật và hoàn thiện.
        </p>
      </div>

      {/* Danh sách mẫu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cvTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="group border rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-2xl hover:-translate-y-2 transform transition duration-300 cursor-pointer"
            onClick={() => handleTemplateSelect(tpl)}
          >
            <div className="relative">
              <img
                src={tpl.preview}
                alt={tpl.name}
                className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"></div>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                {tpl.name}
              </h3>
              <p className="text-sm text-gray-500 mt-2">{tpl.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateCV;
