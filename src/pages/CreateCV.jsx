
import React, { useState, useRef } from 'react';
import CVPreview from '../components/CVPreview';
import cvTemplates from '../components/cvTemplates';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cvsAPI } from '../services/api';
import notify from '../utils/notify';

import { FaPenFancy } from "react-icons/fa";
import { suggestCVSummary } from "../services/gemini";


const defaultFormData = {
    fullName: '',
    appliedPosition: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    summary: '',
    avatar: '', // data URL for avatar image
    educationList: [
        { time: '', school: '', major: '', result: '', note: '' }
    ],
    experienceList: [
        { time: '', company: '', position: '', details: '' }
    ],
    activityList: [
        { time: '', org: '', role: '', details: '' }
    ],
    certificatesList: [
        { time: '', name: '' }
    ],
    awardsList: [
        { time: '', title: '' }
    ],
    skillsList: [
        { name: '', description: '' }
    ],
    projectsList: [
        { time: '', name: '', role: '', details: '' }
    ]
};

const CreateCV = () => {
    const [formData, setFormData] = useState(defaultFormData);
    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const cvRef = useRef();

    //AI
    const handleSuggestSummary = async () => {
        // Kiểm tra xem có đủ dữ liệu hay không
        const { fullName, appliedPosition, skillsList, experienceList } = formData;

        const hasEnoughData = fullName || appliedPosition ||
            (skillsList?.some(skill => skill.name)) ||
            (experienceList?.some(exp => exp.details));

        if (!hasEnoughData) {
            notify.error("Vui lòng điền ít nhất họ tên, vị trí ứng tuyển, kỹ năng hoặc kinh nghiệm để AI có thể gợi ý.");
            return;
        }

        try {
            const suggestion = await suggestCVSummary(formData);
            setFormData(prev => ({ ...prev, summary: suggestion }));
            notify.success("Đã gợi ý mục tiêu nghề nghiệp!");
        } catch (err) {
            if (err.response) {
                console.error("❌ Chi tiết lỗi Gemini:", JSON.stringify(err.response.data, null, 2));
            } else {
                console.error("❌ Lỗi không rõ:", err.message);
            }
            notify.error("Gợi ý thất bại. Vui lòng kiểm tra kết nối hoặc thử lại sau.");
        }


    };




    const handleChange = (e) => {
        if (e.nativeEvent?.isComposing) return;
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleListChange = (listName, idx, field, value) => {
        setFormData(prev => {
            const newList = prev[listName].map((item, i) => (i === idx ? { ...item, [field]: value } : item));
            return { ...prev, [listName]: newList };
        });
    };

    const handleAddList = (listName, emptyObj) => {
        setFormData(prev => ({ ...prev, [listName]: [...prev[listName], emptyObj] }));
    };

    const handleRemoveList = (listName, idx) => {
        setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== idx) }));
    };

    // Avatar upload -> data URL for reliable html2canvas rendering
    const handleAvatarChange = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
    };


    // Xuất PDF từ vùng CV
    const [isExporting, setIsExporting] = useState(false);
    const handleExportPDF = async () => {
        if (!cvRef.current) return;
        setIsExporting(true);
        await new Promise(r => setTimeout(r, 100)); // Đợi CVPreview render lại
        const cvNode = cvRef.current;
        window.scrollTo(0, 0);
        const prevWidth = cvNode.style.width;
        cvNode.style.width = '794px';
        // Giảm scale để giảm dung lượng, dùng JPEG thay vì PNG
        const canvas = await html2canvas(cvNode, { scale: 1.5, useCORS: true, backgroundColor: '#fff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.7); // quality 0.7
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pageWidth;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        // Tải về máy
        pdf.save('cv.pdf');
        // Upload lên server
        const pdfBlob = pdf.output('blob');
        const formData = new FormData();
        formData.append('cv', pdfBlob, 'cv.pdf');
        try {
            await cvsAPI.uploadCV(formData);
            // Có thể thông báo thành công hoặc reload danh sách CV
        } catch (err) {
            notify.error('Lưu CV lên hệ thống thất bại!');
        }
        cvNode.style.width = prevWidth;
        setIsExporting(false);
    };

    const handleTemplateSelect = (tpl) => {
        setSelectedTemplate(tpl);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-primary-600">Tạo CV của bạn</h2>
            {step === 1 && (
                <>
                    <p className="mb-4">Chọn mẫu CV phù hợp với bạn:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {cvTemplates.map((tpl) => (
                            <div
                                key={tpl.id}
                                className={`border rounded-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-200 flex flex-col items-center ${selectedTemplate?.id === tpl.id ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-200'}`}
                                onClick={() => handleTemplateSelect(tpl)}
                            >
                                <img src={tpl.preview} alt={tpl.name} className="w-full h-40 object-cover mb-2 rounded shadow" />
                                <div className="text-center font-semibold text-base mb-1">{tpl.name}</div>
                                <div className="text-xs text-gray-500 text-center">{tpl.description}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {step === 2 && (
                <form onSubmit={e => { e.preventDefault(); handleExportPDF(); }}>
                    <button type="button" onClick={handleBack} className="text-primary-600 underline mb-2">← Chọn lại mẫu</button>
                    <button
                        type="button"
                        onClick={handleSuggestSummary}
                        className="flex items-center gap-2 text-sm text-primary-600 underline mt-4 mb-2"
                    >
                        <FaPenFancy className="text-primary-600" /> Gợi ý mục tiêu nghề nghiệp bằng AI
                    </button>

                    <div
                        ref={cvRef}
                        style={{
                            width: 794,
                            minHeight: 1123,
                            background: '#fff',
                            fontFamily: 'Arial, Segoe UI, sans-serif',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                            letterSpacing: 0,
                        }}
                        className="mx-auto"
                    >
                        <CVPreview
                            data={formData}
                            onChange={handleChange}
                            onListChange={handleListChange}
                            onAddList={handleAddList}
                            onRemoveList={handleRemoveList}
                            onAvatarChange={handleAvatarChange}
                            templateStyle={selectedTemplate?.style}
                            isExporting={isExporting}
                        />
                    </div>
                    <button type="submit" className="mt-4 px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Lưu và xuất PDF</button>
                </form>
            )}
        </div>
    );
};

export default CreateCV;

