import React from "react";
import { useNavigate } from "react-router-dom";
import cvTemplates from "../components/cvTemplates";

const CreateCV = () => {
  const navigate = useNavigate();

  const handleTemplateSelect = (tpl) => {
    navigate("/generate-cv", { state: { template: tpl } });
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-6">
      {/* BANNER HEADER */}
      <section className="bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] py-16 px-6 text-white text-center rounded-xl mb-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          {/* <img
            src="/icons/globe.svg"
            alt="icon"
            className="w-12 h-12"
          /> */}
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Tạo thế giới CV chỉ bằng một cú nhấp chuột
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Với JoBook, bạn có thể dễ dàng tạo CV đẹp mắt chỉ bằng vài bước đơn giản.
            Tùy chọn mẫu, chỉnh sửa thông tin, và tải về ngay lập tức — tất cả đều miễn phí và tiện lợi.
          </p>
        </div>
      </section>

      {/* Danh sách mẫu */}
      <div className="flex justify-center">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Chọn một mẫu bên dưới để bắt đầu
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cvTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
            onClick={() => handleTemplateSelect(tpl)}
          >
            <img
              src={tpl.preview}
              alt={tpl.name}
              className="w-full h-56 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{tpl.name}</h3>
              <p className="text-sm text-gray-500">{tpl.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateCV;
