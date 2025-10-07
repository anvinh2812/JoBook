import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

import { pdf } from "@react-pdf/renderer";
import ClassicOnePDF from "../pdf-templates/ClassicOnePDF"; // file mới bạn tạo cho template PDF

import CVPreview from "../components/CVPreview"; // Hiển thị template CV
import { cvsAPI } from "../services/api";
import notify from "../utils/notify";

const GenerateCV = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedTemplate = location.state?.template;
    const [cvUrl, setCvUrl] = useState(null);


    const [formInput, setFormInput] = useState({
        jobTitle: "",
        targetJob: "",
        experience: "",
        skills: "",
    });

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        summary: "",
        appliedPosition: "",
        experienceYears: "",
        website: "",
        dob: "",
        gender: "",
        avatar: null,
        educationList: [],
        experienceList: [],
        skillsList: [],
        certificatesList: [],
        projectsList: [],
        activityList: [],
        awardsList: []
    });

    const [isExporting, setIsExporting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const cvRef = useRef();

    useEffect(() => {
        if (!selectedTemplate) {
            navigate("/create-cv");
        }
    }, [selectedTemplate, navigate]);

    const handleInputChange = (e) => {
        setFormInput({ ...formInput, [e.target.name]: e.target.value });
    };


    const handleAddList = (field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...(prev[field] || []), {}],
        }));
    };

    const generateAIContent = async () => {
        console.log("🔥 generateAIContent start");
        setIsGenerating(true);

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || ""; 
            const res = await fetch(`${baseUrl}/gemini/generate-cv`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    template: "classicOne",
                    data: {
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        appliedPosition: formInput.jobTitle,
                        experienceYears: formInput.experience,
                        skillsList: formInput.skills
                            ?.split(",")
                            .map((s) => ({ name: s.trim() })),
                    },
                }),
            });

            if (!res.ok) {
                throw new Error(`AI API error: ${res.status}`);
            }

            const parsed = await res.json().catch(() => {
                throw new Error("AI API trả về JSON không hợp lệ");
            });

            const aiData = parsed?.content || {};

            // ✅ phần transform giữ nguyên như bạn đã làm
            const transformed = {
                fullName: aiData.fullName || "",
                email: aiData.email || "",
                phone: aiData.phone || "",
                address: aiData.address || "",
                summary: aiData.summary || "",
                appliedPosition: aiData.appliedPosition || "",
                dob: aiData.dob || "",
                gender: aiData.gender || "",
                avatar: aiData.avatar || "",
                website: aiData.website || "",
                educationList: (aiData.educationList || []).map((e) => ({
                    time: e.time || `${e.startDate || ""} - ${e.endDate || ""}`.trim(),
                    school: e.school || e.institution || "",
                    major: e.major || "",
                    result: e.result || "",
                    note: e.note || "",
                })),
                experienceList: (aiData.experienceList || []).map((exp) => ({
                    time: exp.time || `${exp.startDate || ""} - ${exp.endDate || ""}`.trim(),
                    company: exp.company || "",
                    position: exp.position || "",
                    details: exp.details || exp.description || "",
                })),
                activityList: (aiData.activityList || []).map((a) => ({
                    time: a.time || "",
                    org: a.name || a.org || "",
                    role: a.role || "",
                    details: a.description || a.details || "",
                })),
                certificatesList: (aiData.certificatesList || []).map((c) => ({
                    time: c.date || c.time || "",
                    name: c.name || "",
                })),
                awardsList: (aiData.awardsList || []).map((a) => ({
                    time: a.time || "",
                    title: a.title || "",
                })),
                skillsList: (aiData.skillsList || []).map((s) => ({
                    name: s.name || "",
                    description: s.description || "",
                })),
                projectsList: (aiData.projectsList || []).map((p) => ({
                    name: p.name || "",
                    description: p.description || "",
                    technologies: p.technologies || [],
                })),
            };

            setFormData((prev) => ({
                ...prev,
                ...transformed,
            }));

            console.log("✅ formData after set:", transformed);
        } catch (err) {
            console.error("❌ AI error:", err);
            notify.error(err.message || "Không tạo được nội dung AI");
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        console.log("📄 Dữ liệu đang render ra CV:", formData);
    }, [formData]);

    // const handleExportPDF = async () => {
    //     if (!cvRef.current) return;

    //     setIsExporting(true);

    //     // ⏳ Đợi 1 tick để React re-render với isExporting = true
    //     await new Promise((resolve) => setTimeout(resolve, 100));

    //     try {
    //         // ✅ Clone node CV (lúc này đã là <div>, không còn <input>)
    //         const exportNode = cvRef.current.cloneNode(true);

    //         const wrapper = document.createElement("div");
    //         wrapper.style.width = "794px"; // A4
    //         wrapper.style.padding = "20px";
    //         wrapper.style.background = "#fff";
    //         wrapper.style.overflow = "visible";
    //         wrapper.style.fontSize = "14px";
    //         wrapper.style.lineHeight = "1.5";
    //         wrapper.appendChild(exportNode);
    //         document.body.appendChild(wrapper);

    //         const canvas = await html2canvas(wrapper, {
    //             scale: 2,
    //             useCORS: true,
    //             backgroundColor: "#fff",
    //             onclone: (clonedDoc) => {
    //                 const all = clonedDoc.querySelectorAll("*");
    //                 all.forEach((el) => {
    //                     const style = el.style;
    //                     const cs = clonedDoc.defaultView.getComputedStyle(el);

    //                     const fix = (prop, fallback) => {
    //                         const v = cs[prop];
    //                         if (v && v.includes("oklch")) {
    //                             style[prop] = fallback;
    //                         }
    //                     };
    //                     fix("backgroundColor", "#ffffff");
    //                     fix("color", "#111827");
    //                     fix("borderColor", "#e5e7eb");

    //                     style.wordBreak = "break-word";
    //                     style.overflowWrap = "break-word";
    //                     style.whiteSpace = "pre-wrap";
    //                     // Prevent templates that apply wide letter/word spacing from
    //                     // producing spaced-out characters in extracted text.
    //                     style.letterSpacing = cs.letterSpacing && cs.letterSpacing !== 'normal' ? 'normal' : (style.letterSpacing || 'normal');
    //                     style.wordSpacing = cs.wordSpacing && cs.wordSpacing !== 'normal' ? 'normal' : (style.wordSpacing || 'normal');
    //                     style.lineHeight = cs.lineHeight || "1.5";
    //                     style.fontSize = cs.fontSize || "14px";
    //                 });
    //             },
    //         });

    //         // Capture plain-text representation so server (and AI) can read the content
    //         // and save it as a .txt sidecar next to the PDF (server supports req.body.text)
    //         const plainText = wrapper.innerText || '';

    //         document.body.removeChild(wrapper);

    //         // ✅ Xuất PDF chuẩn A4
    //         const pdf = new jsPDF("p", "mm", "a4");
    //         const pageWidth = pdf.internal.pageSize.getWidth();
    //         const pageHeight = pdf.internal.pageSize.getHeight();

    //         const imgWidth = pageWidth;
    //         const imgHeight = (canvas.height * imgWidth) / canvas.width;

    //         let y = 0;
    //         while (y < canvas.height) {
    //             const pageCanvas = document.createElement("canvas");
    //             pageCanvas.width = canvas.width;
    //             pageCanvas.height = Math.min(
    //                 canvas.height - y,
    //                 (canvas.width * pageHeight) / pageWidth
    //             );

    //             const ctx = pageCanvas.getContext("2d");
    //             ctx.drawImage(
    //                 canvas,
    //                 0,
    //                 y,
    //                 canvas.width,
    //                 pageCanvas.height,
    //                 0,
    //                 0,
    //                 canvas.width,
    //                 pageCanvas.height
    //             );

    //             const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
    //             const pageImgHeight = (pageCanvas.height * imgWidth) / canvas.width;

    //             if (y > 0) pdf.addPage();
    //             pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, pageImgHeight);

    //             y += pageCanvas.height;
    //         }

    //         const fileName = `${formData.fullName || "CV"} - ${formData.appliedPosition || "UngTuyen"}.pdf`;
    //         // Save the visual (image) PDF for the user
    //         pdf.save(fileName);

    //         // Normalize plain text to remove extra spaces/letter spacing that come from
    //         // the template rendering (avoids outputs like "A n g   V i n h").
    //         const normalizePlainText = (text) => {
    //             if (!text) return '';
    //             // Normalize line endings and trim
    //             let t = text.replace(/\r/g, '').trim();

    //             // Collapse multiple spaces into one (preserve newlines for readability)
    //             t = t.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n');

    //             // Fix sequences of single-letter tokens (e.g. "A n g V i n h") into words.
    //             // Heuristic: if there are consecutive single-character letter tokens, join them.
    //             try {
    //                 const letterRe = /\p{L}/u;
    //                 t = t.split('\n').map(line => {
    //                     const tokens = line.split(' ');
    //                     const out = [];
    //                     let acc = [];
    //                     for (const tok of tokens) {
    //                         if (tok.length === 1 && letterRe.test(tok)) {
    //                             acc.push(tok);
    //                         } else {
    //                             if (acc.length > 0) {
    //                                 out.push(acc.join(''));
    //                                 acc = [];
    //                             }
    //                             out.push(tok);
    //                         }
    //                     }
    //                     if (acc.length > 0) out.push(acc.join(''));
    //                     return out.join(' ');
    //                 }).join('\n');
    //             } catch (e) {
    //                 // If Unicode property escapes not supported, fallback to simpler collapse
    //                 t = t.replace(/(\b\w\b\s?){2,}/g, s => s.replace(/\s/g, ''));
    //             }

    //             return t;
    //         };

    //         const normalizedText = normalizePlainText(plainText);

    //         // Upload the visual PDF (so user gets the same visual layout) and send
    //         // normalized plain text as `text` so the server saves a .txt sidecar.
    //         try {
    //             // Get PDF blob (visual)
    //             let pdfBlob = pdf.output('blob');
    //             // Ensure proper mimetype
    //             try {
    //                 pdfBlob = new Blob([pdfBlob], { type: 'application/pdf' });
    //             } catch (e) {
    //                 // ignore, use existing blob
    //             }

    //             const formDataUpload = new FormData();
    //             formDataUpload.append('cv', pdfBlob, fileName);
    //             formDataUpload.append('text', normalizedText);

    //             await cvsAPI.uploadCV(formDataUpload, { headers: { 'Content-Type': 'multipart/form-data' } });
    //             notify.success('Đã lưu CV vào hệ thống');
    //             window.dispatchEvent(new Event('cv-updated'));
    //         } catch (err) {
    //             console.error('Upload error (visual PDF + text sidecar):', err);
    //             console.error('Response data:', err?.response?.data);
    //             const msg = err?.response?.data?.message || 'Lưu CV thất bại!';
    //             notify.error(msg);
    //         }
    //     } catch (err) {
    //         console.error("❌ Export PDF error:", err);
    //     } finally {
    //         setIsExporting(false); // reset lại preview
    //     }
    // };
    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const doc = <ClassicOnePDF data={formData} />; // truyền dữ liệu vào template PDF
            const blob = await pdf(doc).toBlob();

            const fileName = `${formData.fullName || "CV"} - ${formData.appliedPosition || "UngTuyen"}.pdf`;

            // Tải về máy người dùng
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();

            // Upload server: gửi blob + text
            const formDataUpload = new FormData();
            formDataUpload.append("cv", blob, fileName);

            // Lấy text thô từ formData (server vẫn lưu sidecar)
            const plainText = Object.entries(formData)
                .map(([k, v]) => (typeof v === "string" ? v : ""))
                .filter(Boolean)
                .join("\n");

            formDataUpload.append("text", plainText);

            await cvsAPI.uploadCV(formDataUpload, { headers: { "Content-Type": "multipart/form-data" } });
            notify.success("Đã lưu CV vào hệ thống");
            window.dispatchEvent(new Event("cv-updated"));
        } catch (err) {
            console.error("❌ Export PDF error:", err);
            notify.error("Lỗi khi xuất hoặc lưu CV");
        } finally {
            setIsExporting(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-12 py-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
                ✍️ Tạo CV với sự trợ giúp của AI
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* ================= Bên trái: Form nhập AI ================= */}
                <div
                    className={`w-full lg:w-[400px] shrink-0 ${isExporting ? "hidden" : ""}`}
                >
                    <div className="lg:sticky lg:top-6">
                        <h2 className="text-lg font-semibold mb-4 text-blue-700">
                            🧠 Thông tin cơ bản
                        </h2>
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg space-y-4">
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Họ tên"
                                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onChange={(e) =>
                                    setFormData({ ...formData, fullName: e.target.value })
                                }
                                value={formData.fullName}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                value={formData.email}
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Số điện thoại"
                                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                value={formData.phone}
                            />
                            <input
                                type="text"
                                name="jobTitle"
                                placeholder="Vị trí ứng tuyển"
                                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onChange={handleInputChange}
                                value={formInput.jobTitle}
                            />
                            <input
                                type="text"
                                name="experience"
                                placeholder="Số năm kinh nghiệm (VD: 3 năm)"
                                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onChange={handleInputChange}
                                value={formInput.experience}
                            />
                            <input
                                type="text"
                                name="skills"
                                placeholder="Kỹ năng (cách nhau bằng dấu phẩy)"
                                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onChange={handleInputChange}
                                value={formInput.skills}
                            />

                            <button
                                onClick={generateAIContent}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg shadow-md hover:shadow-xl transition"
                                disabled={isGenerating}
                            >
                                {isGenerating ? "⏳ Đang tạo nội dung..." : "⚡ Tạo nội dung bằng AI"}
                            </button>

                            <button
                                onClick={handleExportPDF}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg shadow-md hover:shadow-xl transition"
                                disabled={isExporting}
                            >
                                {isExporting ? "⏳ Đang xuất PDF..." : "📄 Xuất PDF"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= Bên phải: CV Preview ================= */}
                <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-4 text-blue-700">
                        👀 Xem trước & chỉnh sửa CV
                    </h2>
                    <div className="border rounded-xl shadow bg-white p-6 overflow-x-auto">
                        <div
                            ref={cvRef}
                            id="cv-export-root"
                            style={{
                                width: "auto",
                                backgroundColor: "#fff",
                                margin: "0 auto",
                                height: "auto",
                            }}
                        >
                            <CVPreview
                                data={formData}
                                templateStyle={selectedTemplate?.style}
                                isExporting={isExporting} // ✅ Quan trọng
                                isFormMode={!isExporting} // ✅ Tắt input khi export
                                onChange={(field, value) =>
                                    setFormData((prev) => ({ ...prev, [field]: value }))
                                }
                                onAddList={handleAddList}
                                onAvatarChange={(file) => {
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData((prev) => ({ ...prev, avatar: reader.result })); // Base64
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateCV;
