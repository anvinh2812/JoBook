import React from 'react';

const Section = ({ title, children }) => (
    <section className="mb-6">
        <div className="uppercase font-bold text-base border-b-2 border-gray-400 pb-1 mb-2 tracking-wide">{title}</div>
        {children}
    </section>
);

const Box = ({ children }) => (
    <div className="bg-gray-50 border border-gray-300 rounded p-3 mb-3">
        {children}
    </div>
);


const CVPreview = ({ data, onChange, onListChange, onAddList, onRemoveList, templateStyle, isExporting, onAvatarChange }) => {
    // ATS-friendly: 1 cột, tối giản, không icon/màu đậm, font hệ thống
    if (templateStyle === 'ats') {
        return (
            <div className="bg-white w-full max-w-[820px] mx-auto p-8 border border-gray-300" style={{ fontFamily: 'Arial, Calibri, Helvetica, sans-serif', fontSize: '14px', color: '#111' }}>
                <div className="mb-4">
                    <div className="text-2xl font-bold tracking-tight">
                        {isExporting ? (data.fullName || 'Họ và tên') : (
                            <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full border-b border-gray-400 focus:border-gray-700 outline-none bg-transparent font-bold text-2xl" />
                        )}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                        {isExporting ? (
                            <span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>
                        ) : (
                            <div className="flex gap-4 items-center">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-gray-400 focus:border-gray-700" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-gray-400 focus:border-gray-700" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="border-t border-gray-400 my-3" />
                <Section title="Tóm tắt">
                    {isExporting ? (
                        <div className="whitespace-pre-line text-[13.5px]">{data.summary}</div>
                    ) : (
                        <textarea name="summary" value={data.summary} onChange={onChange} rows={4} placeholder="Tóm tắt hồ sơ phù hợp ATS (không dùng icon/ký tự đặc biệt)" className="w-full border-b border-gray-400 focus:border-gray-700 outline-none text-[13.5px]" />
                    )}
                </Section>
                <Section title="Kinh nghiệm làm việc">
                    {data.experienceList?.map((exp, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (
                                    <>
                                        <span className="w-1/3 inline-block text-gray-700">{exp.time}</span>
                                        <span className="w-2/3 inline-block text-right">{exp.company}</span>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="w-1/3 outline-none border-b border-gray-400 focus:border-gray-700" />
                                        <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="w-2/3 text-right outline-none border-b border-gray-400 focus:border-gray-700" />
                                    </>
                                )}
                            </div>
                            {isExporting ? (
                                <>
                                    <div className="font-bold">{exp.position}</div>
                                    <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul>
                                </>
                            ) : (
                                <>
                                    <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="w-full outline-none border-b border-gray-400 focus:border-gray-700 font-bold mt-1" />
                                    <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (
                                        <li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-400 focus:border-gray-700" /></li>
                                    ))}
                                        <li><button type="button" className="text-xs text-gray-800 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                    </ul>
                                </>
                            )}
                            {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                </Section>
                <Section title="Học vấn">
                    {data.educationList?.map((edu, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (
                                    <>
                                        <span className="w-1/3 inline-block text-gray-700">{edu.time}</span>
                                        <span className="w-2/3 inline-block text-right">{edu.school}</span>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="w-1/3 outline-none border-b border-gray-400 focus:border-gray-700" />
                                        <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="w-2/3 text-right outline-none border-b border-gray-400 focus:border-gray-700" />
                                    </>
                                )}
                            </div>
                            {isExporting ? (
                                <>
                                    <div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div>
                                </>
                            ) : (
                                <>
                                    <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="w-full outline-none border-b border-gray-400 focus:border-gray-700 mt-1" />
                                    <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="w-full outline-none border-b border-gray-400 focus:border-gray-700 mt-1" />
                                    <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="w-full outline-none border-b border-gray-400 focus:border-gray-700 mt-1" />
                                </>
                            )}
                            {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                </Section>
                <Section title="Hoạt động">
                    {data.activityList?.map((act, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (
                                    <>
                                        <span className="w-1/3 inline-block text-gray-700">{act.time}</span>
                                        <span className="w-2/3 inline-block text-right">{act.org}</span>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="08/2016 - 08/2018" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} className="w-1/3 outline-none border-b border-gray-400 focus:border-gray-700" />
                                        <input type="text" placeholder="Tên tổ chức..." value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} className="w-2/3 text-right outline-none border-b border-gray-400 focus:border-gray-700" />
                                    </>
                                )}
                            </div>
                            {isExporting ? (
                                <>
                                    <div className="font-bold">{act.role}</div>
                                    <ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul>
                                </>
                            ) : (
                                <>
                                    <input type="text" placeholder="Vai trò" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} className="w-full outline-none border-b border-gray-400 focus:border-gray-700 font-bold mt-1" />
                                    <ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((line, i) => (
                                        <li key={i}><input type="text" value={line} onChange={e => { const lines = (act.details || '').split('\n'); lines[i] = e.target.value; onListChange('activityList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-400 focus:border-gray-700" /></li>
                                    ))}
                                        <li><button type="button" className="text-xs text-gray-800 underline" onClick={() => onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                    </ul>
                                </>
                            )}
                            {data.activityList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                </Section>
            </div>
        );
    }
    // Mẫu mới: Hiện đại (theo ảnh: header tên viền đỏ nét đứt, ô liên hệ viền đứt, tiêu đề đỏ + gạch xám, mục 2 cột)
    if (templateStyle === 'hienDai') {
        const accent = '#d66a6a';
        const listChange = (listName, idx, field) => (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onListChange(listName, idx, field, e.target.value);
        };
        const safeChange = (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onChange?.(e);
        };
        const CornerFrame = ({ children }) => (
            <div className="relative w-[180px] h-[180px] border border-gray-300 rounded bg-white">
                {/* corner marks */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-gray-400" />
                    <div className="absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-gray-400" />
                    <div className="absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-gray-400" />
                    <div className="absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-gray-400" />
                </div>
                {children}
            </div>
        );
        const Avatar = () => (
            <div className="relative w-[200px]">
                <CornerFrame>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                            {data.avatar ? (
                                <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl">👤</div>
                            )}
                        </div>
                    </div>
                </CornerFrame>
                {!isExporting && (
                    <label className="absolute left-4 bottom-2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer">
                        Sửa ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarChange?.(e.target.files?.[0])} />
                    </label>
                )}
            </div>
        );
        const SectionTitle = ({ children }) => (
            <div className="mt-4">
                <div className="text-[18px] font-semibold" style={{ color: accent }}>{children}</div>
                <div className="border-t border-gray-300 mt-1" />
            </div>
        );
        const LabeledTwoCol = ({ leftTop, leftBottom, rightTop, rightBottom }) => (
            <div className="grid grid-cols-2 gap-10 text-sm mt-3">
                <div>
                    <div className="italic text-rose-400">{leftTop}</div>
                    <div className="text-gray-600">{leftBottom}</div>
                </div>
                <div>
                    <div className="font-medium text-gray-800">{rightTop}</div>
                    <div className="text-gray-600">{rightBottom}</div>
                </div>
            </div>
        );
        const ContactCard = ({ icon, name, placeholder, type = 'text', value }) => (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center text-black text-[14px]">{icon}</div>
                {isExporting ? (
                    <div className="flex-1 border border-rose-300 border-dashed rounded px-3 py-1 italic break-all">{value || placeholder}</div>
                ) : (
                    <input type={type} name={name} value={value} onChange={safeChange} placeholder={placeholder} className="flex-1 bg-transparent outline-none border border-rose-300 border-dashed focus:border-rose-500 rounded px-3 py-1 italic" />
                )}
            </div>
        );
        return (
            <div className="bg-white w-full max-w-[980px] mx-auto p-6" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                {/* Header */}
                <div className="grid grid-cols-[220px_1fr] gap-4 items-start">
                    <Avatar />
                    <div className="min-w-0">
                        <div className="flex items-baseline justify-between gap-4">
                            <div className="border border-rose-400 border-dashed rounded px-3 py-1">
                                {isExporting ? (
                                    <div className="italic text-2xl font-semibold text-rose-400">{data.fullName || 'Họ Tên'}</div>
                                ) : (
                                    <input type="text" name="fullName" value={data.fullName} onChange={safeChange} placeholder="Họ Tên" className="bg-transparent outline-none italic text-2xl font-semibold text-rose-500" />
                                )}
                            </div>
                            <div className="italic text-gray-500">
                                {isExporting ? (data.appliedPosition || 'Vị trí ứng tuyển') : (
                                    <input type="text" name="appliedPosition" value={data.appliedPosition} onChange={safeChange} placeholder="Vị trí ứng tuyển" className="bg-transparent outline-none italic" />
                                )}
                            </div>
                        </div>
                        <div className="mt-2 border-t border-gray-300" />

                        {/* Contacts 2 columns */}
                        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                            <ContactCard icon="🗓️" name="dob" value={data.dob} placeholder="DD/MM/YY" />
                            <ContactCard icon="👤" name="gender" value={data.gender} placeholder="Nam/Nữ" />
                            <ContactCard icon="📞" name="phone" value={data.phone} placeholder="0123 456 789" />
                            <ContactCard icon="✉️" type="email" name="email" value={data.email} placeholder="tencuaban@example.com" />
                            <ContactCard icon="📍" name="address" value={data.address} placeholder="Quận A, thành phố Hà Nội" />
                            <ContactCard icon="🔗" name="website" value={data.website} placeholder="facebook.com/TopCV.vn" />
                        </div>
                    </div>
                </div>

                {/* Body sections */}
                <SectionTitle>Mục tiêu nghề nghiệp</SectionTitle>
                <div className="text-sm text-gray-700 mt-2">
                    {isExporting ? (
                        <div className="whitespace-pre-wrap">{data.summary || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn'}</div>
                    ) : (
                        <input type="text" name="summary" value={data.summary} onChange={safeChange} placeholder="Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                    )}
                </div>

                <SectionTitle>Học vấn</SectionTitle>
                <div>
                    {(data.educationList || []).map((edu, idx) => (
                        <LabeledTwoCol
                            key={idx}
                            leftTop={isExporting ? (edu.major || 'Ngành học / Môn học') : (
                                <input value={edu.major || ''} onChange={listChange('educationList', idx, 'major')} placeholder="Ngành học / Môn học" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 italic text-rose-400" />
                            )}
                            leftBottom={isExporting ? (edu.time || 'Bắt đầu  -  Kết thúc') : (
                                <input value={edu.time || ''} onChange={listChange('educationList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />
                            )}
                            rightTop={isExporting ? (edu.school || 'Tên trường học') : (
                                <input value={edu.school || ''} onChange={listChange('educationList', idx, 'school')} placeholder="Tên trường học" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 font-medium" />
                            )}
                            rightBottom={isExporting ? (edu.result || edu.note || 'Mô tả quá trình học tập hoặc thành tích của bạn') : (
                                <input value={edu.result || ''} onChange={listChange('educationList', idx, 'result')} placeholder="Mô tả quá trình học tập hoặc thành tích của bạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                            )}
                        />
                    ))}
                    {!isExporting && (
                        <button type="button" className="text-xs underline mt-2" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>
                    )}
                </div>

                <SectionTitle>Kinh nghiệm làm việc</SectionTitle>
                <div>
                    {(data.experienceList || []).map((exp, idx) => (
                        <LabeledTwoCol
                            key={idx}
                            leftTop={isExporting ? (exp.position || 'Vị trí công việc') : (
                                <input value={exp.position || ''} onChange={listChange('experienceList', idx, 'position')} placeholder="Vị trí công việc" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 italic text-rose-400" />
                            )}
                            leftBottom={isExporting ? (exp.time || 'Bắt đầu  -  Kết thúc') : (
                                <input value={exp.time || ''} onChange={listChange('experienceList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />
                            )}
                            rightTop={isExporting ? (exp.company || 'Tên công ty') : (
                                <input value={exp.company || ''} onChange={listChange('experienceList', idx, 'company')} placeholder="Tên công ty" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 font-medium" />
                            )}
                            rightBottom={isExporting ? (exp.details || 'Mô tả kinh nghiệm làm việc của bạn') : (
                                <input value={exp.details || ''} onChange={listChange('experienceList', idx, 'details')} placeholder="Mô tả kinh nghiệm làm việc của bạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                            )}
                        />
                    ))}
                    {!isExporting && (
                        <button type="button" className="text-xs underline mt-2" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>
                    )}
                </div>

                <SectionTitle>Hoạt động</SectionTitle>
                <div>
                    {(data.activityList || []).map((act, idx) => (
                        <LabeledTwoCol
                            key={idx}
                            leftTop={isExporting ? (act.role || 'Vị trí của bạn') : (
                                <input value={act.role || ''} onChange={listChange('activityList', idx, 'role')} placeholder="Vị trí của bạn" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 italic text-rose-400" />
                            )}
                            leftBottom={isExporting ? (act.time || 'Bắt đầu  -  Kết thúc') : (
                                <input value={act.time || ''} onChange={listChange('activityList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />
                            )}
                            rightTop={isExporting ? (act.org || 'Tên tổ chức') : (
                                <input value={act.org || ''} onChange={listChange('activityList', idx, 'org')} placeholder="Tên tổ chức" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 font-medium" />
                            )}
                            rightBottom={isExporting ? (act.details || 'Mô tả hoạt động') : (
                                <input value={act.details || ''} onChange={listChange('activityList', idx, 'details')} placeholder="Mô tả hoạt động" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                            )}
                        />
                    ))}
                    {!isExporting && (
                        <button type="button" className="text-xs underline mt-2" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>
                    )}
                </div>

                {/* Bottom two columns: Skills & Certificates */}
                <div className="grid grid-cols-2 gap-10">
                    <div>
                        <SectionTitle>Kỹ năng</SectionTitle>
                        <div className="mt-2 space-y-3">
                            {(data.skillsList || []).map((s, idx) => (
                                <div key={idx}>
                                    {isExporting ? (
                                        <div className="text-sm text-gray-800">{s.name || 'Tên kỹ năng'}</div>
                                    ) : (
                                        <input value={s.name || ''} onChange={listChange('skillsList', idx, 'name')} placeholder="Tên kỹ năng" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />
                                    )}
                                    <div className="mt-1 h-2 bg-gray-200 rounded" />
                                </div>
                            ))}
                            {!isExporting && (
                                <button type="button" className="text-xs underline" onClick={() => onAddList('skillsList', { name: '', description: '' })}>+ Thêm kỹ năng</button>
                            )}
                        </div>
                    </div>
                    <div>
                        <SectionTitle>Chứng chỉ</SectionTitle>
                        <div className="mt-2 space-y-3 text-sm">
                            {(data.certificatesList || []).map((c, idx) => (
                                <div key={idx}>
                                    {isExporting ? (
                                        <div className="font-medium text-gray-800">{c.name || 'Tên chứng chỉ'}</div>
                                    ) : (
                                        <input value={c.name || ''} onChange={listChange('certificatesList', idx, 'name')} placeholder="Tên chứng chỉ" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 font-medium" />
                                    )}
                                    <div className="text-gray-600 italic mt-0.5">
                                        {isExporting ? (c.time || 'Thời gian') : (
                                            <input value={c.time || ''} onChange={listChange('certificatesList', idx, 'time')} placeholder="Thời gian" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 italic" />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {!isExporting && (
                                <button type="button" className="text-xs underline" onClick={() => onAddList('certificatesList', { time: '', name: '' })}>+ Thêm chứng chỉ</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // Mẫu mới: Cao cấp (theo ảnh với header tối và rail trái có icon/điểm)
    if (templateStyle === 'caoCap') {
        const listChange = (listName, idx, field) => (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onListChange(listName, idx, field, e.target.value);
        };
        const safeChange = (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onChange?.(e);
        };
        const Header = () => (
            <div className="bg-gray-900 text-white rounded-t border-b border-gray-800">
                <div className="grid grid-cols-[150px_1fr] gap-4 items-center p-4">
                    {/* Avatar + Sửa ảnh */}
                    <div className="relative flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 bg-gray-700">
                            {data.avatar ? (
                                <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                            )}
                        </div>
                        {!isExporting && (
                            <label className="absolute bottom-0 translate-y-1/2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer">
                                Sửa ảnh
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarChange?.(e.target.files?.[0])} />
                            </label>
                        )}
                    </div>
                    {/* Name + contacts */}
                    <div className="min-w-0">
                        <div className="italic text-2xl font-semibold">
                            {isExporting ? (data.fullName || 'Họ Tên') : (
                                <input type="text" name="fullName" value={data.fullName} onChange={safeChange} placeholder="Họ Tên" className="w-full bg-transparent outline-none border-b border-white/30 focus:border-white italic text-2xl font-semibold" />
                            )}
                        </div>
                        <div className="italic text-white/80">
                            {isExporting ? (data.appliedPosition || 'Vị trí ứng tuyển') : (
                                <input type="text" name="appliedPosition" value={data.appliedPosition} onChange={safeChange} placeholder="Vị trí ứng tuyển" className="w-full bg-transparent outline-none border-b border-white/20 focus:border-white italic" />
                            )}
                        </div>
                        <div className="mt-2 text-sm flex flex-wrap gap-x-3 gap-y-1 items-center text-white/90">
                            {isExporting ? (
                                <>
                                    <span>{data.phone || '0123 456 789'}</span>
                                    <span className="opacity-70">•</span>
                                    <span className="break-all">{data.email || 'tencuaban@example.com'}</span>
                                    <span className="opacity-70">•</span>
                                    <span className="break-all">{data.website || 'facebook.com/TopCV.vn'}</span>
                                    <span className="opacity-70">•</span>
                                    <span>{data.address || 'Quận A, thành phố Hà Nội'}</span>
                                    <span className="opacity-70">•</span>
                                    <span>{data.dob || 'DD/MM/YY'}</span>
                                </>
                            ) : (
                                <>
                                    <input type="text" name="phone" value={data.phone} onChange={safeChange} placeholder="0123 456 789" className="bg-transparent outline-none border-b border-white/20 focus:border-white" />
                                    <span className="opacity-70">•</span>
                                    <input type="email" name="email" value={data.email} onChange={safeChange} placeholder="tencuaban@example.com" className="bg-transparent outline-none border-b border-white/20 focus:border-white" />
                                    <span className="opacity-70">•</span>
                                    <input type="text" name="website" value={data.website} onChange={safeChange} placeholder="facebook.com/TopCV.vn" className="bg-transparent outline-none border-b border-white/20 focus:border-white" />
                                    <span className="opacity-70">•</span>
                                    <input type="text" name="address" value={data.address} onChange={safeChange} placeholder="Quận A, thành phố Hà Nội" className="bg-transparent outline-none border-b border-white/20 focus:border-white" />
                                    <span className="opacity-70">•</span>
                                    <input type="text" name="dob" value={data.dob} onChange={safeChange} placeholder="DD/MM/YY" className="bg-transparent outline-none border-b border-white/20 focus:border-white w-20" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
        const SectionRail = ({ icon, title, children }) => (
            <section className="relative pl-12">
                {/* vertical line (global) handled by container; here: node/dot */}
                <div className="absolute left-4 top-2 w-3 h-3 rounded-full bg-white border-2 border-gray-900" />
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded bg-white border border-gray-900 flex items-center justify-center text-[12px] text-gray-900">
                        {icon}
                    </div>
                    <div className="font-semibold text-gray-900">{title}</div>
                </div>
                <div className="mb-3">{children}</div>
            </section>
        );
        const Row = ({ left, right }) => (
            <div className="flex items-baseline justify-between gap-4">
                <div className="flex-1 text-gray-800">{left}</div>
                <div className="w-40 text-right italic text-gray-600">{right}</div>
            </div>
        );
        return (
            <div className="bg-white w-full max-w-[980px] mx-auto border border-gray-300 rounded overflow-hidden" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <Header />
                {/* Content with left rail */}
                <div className="relative p-6">
                    <div className="absolute left-6 top-0 bottom-0 border-l-2 border-gray-900" />

                    <SectionRail icon="📝" title="Mục tiêu nghề nghiệp">
                        {isExporting ? (
                            <div className="text-gray-700 italic">{data.summary || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn'}</div>
                        ) : (
                            <input type="text" name="summary" value={data.summary} onChange={safeChange} placeholder="Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 italic" />
                        )}
                        <div className="mt-2 border-t border-gray-300" />
                    </SectionRail>

                    <SectionRail icon="🎓" title="Học vấn">
                        <div className="space-y-3">
                            {(data.educationList || []).map((edu, idx) => (
                                <div key={idx} className="pb-2 border-b border-gray-200">
                                    <Row
                                        left={isExporting ? (edu.school || 'Tên trường học') : (
                                            <input value={edu.school || ''} onChange={listChange('educationList', idx, 'school')} placeholder="Tên trường học" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                        )}
                                        right={isExporting ? (edu.time || 'Bắt đầu  -  Kết thúc') : (
                                            <input value={edu.time || ''} onChange={listChange('educationList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-40 bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-right italic" />
                                        )}
                                    />
                                    <div className="mt-1 text-gray-700 italic">
                                        {isExporting ? (edu.major || 'Ngành học / Môn học') : (
                                            <input value={edu.major || ''} onChange={listChange('educationList', idx, 'major')} placeholder="Ngành học / Môn học" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 italic" />
                                        )}
                                    </div>
                                    <div className="mt-1 text-gray-500">
                                        {isExporting ? (edu.result || edu.note || 'Mô tả quá trình học hoặc thành tích của bạn') : (
                                            <input value={edu.result || ''} onChange={listChange('educationList', idx, 'result')} placeholder="Mô tả quá trình học hoặc thành tích của bạn" className="w-full bg-transparent outline-none border-b border-gray-100 focus:border-gray-500" />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {!isExporting && (
                                <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>
                            )}
                        </div>
                    </SectionRail>

                    <SectionRail icon="💼" title="Kinh nghiệm làm việc">
                        <div className="space-y-3">
                            {(data.experienceList || []).map((exp, idx) => (
                                <div key={idx} className="pb-2 border-b border-gray-200">
                                    <Row
                                        left={isExporting ? (exp.company || 'Tên công ty') : (
                                            <input value={exp.company || ''} onChange={listChange('experienceList', idx, 'company')} placeholder="Tên công ty" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                        )}
                                        right={isExporting ? (exp.time || 'Bắt đầu  -  Kết thúc') : (
                                            <input value={exp.time || ''} onChange={listChange('experienceList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-40 bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-right italic" />
                                        )}
                                    />
                                    <div className="mt-1 text-gray-700 italic">
                                        {isExporting ? (exp.position || 'Vị trí công việc') : (
                                            <input value={exp.position || ''} onChange={listChange('experienceList', idx, 'position')} placeholder="Vị trí công việc" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 italic" />
                                        )}
                                    </div>
                                    <div className="mt-1 text-gray-500">
                                        {isExporting ? (exp.details || 'Mô tả kinh nghiệm làm việc của bạn') : (
                                            <input value={exp.details || ''} onChange={listChange('experienceList', idx, 'details')} placeholder="Mô tả kinh nghiệm làm việc của bạn" className="w-full bg-transparent outline-none border-b border-gray-100 focus:border-gray-500" />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {!isExporting && (
                                <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>
                            )}
                        </div>
                    </SectionRail>

                    <SectionRail icon="🛠️" title="Kỹ năng">
                        <div className="space-y-2">
                            {(data.skillsList || []).map((s, idx) => (
                                <div key={idx} className="pb-2 border-b border-gray-200">
                                    {isExporting ? (s.name || 'Tên kỹ năng') : (
                                        <input value={s.name || ''} onChange={listChange('skillsList', idx, 'name')} placeholder="Tên kỹ năng" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                    )}
                                </div>
                            ))}
                            {!isExporting && (
                                <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('skillsList', { name: '', description: '' })}>+ Thêm kỹ năng</button>
                            )}
                        </div>
                    </SectionRail>

                    <SectionRail icon="🏛️" title="Hoạt động">
                        <div className="space-y-3">
                            {(data.activityList || []).map((act, idx) => (
                                <div key={idx} className="pb-2 border-b border-gray-200">
                                    <Row
                                        left={isExporting ? (act.org || 'Tên tổ chức') : (
                                            <input value={act.org || ''} onChange={listChange('activityList', idx, 'org')} placeholder="Tên tổ chức" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                        )}
                                        right={isExporting ? (act.time || 'Bắt đầu  -  Kết thúc') : (
                                            <input value={act.time || ''} onChange={listChange('activityList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-40 bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-right italic" />
                                        )}
                                    />
                                    <div className="mt-1 text-gray-700 italic">
                                        {isExporting ? (act.role || 'Vị trí của bạn') : (
                                            <input value={act.role || ''} onChange={listChange('activityList', idx, 'role')} placeholder="Vị trí của bạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 italic" />
                                        )}
                                    </div>
                                    <div className="mt-1 text-gray-500">
                                        {isExporting ? (act.details || 'Mô tả hoạt động') : (
                                            <input value={act.details || ''} onChange={listChange('activityList', idx, 'details')} placeholder="Mô tả hoạt động" className="w-full bg-transparent outline-none border-b border-gray-100 focus:border-gray-500" />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {!isExporting && (
                                <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>
                            )}
                        </div>
                    </SectionRail>

                    <SectionRail icon="🏅" title="Danh hiệu và giải thưởng">
                        <div className="space-y-2">
                            {(data.awardsList || []).map((a, idx) => (
                                <div key={idx} className="pb-2 border-b border-gray-200">
                                    <Row
                                        left={isExporting ? (a.title || 'Tên giải thưởng') : (
                                            <input value={a.title || ''} onChange={listChange('awardsList', idx, 'title')} placeholder="Tên giải thưởng" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                        )}
                                        right={isExporting ? (a.time || 'Thời gian') : (
                                            <input value={a.time || ''} onChange={listChange('awardsList', idx, 'time')} placeholder="Thời gian" className="w-40 bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-right italic" />
                                        )}
                                    />
                                </div>
                            ))}
                            {!isExporting && (
                                <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('awardsList', { time: '', title: '' })}>+ Thêm giải thưởng</button>
                            )}
                        </div>
                    </SectionRail>
                </div>
            </div>
        );
    }
    // Mẫu mới: Chuyên nghiệp (avatar trái, 2 cột nội dung như ảnh)
    if (templateStyle === 'chuyenNghiep') {
        const listChange = (listName, idx, field) => (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onListChange(listName, idx, field, e.target.value);
        };
        const safeChange = (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onChange?.(e);
        };
        const Header = () => (
            <div className="relative overflow-hidden grid grid-cols-[130px_1fr_280px] gap-4 items-start">
                {/* soft peach background shape like screenshot */}
                <div className="absolute -top-16 right-[-120px] w-[520px] h-[520px] rounded-full bg-[#fdebe8] opacity-90 pointer-events-none z-0" />
                {/* Avatar card */}
                <div className="relative z-10">
                    <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 border border-gray-300 mx-auto">
                        {data.avatar ? (
                            <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">👤</div>
                        )}
                    </div>
                    {!isExporting && (
                        <label className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer">
                            Sửa ảnh
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarChange?.(e.target.files?.[0])} />
                        </label>
                    )}
                </div>
                {/* Name + position with dashed red borders */}
                <div className="min-w-0 relative z-10">
                    <div className="border border-red-400 border-dashed rounded px-3 py-2">
                        {isExporting ? (
                            <div className="italic text-[22px] font-semibold text-gray-800">{data.fullName || 'Họ Tên'}</div>
                        ) : (
                            <input type="text" name="fullName" value={data.fullName} onChange={safeChange} placeholder="Họ Tên" className="w-full bg-transparent outline-none italic text-[22px] font-semibold" />
                        )}
                    </div>
                    <div className="mt-2 border border-red-300 border-dashed rounded px-3 py-1">
                        {isExporting ? (
                            <div className="italic text-gray-600">{data.appliedPosition || 'Vị trí ứng tuyển'}</div>
                        ) : (
                            <input type="text" name="appliedPosition" value={data.appliedPosition} onChange={safeChange} placeholder="Vị trí ứng tuyển" className="w-full bg-transparent outline-none italic text-gray-700" />
                        )}
                    </div>
                </div>
                {/* Contacts stack */}
                <div className="grid grid-cols-1 gap-2 text-sm relative z-10">
                    {isExporting ? (
                        <>
                            <div className="border border-red-300 border-dashed rounded px-3 py-1 italic break-all">{data.address || 'Quận A, thành phố Hà Nội'}</div>
                            <div className="border border-red-300 border-dashed rounded px-3 py-1 italic break-all">{data.email || 'tencuaban@example.com'}</div>
                            <div className="border border-red-300 border-dashed rounded px-3 py-1 italic">{data.phone || '789 456 0123'}</div>
                        </>
                    ) : (
                        <>
                            <input type="text" name="address" value={data.address} onChange={safeChange} placeholder="Quận A, thành phố Hà Nội" className="bg-transparent outline-none border border-red-300 border-dashed focus:border-red-500 rounded px-3 py-1 italic" />
                            <input type="email" name="email" value={data.email} onChange={safeChange} placeholder="tencuaban@example.com" className="bg-transparent outline-none border border-red-300 border-dashed focus:border-red-500 rounded px-3 py-1 italic" />
                            <input type="text" name="phone" value={data.phone} onChange={safeChange} placeholder="789 456 0123" className="bg-transparent outline-none border border-red-300 border-dashed focus:border-red-500 rounded px-3 py-1 italic" />
                        </>
                    )}
                </div>
            </div>
        );
        const Title = ({ children }) => (
            <div className="font-semibold text-gray-900 border-b-2 border-gray-900 pb-1">{children}</div>
        );
        const TwoColRow = ({ children }) => (
            <div className="grid grid-cols-[100px_1fr] gap-4">
                <div className="text-xs text-gray-500">
                    <div>Bắt đầu</div>
                    <div className="leading-4">↓</div>
                    <div>Kết thúc</div>
                </div>
                <div className="pl-4 border-l border-gray-900">{children}</div>
            </div>
        );
        const RightPanel = () => (
            <div className="space-y-6">
                <div>
                    <Title icon="🧭">Mục tiêu nghề nghiệp</Title>
                    <div className="mt-2 text-sm text-gray-700">
                        {isExporting ? (
                            <div className="whitespace-pre-wrap">{data.summary || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn'}</div>
                        ) : (
                            <input type="text" name="summary" value={data.summary} onChange={safeChange} placeholder="Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                        )}
                    </div>
                </div>

                <div>
                    <Title icon="🛠️">Kỹ năng</Title>
                    <div className="mt-2 space-y-2">
                        {(data.skillsList || []).map((s, idx) => (
                            <div key={idx}>
                                {isExporting ? (
                                    <div className="text-sm text-gray-800">{s.name || 'Tên kỹ năng'}</div>
                                ) : (
                                    <input value={s.name || ''} onChange={listChange('skillsList', idx, 'name')} placeholder="Tên kỹ năng" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />
                                )}
                                <div className="mt-1 h-2 bg-gray-200 rounded overflow-hidden">
                                    <div className="h-2 bg-gray-400/70" style={{ width: `${Math.min(100, Math.max(0, Number(s.level ?? 70)))}%` }} />
                                </div>
                                {!isExporting && (
                                    <input type="range" min={0} max={100} value={s.level ?? 70} onChange={(e) => onListChange('skillsList', idx, 'level', e.target.value)} className="w-full" />
                                )}
                            </div>
                        ))}
                        {!isExporting && (
                            <button type="button" className="text-xs underline" onClick={() => onAddList('skillsList', { name: '', description: '', level: 70 })}>+ Thêm kỹ năng</button>
                        )}
                    </div>
                </div>

                <div>
                    <Title icon="🎖️">Chứng chỉ</Title>
                    <div className="mt-2 space-y-3 text-sm">
                        {(data.certificatesList || []).map((c, idx) => (
                            <div key={idx} className="grid grid-cols-[120px_1fr] gap-3">
                                {isExporting ? (
                                    <>
                                        <div className="text-gray-600 italic">{c.time || 'Thời gian'}</div>
                                        <div className="text-gray-800">{c.name || 'Tên chứng chỉ'}</div>
                                    </>
                                ) : (
                                    <>
                                        <input value={c.time || ''} onChange={listChange('certificatesList', idx, 'time')} placeholder="Thời gian" className="bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 italic" />
                                        <input value={c.name || ''} onChange={listChange('certificatesList', idx, 'name')} placeholder="Tên chứng chỉ" className="bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />
                                    </>
                                )}
                            </div>
                        ))}
                        {!isExporting && (
                            <button type="button" className="text-xs underline" onClick={() => onAddList('certificatesList', { time: '', name: '' })}>+ Thêm chứng chỉ</button>
                        )}
                    </div>
                </div>

                <div>
                    <Title icon="💬">Thông tin thêm</Title>
                    <div className="mt-2 text-sm text-gray-700">
                        {isExporting ? (
                            <div className="whitespace-pre-wrap">{data.moreInfo || 'Diễn thông tin thêm nếu có'}</div>
                        ) : (
                            <input type="text" name="moreInfo" value={data.moreInfo || ''} onChange={safeChange} placeholder="Diễn thông tin thêm nếu có" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                        )}
                    </div>
                </div>
            </div>
        );
        return (
            <div className="bg-white w-full max-w-[1000px] mx-auto border border-gray-300 rounded p-4" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <Header />
                <div className="border-b-2 border-gray-900 my-3" />
                <div className="grid grid-cols-2 gap-8">
                    {/* Left column */}
                    <div className="space-y-6">
                        <div>
                            <Title icon="🎓">Học vấn</Title>
                            <div className="mt-2 space-y-4">
                                {(data.educationList || []).map((edu, idx) => (
                                    <TwoColRow key={idx}>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-baseline justify-between">
                                                {isExporting ? (
                                                    <div className="font-semibold text-gray-800">{edu.school || 'Tên trường học'}</div>
                                                ) : (
                                                    <input value={edu.school || ''} onChange={listChange('educationList', idx, 'school')} placeholder="Tên trường học" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                                {isExporting ? (
                                                    <div className="ml-4 italic text-gray-600">{edu.time || 'Bắt đầu  -  Kết thúc'}</div>
                                                ) : (
                                                    <input value={edu.time || ''} onChange={listChange('educationList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="ml-4 w-40 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 text-right italic" />
                                                )}
                                            </div>
                                            <div className="italic text-gray-600">
                                                {isExporting ? (edu.major || 'Ngành học / Môn học') : (
                                                    <input value={edu.major || ''} onChange={listChange('educationList', idx, 'major')} placeholder="Ngành học / Môn học" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 italic" />
                                                )}
                                            </div>
                                            <div className="text-gray-500">
                                                {isExporting ? (edu.result || edu.note || 'Mô tả quá trình học tập hoặc thành tích của bạn') : (
                                                    <input value={edu.result || ''} onChange={listChange('educationList', idx, 'result')} placeholder="Mô tả quá trình học tập hoặc thành tích của bạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                                )}
                                            </div>
                                        </div>
                                    </TwoColRow>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>
                                )}
                            </div>
                        </div>

                        <div>
                            <Title icon="💼">Kinh nghiệm làm việc</Title>
                            <div className="mt-2 space-y-4">
                                {(data.experienceList || []).map((exp, idx) => (
                                    <TwoColRow key={idx}>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-baseline justify-between">
                                                {isExporting ? (
                                                    <div className="font-semibold text-gray-800">{exp.company || 'Tên công ty'}</div>
                                                ) : (
                                                    <input value={exp.company || ''} onChange={listChange('experienceList', idx, 'company')} placeholder="Tên công ty" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                                {isExporting ? (
                                                    <div className="ml-4 italic text-gray-600">{exp.time || 'Bắt đầu  -  Kết thúc'}</div>
                                                ) : (
                                                    <input value={exp.time || ''} onChange={listChange('experienceList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="ml-4 w-40 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 text-right italic" />
                                                )}
                                            </div>
                                            <div className="italic text-gray-600">
                                                {isExporting ? (exp.position || 'Vị trí công việc') : (
                                                    <input value={exp.position || ''} onChange={listChange('experienceList', idx, 'position')} placeholder="Vị trí công việc" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 italic" />
                                                )}
                                            </div>
                                            <div className="text-gray-500">
                                                {isExporting ? (exp.details || 'Mô tả kinh nghiệm làm việc của bạn') : (
                                                    <input value={exp.details || ''} onChange={listChange('experienceList', idx, 'details')} placeholder="Mô tả kinh nghiệm làm việc của bạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                                )}
                                            </div>
                                        </div>
                                    </TwoColRow>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>
                                )}
                            </div>
                        </div>

                        <div>
                            <Title icon="🏛️">Hoạt động</Title>
                            <div className="mt-2 space-y-4">
                                {(data.activityList || []).map((act, idx) => (
                                    <TwoColRow key={idx}>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-baseline justify-between">
                                                {isExporting ? (
                                                    <div className="font-semibold text-gray-800">{act.org || 'Tên tổ chức'}</div>
                                                ) : (
                                                    <input value={act.org || ''} onChange={listChange('activityList', idx, 'org')} placeholder="Tên tổ chức" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                                {isExporting ? (
                                                    <div className="ml-4 italic text-gray-600">{act.time || 'Bắt đầu  -  Kết thúc'}</div>
                                                ) : (
                                                    <input value={act.time || ''} onChange={listChange('activityList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="ml-4 w-40 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 text-right italic" />
                                                )}
                                            </div>
                                            <div className="italic text-gray-600">
                                                {isExporting ? (act.role || 'Vị trí của bạn') : (
                                                    <input value={act.role || ''} onChange={listChange('activityList', idx, 'role')} placeholder="Vị trí của bạn" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 italic" />
                                                )}
                                            </div>
                                            <div className="text-gray-500">
                                                {isExporting ? (act.details || 'Mô tả hoạt động') : (
                                                    <input value={act.details || ''} onChange={listChange('activityList', idx, 'details')} placeholder="Mô tả hoạt động" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                                )}
                                            </div>
                                        </div>
                                    </TwoColRow>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <RightPanel />
                </div>
            </div>
        );
    }
    // Mẫu mới: Sidebar Pastel theo ảnh, hành vi giống cv2 (2 dòng cho Học vấn/Chứng chỉ, Kinh nghiệm gộp details + thời gian)
    if (templateStyle === 'sidebarPastel') {
        const listChange = (listName, idx, field) => (e) => {
            if (e.nativeEvent?.isComposing) return;
            onListChange(listName, idx, field, e.target.value);
        };
        const safeChange = (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onChange?.(e);
        };
        const HeaderShapes = () => (
            <div className="relative h-40 mb-8 pointer-events-none z-0">
                <div className="absolute inset-0 bg-white" />
                {/* Vệt cong góc trái */}
                <div className="absolute -left-10 -top-10 w-72 h-72 rounded-full" style={{ background: '#eebabb' }} />
                <div className="absolute left-6 -top-10 w-[360px] h-[260px] rounded-br-[180px] rounded-tr-[0] rounded-tl-[260px]" style={{ background: '#64748b' }} />
                {/* nền chấm */}
                <div className="absolute left-6 -top-10 w-[360px] h-[260px] rounded-br-[180px] rounded-tl-[260px] opacity-30" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                {/* viền tròn quanh avatar */}
            </div>
        );
        const Avatar = () => (
            <div className="mx-10 -mt-28 flex flex-col items-center relative z-10">
                <div className="w-40 h-40 rounded-full border-[10px] border-white shadow overflow-hidden bg-gray-200">
                    {data.avatar ? (
                        <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">👤</div>
                    )}
                </div>
                {!isExporting && (
                    <label className="absolute bottom-0 translate-y-1/2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer">
                        Sửa ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarChange?.(e.target.files?.[0])} />
                    </label>
                )}
            </div>
        );
        const Pill = ({ children }) => (
            <div className="flex items-center gap-3">
                <div className="h-[2px] bg-gray-300 flex-1" />
                <div className="px-3 py-1 rounded-full bg-[#f1ddc8] text-gray-800 text-[14px] font-semibold whitespace-nowrap">{children}</div>
            </div>
        );
        const CardRow = ({ children }) => (
            <div className="border border-gray-300 rounded px-3 py-2 text-sm">{children}</div>
        );
        return (
            <div className="bg-white w-full max-w-[980px] mx-auto border border-gray-200 rounded overflow-hidden shadow" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <div className="relative">
                    <HeaderShapes />
                    <div className="px-10 relative z-10">
                        <Avatar />
                        <div className="grid grid-cols-3 gap-8 mt-6">
                            <div className="col-span-2">
                                <div className="text-3xl font-extrabold text-gray-800">
                                    {isExporting ? (data.fullName || 'An Đăng Vinh') : (
                                        <input name="fullName" value={data.fullName} onChange={safeChange} placeholder="Họ và tên" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 text-3xl font-extrabold" />
                                    )}
                                </div>
                                <div className="mt-1 text-[#d19c68] italic text-xl">
                                    {isExporting ? (data.appliedPosition || 'Vị Trí Ứng Tuyển') : (
                                        <input name="appliedPosition" value={data.appliedPosition} onChange={safeChange} placeholder="Vị Trí Ứng Tuyển" className="w-full bg-transparent outline-none border-b border-[#e8c9a5] focus:border-[#c08b5a] italic text-xl" />
                                    )}
                                </div>
                                <div className="mt-4 text-sm text-gray-600">
                                    {isExporting ? (
                                        <div className="whitespace-pre-wrap">{data.summary || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn'}</div>
                                    ) : (
                                        <input name="summary" value={data.summary} onChange={safeChange} placeholder="Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-sm" />
                                    )}
                                </div>
                            </div>
                            <div className="col-span-1 self-start">
                                <div className="space-y-3">
                                    <CardRow>{isExporting ? (data.phone || '0123 456 789') : (<input name="phone" value={data.phone} onChange={safeChange} placeholder="0123 456 789" className="w-full bg-transparent outline-none" />)}</CardRow>
                                    <CardRow>{isExporting ? (data.email || 'anvinh54@gmail.com') : (<input type="email" name="email" value={data.email} onChange={safeChange} placeholder="anvinh54@gmail.com" className="w-full bg-transparent outline-none" />)}</CardRow>
                                    <CardRow>{isExporting ? (data.website || 'facebook.com/TopCV.vn') : (<input name="website" value={data.website} onChange={safeChange} placeholder="facebook.com/TopCV.vn" className="w-full bg-transparent outline-none" />)}</CardRow>
                                    <CardRow>{isExporting ? (data.address || 'Quận A, thành phố Hà Nội') : (<input name="address" value={data.address} onChange={safeChange} placeholder="Quận A, thành phố Hà Nội" className="w-full bg-transparent outline-none" />)}</CardRow>
                                </div>
                            </div>
                        </div>

                        {/* Nội dung chính */}
                        <div className="grid grid-cols-3 gap-8 mt-8">
                            {/* Cột trái */}
                            <aside className="col-span-1 space-y-6">
                                <div>
                                    <Pill>Thông tin cá nhân</Pill>
                                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                                        {/* Phone / DOB / Email / Website / Address hiển thị ở trên đã đủ; giữ trống hoặc thêm DOB */}
                                        <CardRow>{isExporting ? (data.dob || 'Ngày sinh') : (<input name="dob" value={data.dob} onChange={safeChange} placeholder="Ngày sinh" className="w-full bg-transparent outline-none" />)}</CardRow>
                                    </div>
                                </div>
                                <div>
                                    <Pill>Học vấn</Pill>
                                    <div className="mt-3 space-y-3 text-sm">
                                        {(data.educationList || []).map((edu, idx) => (
                                            <div key={idx}>
                                                {/* Dòng 1: Chuyên ngành */}
                                                {isExporting ? (
                                                    <div className="font-semibold text-gray-800">{edu.major || 'Ngành học / Môn học'}</div>
                                                ) : (
                                                    <input value={edu.major || ''} onChange={listChange('educationList', idx, 'major')} placeholder="Ngành học / Môn học" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                                {/* Dòng 2: Trường trái + Thời gian phải */}
                                                <div className="flex items-baseline justify-between gap-3 mt-0.5 text-gray-700">
                                                    {isExporting ? (
                                                        <>
                                                            <span className="truncate">{edu.school || 'Tên trường học'}</span>
                                                            <span className="italic text-gray-600">{edu.time || 'Bắt đầu  -  Kết thúc'}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <input value={edu.school || ''} onChange={listChange('educationList', idx, 'school')} placeholder="Tên trường học" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />
                                                            <input value={edu.time || ''} onChange={listChange('educationList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-40 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 text-right italic" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {!isExporting && (
                                            <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Pill>Kỹ năng</Pill>
                                    <div className="mt-3 space-y-2 text-sm">
                                        {(data.skillsList || []).map((s, idx) => (
                                            <div key={idx}>
                                                {isExporting ? (s.name || 'Tên kỹ năng') : (
                                                    <input value={s.name} onChange={listChange('skillsList', idx, 'name')} placeholder="Tên kỹ năng" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />
                                                )}
                                            </div>
                                        ))}
                                        {!isExporting && (
                                            <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('skillsList', { name: '', description: '' })}>+ Thêm kỹ năng</button>
                                        )}
                                    </div>
                                </div>
                            </aside>

                            {/* Cột phải 2/3 */}
                            <main className="col-span-2 space-y-6">
                                <div>
                                    <Pill>Kinh nghiệm làm việc</Pill>
                                    <div className="mt-3 space-y-4 text-sm">
                                        {(data.experienceList || []).map((exp, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between">
                                                    <div className="font-semibold text-gray-800">
                                                        {isExporting ? (exp.details || 'Tên công ty, Vị trí công việc') : (
                                                            <input value={exp.details || ''} onChange={listChange('experienceList', idx, 'details')} placeholder="Tên công ty, Vị trí công việc" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                        )}
                                                    </div>
                                                    <div className="italic text-gray-600 ml-4">
                                                        {isExporting ? (exp.time || 'Bắt đầu  -  Kết thúc') : (
                                                            <input value={exp.time || ''} onChange={listChange('experienceList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {!isExporting && (
                                            <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Pill>Hoạt động</Pill>
                                    <div className="mt-3 space-y-4 text-sm">
                                        {(data.activityList || []).map((act, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between">
                                                    <div className="font-semibold text-gray-800">
                                                        {isExporting ? (act.role || 'Vị trí của bạn') : (
                                                            <input value={act.role} onChange={listChange('activityList', idx, 'role')} placeholder="Vị trí của bạn" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                        )}
                                                    </div>
                                                    <div className="italic text-gray-600 ml-4">
                                                        {isExporting ? (act.time || 'Bắt đầu  -  Kết thúc') : (
                                                            <input value={act.time} onChange={listChange('activityList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-1 text-gray-700">
                                                    {isExporting ? (act.org || 'Tên tổ chức') : (
                                                        <input value={act.org} onChange={listChange('activityList', idx, 'org')} placeholder="Tên tổ chức" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                                    )}
                                                </div>
                                                <div className="mt-1 text-gray-600">
                                                    {isExporting ? (act.details || 'Mô tả hoạt động') : (
                                                        <input value={act.details} onChange={listChange('activityList', idx, 'details')} placeholder="Mô tả hoạt động" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {!isExporting && (
                                            <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Pill>Dự án</Pill>
                                    <div className="mt-3 space-y-4 text-sm">
                                        {(data.projectsList || []).map((pj, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between">
                                                    <div className="font-semibold text-gray-800">
                                                        {isExporting ? (pj.name || 'Tên dự án') : (
                                                            <input value={pj.name} onChange={listChange('projectsList', idx, 'name')} placeholder="Tên dự án" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                        )}
                                                    </div>
                                                    <div className="italic text-gray-600 ml-4">
                                                        {isExporting ? (pj.time || 'Bắt đầu  -  Kết thúc') : (
                                                            <input value={pj.time} onChange={listChange('projectsList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-1 text-gray-700">
                                                    {isExporting ? (pj.role || 'Vị trí của bạn trong dự án') : (
                                                        <input value={pj.role} onChange={listChange('projectsList', idx, 'role')} placeholder="Vị trí của bạn trong dự án" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                                    )}
                                                </div>
                                                <div className="mt-1 text-gray-600">
                                                    {isExporting ? (pj.details || 'Mô tả ngắn gọn về dự án, mục tiêu, vai trò, công nghệ sử dụng và thành tựu') : (
                                                        <input value={pj.details} onChange={listChange('projectsList', idx, 'details')} placeholder="Mô tả ngắn gọn về dự án, mục tiêu, vai trò, công nghệ sử dụng và thành tựu" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {!isExporting && (
                                            <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('projectsList', { time: '', name: '', role: '', details: '' })}>+ Thêm dự án</button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Pill>Chứng chỉ</Pill>
                                    <div className="mt-3 space-y-3 text-sm">
                                        {(data.certificatesList || []).map((c, idx) => (
                                            <div key={idx}>
                                                {/* Dòng 1: Tên chứng chỉ */}
                                                <div className="font-semibold text-gray-800">
                                                    {isExporting ? (c.name || 'Tên chứng chỉ') : (
                                                        <input value={c.name || ''} onChange={listChange('certificatesList', idx, 'name')} placeholder="Tên chứng chỉ" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                    )}
                                                </div>
                                                {/* Dòng 2: Thời gian */}
                                                <div className="italic text-gray-600 mt-0.5">
                                                    {isExporting ? (c.time || 'Thời gian') : (
                                                        <input value={c.time || ''} onChange={listChange('certificatesList', idx, 'time')} placeholder="Thời gian" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 italic" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {!isExporting && (
                                            <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('certificatesList', { time: '', name: '' })}>+ Thêm chứng chỉ</button>
                                        )}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // Mẫu thứ 2: Sidebar 2 cột theo ảnh (trái nền đậm, tiêu đề dạng pill)
    if (templateStyle === 'sidebarV2') {
        const listChange = (listName, idx, field) => (e) => {
            if (e.nativeEvent?.isComposing) return;
            onListChange(listName, idx, field, e.target.value);
        };
        // Guard IME composition for simple fields as well
        const safeChange = (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onChange?.(e);
        };
        const PillTitle = ({ children }) => (
            <div className="flex items-center gap-4 mb-3">
                <div className="bg-[#3f4a3e] text-white rounded-full px-4 py-2 text-[15px] font-semibold inline-block">{children}</div>
                <div className="flex-1 border-t border-gray-300" />
            </div>
        );
        const LeftPillTitle = ({ children }) => (
            <div className="flex items-center gap-4 mb-3">
                <div className="bg-white/10 text-white rounded-full px-4 py-2 text-[15px] font-semibold inline-block">{children}</div>
                <div className="flex-1 border-t border-white/20" />
            </div>
        );
        const Avatar = () => (
            <div className="w-full flex flex-col items-center relative">
                <div className="w-44 h-44 rounded-full overflow-hidden bg-gray-300 border-4 border-[#6a7569]">
                    {data.avatar ? (
                        <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">Ảnh</div>
                    )}
                </div>
                {!isExporting && (
                    <label className="absolute bottom-0 translate-y-1/2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer">
                        Sửa ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={e => onAvatarChange?.(e.target.files?.[0])} />
                    </label>
                )}
            </div>
        );
        return (
            <div className="bg-white w-full max-w-[1000px] mx-auto border border-gray-200 rounded overflow-hidden shadow" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <div className="flex">
                    {/* Sidebar trái */}
                    <aside className="w-[340px] bg-[#2f3830] text-white p-8">
                        <Avatar />
                        <div className="mt-6">
                            {isExporting ? (
                                <div className="text-2xl font-extrabold text-white text-center">{data.fullName || 'Họ và tên'}</div>
                            ) : (
                                <input type="text" name="fullName" value={data.fullName} onChange={safeChange} placeholder="Họ và tên" className="w-full bg-transparent outline-none border-b border-white/30 focus:border-white text-2xl font-extrabold text-center" />
                            )}
                            <div className="text-white/80 italic text-center mt-1">
                                {isExporting ? (
                                    <div>{data.appliedPosition || 'Vị trí ứng tuyển'}</div>
                                ) : (
                                    <input type="text" name="appliedPosition" value={data.appliedPosition} onChange={safeChange} placeholder="Vị trí ứng tuyển" className="w-full bg-transparent outline-none border-b border-white/30 focus:border-white italic text-center" />
                                )}
                            </div>
                        </div>

                        {/* Liên hệ */}
                        <div className="mt-6 space-y-3">
                            {isExporting ? (
                                <>
                                    <div className="border border-white/20 rounded px-3 py-2 text-sm">{data.phone || 'Số điện thoại'}</div>
                                    <div className="border border-white/20 rounded px-3 py-2 text-sm">{data.dob || 'Ngày sinh'}</div>
                                    <div className="border border-white/20 rounded px-3 py-2 text-sm break-all">{data.email || 'Email'}</div>
                                    <div className="border border-white/20 rounded px-3 py-2 text-sm break-all">{data.website || 'facebook.com/TopCV.vn'}</div>
                                    <div className="border border-white/20 rounded px-3 py-2 text-sm">{data.address || 'Địa chỉ'}</div>
                                </>
                            ) : (
                                <>
                                    <input type="text" name="phone" value={data.phone} onChange={safeChange} placeholder="Số điện thoại" className="w-full bg-transparent outline-none border border-white/30 focus:border-white rounded px-3 py-2 text-sm" />
                                    <input type="text" name="dob" value={data.dob} onChange={safeChange} placeholder="Ngày sinh" className="w-full bg-transparent outline-none border border-white/30 focus:border-white rounded px-3 py-2 text-sm" />
                                    <input type="email" name="email" value={data.email} onChange={safeChange} placeholder="Email" className="w-full bg-transparent outline-none border border-white/30 focus:border-white rounded px-3 py-2 text-sm" />
                                    <input type="text" name="website" value={data.website} onChange={safeChange} placeholder="facebook.com/TopCV.vn" className="w-full bg-transparent outline-none border border-white/30 focus:border-white rounded px-3 py-2 text-sm" />
                                    <input type="text" name="address" value={data.address} onChange={safeChange} placeholder="Địa chỉ" className="w-full bg-transparent outline-none border border-white/30 focus:border-white rounded px-3 py-2 text-sm" />
                                </>
                            )}
                        </div>

                        {/* Học vấn (trái) - mỗi mục hiển thị 2 dòng */}
                        <div className="mt-8">
                            <LeftPillTitle>Học vấn</LeftPillTitle>
                            <div className="space-y-4 text-sm">
                                {(data.educationList || []).map((edu, idx) => (
                                    <div key={idx}>
                                        {isExporting ? (
                                            <>
                                                {/* Dòng 1: Chuyên ngành */}
                                                <div className="font-semibold">{edu.major || 'Ngành học / Môn học'}</div>
                                                {/* Dòng 2: Trường (trái) + Thời gian (phải) */}
                                                <div className="text-white/90 flex items-baseline justify-between gap-3">
                                                    <span className="truncate">{edu.school || 'Tên trường học'}</span>
                                                    <span className="italic text-white/80">{edu.time || 'Bắt đầu  -  Kết thúc'}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Dòng 1: Chuyên ngành */}
                                                <input type="text" value={edu.major || ''} onChange={listChange('educationList', idx, 'major')} placeholder="Ngành học / Môn học" className="w-full bg-transparent outline-none border-b border-white/30 focus:border-white" />
                                                {/* Dòng 2: Trường (trái) + Thời gian (phải) trên cùng một dòng */}
                                                <div className="flex items-center gap-3 mt-1">
                                                    <input type="text" value={edu.school || ''} onChange={listChange('educationList', idx, 'school')} placeholder="Tên trường học" className="flex-1 bg-transparent outline-none border-b border-white/30 focus:border-white" />
                                                    <input type="text" value={edu.time || ''} onChange={listChange('educationList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-40 bg-transparent outline-none border-b border-white/30 focus:border-white text-right italic" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-white/90" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>
                                )}
                            </div>
                        </div>

                        {/* Kỹ năng (trái) */}
                        <div className="mt-8">
                            <LeftPillTitle>Kỹ năng</LeftPillTitle>
                            <div className="space-y-2 text-sm">
                                {(data.skillsList || []).map((s, idx) => (
                                    <div key={idx}>
                                        {isExporting ? (
                                            <div>{s.name || 'Tên kỹ năng'}</div>
                                        ) : (
                                            <input type="text" value={s.name} onChange={listChange('skillsList', idx, 'name')} placeholder="Tên kỹ năng" className="w-full bg-transparent outline-none border-b border-white/30 focus:border-white" />
                                        )}
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-white/90" onClick={() => onAddList('skillsList', { name: '', description: '' })}>+ Thêm kỹ năng</button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Nội dung phải */}
                    <main className="flex-1 p-8">
                        <section className="mb-6">
                            <PillTitle>Mục tiêu nghề nghiệp</PillTitle>
                            {isExporting ? (
                                <div className="text-sm text-gray-700">{data.summary || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn'}</div>
                            ) : (
                                <input type="text" name="summary" value={data.summary} onChange={safeChange} placeholder="Mục tiêu nghề nghiệp của bạn" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />
                            )}
                        </section>

                        <section className="mb-6">
                            <PillTitle>Kinh nghiệm làm việc</PillTitle>
                            <div className="space-y-4">
                                {(data.experienceList || []).map((exp, idx) => (
                                    <div key={idx}>
                                        {/* Hàng trên: "Tên công ty, Vị trí công việc" (dùng trường mô tả) + thời gian */}
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="font-semibold">
                                                {isExporting ? (exp.details || 'Tên công ty, Vị trí công việc') : (
                                                    <input type="text" value={exp.details || ''} onChange={listChange('experienceList', idx, 'details')} placeholder="Tên công ty, Vị trí công việc" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                            </div>
                                            <div className="italic text-gray-600 ml-4">
                                                {isExporting ? (exp.time || 'Bắt đầu  -  Kết thúc') : (
                                                    <input type="text" value={exp.time || ''} onChange={listChange('experienceList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                                )}
                                            </div>
                                        </div>
                                        {/* Bỏ các dòng riêng cho tên công ty và mô tả chi tiết để đảm bảo điền trên 1 trường */}
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>
                                )}
                            </div>
                        </section>

                        <section className="mb-6">
                            <PillTitle>Danh hiệu và Giải thưởng</PillTitle>
                            <div className="space-y-3">
                                {(data.awardsList || []).map((a, idx) => (
                                    <div key={idx} className="text-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold">
                                                {isExporting ? (a.title || 'Tên giải thưởng') : (
                                                    <input type="text" value={a.title} onChange={listChange('awardsList', idx, 'title')} placeholder="Tên giải thưởng" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                            </div>
                                            <div className="italic text-gray-600 ml-4">
                                                {isExporting ? (a.time || 'Thời gian') : (
                                                    <input type="text" value={a.time} onChange={listChange('awardsList', idx, 'time')} placeholder="Thời gian" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('awardsList', { time: '', title: '' })}>+ Thêm giải thưởng</button>
                                )}
                            </div>
                        </section>

                        <section className="mb-6">
                            <PillTitle>Chứng chỉ</PillTitle>
                            {/* Mỗi chứng chỉ hiển thị 2 dòng: Tên (dòng 1), Thời gian (dòng 2) */}
                            <div className="space-y-3">
                                {(data.certificatesList || []).map((c, idx) => (
                                    <div key={idx} className="text-sm">
                                        {/* Dòng 1: Tên chứng chỉ */}
                                        <div className="font-semibold">
                                            {isExporting ? (c.name || 'Tên chứng chỉ') : (
                                                <input type="text" value={c.name || ''} onChange={listChange('certificatesList', idx, 'name')} placeholder="Tên chứng chỉ" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                            )}
                                        </div>
                                        {/* Dòng 2: Thời gian */}
                                        <div className="italic text-gray-600 mt-0.5">
                                            {isExporting ? (c.time || 'Thời gian') : (
                                                <input type="text" value={c.time || ''} onChange={listChange('certificatesList', idx, 'time')} placeholder="Thời gian" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 italic" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('certificatesList', { time: '', name: '' })}>+ Thêm chứng chỉ</button>
                                )}
                            </div>
                        </section>

                        <section className="mb-6">
                            <PillTitle>Hoạt động</PillTitle>
                            <div className="space-y-4">
                                {(data.activityList || []).map((act, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="font-semibold">
                                                {isExporting ? (act.role || 'Vị trí của bạn') : (
                                                    <input type="text" value={act.role} onChange={listChange('activityList', idx, 'role')} placeholder="Vị trí của bạn" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                            </div>
                                            <div className="italic text-gray-600 ml-4">
                                                {isExporting ? (act.time || 'Bắt đầu  -  Kết thúc') : (
                                                    <input type="text" value={act.time} onChange={listChange('activityList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-1 text-sm">
                                            {isExporting ? (act.org || 'Tên tổ chức') : (
                                                <input type="text" value={act.org} onChange={listChange('activityList', idx, 'org')} placeholder="Tên tổ chức" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-700">
                                            {isExporting ? (act.details || 'Mô tả hoạt động') : (
                                                <input type="text" value={act.details} onChange={listChange('activityList', idx, 'details')} placeholder="Mô tả hoạt động" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>
                                )}
                            </div>
                        </section>

                        <section className="mb-6">
                            <PillTitle>Dự án</PillTitle>
                            <div className="space-y-4">
                                {(data.projectsList || []).map((pj, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="font-semibold">
                                                {isExporting ? (pj.role || 'Vị trí của bạn trong dự án') : (
                                                    <input type="text" value={pj.role} onChange={listChange('projectsList', idx, 'role')} placeholder="Vị trí của bạn trong dự án" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                            </div>
                                            <div className="italic text-gray-600 ml-4">
                                                {isExporting ? (pj.time || 'Bắt đầu  -  Kết thúc') : (
                                                    <input type="text" value={pj.time} onChange={listChange('projectsList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-1 text-sm">
                                            {isExporting ? (pj.name || 'Tên dự án') : (
                                                <input type="text" value={pj.name} onChange={listChange('projectsList', idx, 'name')} placeholder="Tên dự án" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-700">
                                            {isExporting ? (pj.details || 'Mô tả ngắn gọn về dự án, mục tiêu, vai trò, công nghệ sử dụng và thành tựu') : (
                                                <input type="text" value={pj.details} onChange={listChange('projectsList', idx, 'details')} placeholder="Mô tả ngắn gọn về dự án, mục tiêu, vai trò, công nghệ sử dụng và thành tựu" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('projectsList', { time: '', name: '', role: '', details: '' })}>+ Thêm dự án</button>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        );
    }

    // Mẫu thứ 3: Sidebar + Icon headings (như ảnh), giữ hành vi giống mẫu 1
    if (templateStyle === 'sidebarV3') {
        const listChange = (listName, idx, field) => (e) => {
            if (e.nativeEvent?.isComposing) return;
            onListChange(listName, idx, field, e.target.value);
        };
        const IconTitle = ({ icon, children }) => (
            <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#3f4a3e] text-white flex items-center justify-center text-[14px]">{icon}</div>
                <div className="text-[18px] font-semibold text-gray-800">{children}</div>
            </div>
        );
        const LeftSectionTitle = ({ children }) => (
            <div className="text-[18px] font-semibold text-white mb-2">{children}</div>
        );
        const Avatar = () => (
            <div className="w-full flex flex-col items-center relative">
                <div className="w-52 h-52 rounded-full overflow-hidden bg-gray-300 border-4 border-[#6a7569]">
                    {data.avatar ? (
                        <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">Ảnh</div>
                    )}
                </div>
                {!isExporting && (
                    <label className="absolute bottom-0 translate-y-1/2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer">
                        Sửa ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={e => onAvatarChange?.(e.target.files?.[0])} />
                    </label>
                )}
            </div>
        );
        const ContactRow = ({ placeholder, name, type = 'text', value }) => (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/80 text-[12px]">•</div>
                {isExporting ? (
                    <div className="flex-1 border border-white/20 rounded px-3 py-2 text-sm break-all">{value || placeholder}</div>
                ) : (
                    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="flex-1 bg-transparent outline-none border border-white/30 focus:border-white rounded px-3 py-2 text-sm" />
                )}
            </div>
        );
        // Progress bar theo level 0..100, mặc định 70 nếu không có
        const SkillBar = ({ name, level = 70, onName, onLevel }) => (
            <div>
                {isExporting ? (
                    <div className="text-sm mb-1 text-white">{name || 'Tên kỹ năng'}</div>
                ) : (
                    <input type="text" value={name} onChange={onName} placeholder="Tên kỹ năng" className="w-full bg-transparent outline-none border-b border-white/30 focus:border-white text-sm mb-1 text-white placeholder:text-white/70" />
                )}
                <div className="w-full h-2 bg-white/20 rounded">
                    <div className="h-2 bg-white rounded" style={{ width: `${Math.max(0, Math.min(100, Number(level) || 0))}%` }} />
                </div>
                {!isExporting && (
                    <input type="range" min={0} max={100} value={level || 0} onChange={onLevel} className="w-full mt-1" />
                )}
            </div>
        );
        return (
            <div className="bg-white w-full max-w-[1000px] mx-auto border border-gray-200 rounded overflow-hidden shadow" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <div className="flex">
                    {/* Sidebar trái */}
                    <aside className="w-[340px] bg-[#2f3830] text-white p-8 space-y-6">
                        <Avatar />
                        <div>
                            {isExporting ? (
                                <div className="text-2xl font-extrabold text-center">{data.fullName || 'An Đăng Vinh'}</div>
                            ) : (
                                <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full bg-transparent outline-none border-b border-white/30 focus:border-white text-2xl font-extrabold text-center" />
                            )}
                            <div className="italic text-white/80 text-center mt-1">
                                {isExporting ? (data.appliedPosition || 'Vị trí ứng tuyển') : (
                                    <input type="text" name="appliedPosition" value={data.appliedPosition} onChange={onChange} placeholder="Vị trí ứng tuyển" className="w-full bg-transparent outline-none border-b border-white/30 focus:border-white italic text-center" />
                                )}
                            </div>
                        </div>

                        {/* Liên hệ dạng box có icon chấm */}
                        <div className="space-y-2">
                            <ContactRow name="phone" value={data.phone} placeholder="0123 456 789" />
                            <ContactRow name="email" value={data.email} placeholder="anvinh54@gmail.com" type="email" />
                            <ContactRow name="address" value={data.address} placeholder="Quận A, thành phố Hà Nội" />
                            <ContactRow name="dob" value={data.dob} placeholder="Ngày sinh" />
                            <ContactRow name="gender" value={data.gender} placeholder="Giới tính" />
                        </div>

                        {/* Mục tiêu nghề nghiệp ở sidebar */}
                        <div>
                            <LeftSectionTitle>Mục tiêu nghề nghiệp</LeftSectionTitle>
                            {isExporting ? (
                                <div className="text-sm text-white/85">{data.summary || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn'}</div>
                            ) : (
                                <input type="text" name="summary" value={data.summary} onChange={onChange} placeholder="Mục tiêu nghề nghiệp của bạn" className="w-full bg-transparent outline-none border-b border-white/30 focus:border-white text-sm text-white" />
                            )}
                        </div>

                        {/* Kỹ năng với thanh tiến trình */}
                        <div>
                            <LeftSectionTitle>Kỹ năng</LeftSectionTitle>
                            <div className="space-y-3">
                                {(data.skillsList || []).map((s, idx) => (
                                    <SkillBar
                                        key={idx}
                                        name={s.name}
                                        level={s.level ?? 70}
                                        onName={listChange('skillsList', idx, 'name')}
                                        onLevel={(e) => onListChange('skillsList', idx, 'level', e.target.value)}
                                    />
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-white/90" onClick={() => onAddList('skillsList', { name: '', description: '', level: 70 })}>+ Thêm kỹ năng</button>
                                )}
                            </div>
                        </div>

                        {/* Danh hiệu & Giải thưởng trong sidebar */}
                        <div>
                            <LeftSectionTitle>Danh hiệu và giải thưởng</LeftSectionTitle>
                            <div className="space-y-2 text-sm">
                                {(data.awardsList || []).map((a, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        {isExporting ? (
                                            <>
                                                <div className="text-white/80 w-32 shrink-0">{a.time || 'Thời gian'}</div>
                                                <div className="text-white">{a.title || 'Tên giải thưởng'}</div>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" value={a.time} onChange={listChange('awardsList', idx, 'time')} placeholder="Thời gian" className="w-32 bg-transparent outline-none border-b border-white/30 focus:border-white text-white/90" />
                                                <input type="text" value={a.title} onChange={listChange('awardsList', idx, 'title')} placeholder="Tên giải thưởng" className="flex-1 bg-transparent outline-none border-b border-white/30 focus:border-white text-white" />
                                            </>
                                        )}
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-white/90" onClick={() => onAddList('awardsList', { time: '', title: '' })}>+ Thêm giải thưởng</button>
                                )}
                            </div>
                        </div>

                        {/* Chứng chỉ trong sidebar */}
                        <div>
                            <LeftSectionTitle>Chứng chỉ</LeftSectionTitle>
                            <div className="space-y-2 text-sm">
                                {(data.certificatesList || []).map((c, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        {isExporting ? (
                                            <>
                                                <div className="text-white/80 w-32 shrink-0">{c.time || 'Thời gian'}</div>
                                                <div className="text-white">{c.name || 'Tên chứng chỉ'}</div>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" value={c.time} onChange={listChange('certificatesList', idx, 'time')} placeholder="Thời gian" className="w-32 bg-transparent outline-none border-b border-white/30 focus:border-white text-white/90" />
                                                <input type="text" value={c.name} onChange={listChange('certificatesList', idx, 'name')} placeholder="Tên chứng chỉ" className="flex-1 bg-transparent outline-none border-b border-white/30 focus:border-white text-white" />
                                            </>
                                        )}
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-white/90" onClick={() => onAddList('certificatesList', { time: '', name: '' })}>+ Thêm chứng chỉ</button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Nội dung phải với tiêu đề có icon */}
                    <main className="flex-1 p-8 space-y-6">
                        <section>
                            <IconTitle icon="💡">Học vấn</IconTitle>
                            <div className="space-y-4 pl-1">
                                {(data.educationList || []).map((edu, idx) => (
                                    <div key={idx} className="text-sm">
                                        {/* Dòng thời gian bên phải */}
                                        <div className="flex items-center justify-between text-gray-600 italic">
                                            <div />
                                            {isExporting ? (edu.time || 'Bắt đầu  -  Kết thúc') : (
                                                <input type="text" value={edu.time} onChange={listChange('educationList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1 font-semibold text-gray-800">
                                            {isExporting ? (edu.major || 'Ngành học / Môn học') : (
                                                <input type="text" value={edu.major} onChange={listChange('educationList', idx, 'major')} placeholder="Ngành học / Môn học" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                            )}
                                        </div>
                                        <div className="mt-1">
                                            {isExporting ? (edu.school || 'Tên trường học') : (
                                                <input type="text" value={edu.school} onChange={listChange('educationList', idx, 'school')} placeholder="Tên trường học" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1 text-gray-600 italic">
                                            {isExporting ? (edu.note || 'Mô tả quá trình học tập hoặc thành tích của bạn') : (
                                                <input type="text" value={edu.note} onChange={listChange('educationList', idx, 'note')} placeholder="Mô tả quá trình học tập hoặc thành tích của bạn" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>
                                )}
                            </div>
                        </section>

                        <section>
                            <IconTitle icon="👥">Kinh nghiệm làm việc</IconTitle>
                            <div className="space-y-4 pl-1">
                                {(data.experienceList || []).map((exp, idx) => (
                                    <div key={idx} className="text-sm">
                                        <div className="flex items-center justify-between text-gray-600 italic">
                                            <div className="font-semibold text-gray-800">
                                                {isExporting ? (exp.position || 'Vị trí công việc') : (
                                                    <input type="text" value={exp.position} onChange={listChange('experienceList', idx, 'position')} placeholder="Vị trí công việc" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                            </div>
                                            {isExporting ? (exp.time || 'Bắt đầu  -  Kết thúc') : (
                                                <input type="text" value={exp.time} onChange={listChange('experienceList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1">
                                            {isExporting ? (exp.company || 'Tên công ty') : (
                                                <input type="text" value={exp.company} onChange={listChange('experienceList', idx, 'company')} placeholder="Tên công ty" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1 text-gray-700">
                                            {isExporting ? (exp.details || 'Mô tả kinh nghiệm làm việc của bạn') : (
                                                <input type="text" value={exp.details} onChange={listChange('experienceList', idx, 'details')} placeholder="Mô tả kinh nghiệm làm việc của bạn" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>
                                )}
                            </div>
                        </section>

                        <section>
                            <IconTitle icon="⭐">Hoạt động</IconTitle>
                            <div className="space-y-4 pl-1">
                                {(data.activityList || []).map((act, idx) => (
                                    <div key={idx} className="text-sm">
                                        <div className="flex items-center justify-between text-gray-600 italic">
                                            <div className="font-semibold text-gray-800">
                                                {isExporting ? (act.role || 'Vị trí của bạn') : (
                                                    <input type="text" value={act.role} onChange={listChange('activityList', idx, 'role')} placeholder="Vị trí của bạn" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                            </div>
                                            {isExporting ? (act.time || 'Bắt đầu  -  Kết thúc') : (
                                                <input type="text" value={act.time} onChange={listChange('activityList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1">
                                            {isExporting ? (act.org || 'Tên tổ chức') : (
                                                <input type="text" value={act.org} onChange={listChange('activityList', idx, 'org')} placeholder="Tên tổ chức" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1 text-gray-700">
                                            {isExporting ? (act.details || 'Mô tả hoạt động') : (
                                                <input type="text" value={act.details} onChange={listChange('activityList', idx, 'details')} placeholder="Mô tả hoạt động" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>
                                )}
                            </div>
                        </section>

                        <section>
                            <IconTitle icon="📁">Dự án</IconTitle>
                            <div className="space-y-4 pl-1">
                                {(data.projectsList || []).map((pj, idx) => (
                                    <div key={idx} className="text-sm">
                                        <div className="flex items-center justify-between text-gray-600 italic">
                                            <div className="font-semibold text-gray-800">
                                                {isExporting ? (pj.role || 'Vị trí của bạn trong dự án') : (
                                                    <input type="text" value={pj.role} onChange={listChange('projectsList', idx, 'role')} placeholder="Vị trí của bạn trong dự án" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                                )}
                                            </div>
                                            {isExporting ? (pj.time || 'Bắt đầu  -  Kết thúc') : (
                                                <input type="text" value={pj.time} onChange={listChange('projectsList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1">
                                            {isExporting ? (pj.name || 'Tên dự án') : (
                                                <input type="text" value={pj.name} onChange={listChange('projectsList', idx, 'name')} placeholder="Tên dự án" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                            )}
                                        </div>
                                        <div className="mt-1 text-gray-700">
                                            {isExporting ? (pj.details || 'Mô tả ngắn gọn về dự án, mục tiêu, vai trò, công nghệ sử dụng và thành tựu') : (
                                                <input type="text" value={pj.details} onChange={listChange('projectsList', idx, 'details')} placeholder="Mô tả ngắn gọn về dự án, mục tiêu, vai trò, công nghệ sử dụng và thành tựu" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isExporting && (
                                    <button type="button" className="text-xs underline text-gray-700" onClick={() => onAddList('projectsList', { time: '', name: '', role: '', details: '' })}>+ Thêm dự án</button>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        );
    }

    // Mẫu thứ 4: Classic Red (header + lưới 3 cột, nhấn màu đỏ, timeline chấm đỏ)
    if (templateStyle === 'classicRed') {
        const accent = '#c43b3b';
        const listChange = (listName, idx, field) => (e) => {
            if (e.nativeEvent?.isComposing) return;
            onListChange(listName, idx, field, e.target.value);
        };
        const SectionTitle = ({ children }) => (
            <div className="uppercase font-extrabold tracking-wide text-[18px] text-gray-900 border-b-2 mb-2 pt-1" style={{ borderColor: accent }}>
                {children}
            </div>
        );
        const Label = ({ children }) => (
            <div className="text-sm italic text-gray-500">{children}</div>
        );
        const Value = ({ children, bold }) => (
            <div className={"text-sm break-words whitespace-pre-wrap " + (bold ? 'font-semibold text-gray-800' : 'text-gray-700')}>{children}</div>
        );
        const DotLine = ({ children }) => (
            <div className="flex gap-3">
                <div className="w-4 flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: accent }}></div>
                    <div className="flex-1 w-px bg-gray-300" />
                </div>
                <div className="flex-1 pb-4">{children}</div>
            </div>
        );
        const Avatar = () => (
            <div className="flex flex-col items-center relative">
                <div className="w-[260px] h-[220px] bg-gray-200 flex items-center justify-center overflow-hidden">
                    {data.avatar ? (
                        <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-gray-500">Avatar</div>
                    )}
                </div>
                {!isExporting && (
                    <label className="absolute bottom-0 translate-y-1/2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer">
                        Sửa ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={e => onAvatarChange?.(e.target.files?.[0])} />
                    </label>
                )}
            </div>
        );
        return (
            <div className="bg-white w-full max-w-[1000px] mx-auto p-8" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                {/* Header */}
                <div className="grid grid-cols-[260px_1fr] gap-8 items-start mb-6">
                    <Avatar />
                    <div>
                        {isExporting ? (
                            <div className="text-[28px] font-extrabold" style={{ color: accent }}>{data.fullName || 'An Đăng Vinh'}</div>
                        ) : (
                            <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 text-[28px] font-extrabold" style={{ color: accent }} />
                        )}
                        <div className="mt-1 italic text-gray-600">
                            {isExporting ? (
                                <div>{data.appliedPosition || 'Vị trí ứng tuyển'}</div>
                            ) : (
                                <input type="text" name="appliedPosition" value={data.appliedPosition} onChange={onChange} placeholder="Vị trí ứng tuyển" className="w-full outline-none border-b border-black" />
                            )}
                        </div>
                        <div className="border-b mt-2" />
                        <div className="mt-1 text-gray-500 italic break-words whitespace-pre-wrap">
                            {isExporting ? (
                                <div className="break-words whitespace-pre-wrap">{data.summary || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn'}</div>
                            ) : (
                                <input type="text" name="summary" value={data.summary} onChange={onChange} placeholder="Mục tiêu nghề nghiệp của bạn" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Hàng 3 cột: Thông tin cá nhân, Học vấn, Chứng chỉ */}
                <div className="grid grid-cols-3 gap-8 mb-6">
                    <div>
                        <SectionTitle>Thông tin cá nhân</SectionTitle>
                        <div className="space-y-3">
                            {/* dob */}
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full text-white flex items-center justify-center" style={{ background: accent }}>🗓️</div>
                                {isExporting ? (<Value>{data.dob || '15/05/1995'}</Value>) : (<input type="text" name="dob" value={data.dob} onChange={onChange} placeholder="15/05/1995" className="flex-1 outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />)}
                            </div>
                            {/* email */}
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full text-white flex items-center justify-center" style={{ background: accent }}>✉️</div>
                                {isExporting ? (<Value>{data.email || 'anvinh54@gmail.com'}</Value>) : (<input type="email" name="email" value={data.email} onChange={onChange} placeholder="anvinh54@gmail.com" className="flex-1 outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />)}
                            </div>
                            {/* phone */}
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full text-white flex items-center justify-center" style={{ background: accent }}>☎️</div>
                                {isExporting ? (<Value>{data.phone || '0123 456 789'}</Value>) : (<input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="0123 456 789" className="flex-1 outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />)}
                            </div>
                            {/* address */}
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full text-white flex items-center justify-center" style={{ background: accent }}>📍</div>
                                {isExporting ? (<Value>{data.address || 'Quận A, thành phố Hà Nội'}</Value>) : (<input type="text" name="address" value={data.address} onChange={onChange} placeholder="Quận A, thành phố Hà Nội" className="flex-1 outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />)}
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionTitle>Học vấn</SectionTitle>
                        <div className="space-y-3">
                            {(data.educationList || []).map((edu, idx) => (
                                <div key={idx} className="grid grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <Label>Tên trường học</Label>
                                        {isExporting ? (<Value bold>{edu.school || 'Tên trường học'}</Value>) : (<input type="text" value={edu.school} onChange={listChange('educationList', idx, 'school')} placeholder="Tên trường học" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />)}
                                        <Label>Ngành học / Môn học</Label>
                                        {isExporting ? (<Value>{edu.major || 'Ngành học / Môn học'}</Value>) : (<input type="text" value={edu.major} onChange={listChange('educationList', idx, 'major')} placeholder="Ngành học / Môn học" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />)}
                                        <Label>Mô tả quá trình học tập hoặc thành tích của bạn</Label>
                                        {isExporting ? (<Value>{edu.note || ''}</Value>) : (<input type="text" value={edu.note} onChange={listChange('educationList', idx, 'note')} placeholder="Mô tả quá trình học tập hoặc thành tích của bạn" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />)}
                                    </div>
                                    <div>
                                        <Label>Thời gian</Label>
                                        {isExporting ? (<Value>{edu.time || 'Bắt đầu  -  Kết thúc'}</Value>) : (<input type="text" value={edu.time} onChange={listChange('educationList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />)}
                                    </div>
                                </div>
                            ))}
                            {!isExporting && <button type="button" className="text-xs underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </div>
                    </div>

                    <div>
                        <SectionTitle>Chứng chỉ</SectionTitle>
                        <div className="space-y-3 text-sm">
                            {(data.certificatesList || []).map((c, idx) => (
                                <div key={idx} className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label>Thời gian</Label>
                                        {isExporting ? (<Value>{c.time || 'Thời gian'}</Value>) : (<input type="text" value={c.time} onChange={listChange('certificatesList', idx, 'time')} placeholder="Thời gian" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />)}
                                    </div>
                                    <div>
                                        <Label>Tên chứng chỉ</Label>
                                        {isExporting ? (<Value bold>{c.name || 'Tên chứng chỉ'}</Value>) : (<input type="text" value={c.name} onChange={listChange('certificatesList', idx, 'name')} placeholder="Tên chứng chỉ" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />)}
                                    </div>
                                </div>
                            ))}
                            {!isExporting && <button type="button" className="text-xs underline" onClick={() => onAddList('certificatesList', { time: '', name: '' })}>+ Thêm chứng chỉ</button>}
                        </div>
                    </div>
                </div>

                {/* Kinh nghiệm làm việc (full-width) */}
                <div className="mb-4">
                    <SectionTitle>Kinh nghiệm làm việc</SectionTitle>
                    <div className="mt-3">
                        {(data.experienceList || []).map((exp, idx) => (
                            <DotLine key={idx}>
                                <div className="grid grid-cols-2 gap-8 text-sm">
                                    <div>
                                        <Value>{exp.time || (isExporting ? 'Bắt đầu  -  Kết thúc' : '')}</Value>
                                        <div className="mt-1">
                                            {isExporting ? (<div className="italic font-semibold text-gray-700 break-words whitespace-pre-wrap">{exp.company || 'Tên công ty'}</div>) : (
                                                <input type="text" value={exp.company} onChange={listChange('experienceList', idx, 'company')} placeholder="Tên công ty" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 italic font-semibold" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="italic font-semibold text-gray-700">
                                            {isExporting ? (exp.position || 'Vị trí công việc') : (
                                                <input type="text" value={exp.position} onChange={listChange('experienceList', idx, 'position')} placeholder="Vị trí công việc" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 italic font-semibold" />
                                            )}
                                        </div>
                                        <div className="text-gray-600 mt-1 break-words whitespace-pre-wrap">
                                            {isExporting ? (exp.details || 'Mô tả kinh nghiệm làm việc của bạn') : (
                                                <input type="text" value={exp.details} onChange={listChange('experienceList', idx, 'details')} placeholder="Mô tả kinh nghiệm làm việc của bạn" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DotLine>
                        ))}
                        {!isExporting && <button type="button" className="text-xs underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                    </div>
                </div>

                {/* Hàng 2 cột: Kỹ năng & Danh hiệu/Giải thưởng */}
                <div className="grid grid-cols-2 gap-10 mb-4">
                    <div>
                        <SectionTitle>Kỹ năng</SectionTitle>
                        <div className="space-y-4 text-sm">
                            {(data.skillsList || []).map((s, idx) => (
                                <div key={idx}>
                                    {isExporting ? (<div className="italic text-gray-700">{s.name || 'Tên kỹ năng'}</div>) : (
                                        <input type="text" value={s.name} onChange={listChange('skillsList', idx, 'name')} placeholder="Tên kỹ năng" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 italic" />
                                    )}
                                    {isExporting ? (<div className="text-gray-600 break-words whitespace-pre-wrap">{s.description || 'Mô tả kỹ năng'}</div>) : (
                                        <input type="text" value={s.description} onChange={listChange('skillsList', idx, 'description')} placeholder="Mô tả kỹ năng" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                    )}
                                </div>
                            ))}
                            {!isExporting && <button type="button" className="text-xs underline" onClick={() => onAddList('skillsList', { name: '', description: '' })}>+ Thêm kỹ năng</button>}
                        </div>
                    </div>
                    <div>
                        <SectionTitle>Danh hiệu và giải thưởng</SectionTitle>
                        <div className="space-y-3 text-sm">
                            {(data.awardsList || []).map((a, idx) => (
                                <div key={idx} className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label>Thời gian</Label>
                                        {isExporting ? (<Value>{a.time || 'Thời gian'}</Value>) : (<input type="text" value={a.time} onChange={listChange('awardsList', idx, 'time')} placeholder="Thời gian" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />)}
                                    </div>
                                    <div>
                                        <Label>Tên giải thưởng</Label>
                                        {isExporting ? (<Value bold>{a.title || 'Tên giải thưởng'}</Value>) : (<input type="text" value={a.title} onChange={listChange('awardsList', idx, 'title')} placeholder="Tên giải thưởng" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />)}
                                    </div>
                                </div>
                            ))}
                            {!isExporting && <button type="button" className="text-xs underline" onClick={() => onAddList('awardsList', { time: '', title: '' })}>+ Thêm giải thưởng</button>}
                        </div>
                    </div>
                </div>

                {/* Hoạt động (full-width) */}
                <div>
                    <SectionTitle>Hoạt động</SectionTitle>
                    <div className="mt-3">
                        {(data.activityList || []).map((act, idx) => (
                            <DotLine key={idx}>
                                <div className="grid grid-cols-2 gap-8 text-sm">
                                    <div>
                                        <Value>{act.time || (isExporting ? 'Bắt đầu  -  Kết thúc' : '')}</Value>
                                        <div className="mt-1 italic text-gray-700">
                                            {isExporting ? (act.org || 'Tên tổ chức') : (
                                                <input type="text" value={act.org} onChange={listChange('activityList', idx, 'org')} placeholder="Tên tổ chức" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 italic" />
                                            )}
                                            <div className="font-semibold">{isExporting ? (act.role || 'Vị trí của bạn') : null}</div>
                                            {!isExporting && (
                                                <input type="text" value={act.role} onChange={listChange('activityList', idx, 'role')} placeholder="Vị trí của bạn" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 mt-1 font-semibold" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-gray-600 break-words whitespace-pre-wrap">
                                        {isExporting ? (act.details || 'Mô tả hoạt động') : (
                                            <input type="text" value={act.details} onChange={listChange('activityList', idx, 'details')} placeholder="Mô tả hoạt động" className="w-full outline-none border-b border-gray-200 focus:border-gray-600" />
                                        )}
                                    </div>
                                </div>
                            </DotLine>
                        ))}
                        {!isExporting && <button type="button" className="text-xs underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                    </div>
                </div>
            </div>
        );
    }
    // Mẫu mới
    if (templateStyle === 'classicOne') {
        // Helper to guard IME composition for list inputs/textareas
        const listChange = (listName, idx, field) => (e) => {
            if (e.nativeEvent?.isComposing) return;
            onListChange(listName, idx, field, e.target.value);
        };
        const Avatar = () => (
            <div className="flex items-center gap-4 mb-4 relative">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300">
                    {data.avatar ? (
                        <img src={data.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">Ảnh</div>
                    )}
                </div>
                {!isExporting && (
                    <label className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow cursor-pointer">
                        Sửa ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={e => onAvatarChange?.(e.target.files?.[0])} />
                    </label>
                )}
            </div>
        );
        const ThinRule = () => <div className="border-t border-gray-200 my-3" />;
        const HeavyRule = () => <div className="border-t-2 border-gray-800 my-3" />;
        const Title = ({ children }) => (
            <div className="uppercase font-semibold tracking-wide text-[16px]">{children}</div>
        );
        const Row = ({ left, right, boldRight }) => (
            <div className="grid grid-cols-5 gap-4 text-sm text-gray-700">
                <div className="col-span-2 text-gray-500">{left}</div>
                <div className={`col-span-3 ${boldRight ? 'font-semibold' : ''}`}>{right}</div>
            </div>
        );
        return (
            <div className="bg-white w-full max-w-[800px] mx-auto p-8" style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '15px' }}>
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-start gap-6">
                        <Avatar />
                        <div className="flex-1">
                            {isExporting ? (
                                <div className="text-2xl font-extrabold italic text-gray-800">{data.fullName || 'Họ Tên'}</div>
                            ) : (
                                <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ Tên" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 bg-transparent font-extrabold text-2xl italic" />
                            )}
                            <div className="text-sm text-gray-600 mt-1">
                                {isExporting ? (
                                    <div>{data.appliedPosition || 'Vị trí ứng tuyển'}</div>
                                ) : (
                                    <input type="text" name="appliedPosition" value={data.appliedPosition} onChange={onChange} placeholder="Vị trí ứng tuyển" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />
                                )}
                            </div>
                            <div className="mt-2 text-[14px]">
                                <div className="flex gap-2"><span className="font-semibold">Ngày sinh:</span> {isExporting ? (data.dob || 'DD/MM/YY') : (<input type="text" name="dob" value={data.dob} onChange={onChange} placeholder="DD/MM/YY" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />)}</div>
                                <div className="flex gap-2"><span className="font-semibold">Giới tính:</span> {isExporting ? (data.gender || 'Nam/Nữ') : (<input type="text" name="gender" value={data.gender} onChange={onChange} placeholder="Nam/Nữ" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />)}</div>
                                <div className="flex gap-2"><span className="font-semibold">Số điện thoại:</span> {isExporting ? (data.phone || '0123 456 789') : (<input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="0123 456 789" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />)}</div>
                                <div className="flex gap-2"><span className="font-semibold">Email:</span> {isExporting ? (data.email || 'tencuaban@example.com') : (<input type="email" name="email" value={data.email} onChange={onChange} placeholder="tencuaban@example.com" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />)}</div>
                                <div className="flex gap-2"><span className="font-semibold">Website:</span> {isExporting ? (data.website || 'facebook.com/TopCV.vn') : (<input type="text" name="website" value={data.website} onChange={onChange} placeholder="facebook.com/TopCV.vn" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />)}</div>
                                <div className="flex gap-2"><span className="font-semibold">Địa chỉ:</span> {isExporting ? (data.address || 'Quận A, thành phố Hà Nội') : (<input type="text" name="address" value={data.address} onChange={onChange} placeholder="Quận A, thành phố Hà Nội" className="flex-1 bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" />)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mục tiêu nghề nghiệp */}
                <Title>Mục tiêu nghề nghiệp</Title>
                <HeavyRule />
                <div className="pl-20">
                    {isExporting ? (
                        <div className="text-sm text-gray-700 whitespace-pre-line mb-4">{data.summary || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn'}</div>
                    ) : (
                        <input type="text" name="summary" value={data.summary} onChange={onChange} placeholder="Mục tiêu nghề nghiệp của bạn" className="w-full outline-none border-b border-gray-200 focus:border-gray-600 text-sm mb-4" />
                    )}
                </div>

                {/* Học vấn */}
                <Title>Học vấn</Title>
                <HeavyRule />
                <div className="pl-20">
                    {(data.educationList || []).map((edu, idx) => (
                        <div key={idx} className="mb-3">
                            {/* Trường học (full width) */}
                            <div className="text-sm">
                                {isExporting ? (
                                    <div className="font-bold text-gray-900 text-[15px]">{edu.school || 'Tên trường học'}</div>
                                ) : (
                                    <input type="text" value={edu.school} onChange={listChange('educationList', idx, 'school')} placeholder="Tên trường học" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 text-sm font-semibold" />
                                )}
                            </div>
                            {/* Chi tiết */}
                            <div className="pl-0 text-sm">
                                {isExporting ? (
                                    <div className="text-gray-600">{edu.time || 'Thời gian (ví dụ: 2016 - 2020)'}</div>
                                ) : (
                                    <input type="text" value={edu.time} onChange={listChange('educationList', idx, 'time')} placeholder="Thời gian (ví dụ: 2016 - 2020)" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                )}
                                {isExporting ? (
                                    <div className="mt-1"><span className="font-semibold text-gray-800">Chuyên ngành:</span> <span className="font-semibold text-gray-800">{edu.major || 'Ngành học / Môn học'}</span></div>
                                ) : (
                                    <input type="text" value={edu.major} onChange={listChange('educationList', idx, 'major')} placeholder="Ngành học / Môn học" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 mt-1" />
                                )}
                                {/* Xếp loại / GPA (edit) */}
                                {!isExporting && (
                                    <input type="text" value={edu.result || ''} onChange={listChange('educationList', idx, 'result')} placeholder="Xếp loại / GPA" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 mt-1" />
                                )}
                                {isExporting ? (
                                    <ul className="list-disc pl-6 text-gray-800 space-y-1 mt-1">
                                        {edu.result ? (<li>{`Xếp loại: ${edu.result}`}</li>) : null}
                                        {(edu.note || '').split('\n').map((l, i) => l.trim() ? (<li key={i}>{l}</li>) : null)}
                                    </ul>
                                ) : (
                                    <input type="text" value={edu.note} onChange={listChange('educationList', idx, 'note')} placeholder="Ghi chú, môn học liên quan, thành tích nổi bật..." className="w-full outline-none border-b border-gray-200 focus:border-gray-600 mt-1" />
                                )}
                            </div>
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                </div>

                {/* Kinh nghiệm */}
                <Title>Kinh nghiệm làm việc</Title>
                <HeavyRule />
                <div className="pl-20">
                    {(data.experienceList || []).map((exp, idx) => (
                        <div key={idx} className="mb-3">
                            {/* Tổ chức (full width) */}
                            <div className="text-sm">
                                {isExporting ? (
                                    <div className="font-semibold text-gray-700">{exp.company || 'Tên tổ chức'}</div>
                                ) : (
                                    <input type="text" value={exp.company} onChange={listChange('experienceList', idx, 'company')} placeholder="Tên tổ chức" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />
                                )}
                            </div>
                            {/* Thời gian */}
                            <div className="pl-0 text-sm text-gray-600 italic">
                                {isExporting ? (
                                    <div>{exp.time || 'Thời gian (ví dụ: 03/2022 - 02/2025)'}</div>
                                ) : (
                                    <input type="text" value={exp.time} onChange={listChange('experienceList', idx, 'time')} placeholder="Thời gian (ví dụ: 03/2022 - 02/2025)" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                )}
                            </div>
                            {/* Vị trí */}
                            <div className="pl-0">
                                {isExporting ? (
                                    <div className="font-semibold">{exp.position || 'Vị trí của bạn'}</div>
                                ) : (
                                    <input type="text" value={exp.position} onChange={listChange('experienceList', idx, 'position')} placeholder="Vị trí của bạn" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                )}
                            </div>
                            {/* Mô tả */}
                            <div className="pl-0">
                                {isExporting ? (
                                    <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1">
                                        {(exp.details || '').split('\n').map((l, i) => l.trim() ? (<li key={i}>{l}</li>) : null)}
                                    </ul>
                                ) : (
                                    <input type="text" value={exp.details} onChange={listChange('experienceList', idx, 'details')} placeholder="Mô tả kinh nghiệm làm việc của bạn" className="w-full outline-none border-b border-gray-200 focus:border-gray-600 text-sm" />
                                )}
                            </div>
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                </div>

                {/* Hoạt động */}
                <Title>Hoạt động</Title>
                <HeavyRule />
                <div className="pl-20">
                    {(data.activityList || []).map((act, idx) => (
                        <div key={idx} className="mb-3">
                            {/* Tổ chức (full width) */}
                            <div className="text-sm">
                                {isExporting ? (
                                    <div className="font-semibold text-gray-700">{act.org || 'Tên tổ chức'}</div>
                                ) : (
                                    <input type="text" value={act.org} onChange={listChange('activityList', idx, 'org')} placeholder="Tên tổ chức" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />
                                )}
                            </div>
                            {/* Thời gian */}
                            <div className="pl-0 text-sm text-gray-600 italic">
                                {isExporting ? (
                                    <div>{act.time || 'Thời gian (ví dụ: 08/2016 - 08/2018)'}</div>
                                ) : (
                                    <input type="text" value={act.time} onChange={listChange('activityList', idx, 'time')} placeholder="Thời gian (ví dụ: 08/2016 - 08/2018)" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                )}
                            </div>
                            {/* Vai trò */}
                            <div className="pl-0">
                                {isExporting ? (
                                    <div className="font-semibold">{act.role || 'Vị trí của bạn'}</div>
                                ) : (
                                    <input type="text" value={act.role} onChange={listChange('activityList', idx, 'role')} placeholder="Vị trí của bạn" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-semibold" />
                                )}
                            </div>
                            {/* Mô tả */}
                            <div className="pl-0">
                                {isExporting ? (
                                    <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1">
                                        {(act.details || '').split('\n').map((l, i) => l.trim() ? (<li key={i}>{l}</li>) : null)}
                                    </ul>
                                ) : (
                                    <input type="text" value={act.details} onChange={listChange('activityList', idx, 'details')} placeholder="Mô tả hoạt động" className="w-full outline-none border-b border-gray-200 focus:border-gray-600 text-sm" />
                                )}
                            </div>
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                </div>

                {/* Chứng chỉ */}
                <Title>Chứng chỉ</Title>
                <HeavyRule />
                <div className="pl-20">
                    {(data.certificatesList || []).map((c, idx) => (
                        <div key={idx} className="mb-3">
                            {/* Tên chứng chỉ (full width) */}
                            <div className="text-sm">
                                {isExporting ? (
                                    <div className="font-semibold text-gray-700">{c.name || 'Tên chứng chỉ'}</div>
                                ) : (
                                    <input type="text" value={c.name} onChange={listChange('certificatesList', idx, 'name')} placeholder="Tên chứng chỉ" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />
                                )}
                            </div>
                            {/* Thời gian */}
                            <div className="pl-0 text-sm text-gray-600 italic">
                                {isExporting ? (
                                    <div>{c.time || 'Thời gian'}</div>
                                ) : (
                                    <input type="text" value={c.time} onChange={listChange('certificatesList', idx, 'time')} placeholder="Thời gian" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                )}
                            </div>
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('certificatesList', { time: '', name: '' })}>+ Thêm chứng chỉ</button>}
                </div>

                {/* Danh hiệu & Giải thưởng */}
                <Title>Danh hiệu và Giải thưởng</Title>
                <HeavyRule />
                <div className="pl-20">
                    {(data.awardsList || []).map((a, idx) => (
                        <div key={idx} className="mb-3">
                            {/* Tên giải thưởng (full width) */}
                            <div className="text-sm">
                                {isExporting ? (
                                    <div className="font-semibold text-gray-700">{a.title || 'Tên giải thưởng'}</div>
                                ) : (
                                    <input type="text" value={a.title} onChange={listChange('awardsList', idx, 'title')} placeholder="Tên giải thưởng" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />
                                )}
                            </div>
                            {/* Thời gian */}
                            <div className="pl-0 text-sm text-gray-600 italic">
                                {isExporting ? (
                                    <div>{a.time || 'Thời gian'}</div>
                                ) : (
                                    <input type="text" value={a.time} onChange={listChange('awardsList', idx, 'time')} placeholder="Thời gian" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                )}
                            </div>
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('awardsList', { time: '', title: '' })}>+ Thêm giải thưởng</button>}
                </div>

                {/* Kỹ năng */}
                <Title>Kỹ năng</Title>
                <HeavyRule />
                <div className="pl-20">
                    {(data.skillsList || []).map((s, idx) => (
                        <div key={idx} className="mb-3">
                            {/* Tên kỹ năng (full width) */}
                            <div className="text-sm">
                                {isExporting ? (
                                    <div className="font-semibold text-gray-700">{s.name || 'Tên kỹ năng'}</div>
                                ) : (
                                    <input type="text" value={s.name} onChange={listChange('skillsList', idx, 'name')} placeholder="Tên kỹ năng" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />
                                )}
                            </div>
                            {/* Mô tả kỹ năng */}
                            <div className="pl-0">
                                {isExporting ? (
                                    <div className="text-sm text-gray-700 whitespace-pre-line">{s.description || 'Mô tả kỹ năng'}</div>
                                ) : (
                                    <input type="text" value={s.description} onChange={listChange('skillsList', idx, 'description')} placeholder="Mô tả kỹ năng" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 text-sm" />
                                )}
                            </div>
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('skillsList', { name: '', description: '' })}>+ Thêm kỹ năng</button>}
                </div>

                {/* Đã gỡ Người giới thiệu và Sở thích theo yêu cầu */}
            </div>
        );
    }
    if (templateStyle === 'sidebar') {
        return (
            <div className="bg-white w-full max-w-[900px] mx-auto border border-gray-200 rounded overflow-hidden shadow" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <div className="flex">
                    {/* Sidebar trái */}
                    <aside className="w-[280px] bg-gray-50 border-r border-gray-200 p-6">
                        <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-gray-700">{(data.fullName || 'A')[0]}</div>
                        <div className="text-center mb-4">
                            {isExporting ? (
                                <div className="font-extrabold text-lg">{data.fullName || 'Họ và tên'}</div>
                            ) : (
                                <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full text-center bg-transparent outline-none border-b border-gray-300 focus:border-gray-600 font-extrabold text-lg" />
                            )}
                            <div className="text-xs text-gray-600 mt-1">
                                {isExporting ? (
                                    <span>{data.email || 'Email'}</span>
                                ) : (
                                    <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="w-full text-center bg-transparent outline-none border-b border-gray-300 focus:border-gray-600 text-xs" />
                                )}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {isExporting ? (
                                    <span>{data.phone || 'Số điện thoại'}</span>
                                ) : (
                                    <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="w-full text-center bg-transparent outline-none border-b border-gray-300 focus:border-gray-600 text-xs" />
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="uppercase text-xs font-bold text-gray-700 tracking-wider mb-1">Mục tiêu</div>
                            {isExporting ? (
                                <div className="text-sm text-gray-700 whitespace-pre-line">{data.summary}</div>
                            ) : (
                                <textarea name="summary" value={data.summary} onChange={onChange} rows={6} placeholder="Tóm tắt, mục tiêu nghề nghiệp" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-600 text-sm" />
                            )}
                        </div>
                    </aside>
                    {/* Nội dung phải */}
                    <main className="flex-1 p-8">
                        <Section title="Kinh nghiệm làm việc">
                            {data.experienceList?.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{exp.time}</span><span className="w-2/3 inline-block text-right">{exp.company}</span></>) : (
                                            <><input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-600" />
                                                <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (
                                        <>
                                            <div className="font-bold">{exp.position}</div>
                                            <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (<li key={i}>{line}</li>))}</ul>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="w-full outline-none border-b border-gray-300 focus:border-gray-600 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (<li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-gray-600" placeholder="Mô tả, thành tích..." /></li>))}
                                                <li><button type="button" className="text-xs text-gray-700 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                    {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{edu.time}</span><span className="w-2/3 inline-block text-right">{edu.school}</span></>) : (
                                            <><input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-600" />
                                                <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div></>) : (
                                        <>
                                            <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="w-full outline-none border-b border-gray-300 focus:border-gray-600 mt-1" />
                                            <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="w-full outline-none border-b border-gray-300 focus:border-gray-600 mt-1" />
                                            <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="w-full outline-none border-b border-gray-300 focus:border-gray-600 mt-1" />
                                        </>
                                    )}
                                    {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                        <Section title="Hoạt động">
                            {data.activityList?.map((act, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{act.time}</span><span className="w-2/3 inline-block text-right">{act.org}</span></>) : (
                                            <><input type="text" placeholder="08/2016 - 08/2018" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-600" />
                                                <input type="text" placeholder="Tên tổ chức..." value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{act.role}</div><ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((line, i) => (<li key={i}>{line}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" placeholder="Vai trò" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} className="w-full outline-none border-b border-gray-300 focus:border-gray-600 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((line, i) => (<li key={i}><input type="text" value={line} onChange={e => { const lines = (act.details || '').split('\n'); lines[i] = e.target.value; onListChange('activityList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-gray-600" placeholder="Mô tả hoạt động, thành tích..." /></li>))}
                                                <li><button type="button" className="text-xs text-gray-700 underline" onClick={() => onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                    {data.activityList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                        </Section>
                    </main>
                </div>
            </div>
        );
    }
    if (templateStyle === 'minimal') {
        return (
            <div className="bg-white w-full max-w-[820px] mx-auto p-8 border border-gray-200 rounded shadow-sm" style={{ fontFamily: 'Poppins, Arial, sans-serif', fontSize: '15px' }}>
                <div className="mb-6">
                    <div className="text-2xl font-bold">{isExporting ? (data.fullName || 'Họ và tên') : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-600 font-bold text-2xl" />
                    )}</div>
                    <div className="text-sm text-gray-600 mt-1">
                        {isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                            <div className="flex gap-4">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-gray-300 focus:border-gray-600" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-gray-300 focus:border-gray-600" />
                            </div>
                        )}
                    </div>
                </div>
                <Section title="Tóm tắt">
                    <Box>
                        {isExporting ? (<div className="whitespace-pre-line">{data.summary}</div>) : (
                            <textarea name="summary" value={data.summary} onChange={onChange} rows={3} placeholder="Tóm tắt ngắn gọn về bạn" className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-gray-600" />
                        )}
                    </Box>
                </Section>
                <Section title="Kinh nghiệm làm việc">
                    {data.experienceList?.map((exp, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (<><span>{exp.time}</span><span>{exp.company}</span></>) : (
                                    <><input type="text" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} placeholder="03/2022 - 02/2025" className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-600" />
                                        <input type="text" value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} placeholder="Tên công ty..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-600" /></>
                                )}
                            </div>
                            {isExporting ? (<><div className="font-bold">{exp.position}</div><ul className="list-disc ml-5">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                <>
                                    <input type="text" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} placeholder="Vị trí" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 font-bold" />
                                    <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (<li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-gray-600" /></li>))}
                                        <li><button type="button" className="text-xs text-gray-700 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                    </ul>
                                </>
                            )}
                            {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                </Section>
                <Section title="Học vấn">
                    {data.educationList?.map((edu, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (<><span>{edu.time}</span><span>{edu.school}</span></>) : (
                                    <><input type="text" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} placeholder="2016 - 2020" className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-600" />
                                        <input type="text" value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} placeholder="Tên trường..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-600" /></>
                                )}
                            </div>
                            {isExporting ? (<><div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div></>) : (
                                <>
                                    <input type="text" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} placeholder="Chuyên ngành" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 mt-1" />
                                    <input type="text" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} placeholder="Kết quả/Thành tích" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 mt-1" />
                                    <input type="text" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 mt-1" />
                                </>
                            )}
                            {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                </Section>
                <Section title="Hoạt động">
                    {data.activityList?.map((act, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (<><span>{act.time}</span><span>{act.org}</span></>) : (
                                    <><input type="text" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} placeholder="08/2016 - 08/2018" className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-600" />
                                        <input type="text" value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} placeholder="Tên tổ chức..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-600" /></>
                                )}
                            </div>
                            {isExporting ? (<><div className="font-bold">{act.role}</div><ul className="list-disc ml-5">{(act.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                <>
                                    <input type="text" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} placeholder="Vai trò" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 font-bold mt-1" />
                                    <ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((line, i) => (<li key={i}><input type="text" value={line} onChange={e => { const lines = (act.details || '').split('\n'); lines[i] = e.target.value; onListChange('activityList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-gray-600" /></li>))}
                                        <li><button type="button" className="text-xs text-gray-700 underline" onClick={() => onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                    </ul>
                                </>
                            )}
                            {data.activityList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                </Section>
            </div>
        );
    }
    if (templateStyle === 'corporate') {
        return (
            <div className="bg-white w-full max-w-[900px] mx-auto border border-blue-200 rounded shadow overflow-hidden" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6">
                    <div className="text-2xl font-extrabold">{isExporting ? (data.fullName || 'Họ và tên') : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="bg-transparent outline-none border-b border-white/70 focus:border-white w-full font-extrabold text-2xl" />
                    )}</div>
                    <div className="opacity-90 mt-1">
                        {isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                            <div className="flex gap-4">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-white/70 focus:border-white" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-white/70 focus:border-white" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8 p-8">
                    <div className="col-span-2">
                        <Section title="Kinh nghiệm làm việc">
                            {data.experienceList?.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{exp.time}</span><span className="w-2/3 inline-block text-right">{exp.company}</span></>) : (
                                            <><input type="text" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} placeholder="03/2022 - 02/2025" className="w-1/3 outline-none border-b border-gray-300 focus:border-blue-600" />
                                                <input type="text" value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} placeholder="Tên công ty..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-blue-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{exp.position}</div><ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} placeholder="Vị trí" className="w-full outline-none border-b border-gray-300 focus:border-blue-600 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (<li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-blue-600" placeholder="Mô tả..." /></li>))}
                                                <li><button type="button" className="text-xs text-blue-700 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-blue-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{edu.time}</span><span className="w-2/3 inline-block text-right">{edu.school}</span></>) : (
                                            <><input type="text" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} placeholder="2016 - 2020" className="w-1/3 outline-none border-b border-gray-300 focus:border-blue-600" />
                                                <input type="text" value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} placeholder="Tên trường..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-blue-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div></>) : (
                                        <>
                                            <input type="text" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} placeholder="Chuyên ngành" className="w-full outline-none border-b border-gray-300 focus:border-blue-600 mt-1" />
                                            <input type="text" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} placeholder="Kết quả/Thành tích" className="w-full outline-none border-b border-gray-300 focus:border-blue-600 mt-1" />
                                            <input type="text" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full outline-none border-b border-gray-300 focus:border-blue-600 mt-1" />
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-blue-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                    </div>
                    <div className="col-span-1">
                        <Section title="Tóm tắt">
                            {isExporting ? (<div className="text-sm text-gray-700 whitespace-pre-line">{data.summary}</div>) : (
                                <textarea name="summary" value={data.summary} onChange={onChange} rows={8} placeholder="Tóm tắt nghề nghiệp" className="w-full outline-none border-b border-gray-300 focus:border-blue-600 text-sm" />
                            )}
                        </Section>
                        <Section title="Hoạt động">
                            {data.activityList?.map((act, idx) => (
                                <Box key={idx}>
                                    <div className="text-xs text-gray-500">{isExporting ? act.time : (<input type="text" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} placeholder="08/2016 - 08/2018" className="w-full outline-none border-b border-gray-300 focus:border-blue-600 text-xs" />)}</div>
                                    <div className="font-semibold">{isExporting ? act.org : (<input type="text" value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} placeholder="Tên tổ chức..." className="w-full outline-none border-b border-gray-300 focus:border-blue-600" />)}</div>
                                    <div className="text-sm">{isExporting ? act.role : (<input type="text" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} placeholder="Vai trò" className="w-full outline-none border-b border-gray-300 focus:border-blue-600" />)}</div>
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-blue-700 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    if (templateStyle === 'creative') {
        return (
            <div className="bg-white w-full max-w-[880px] mx-auto p-8 border border-fuchsia-200 rounded-xl shadow" style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '15px' }}>
                <div className="mb-6">
                    {isExporting ? (
                        <div className="text-3xl font-extrabold text-fuchsia-700">{data.fullName || 'Họ và tên'}</div>
                    ) : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full outline-none border-b border-fuchsia-300 focus:border-fuchsia-600 bg-transparent text-3xl font-extrabold text-fuchsia-700" />
                    )}
                    <div className="text-fuchsia-600 mt-1">
                        {isExporting ? (<span>{data.email || 'Email'} | {data.phone || 'Số điện thoại'}</span>) : (
                            <div className="flex gap-4">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="outline-none border-b border-fuchsia-300 focus:border-fuchsia-600 bg-transparent" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="outline-none border-b border-fuchsia-300 focus:border-fuchsia-600 bg-transparent" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <Section title="Tóm tắt">
                            {isExporting ? (<div className="whitespace-pre-line">{data.summary}</div>) : (
                                <textarea name="summary" value={data.summary} onChange={onChange} rows={6} placeholder="Giới thiệu ngắn, điểm mạnh" className="w-full outline-none border-b border-fuchsia-300 focus:border-fuchsia-600" />
                            )}
                        </Section>
                        <Section title="Hoạt động">
                            {data.activityList?.map((act, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span>{act.time}</span><span>{act.org}</span></>) : (
                                            <><input type="text" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} placeholder="08/2016 - 08/2018" className="w-1/3 outline-none border-b border-fuchsia-300 focus:border-fuchsia-600" />
                                                <input type="text" value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} placeholder="Tên tổ chức..." className="w-2/3 text-right outline-none border-b border-fuchsia-300 focus:border-fuchsia-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{act.role}</div><ul className="list-disc ml-5">{(act.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} placeholder="Vai trò" className="w-full outline-none border-b border-fuchsia-300 focus:border-fuchsia-600 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((line, i) => (<li key={i}><input type="text" value={line} onChange={e => { const lines = (act.details || '').split('\n'); lines[i] = e.target.value; onListChange('activityList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-fuchsia-300 focus:border-fuchsia-600" /></li>))}
                                                <li><button type="button" className="text-xs text-fuchsia-700 underline" onClick={() => onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-fuchsia-700 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                        </Section>
                    </div>
                    <div>
                        <Section title="Kinh nghiệm làm việc">
                            {data.experienceList?.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span>{exp.time}</span><span>{exp.company}</span></>) : (
                                            <><input type="text" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} placeholder="03/2022 - 02/2025" className="w-1/3 outline-none border-b border-fuchsia-300 focus:border-fuchsia-600" />
                                                <input type="text" value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} placeholder="Tên công ty..." className="w-2/3 text-right outline-none border-b border-fuchsia-300 focus:border-fuchsia-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{exp.position}</div><ul className="list-disc ml-5">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} placeholder="Vị trí" className="w-full outline-none border-b border-fuchsia-300 focus:border-fuchsia-600 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (<li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-fuchsia-300 focus:border-fuchsia-600" /></li>))}
                                                <li><button type="button" className="text-xs text-fuchsia-700 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-fuchsia-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span>{edu.time}</span><span>{edu.school}</span></>) : (
                                            <><input type="text" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} placeholder="2016 - 2020" className="w-1/3 outline-none border-b border-fuchsia-300 focus:border-fuchsia-600" />
                                                <input type="text" value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} placeholder="Tên trường..." className="w-2/3 text-right outline-none border-b border-fuchsia-300 focus:border-fuchsia-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div></>) : (
                                        <>
                                            <input type="text" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} placeholder="Chuyên ngành" className="w-full outline-none border-b border-fuchsia-300 focus:border-fuchsia-600 mt-1" />
                                            <input type="text" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} placeholder="Kết quả/Thành tích" className="w-full outline-none border-b border-fuchsia-300 focus:border-fuchsia-600 mt-1" />
                                            <input type="text" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full outline-none border-b border-fuchsia-300 focus:border-fuchsia-600 mt-1" />
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-fuchsia-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    if (templateStyle === 'timeline') {
        return (
            <div className="bg-white w-full max-w-[880px] mx-auto p-8 border border-gray-200 rounded shadow" style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '15px' }}>
                <div className="mb-6">
                    <div className="text-2xl font-extrabold">{isExporting ? (data.fullName || 'Họ và tên') : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-extrabold text-2xl" />
                    )}</div>
                    <div className="text-sm text-gray-600 mt-1">{isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                        <div className="flex gap-4"><input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="outline-none border-b border-gray-300 focus:border-gray-700" /><input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="outline-none border-b border-gray-300 focus:border-gray-700" /></div>
                    )}</div>
                </div>
                <Section title="Kinh nghiệm & Học vấn">
                    <div className="relative pl-8">
                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                        {(() => {
                            const expCount = (data.experienceList || []).length;
                            const merged = [
                                ...((data.experienceList || []).map((e, i) => ({ type: 'exp', idx: i, ...e }))),
                                ...((data.educationList || []).map((e, i) => ({ type: 'edu', idx: i, ...e })))
                            ];
                            return merged;
                        })().map((item, idx) => (
                            <div key={idx} className="relative mb-5">
                                <div className="absolute -left-0.5 top-1 w-3 h-3 rounded-full bg-gray-600"></div>
                                <div className="flex justify-between font-semibold">
                                    {isExporting ? (<><span className="text-sm text-gray-600">{item.time}</span><span>{item.type === 'exp' ? item.company : item.school}</span></>) : (
                                        <>
                                            <input type="text" value={item.time} onChange={e => {
                                                if (item.type === 'exp') onListChange('experienceList', item.idx, 'time', e.target.value);
                                                else onListChange('educationList', item.idx, 'time', e.target.value);
                                            }} placeholder={item.type === 'exp' ? "03/2022 - 02/2025" : "2016 - 2020"} className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-700 text-sm text-gray-700" />
                                            <input type="text" value={item.type === 'exp' ? item.company : item.school} onChange={e => {
                                                if (item.type === 'exp') onListChange('experienceList', item.idx, 'company', e.target.value);
                                                else onListChange('educationList', item.idx, 'school', e.target.value);
                                            }} placeholder={item.type === 'exp' ? "Tên công ty..." : "Tên trường..."} className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-700" />
                                        </>
                                    )}
                                </div>
                                <div className="mt-1">
                                    {item.type === 'exp' ? (
                                        isExporting ? (
                                            <>
                                                <div className="font-bold">{item.position}</div>
                                                <ul className="list-disc ml-5">{(item.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" value={item.position} onChange={e => onListChange('experienceList', item.idx, 'position', e.target.value)} placeholder="Vị trí" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-bold" />
                                                <ul className="list-disc ml-5 mt-1">{(item.details || '').split('\n').map((line, i) => (
                                                    <li key={i}><input type="text" value={line} onChange={e => { const lines = (item.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', item.idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-gray-700" placeholder="Mô tả, thành tích..." /></li>
                                                ))}
                                                    <li><button type="button" className="text-xs text-gray-700 underline" onClick={() => onListChange('experienceList', item.idx, 'details', (item.details ? item.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                                </ul>
                                            </>
                                        )
                                    ) : (
                                        isExporting ? (
                                            <>
                                                <div>{item.major}</div><div>{item.result}</div><div>{item.note}</div>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" value={item.major} onChange={e => onListChange('educationList', item.idx, 'major', e.target.value)} placeholder="Chuyên ngành" className="w-full outline-none border-b border-gray-300 focus:border-gray-700" />
                                                <input type="text" value={item.result} onChange={e => onListChange('educationList', item.idx, 'result', e.target.value)} placeholder="Kết quả/Thành tích" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 mt-1" />
                                                <input type="text" value={item.note} onChange={e => onListChange('educationList', item.idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 mt-1" />
                                            </>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
                <Section title="Hoạt động">
                    {data.activityList?.map((act, idx) => (
                        <Box key={idx}>
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (<><span>{act.time}</span><span>{act.org}</span></>) : (
                                    <><input type="text" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} placeholder="08/2016 - 08/2018" className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-700" />
                                        <input type="text" value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} placeholder="Tên tổ chức..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-700" /></>
                                )}
                            </div>
                            {isExporting ? (<><div className="font-bold">{act.role}</div><ul className="list-disc ml-5">{(act.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                <input type="text" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} placeholder="Vai trò" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-bold mt-1" />
                            )}
                        </Box>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                </Section>
            </div>
        );
    }
    if (templateStyle === 'compact') {
        return (
            <div className="bg-white w-full max-w-[780px] mx-auto p-6 border border-gray-200 rounded shadow" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: 1.4 }}>
                <div className="flex justify-between items-end mb-4">
                    <div className="text-xl font-bold">{isExporting ? (data.fullName || 'Họ và tên') : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 font-bold text-xl" />
                    )}</div>
                    <div className="text-xs text-gray-600">
                        {isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                            <div className="flex gap-3">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="outline-none border-b border-gray-300 focus:border-gray-600" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="outline-none border-b border-gray-300 focus:border-gray-600" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Section title="Kinh nghiệm">
                            {data.experienceList?.map((exp, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="flex justify-between text-sm font-semibold">
                                        {isExporting ? (<><span>{exp.time}</span><span>{exp.company}</span></>) : (
                                            <><input type="text" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} placeholder="03/2022 - 02/2025" className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-600" />
                                                <input type="text" value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} placeholder="Tên công ty..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{exp.position}</div><ul className="list-disc ml-5">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} placeholder="Vị trí" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 font-bold" />
                                            <ul className="list-disc ml-5">{(exp.details || '').split('\n').map((line, i) => (<li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-gray-600" /></li>))}</ul>
                                            {!isExporting && <button type="button" className="text-xs text-gray-700 underline mt-1" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button>}
                                        </>
                                    )}
                                </div>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                    </div>
                    <div>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="flex justify-between text-sm font-semibold">
                                        {isExporting ? (<><span>{edu.time}</span><span>{edu.school}</span></>) : (
                                            <><input type="text" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} placeholder="2016 - 2020" className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-600" />
                                                <input type="text" value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} placeholder="Tên trường..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div></>) : (
                                        <>
                                            <input type="text" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} placeholder="Chuyên ngành" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 mt-1" />
                                            <input type="text" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} placeholder="Kết quả/Thành tích" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 mt-1" />
                                            <input type="text" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 mt-1" />
                                        </>
                                    )}
                                </div>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                        <Section title="Tóm tắt">
                            {isExporting ? (<div className="text-sm whitespace-pre-line">{data.summary}</div>) : (
                                <textarea name="summary" value={data.summary} onChange={onChange} rows={5} placeholder="Tóm tắt" className="w-full outline-none border-b border-gray-300 focus:border-gray-600 text-sm" />
                            )}
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    if (templateStyle === 'harvard') {
        // Phong cách học thuật: tên lớn, gạch phân khu mảnh, chữ serif cho tiêu đề
        return (
            <div className="bg-white w-full max-w-[820px] mx-auto p-8 border border-gray-300" style={{ fontFamily: 'Georgia, Times New Roman, serif', fontSize: '15px' }}>
                <div className="mb-2 text-3xl font-bold tracking-tight">
                    {isExporting ? (data.fullName || 'Họ và tên') : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full border-b border-gray-400 focus:border-gray-700 outline-none bg-transparent font-bold text-3xl" />
                    )}
                </div>
                <div className="text-sm text-gray-700 mb-4">{isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                    <div className="flex gap-4"><input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-gray-400 focus:border-gray-700" /><input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-gray-400 focus:border-gray-700" /></div>
                )}</div>
                <div className="border-t border-gray-400 my-2" />
                <Section title="Tóm tắt">
                    {isExporting ? (<div className="whitespace-pre-line">{data.summary}</div>) : (
                        <textarea name="summary" value={data.summary} onChange={onChange} rows={4} placeholder="Tổng quan học thuật/kinh nghiệm" className="w-full border-b border-gray-400 focus:border-gray-700 outline-none" />
                    )}
                </Section>
                <Section title="Học vấn">
                    {data.educationList?.map((edu, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (<><span>{edu.time}</span><span>{edu.school}</span></>) : (
                                    <><input type="text" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} placeholder="2016 - 2020" className="w-1/3 outline-none border-b border-gray-400 focus:border-gray-700" />
                                        <input type="text" value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} placeholder="Tên trường..." className="w-2/3 text-right outline-none border-b border-gray-400 focus:border-gray-700" /></>
                                )}
                            </div>
                            {isExporting ? (<><div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div></>) : (
                                <>
                                    <input type="text" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} placeholder="Chuyên ngành" className="w-full outline-none border-b border-gray-400 focus:border-gray-700 mt-1" />
                                    <input type="text" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} placeholder="Kết quả/Thành tích" className="w-full outline-none border-b border-gray-400 focus:border-gray-700 mt-1" />
                                    <input type="text" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full outline-none border-b border-gray-400 focus:border-gray-700 mt-1" />
                                </>
                            )}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                </Section>
                <Section title="Kinh nghiệm làm việc">
                    {data.experienceList?.map((exp, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (<><span>{exp.time}</span><span>{exp.company}</span></>) : (
                                    <><input type="text" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} placeholder="03/2022 - 02/2025" className="w-1/3 outline-none border-b border-gray-400 focus:border-gray-700" />
                                        <input type="text" value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} placeholder="Tên công ty..." className="w-2/3 text-right outline-none border-b border-gray-400 focus:border-gray-700" /></>
                                )}
                            </div>
                            {isExporting ? (<><div className="font-bold">{exp.position}</div><ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                <>
                                    <input type="text" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} placeholder="Vị trí" className="w-full outline-none border-b border-gray-400 focus:border-gray-700 font-bold mt-1" />
                                    <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (
                                        <li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-400 focus:border-gray-700" placeholder="Mô tả, thành tích..." /></li>
                                    ))}
                                        <li><button type="button" className="text-xs text-gray-800 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                    </ul>
                                </>
                            )}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                </Section>
                <Section title="Hoạt động">
                    {data.activityList?.map((act, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="flex justify-between font-semibold">
                                {isExporting ? (<><span>{act.time}</span><span>{act.org}</span></>) : (
                                    <><input type="text" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} placeholder="08/2016 - 08/2018" className="w-1/3 outline-none border-b border-gray-400 focus:border-gray-700" />
                                        <input type="text" value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} placeholder="Tên tổ chức..." className="w-2/3 text-right outline-none border-b border-gray-400 focus:border-gray-700" /></>
                                )}
                            </div>
                            {isExporting ? (<><div className="font-bold">{act.role}</div><ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                <>
                                    <input type="text" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} placeholder="Vai trò" className="w-full outline-none border-b border-gray-400 focus:border-gray-700 font-bold mt-1" />
                                    <ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((line, i) => (
                                        <li key={i}><input type="text" value={line} onChange={e => { const lines = (act.details || '').split('\n'); lines[i] = e.target.value; onListChange('activityList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-400 focus:border-gray-700" placeholder="Mô tả, thành tích..." /></li>
                                    ))}
                                        <li><button type="button" className="text-xs text-gray-800 underline" onClick={() => onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                    </ul>
                                </>
                            )}
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                </Section>
            </div>
        );
    }
    if (templateStyle === 'elegant') {
        // Thanh lịch: tiêu đề serif, nội dung sans, đường kẻ mảnh, khoảng trắng rộng
        return (
            <div className="bg-white w-full max-w-[860px] mx-auto p-10 border border-gray-200 rounded" style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '15px' }}>
                <div className="text-center mb-6">
                    <div className="text-4xl font-extrabold tracking-tight">
                        {isExporting ? (data.fullName || 'Họ và tên') : (
                            <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full max-w-[520px] mx-auto text-center border-b border-gray-300 focus:border-gray-700 outline-none bg-transparent font-extrabold text-4xl" />
                        )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                        {isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                            <div className="flex justify-center gap-4"><input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" /><input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-gray-300 focus:border-gray-700" /></div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-10" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                    <div className="col-span-1">
                        <Section title="Tóm tắt">
                            {isExporting ? (<div className="text-sm text-gray-800 whitespace-pre-line">{data.summary}</div>) : (
                                <textarea name="summary" value={data.summary} onChange={onChange} rows={6} placeholder="Giới thiệu ngắn gọn" className="w-full border-b border-gray-300 focus:border-gray-700 outline-none text-sm" />
                            )}
                        </Section>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{edu.time}</span><span className="w-2/3 inline-block text-right">{edu.school}</span></>) : (
                                            <><input type="text" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} placeholder="2016 - 2020" className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-700" />
                                                <input type="text" value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} placeholder="Tên trường..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-700" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div></>) : (
                                        <>
                                            <input type="text" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} placeholder="Chuyên ngành" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 mt-1" />
                                            <input type="text" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} placeholder="Kết quả/Thành tích" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 mt-1" />
                                            <input type="text" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 mt-1" />
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                    </div>
                    <div className="col-span-2">
                        <Section title="Kinh nghiệm làm việc">
                            {data.experienceList?.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{exp.time}</span><span className="w-2/3 inline-block text-right">{exp.company}</span></>) : (
                                            <><input type="text" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} placeholder="03/2022 - 02/2025" className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-700" />
                                                <input type="text" value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} placeholder="Tên công ty..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-700" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{exp.position}</div><ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} placeholder="Vị trí" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (
                                                <li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-gray-700" placeholder="Mô tả, thành tích..." /></li>
                                            ))}
                                                <li><button type="button" className="text-xs text-gray-800 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                        <Section title="Hoạt động">
                            {data.activityList?.map((act, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{act.time}</span><span className="w-2/3 inline-block text-right">{act.org}</span></>) : (
                                            <><input type="text" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} placeholder="08/2016 - 08/2018" className="w-1/3 outline-none border-b border-gray-300 focus:border-gray-700" />
                                                <input type="text" value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} placeholder="Tên tổ chức..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-gray-700" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{act.role}</div><ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} placeholder="Vai trò" className="w-full outline-none border-b border-gray-300 focus:border-gray-700 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((line, i) => (
                                                <li key={i}><input type="text" value={line} onChange={e => { const lines = (act.details || '').split('\n'); lines[i] = e.target.value; onListChange('activityList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-gray-700" placeholder="Mô tả hoạt động, thành tích..." /></li>
                                            ))}
                                                <li><button type="button" className="text-xs text-gray-800 underline" onClick={() => onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    if (templateStyle === 'gradient') {
        // Header dải màu gradient, nội dung 2 cột
        return (
            <div className="bg-white w-full max-w-[900px] mx-auto border border-gray-200 rounded overflow-hidden shadow" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-7">
                    <div className="text-3xl font-extrabold">
                        {isExporting ? (data.fullName || 'Họ và tên') : (
                            <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="bg-transparent outline-none border-b border-white/70 focus:border-white w-full font-extrabold text-3xl" />
                        )}
                    </div>
                    <div className="opacity-90 mt-1">
                        {isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                            <div className="flex gap-4 items-center"><input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-white/70 focus:border-white" /><input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-white/70 focus:border-white" /></div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8 p-8">
                    <div className="col-span-2">
                        <Section title="Kinh nghiệm làm việc">
                            {data.experienceList?.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{exp.time}</span><span className="w-2/3 inline-block text-right">{exp.company}</span></>) : (
                                            <><input type="text" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} placeholder="03/2022 - 02/2025" className="w-1/3 outline-none border-b border-gray-300 focus:border-indigo-600" />
                                                <input type="text" value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} placeholder="Tên công ty..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-indigo-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{exp.position}</div><ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} placeholder="Vị trí" className="w-full outline-none border-b border-gray-300 focus:border-indigo-600 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (
                                                <li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-gray-300 focus:border-indigo-600" placeholder="Mô tả, thành tích..." /></li>
                                            ))}
                                                <li><button type="button" className="text-xs text-indigo-700 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-indigo-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{edu.time}</span><span className="w-2/3 inline-block text-right">{edu.school}</span></>) : (
                                            <><input type="text" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} placeholder="2016 - 2020" className="w-1/3 outline-none border-b border-gray-300 focus:border-indigo-600" />
                                                <input type="text" value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} placeholder="Tên trường..." className="w-2/3 text-right outline-none border-b border-gray-300 focus:border-indigo-600" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div></>) : (
                                        <>
                                            <input type="text" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} placeholder="Chuyên ngành" className="w-full outline-none border-b border-gray-300 focus:border-indigo-600 mt-1" />
                                            <input type="text" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} placeholder="Kết quả/Thành tích" className="w-full outline-none border-b border-gray-300 focus:border-indigo-600 mt-1" />
                                            <input type="text" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full outline-none border-b border-gray-300 focus:border-indigo-600 mt-1" />
                                        </>
                                    )}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-indigo-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                    </div>
                    <div className="col-span-1">
                        <Section title="Tóm tắt">
                            {isExporting ? (<div className="text-sm text-gray-700 whitespace-pre-line">{data.summary}</div>) : (
                                <textarea name="summary" value={data.summary} onChange={onChange} rows={8} placeholder="Tóm tắt nghề nghiệp" className="w-full outline-none border-b border-gray-300 focus:border-indigo-600 text-sm" />
                            )}
                        </Section>
                        <Section title="Hoạt động">
                            {data.activityList?.map((act, idx) => (
                                <Box key={idx}>
                                    <div className="text-xs text-gray-500">{isExporting ? act.time : (<input type="text" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} placeholder="08/2016 - 08/2018" className="w-full outline-none border-b border-gray-300 focus:border-indigo-600 text-xs" />)}</div>
                                    <div className="font-semibold">{isExporting ? act.org : (<input type="text" value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} placeholder="Tên tổ chức..." className="w-full outline-none border-b border-gray-300 focus:border-indigo-600" />)}</div>
                                    <div className="text-sm">{isExporting ? act.role : (<input type="text" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} placeholder="Vai trò" className="w-full outline-none border-b border-gray-300 focus:border-indigo-600 text-sm" />)}</div>
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-indigo-700 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    if (templateStyle === 'student') {
        // Tập trung học vấn, hoạt động, chứng chỉ cho sinh viên/fresher (khác fresher: header đơn giản 1 cột)
        return (
            <div className="bg-white w-full max-w-[820px] mx-auto p-8 border border-teal-200 rounded" style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '15px' }}>
                <div className="mb-4">
                    <div className="text-2xl font-extrabold text-teal-700">{isExporting ? (data.fullName || 'Họ và tên') : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full outline-none border-b border-teal-300 focus:border-teal-700 bg-transparent font-extrabold text-2xl" />
                    )}</div>
                    <div className="text-sm text-teal-700 mt-1">{isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                        <div className="flex gap-4"><input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-teal-300 focus:border-teal-700" /><input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-teal-300 focus:border-teal-700" /></div>
                    )}</div>
                </div>
                <Section title="Mục tiêu/Định hướng">
                    {isExporting ? (<div className="whitespace-pre-line">{data.summary}</div>) : (
                        <textarea name="summary" value={data.summary} onChange={onChange} rows={4} placeholder="Định hướng học tập, kỹ năng nổi bật" className="w-full outline-none border-b border-teal-300 focus:border-teal-700" />
                    )}
                </Section>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{edu.time}</span><span className="w-2/3 inline-block text-right">{edu.school}</span></>) : (
                                            <><input type="text" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} placeholder="2016 - 2020" className="w-1/3 outline-none border-b border-teal-300 focus:border-teal-700" />
                                                <input type="text" value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} placeholder="Tên trường..." className="w-2/3 text-right outline-none border-b border-teal-300 focus:border-teal-700" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div>{edu.major}</div><div>{edu.result}</div><div>{edu.note}</div></>) : (
                                        <>
                                            <input type="text" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} placeholder="Chuyên ngành" className="w-full outline-none border-b border-teal-300 focus:border-teal-700 mt-1" />
                                            <input type="text" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} placeholder="Kết quả/Thành tích" className="w-full outline-none border-b border-teal-300 focus:border-teal-700 mt-1" />
                                            <input type="text" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} placeholder="Ghi chú" className="w-full outline-none border-b border-teal-300 focus:border-teal-700 mt-1" />
                                        </>
                                    )}
                                    {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-teal-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                    </div>
                    <div>
                        <Section title="Hoạt động">
                            {data.activityList?.map((act, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{act.time}</span><span className="w-2/3 inline-block text-right">{act.org}</span></>) : (
                                            <><input type="text" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} placeholder="08/2016 - 08/2018" className="w-1/3 outline-none border-b border-teal-300 focus:border-teal-700" />
                                                <input type="text" value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} placeholder="Tên tổ chức..." className="w-2/3 text-right outline-none border-b border-teal-300 focus:border-teal-700" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{act.role}</div><ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} placeholder="Vai trò" className="w-full outline-none border-b border-teal-300 focus:border-teal-700 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(act.details || '').split('\n').map((line, i) => (
                                                <li key={i}><input type="text" value={line} onChange={e => { const lines = (act.details || '').split('\n'); lines[i] = e.target.value; onListChange('activityList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-teal-300 focus:border-teal-700" placeholder="Mô tả hoạt động, thành tích..." /></li>
                                            ))}
                                                <li><button type="button" className="text-xs text-teal-700 underline" onClick={() => onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                    {data.activityList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-teal-700 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                        </Section>
                        <Section title="Kinh nghiệm (Nếu có)">
                            {data.experienceList?.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (<><span className="w-1/3 inline-block">{exp.time}</span><span className="w-2/3 inline-block text-right">{exp.company}</span></>) : (
                                            <><input type="text" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} placeholder="03/2022 - 02/2025" className="w-1/3 outline-none border-b border-teal-300 focus:border-teal-700" />
                                                <input type="text" value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} placeholder="Tên công ty..." className="w-2/3 text-right outline-none border-b border-teal-300 focus:border-teal-700" /></>
                                        )}
                                    </div>
                                    {isExporting ? (<><div className="font-bold">{exp.position}</div><ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((l, i) => (<li key={i}>{l}</li>))}</ul></>) : (
                                        <>
                                            <input type="text" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} placeholder="Vị trí" className="w-full outline-none border-b border-teal-300 focus:border-teal-700 font-bold mt-1" />
                                            <ul className="list-disc ml-5 mt-1">{(exp.details || '').split('\n').map((line, i) => (
                                                <li key={i}><input type="text" value={line} onChange={e => { const lines = (exp.details || '').split('\n'); lines[i] = e.target.value; onListChange('experienceList', idx, 'details', lines.join('\n')); }} className="w-full outline-none border-b border-teal-300 focus:border-teal-700" placeholder="Mô tả, thành tích..." /></li>
                                            ))}
                                                <li><button type="button" className="text-xs text-teal-700 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button></li>
                                            </ul>
                                        </>
                                    )}
                                    {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-teal-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    if (templateStyle === 'modern') {
        // 2 cột: trái thông tin cá nhân, phải nội dung
        return (
            <div className="bg-white p-0 rounded shadow text-gray-900 w-full max-w-[900px] mx-auto flex border border-gray-200" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                {/* Cột trái */}
                <div className="w-1/3 bg-primary-50 p-6 flex flex-col items-center border-r border-gray-200">
                    <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-3xl font-bold text-primary-600">{(data.fullName || 'A')[0]}</div>
                    <div className="w-full text-center">
                        {isExporting ? (
                            <div className="font-bold text-lg mb-2 text-primary-700">{data.fullName || 'Họ và tên'}</div>
                        ) : (
                            <input type="text" name="fullName" placeholder="Họ và tên" value={data.fullName} onChange={onChange} className="w-full border-b border-primary-300 focus:border-primary-500 outline-none font-bold text-lg text-center bg-transparent mb-2" />
                        )}
                        {isExporting ? (
                            <div className="text-xs text-gray-500 mb-1">{data.email || 'Email'}</div>
                        ) : (
                            <input type="email" name="email" placeholder="Email" value={data.email} onChange={onChange} className="w-full border-b border-primary-300 focus:border-primary-500 outline-none text-xs text-gray-700 bg-transparent mb-1 text-center" />
                        )}
                        {isExporting ? (
                            <div className="text-xs text-gray-500 mb-1">{data.phone || 'Số điện thoại'}</div>
                        ) : (
                            <input type="text" name="phone" placeholder="Số điện thoại" value={data.phone} onChange={onChange} className="w-full border-b border-primary-300 focus:border-primary-500 outline-none text-xs text-gray-700 bg-transparent mb-1 text-center" />
                        )}
                    </div>
                    <div className="mt-6 w-full">
                        <div className="uppercase font-bold text-xs text-primary-600 mb-1">Mục tiêu nghề nghiệp</div>
                        {isExporting ? (
                            <div className="text-xs text-gray-700 whitespace-pre-line">{data.summary || 'Mục tiêu nghề nghiệp của bạn...'}</div>
                        ) : (
                            <textarea name="summary" placeholder="Mục tiêu nghề nghiệp của bạn..." value={data.summary} onChange={onChange} className="w-full border-b border-primary-300 focus:border-primary-500 outline-none text-xs text-gray-700 bg-transparent" rows={4} />
                        )}
                    </div>
                </div>
                {/* Cột phải */}
                <div className="w-2/3 p-8">
                    <Section title="Học vấn">
                        {data.educationList && data.educationList.length > 0 && data.educationList.map((edu, idx) => (
                            <Box key={idx}>
                                <div className="flex justify-between font-semibold">
                                    {isExporting ? (
                                        <>
                                            <span className="w-1/3 inline-block">{edu.time}</span>
                                            <span className="w-2/3 inline-block text-right">{edu.school}</span>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-1/3" />
                                            <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-2/3 text-right" />
                                        </>
                                    )}
                                </div>
                                {isExporting ? (
                                    <>
                                        <div>{edu.major}</div>
                                        <div>{edu.result}</div>
                                        <div>{edu.note}</div>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1" />
                                        <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1" />
                                        <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1" />
                                    </>
                                )}
                                {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                            </Box>
                        ))}
                        {!isExporting && <button type="button" className="text-xs text-primary-600 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                    </Section>
                    <Section title="Kinh nghiệm làm việc">
                        {data.experienceList && data.experienceList.length > 0 && data.experienceList.map((exp, idx) => (
                            <Box key={idx}>
                                <div className="flex justify-between font-semibold">
                                    {isExporting ? (
                                        <>
                                            <span className="w-1/3 inline-block">{exp.time}</span>
                                            <span className="w-2/3 inline-block text-right">{exp.company}</span>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-1/3" />
                                            <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-2/3 text-right" />
                                        </>
                                    )}
                                </div>
                                {isExporting ? (
                                    <>
                                        <div className="font-bold">{exp.position}</div>
                                        <ul className="list-disc ml-5 mt-1">
                                            {(exp.details || '').split('\n').map((line, i) => (
                                                <li key={i}>{line}</li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1 font-bold" />
                                        <ul className="list-disc ml-5 mt-1">
                                            {(exp.details || '').split('\n').map((line, i) => (
                                                <li key={i}>
                                                    <input type="text" value={line} onChange={e => {
                                                        const lines = (exp.details || '').split('\n');
                                                        lines[i] = e.target.value;
                                                        onListChange('experienceList', idx, 'details', lines.join('\n'));
                                                    }} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full" placeholder="Mô tả công việc, thành tích..." />
                                                </li>
                                            ))}
                                            <li>
                                                <button type="button" className="text-xs text-primary-600 underline" onClick={() => {
                                                    onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'));
                                                }}>+ Thêm dòng</button>
                                            </li>
                                        </ul>
                                    </>
                                )}
                                {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                            </Box>
                        ))}
                        {!isExporting && <button type="button" className="text-xs text-primary-600 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                    </Section>
                    <Section title="Hoạt động">
                        {data.activityList && data.activityList.length > 0 && data.activityList.map((act, idx) => (
                            <Box key={idx}>
                                <div className="flex justify-between font-semibold">
                                    {isExporting ? (
                                        <>
                                            <span className="w-1/3 inline-block">{act.time}</span>
                                            <span className="w-2/3 inline-block text-right">{act.org}</span>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="08/2016 - 08/2018" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-1/3" />
                                            <input type="text" placeholder="Tên tổ chức..." value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-2/3 text-right" />
                                        </>
                                    )}
                                </div>
                                {isExporting ? (
                                    <>
                                        <div className="font-bold">{act.role}</div>
                                        <ul className="list-disc ml-5 mt-1">
                                            {(act.details || '').split('\n').map((line, i) => (
                                                <li key={i}>{line}</li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="Vai trò" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1 font-bold" />
                                        <ul className="list-disc ml-5 mt-1">
                                            {(act.details || '').split('\n').map((line, i) => (
                                                <li key={i}>
                                                    <input type="text" value={line} onChange={e => {
                                                        const lines = (act.details || '').split('\n');
                                                        lines[i] = e.target.value;
                                                        onListChange('activityList', idx, 'details', lines.join('\n'));
                                                    }} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full" placeholder="Mô tả hoạt động, thành tích..." />
                                                </li>
                                            ))}
                                            <li>
                                                <button type="button" className="text-xs text-primary-600 underline" onClick={() => {
                                                    onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'));
                                                }}>+ Thêm dòng</button>
                                            </li>
                                        </ul>
                                    </>
                                )}
                                {data.activityList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>}
                            </Box>
                        ))}
                        {!isExporting && <button type="button" className="text-xs text-primary-600 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                    </Section>
                </div>
            </div>
        );
    }
    if (templateStyle === 'professional') {
        // Header dải màu đậm, nội dung 2 cột: trái tóm tắt, phải trải nghiệm trước
        return (
            <div className="bg-white w-full max-w-[900px] mx-auto border border-gray-200 rounded shadow overflow-hidden" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <div className="bg-primary-700 text-white p-6">
                    <div className="text-2xl font-extrabold">{isExporting ? (data.fullName || 'Họ và tên') : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="bg-transparent outline-none border-b border-white/60 focus:border-white w-full font-extrabold text-2xl" />
                    )}</div>
                    <div className="opacity-90 mt-1">
                        {isExporting ? (
                            <span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>
                        ) : (
                            <div className="flex gap-4 items-center">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-white/60 focus:border-white" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-white/60 focus:border-white" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8 p-8">
                    <div className="col-span-1">
                        <div className="uppercase text-sm font-bold text-primary-700 mb-2">Tóm tắt</div>
                        {isExporting ? (
                            <div className="text-sm text-gray-700 whitespace-pre-line">{data.summary}</div>
                        ) : (
                            <textarea name="summary" value={data.summary} onChange={onChange} rows={6} placeholder="Tóm tắt ngắn gọn về kinh nghiệm, kỹ năng nổi bật" className="w-full border-b border-gray-300 focus:border-primary-500 outline-none text-sm" />
                        )}
                    </div>
                    <div className="col-span-2">
                        <Section title="Kinh nghiệm làm việc">
                            {data.experienceList?.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (
                                            <>
                                                <span className="w-1/3 inline-block">{exp.time}</span>
                                                <span className="w-2/3 inline-block text-right">{exp.company}</span>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-1/3" />
                                                <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-2/3 text-right" />
                                            </>
                                        )}
                                    </div>
                                    {isExporting ? (
                                        <>
                                            <div className="font-bold">{exp.position}</div>
                                            <ul className="list-disc ml-5 mt-1">
                                                {(exp.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1 font-bold" />
                                            <ul className="list-disc ml-5 mt-1">
                                                {(exp.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>
                                                        <input type="text" value={line} onChange={e => {
                                                            const lines = (exp.details || '').split('\n');
                                                            lines[i] = e.target.value;
                                                            onListChange('experienceList', idx, 'details', lines.join('\n'));
                                                        }} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full" placeholder="Mô tả công việc, thành tích..." />
                                                    </li>
                                                ))}
                                                <li>
                                                    <button type="button" className="text-xs text-primary-600 underline" onClick={() => {
                                                        onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'));
                                                    }}>+ Thêm dòng</button>
                                                </li>
                                            </ul>
                                        </>
                                    )}
                                    {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-primary-600 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (
                                            <>
                                                <span className="w-1/3 inline-block">{edu.time}</span>
                                                <span className="w-2/3 inline-block text-right">{edu.school}</span>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-1/3" />
                                                <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-2/3 text-right" />
                                            </>
                                        )}
                                    </div>
                                    {isExporting ? (
                                        <>
                                            <div>{edu.major}</div>
                                            <div>{edu.result}</div>
                                            <div>{edu.note}</div>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1" />
                                            <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1" />
                                            <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1" />
                                        </>
                                    )}
                                    {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-primary-600 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                        <Section title="Hoạt động">
                            {data.activityList?.map((act, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (
                                            <>
                                                <span className="w-1/3 inline-block">{act.time}</span>
                                                <span className="w-2/3 inline-block text-right">{act.org}</span>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" placeholder="08/2016 - 08/2018" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-1/3" />
                                                <input type="text" placeholder="Tên tổ chức..." value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-2/3 text-right" />
                                            </>
                                        )}
                                    </div>
                                    {isExporting ? (
                                        <>
                                            <div className="font-bold">{act.role}</div>
                                            <ul className="list-disc ml-5 mt-1">
                                                {(act.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="Vai trò" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1 font-bold" />
                                            <ul className="list-disc ml-5 mt-1">
                                                {(act.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>
                                                        <input type="text" value={line} onChange={e => {
                                                            const lines = (act.details || '').split('\n');
                                                            lines[i] = e.target.value;
                                                            onListChange('activityList', idx, 'details', lines.join('\n'));
                                                        }} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full" placeholder="Mô tả hoạt động, thành tích..." />
                                                    </li>
                                                ))}
                                                <li>
                                                    <button type="button" className="text-xs text-primary-600 underline" onClick={() => {
                                                        onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'));
                                                    }}>+ Thêm dòng</button>
                                                </li>
                                            </ul>
                                        </>
                                    )}
                                    {data.activityList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-primary-600 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    if (templateStyle === 'it') {
        // Phong cách tech: 2 cột, font mono cho tiêu đề, nhấn mạnh kinh nghiệm
        return (
            <div className="bg-white w-full max-w-[900px] mx-auto border border-gray-200 rounded-md shadow p-8" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <div className="mb-6 border-b-2 border-gray-800 pb-3">
                    <div className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace' }}>
                        {isExporting ? (data.fullName || 'Họ và tên') : (
                            <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="outline-none border-b border-gray-300 focus:border-gray-800 bg-transparent w-full font-extrabold text-2xl" />
                        )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                            <div className="flex gap-4 items-center">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-gray-300 focus:border-gray-800" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-gray-300 focus:border-gray-800" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-1">
                        <div className="uppercase text-xs font-bold text-gray-700 tracking-wider mb-2">Summary</div>
                        {isExporting ? (
                            <div className="text-sm text-gray-800 whitespace-pre-line">{data.summary}</div>
                        ) : (
                            <textarea name="summary" value={data.summary} onChange={onChange} rows={6} placeholder="Mô tả ngắn về kỹ năng, công nghệ, dự án nổi bật" className="w-full border-b border-gray-300 focus:border-gray-800 outline-none text-sm" />
                        )}
                        <div className="mt-6 uppercase text-xs font-bold text-gray-700 tracking-wider mb-2">Hoạt động</div>
                        {data.activityList?.map((act, idx) => (
                            <div key={idx} className="border-l-2 border-gray-800 pl-3 mb-3">
                                {isExporting ? (
                                    <>
                                        <div className="text-xs text-gray-500">{act.time}</div>
                                        <div className="font-semibold">{act.org}</div>
                                        <div className="text-sm">{act.role}</div>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="08/2016 - 08/2018" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-full text-xs" />
                                        <input type="text" placeholder="Tên tổ chức..." value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-full font-semibold" />
                                        <input type="text" placeholder="Vai trò" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-full text-sm" />
                                    </>
                                )}
                            </div>
                        ))}
                        {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                    </div>
                    <div className="col-span-2">
                        <Section title="Kinh nghiệm làm việc">
                            {data.experienceList?.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (
                                            <>
                                                <span className="w-1/3 inline-block">{exp.time}</span>
                                                <span className="w-2/3 inline-block text-right">{exp.company}</span>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-1/3" />
                                                <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-2/3 text-right" />
                                            </>
                                        )}
                                    </div>
                                    {isExporting ? (
                                        <>
                                            <div className="font-bold">{exp.position}</div>
                                            <ul className="list-disc ml-5 mt-1">
                                                {(exp.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-full mt-1 font-bold" />
                                            <ul className="list-disc ml-5 mt-1">
                                                {(exp.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>
                                                        <input type="text" value={line} onChange={e => {
                                                            const lines = (exp.details || '').split('\n');
                                                            lines[i] = e.target.value;
                                                            onListChange('experienceList', idx, 'details', lines.join('\n'));
                                                        }} className="border-b border-gray-300 focus:border-gray-800 outline-none w-full" placeholder="Mô tả công việc, thành tích..." />
                                                    </li>
                                                ))}
                                                <li>
                                                    <button type="button" className="text-xs text-gray-800 underline" onClick={() => {
                                                        onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'));
                                                    }}>+ Thêm dòng</button>
                                                </li>
                                            </ul>
                                        </>
                                    )}
                                    {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (
                                            <>
                                                <span className="w-1/3 inline-block">{edu.time}</span>
                                                <span className="w-2/3 inline-block text-right">{edu.school}</span>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-1/3" />
                                                <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-2/3 text-right" />
                                            </>
                                        )}
                                    </div>
                                    {isExporting ? (
                                        <>
                                            <div>{edu.major}</div>
                                            <div>{edu.result}</div>
                                            <div>{edu.note}</div>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-full mt-1" />
                                            <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-full mt-1" />
                                            <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="border-b border-gray-300 focus:border-gray-800 outline-none w-full mt-1" />
                                        </>
                                    )}
                                    {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-gray-800 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    if (templateStyle === 'accounting') {
        // Phong cách nghiêm túc: 1 cột, timeline rõ ràng, màu trung tính
        return (
            <div className="bg-white w-full max-w-[820px] mx-auto border border-gray-300 rounded p-8" style={{ fontFamily: 'Calibri, Arial, sans-serif', fontSize: '15px' }}>
                <div className="mb-4">
                    <div className="text-2xl font-bold">{isExporting ? (data.fullName || 'Họ và tên') : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full border-b border-gray-400 focus:border-gray-700 outline-none bg-transparent font-bold text-2xl" />
                    )}</div>
                    <div className="text-sm text-gray-600">
                        {isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                            <div className="flex gap-4 items-center">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-gray-400 focus:border-gray-700" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-gray-400 focus:border-gray-700" />
                            </div>
                        )}
                    </div>
                </div>
                <Section title="Mục tiêu nghề nghiệp">
                    <Box>
                        {isExporting ? (
                            <div className="whitespace-pre-line">{data.summary}</div>
                        ) : (
                            <textarea name="summary" value={data.summary} onChange={onChange} className="w-full border-b border-gray-400 focus:border-gray-700 outline-none" rows={3} placeholder="Định hướng nghề nghiệp, chứng chỉ liên quan đến kế toán, tài chính" />
                        )}
                    </Box>
                </Section>
                <Section title="Kinh nghiệm làm việc">
                    {data.experienceList?.map((exp, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-4 items-start mb-4">
                            <div className="col-span-1 text-sm text-gray-600">{isExporting ? exp.time : (
                                <input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="w-full border-b border-gray-400 focus:border-gray-700 outline-none" />
                            )}</div>
                            <div className="col-span-4">
                                <div className="font-semibold flex justify-between">
                                    <span>{isExporting ? exp.company : (
                                        <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="w-2/3 border-b border-gray-400 focus:border-gray-700 outline-none" />
                                    )}</span>
                                </div>
                                <div className="font-bold mt-1">{isExporting ? exp.position : (
                                    <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="w-full border-b border-gray-400 focus:border-gray-700 outline-none font-bold" />
                                )}</div>
                                {isExporting ? (
                                    <ul className="list-disc ml-5 mt-1">
                                        {(exp.details || '').split('\n').map((line, i) => <li key={i}>{line}</li>)}
                                    </ul>
                                ) : (
                                    <ul className="list-disc ml-5 mt-1">
                                        {(exp.details || '').split('\n').map((line, i) => (
                                            <li key={i}>
                                                <input type="text" value={line} onChange={e => {
                                                    const lines = (exp.details || '').split('\n');
                                                    lines[i] = e.target.value;
                                                    onListChange('experienceList', idx, 'details', lines.join('\n'));
                                                }} className="w-full border-b border-gray-400 focus:border-gray-700 outline-none" placeholder="Mô tả công việc, thành tích..." />
                                            </li>
                                        ))}
                                        <li>
                                            <button type="button" className="text-xs text-gray-700 underline" onClick={() => onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'))}>+ Thêm dòng</button>
                                        </li>
                                    </ul>
                                )}
                                {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                            </div>
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                </Section>
                <Section title="Học vấn">
                    {data.educationList?.map((edu, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-4 items-start mb-4">
                            <div className="col-span-1 text-sm text-gray-600">{isExporting ? edu.time : (
                                <input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="w-full border-b border-gray-400 focus:border-gray-700 outline-none" />
                            )}</div>
                            <div className="col-span-4">
                                <div className="font-semibold flex justify-between">
                                    <span>{isExporting ? edu.school : (
                                        <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="w-2/3 border-b border-gray-400 focus:border-gray-700 outline-none" />
                                    )}</span>
                                </div>
                                {isExporting ? (
                                    <>
                                        <div>{edu.major}</div>
                                        <div>{edu.result}</div>
                                        <div>{edu.note}</div>
                                    </>
                                ) : (
                                    <>
                                        <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="w-full border-b border-gray-400 focus:border-gray-700 outline-none mt-1" />
                                        <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="w-full border-b border-gray-400 focus:border-gray-700 outline-none mt-1" />
                                        <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="w-full border-b border-gray-400 focus:border-gray-700 outline-none mt-1" />
                                    </>
                                )}
                                {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                            </div>
                        </div>
                    ))}
                    {!isExporting && <button type="button" className="text-xs text-gray-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                </Section>
            </div>
        );
    }
    if (templateStyle === 'fresher') {
        // Ưu tiên học vấn & mục tiêu, bố cục sáng sủa, căn giữa tiêu đề
        return (
            <div className="bg-white w-full max-w-[820px] mx-auto border border-blue-200 rounded-xl p-8 shadow" style={{ fontFamily: 'Poppins, Segoe UI, Arial, sans-serif', fontSize: '15px' }}>
                <div className="text-center mb-6">
                    <div className="text-3xl font-extrabold text-blue-700">{isExporting ? (data.fullName || 'Họ và tên') : (
                        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full max-w-[480px] mx-auto text-center border-b border-blue-400 focus:border-blue-700 outline-none bg-transparent font-extrabold text-3xl" />
                    )}</div>
                    <div className="text-sm text-blue-600 mt-1">
                        {isExporting ? (<span>{data.email || 'Email'} • {data.phone || 'Số điện thoại'}</span>) : (
                            <div className="flex justify-center gap-4">
                                <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-blue-300 focus:border-blue-700" />
                                <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-blue-300 focus:border-blue-700" />
                            </div>
                        )}
                    </div>
                </div>
                <Section title="Mục tiêu nghề nghiệp">
                    <Box>
                        {isExporting ? (
                            <div className="whitespace-pre-line">{data.summary}</div>
                        ) : (
                            <textarea name="summary" value={data.summary} onChange={onChange} className="w-full border-b border-blue-300 focus:border-blue-700 outline-none" rows={4} placeholder="Định hướng học hỏi, mục tiêu ngắn hạn khi mới ra trường" />
                        )}
                    </Box>
                </Section>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <Section title="Học vấn">
                            {data.educationList?.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (
                                            <>
                                                <span className="w-1/3 inline-block">{edu.time}</span>
                                                <span className="w-2/3 inline-block text-right">{edu.school}</span>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-1/3" />
                                                <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-2/3 text-right" />
                                            </>
                                        )}
                                    </div>
                                    {isExporting ? (
                                        <>
                                            <div>{edu.major}</div>
                                            <div>{edu.result}</div>
                                            <div>{edu.note}</div>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-full mt-1" />
                                            <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-full mt-1" />
                                            <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-full mt-1" />
                                        </>
                                    )}
                                    {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-blue-700 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
                        </Section>
                    </div>
                    <div>
                        <Section title="Kinh nghiệm làm việc">
                            {data.experienceList?.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (
                                            <>
                                                <span className="w-1/3 inline-block">{exp.time}</span>
                                                <span className="w-2/3 inline-block text-right">{exp.company}</span>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-1/3" />
                                                <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-2/3 text-right" />
                                            </>
                                        )}
                                    </div>
                                    {isExporting ? (
                                        <>
                                            <div className="font-bold">{exp.position}</div>
                                            <ul className="list-disc ml-5 mt-1">
                                                {(exp.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-full mt-1 font-bold" />
                                            <ul className="list-disc ml-5 mt-1">
                                                {(exp.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>
                                                        <input type="text" value={line} onChange={e => {
                                                            const lines = (exp.details || '').split('\n');
                                                            lines[i] = e.target.value;
                                                            onListChange('experienceList', idx, 'details', lines.join('\n'));
                                                        }} className="border-b border-blue-300 focus:border-blue-700 outline-none w-full" placeholder="Mô tả công việc, thành tích..." />
                                                    </li>
                                                ))}
                                                <li>
                                                    <button type="button" className="text-xs text-blue-700 underline" onClick={() => {
                                                        onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'));
                                                    }}>+ Thêm dòng</button>
                                                </li>
                                            </ul>
                                        </>
                                    )}
                                    {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-blue-700 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
                        </Section>
                        <Section title="Hoạt động">
                            {data.activityList?.map((act, idx) => (
                                <Box key={idx}>
                                    <div className="flex justify-between font-semibold">
                                        {isExporting ? (
                                            <>
                                                <span className="w-1/3 inline-block">{act.time}</span>
                                                <span className="w-2/3 inline-block text-right">{act.org}</span>
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" placeholder="08/2016 - 08/2018" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-1/3" />
                                                <input type="text" placeholder="Tên tổ chức..." value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-2/3 text-right" />
                                            </>
                                        )}
                                    </div>
                                    {isExporting ? (
                                        <>
                                            <div className="font-bold">{act.role}</div>
                                            <ul className="list-disc ml-5 mt-1">
                                                {(act.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <>
                                            <input type="text" placeholder="Vai trò" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} className="border-b border-blue-300 focus:border-blue-700 outline-none w-full mt-1 font-bold" />
                                            <ul className="list-disc ml-5 mt-1">
                                                {(act.details || '').split('\n').map((line, i) => (
                                                    <li key={i}>
                                                        <input type="text" value={line} onChange={e => {
                                                            const lines = (act.details || '').split('\n');
                                                            lines[i] = e.target.value;
                                                            onListChange('activityList', idx, 'details', lines.join('\n'));
                                                        }} className="border-b border-blue-300 focus:border-blue-700 outline-none w-full" placeholder="Mô tả hoạt động, thành tích..." />
                                                    </li>
                                                ))}
                                                <li>
                                                    <button type="button" className="text-xs text-blue-700 underline" onClick={() => {
                                                        onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'));
                                                    }}>+ Thêm dòng</button>
                                                </li>
                                            </ul>
                                        </>
                                    )}
                                    {data.activityList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            {!isExporting && <button type="button" className="text-xs text-blue-700 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    if (templateStyle === 'impressive') {
        // Ảnh lớn, tên nổi bật, màu sắc mạnh, section chia rõ
        return (
            <div className="bg-gradient-to-br from-primary-100 to-pink-100 p-10 rounded-xl shadow-lg w-full max-w-[900px] mx-auto border border-pink-200" style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '16px' }}>
                <div className="flex items-center mb-8">
                    <div className="w-32 h-32 rounded-full bg-pink-300 flex items-center justify-center text-5xl font-bold text-white mr-8 border-4 border-pink-400">
                        {(data.fullName || 'A')[0]}
                    </div>
                    <div className="flex-1">
                        {isExporting ? (
                            <div className="text-3xl font-extrabold text-pink-700 mb-1">{data.fullName || 'Họ và tên'}</div>
                        ) : (
                            <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Họ và tên" className="w-full border-b border-pink-300 focus:border-pink-600 outline-none bg-transparent text-3xl font-extrabold text-pink-700 mb-1" />
                        )}
                        <div className="text-lg text-pink-600 mb-1">
                            {isExporting ? (
                                <span>{data.email || 'Email'} | {data.phone || 'Số điện thoại'}</span>
                            ) : (
                                <div className="flex gap-4">
                                    <input type="email" name="email" value={data.email} onChange={onChange} placeholder="Email" className="bg-transparent outline-none border-b border-pink-300 focus:border-pink-600" />
                                    <input type="text" name="phone" value={data.phone} onChange={onChange} placeholder="Số điện thoại" className="bg-transparent outline-none border-b border-pink-300 focus:border-pink-600" />
                                </div>
                            )}
                        </div>
                        <div className="text-base text-gray-700 italic">
                            {isExporting ? (
                                <span>{data.summary || 'Mục tiêu nghề nghiệp...'}</span>
                            ) : (
                                <textarea name="summary" value={data.summary} onChange={onChange} rows={3} placeholder="Mục tiêu nghề nghiệp..." className="w-full bg-transparent outline-none border-b border-pink-300 focus:border-pink-600" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <Section title="Học vấn">
                            {data.educationList && data.educationList.length > 0 && data.educationList.map((edu, idx) => (
                                <Box key={idx}>
                                    <div className="font-semibold">
                                        <input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-1/3" />
                                        <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-2/3 text-right" />
                                    </div>
                                    <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-full mt-1" />
                                    <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-full mt-1" />
                                    <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-full mt-1" />
                                    {data.educationList.length > 1 && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            <button type="button" className="text-xs text-pink-600 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>
                        </Section>
                        <Section title="Hoạt động">
                            {data.activityList && data.activityList.length > 0 && data.activityList.map((act, idx) => (
                                <Box key={idx}>
                                    <div className="font-semibold">
                                        <input type="text" placeholder="08/2016 - 08/2018" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-1/3" />
                                        <input type="text" placeholder="Tên tổ chức..." value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-2/3 text-right" />
                                    </div>
                                    <input type="text" placeholder="Vai trò" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-full mt-1 font-bold" />
                                    <ul className="list-disc ml-5 mt-1">
                                        {(act.details || '').split('\n').map((line, i) => (
                                            <li key={i}>
                                                <input type="text" value={line} onChange={e => {
                                                    const lines = (act.details || '').split('\n');
                                                    lines[i] = e.target.value;
                                                    onListChange('activityList', idx, 'details', lines.join('\n'));
                                                }} className="border-b border-pink-300 focus:border-pink-500 outline-none w-full" placeholder="Mô tả hoạt động, thành tích..." />
                                            </li>
                                        ))}
                                        <li>
                                            <button type="button" className="text-xs text-pink-600 underline" onClick={() => {
                                                onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'));
                                            }}>+ Thêm dòng</button>
                                        </li>
                                    </ul>
                                    {data.activityList.length > 1 && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            <button type="button" className="text-xs text-pink-600 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>
                        </Section>
                    </div>
                    <div>
                        <Section title="Kinh nghiệm làm việc">
                            {data.experienceList && data.experienceList.length > 0 && data.experienceList.map((exp, idx) => (
                                <Box key={idx}>
                                    <div className="font-semibold">
                                        <input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-1/3" />
                                        <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-2/3 text-right" />
                                    </div>
                                    <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="border-b border-pink-300 focus:border-pink-500 outline-none w-full mt-1 font-bold" />
                                    <ul className="list-disc ml-5 mt-1">
                                        {(exp.details || '').split('\n').map((line, i) => (
                                            <li key={i}>
                                                <input type="text" value={line} onChange={e => {
                                                    const lines = (exp.details || '').split('\n');
                                                    lines[i] = e.target.value;
                                                    onListChange('experienceList', idx, 'details', lines.join('\n'));
                                                }} className="border-b border-pink-300 focus:border-pink-500 outline-none w-full" placeholder="Mô tả công việc, thành tích..." />
                                            </li>
                                        ))}
                                        <li>
                                            <button type="button" className="text-xs text-pink-600 underline" onClick={() => {
                                                onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'));
                                            }}>+ Thêm dòng</button>
                                        </li>
                                    </ul>
                                    {data.experienceList.length > 1 && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                                </Box>
                            ))}
                            <button type="button" className="text-xs text-pink-600 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>
                        </Section>
                    </div>
                </div>
            </div>
        );
    }
    // Mẫu mới: Senior (1 cột tối giản theo ảnh, tiêu đề in hoa + đường kẻ)
    if (templateStyle === 'senior') {
        const listChange = (listName, idx, field) => (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onListChange(listName, idx, field, e.target.value);
        };
        const safeChange = (e) => {
            if (e?.nativeEvent?.isComposing) return;
            onChange?.(e);
        };
        const SectionHeader = ({ children }) => (
            <div className="flex items-center gap-3 mt-6 mb-2">
                <div className="uppercase font-extrabold tracking-wide text-[13px] text-gray-800">{children}</div>
                <div className="flex-1 border-t border-gray-800" />
            </div>
        );
        const Row = ({ left, right, className = '' }) => (
            <div className={`flex items-baseline justify-between gap-4 ${className}`}>
                <div className="flex-1 text-gray-800">{left}</div>
                <div className="w-40 text-right italic text-gray-600">{right}</div>
            </div>
        );
        return (
            <div className="bg-white w-full max-w-[900px] mx-auto border border-gray-300 rounded p-8" style={{ fontFamily: 'Georgia, Times, serif', fontSize: '15px' }}>
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="italic text-2xl font-semibold text-gray-700">
                        {isExporting ? (data.fullName || 'Họ Tên') : (
                            <input type="text" name="fullName" value={data.fullName} onChange={safeChange} placeholder="Họ Tên" className="w-full max-w-[520px] mx-auto text-center bg-transparent outline-none border-b border-gray-300 focus:border-gray-700 italic text-2xl font-semibold" />
                        )}
                    </div>
                    <div className="italic text-gray-600 mt-1">
                        {isExporting ? (data.appliedPosition || 'Vị trí ứng tuyển') : (
                            <input type="text" name="appliedPosition" value={data.appliedPosition} onChange={safeChange} placeholder="Vị trí ứng tuyển" className="w-full max-w-[360px] mx-auto text-center bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 italic" />
                        )}
                    </div>
                    {/* Liên hệ dạng 1 dòng có dấu chấm ngăn cách */}
                    <div className="mt-3 text-sm text-gray-700 flex flex-wrap gap-x-4 gap-y-1 justify-center">
                        {isExporting ? (
                            <>
                                <span>{data.phone || '0123 456 789'}</span>
                                <span>•</span>
                                <span className="break-all">{data.email || 'email@example.com'}</span>
                                <span>•</span>
                                <span className="break-all">{data.website || 'facebook.com/TopCV.vn'}</span>
                                <span>•</span>
                                <span>{data.address || 'Quận A, thành phố Hà Nội'}</span>
                            </>
                        ) : (
                            <>
                                <input type="text" name="phone" value={data.phone} onChange={safeChange} placeholder="0123 456 789" className="bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                <span>•</span>
                                <input type="email" name="email" value={data.email} onChange={safeChange} placeholder="email@example.com" className="bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                <span>•</span>
                                <input type="text" name="website" value={data.website} onChange={safeChange} placeholder="facebook.com/TopCV.vn" className="bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                <span>•</span>
                                <input type="text" name="address" value={data.address} onChange={safeChange} placeholder="Quận A, thành phố Hà Nội" className="bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                            </>
                        )}
                    </div>
                </div>

                {/* Mục tiêu nghề nghiệp */}
                <SectionHeader>Mục tiêu nghề nghiệp</SectionHeader>
                <div className="text-gray-700 mb-3">
                    {isExporting ? (
                        <div className="whitespace-pre-wrap">{data.summary || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn'}</div>
                    ) : (
                        <input type="text" name="summary" value={data.summary} onChange={safeChange} placeholder="Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                    )}
                </div>

                {/* Học vấn */}
                <SectionHeader>Học vấn</SectionHeader>
                <div className="space-y-3">
                    {(data.educationList || []).map((edu, idx) => (
                        <div key={idx} className="pb-2 border-b border-gray-200">
                            <Row
                                left={isExporting ? (edu.school || 'Tên trường học') : (
                                    <input value={edu.school || ''} onChange={listChange('educationList', idx, 'school')} placeholder="Tên trường học" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                )}
                                right={isExporting ? (edu.time || 'Bắt đầu  -  Kết thúc') : (
                                    <input value={edu.time || ''} onChange={listChange('educationList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-40 bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-right italic" />
                                )}
                            />
                            <div className="mt-1 text-gray-700">
                                {isExporting ? (edu.major || 'Ngành học / Môn học') : (
                                    <input value={edu.major || ''} onChange={listChange('educationList', idx, 'major')} placeholder="Ngành học / Môn học" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                )}
                            </div>
                            <div className="mt-1 text-gray-600">
                                {isExporting ? (edu.result || edu.note || 'Mô tả quá trình học hoặc thành tích của bạn') : (
                                    <input value={edu.result || ''} onChange={listChange('educationList', idx, 'result')} placeholder="Mô tả quá trình học hoặc thành tích của bạn" className="w-full bg-transparent outline-none border-b border-gray-100 focus:border-gray-500" />
                                )}
                            </div>
                            {!isExporting && data.educationList?.length > 1 && (
                                <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>
                            )}
                        </div>
                    ))}
                    {!isExporting && (
                        <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>
                    )}
                </div>

                {/* Kinh nghiệm */}
                <SectionHeader>Kinh nghiệm làm việc</SectionHeader>
                <div className="space-y-3">
                    {(data.experienceList || []).map((exp, idx) => (
                        <div key={idx} className="pb-2 border-b border-gray-200">
                            <Row
                                left={isExporting ? (exp.company || 'Tên công ty') : (
                                    <input value={exp.company || ''} onChange={listChange('experienceList', idx, 'company')} placeholder="Tên công ty" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                )}
                                right={isExporting ? (exp.time || 'Bắt đầu  -  Kết thúc') : (
                                    <input value={exp.time || ''} onChange={listChange('experienceList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-40 bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-right italic" />
                                )}
                            />
                            <div className="mt-1 text-gray-800 font-semibold">
                                {isExporting ? (exp.position || 'Vị trí công việc') : (
                                    <input value={exp.position || ''} onChange={listChange('experienceList', idx, 'position')} placeholder="Vị trí công việc" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 font-semibold" />
                                )}
                            </div>
                            <div className="mt-1 text-gray-600">
                                {isExporting ? (exp.details || 'Mô tả kinh nghiệm làm việc của bạn') : (
                                    <input value={exp.details || ''} onChange={listChange('experienceList', idx, 'details')} placeholder="Mô tả kinh nghiệm làm việc của bạn" className="w-full bg-transparent outline-none border-b border-gray-100 focus:border-gray-500" />
                                )}
                            </div>
                            {!isExporting && data.experienceList?.length > 1 && (
                                <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>
                            )}
                        </div>
                    ))}
                    {!isExporting && (
                        <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>
                    )}
                </div>

                {/* Kỹ năng */}
                <SectionHeader>Kỹ năng</SectionHeader>
                <div className="space-y-2">
                    {(data.skillsList || []).map((s, idx) => (
                        <div key={idx} className="flex items-baseline gap-4 pb-2 border-b border-gray-200">
                            <div className="w-1/3 text-gray-800">
                                {isExporting ? (s.name || 'Tên kỹ năng') : (
                                    <input value={s.name || ''} onChange={listChange('skillsList', idx, 'name')} placeholder="Tên kỹ năng" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                )}
                            </div>
                            <div className="flex-1 text-gray-600">
                                {isExporting ? (s.description || 'Mô tả kỹ năng') : (
                                    <input value={s.description || ''} onChange={listChange('skillsList', idx, 'description')} placeholder="Mô tả kỹ năng" className="w-full bg-transparent outline-none border-b border-gray-100 focus:border-gray-500" />
                                )}
                            </div>
                            {!isExporting && data.skillsList?.length > 1 && (
                                <button type="button" className="text-xs text-red-500 underline ml-2" onClick={() => onRemoveList('skillsList', idx)}>Xóa</button>
                            )}
                        </div>
                    ))}
                    {!isExporting && (
                        <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('skillsList', { name: '', description: '' })}>+ Thêm kỹ năng</button>
                    )}
                </div>

                {/* Hoạt động */}
                <SectionHeader>Hoạt động</SectionHeader>
                <div className="space-y-3">
                    {(data.activityList || []).map((act, idx) => (
                        <div key={idx} className="pb-2 border-b border-gray-200">
                            <Row
                                left={isExporting ? (act.org || 'Tên tổ chức') : (
                                    <input value={act.org || ''} onChange={listChange('activityList', idx, 'org')} placeholder="Tên tổ chức" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                )}
                                right={isExporting ? (act.time || 'Bắt đầu  -  Kết thúc') : (
                                    <input value={act.time || ''} onChange={listChange('activityList', idx, 'time')} placeholder="Bắt đầu  -  Kết thúc" className="w-40 bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-right italic" />
                                )}
                            />
                            <div className="mt-1 text-gray-800 font-semibold">
                                {isExporting ? (act.role || 'Vị trí của bạn') : (
                                    <input value={act.role || ''} onChange={listChange('activityList', idx, 'role')} placeholder="Vị trí của bạn" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 font-semibold" />
                                )}
                            </div>
                            <div className="mt-1 text-gray-600">
                                {isExporting ? (act.details || 'Mô tả hoạt động') : (
                                    <input value={act.details || ''} onChange={listChange('activityList', idx, 'details')} placeholder="Mô tả hoạt động" className="w-full bg-transparent outline-none border-b border-gray-100 focus:border-gray-500" />
                                )}
                            </div>
                            {!isExporting && data.activityList?.length > 1 && (
                                <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>
                            )}
                        </div>
                    ))}
                    {!isExporting && (
                        <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>
                    )}
                </div>

                {/* Chứng chỉ */}
                <SectionHeader>Chứng chỉ</SectionHeader>
                <div className="space-y-2">
                    {(data.certificatesList || []).map((c, idx) => (
                        <div key={idx} className="pb-2 border-b border-gray-200">
                            <Row
                                left={isExporting ? (c.name || 'Tên chứng chỉ') : (
                                    <input value={c.name || ''} onChange={listChange('certificatesList', idx, 'name')} placeholder="Tên chứng chỉ" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                )}
                                right={isExporting ? (c.time || 'Thời gian') : (
                                    <input value={c.time || ''} onChange={listChange('certificatesList', idx, 'time')} placeholder="Thời gian" className="w-40 bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-right italic" />
                                )}
                            />
                            {!isExporting && data.certificatesList?.length > 1 && (
                                <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('certificatesList', idx)}>Xóa</button>
                            )}
                        </div>
                    ))}
                    {!isExporting && (
                        <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('certificatesList', { time: '', name: '' })}>+ Thêm chứng chỉ</button>
                    )}
                </div>

                {/* Danh hiệu & Giải thưởng */}
                <SectionHeader>Danh hiệu và giải thưởng</SectionHeader>
                <div className="space-y-2">
                    {(data.awardsList || []).map((a, idx) => (
                        <div key={idx} className="pb-2 border-b border-gray-200">
                            <Row
                                left={isExporting ? (a.title || 'Tên giải thưởng') : (
                                    <input value={a.title || ''} onChange={listChange('awardsList', idx, 'title')} placeholder="Tên giải thưởng" className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-gray-600" />
                                )}
                                right={isExporting ? (a.time || 'Thời gian') : (
                                    <input value={a.time || ''} onChange={listChange('awardsList', idx, 'time')} placeholder="Thời gian" className="w-40 bg-transparent outline-none border-b border-gray-200 focus:border-gray-600 text-right italic" />
                                )}
                            />
                            {!isExporting && data.awardsList?.length > 1 && (
                                <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('awardsList', idx)}>Xóa</button>
                            )}
                        </div>
                    ))}
                    {!isExporting && (
                        <button type="button" className="text-xs underline text-gray-800" onClick={() => onAddList('awardsList', { time: '', title: '' })}>+ Thêm giải thưởng</button>
                    )}
                </div>
            </div>
        );
    }
    // Default: simple (1 cột)
    return (
        <div className="bg-white p-6 rounded shadow text-gray-900 w-full max-w-[800px] mx-auto" style={{ fontFamily: 'Arial, sans-serif', fontSize: '15px' }}>
            <div className="text-xl font-bold mb-2">Mẫu CV tiếng Việt - Tiêu chuẩn</div>
            {/* Thông tin cá nhân */}
            <Section title="Thông tin cá nhân">
                <Box>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500">Họ và tên</label>
                            {isExporting ? (
                                <div className="font-bold text-lg">{data.fullName}</div>
                            ) : (
                                <input type="text" name="fullName" value={data.fullName} onChange={onChange} className="w-full border-b border-gray-300 focus:border-primary-500 outline-none font-bold text-lg" />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">Email</label>
                            {isExporting ? (
                                <div>{data.email}</div>
                            ) : (
                                <input type="email" name="email" value={data.email} onChange={onChange} className="w-full border-b border-gray-300 focus:border-primary-500 outline-none" />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">Số điện thoại</label>
                            {isExporting ? (
                                <div>{data.phone}</div>
                            ) : (
                                <input type="text" name="phone" value={data.phone} onChange={onChange} className="w-full border-b border-gray-300 focus:border-primary-500 outline-none" />
                            )}
                        </div>
                    </div>
                </Box>
            </Section>
            <Section title="Mục tiêu nghề nghiệp">
                <Box>
                    {isExporting ? (
                        <div className="whitespace-pre-line">{data.summary}</div>
                    ) : (
                        <textarea name="summary" value={data.summary} onChange={onChange} className="w-full border-b border-gray-300 focus:border-primary-500 outline-none" rows={2} placeholder="Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn" />
                    )}
                </Box>
            </Section>
            <Section title="Học vấn">
                {data.educationList && data.educationList.length > 0 && data.educationList.map((edu, idx) => (
                    <Box key={idx}>
                        <div className="flex justify-between font-semibold">
                            {isExporting ? (
                                <>
                                    <span className="w-1/3 inline-block">{edu.time}</span>
                                    <span className="w-2/3 inline-block text-right">{edu.school}</span>
                                </>
                            ) : (
                                <>
                                    <input type="text" placeholder="2016 - 2020" value={edu.time} onChange={e => onListChange('educationList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-1/3" />
                                    <input type="text" placeholder="Tên trường..." value={edu.school} onChange={e => onListChange('educationList', idx, 'school', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-2/3 text-right" />
                                </>
                            )}
                        </div>
                        {isExporting ? (
                            <>
                                <div>{edu.major}</div>
                                <div>{edu.result}</div>
                                <div>{edu.note}</div>
                            </>
                        ) : (
                            <>
                                <input type="text" placeholder="Chuyên ngành" value={edu.major} onChange={e => onListChange('educationList', idx, 'major', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1" />
                                <input type="text" placeholder="Kết quả/Thành tích" value={edu.result} onChange={e => onListChange('educationList', idx, 'result', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1" />
                                <input type="text" placeholder="Ghi chú" value={edu.note} onChange={e => onListChange('educationList', idx, 'note', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1" />
                            </>
                        )}
                        {data.educationList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('educationList', idx)}>Xóa</button>}
                    </Box>
                ))}
                {!isExporting && <button type="button" className="text-xs text-primary-600 underline" onClick={() => onAddList('educationList', { time: '', school: '', major: '', result: '', note: '' })}>+ Thêm học vấn</button>}
            </Section>
            <Section title="Kinh nghiệm làm việc">
                {data.experienceList && data.experienceList.length > 0 && data.experienceList.map((exp, idx) => (
                    <Box key={idx}>
                        <div className="flex justify-between font-semibold">
                            {isExporting ? (
                                <>
                                    <span className="w-1/3 inline-block">{exp.time}</span>
                                    <span className="w-2/3 inline-block text-right">{exp.company}</span>
                                </>
                            ) : (
                                <>
                                    <input type="text" placeholder="03/2022 - 02/2025" value={exp.time} onChange={e => onListChange('experienceList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-1/3" />
                                    <input type="text" placeholder="Tên công ty..." value={exp.company} onChange={e => onListChange('experienceList', idx, 'company', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-2/3 text-right" />
                                </>
                            )}
                        </div>
                        {isExporting ? (
                            <>
                                <div className="font-bold">{exp.position}</div>
                                <ul className="list-disc ml-5 mt-1">
                                    {(exp.details || '').split('\n').map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <input type="text" placeholder="Vị trí" value={exp.position} onChange={e => onListChange('experienceList', idx, 'position', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1 font-bold" />
                                <ul className="list-disc ml-5 mt-1">
                                    {(exp.details || '').split('\n').map((line, i) => (
                                        <li key={i}>
                                            <input type="text" value={line} onChange={e => {
                                                const lines = (exp.details || '').split('\n');
                                                lines[i] = e.target.value;
                                                onListChange('experienceList', idx, 'details', lines.join('\n'));
                                            }} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full" placeholder="Mô tả công việc, thành tích..." />
                                        </li>
                                    ))}
                                    <li>
                                        <button type="button" className="text-xs text-primary-600 underline" onClick={() => {
                                            onListChange('experienceList', idx, 'details', (exp.details ? exp.details + '\n' : '\n'));
                                        }}>+ Thêm dòng</button>
                                    </li>
                                </ul>
                            </>
                        )}
                        {data.experienceList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('experienceList', idx)}>Xóa</button>}
                    </Box>
                ))}
                {!isExporting && <button type="button" className="text-xs text-primary-600 underline" onClick={() => onAddList('experienceList', { time: '', company: '', position: '', details: '' })}>+ Thêm kinh nghiệm</button>}
            </Section>
            <Section title="Hoạt động">
                {data.activityList && data.activityList.length > 0 && data.activityList.map((act, idx) => (
                    <Box key={idx}>
                        <div className="flex justify-between font-semibold">
                            {isExporting ? (
                                <>
                                    <span className="w-1/3 inline-block">{act.time}</span>
                                    <span className="w-2/3 inline-block text-right">{act.org}</span>
                                </>
                            ) : (
                                <>
                                    <input type="text" placeholder="08/2016 - 08/2018" value={act.time} onChange={e => onListChange('activityList', idx, 'time', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-1/3" />
                                    <input type="text" placeholder="Tên tổ chức..." value={act.org} onChange={e => onListChange('activityList', idx, 'org', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-2/3 text-right" />
                                </>
                            )}
                        </div>
                        {isExporting ? (
                            <>
                                <div className="font-bold">{act.role}</div>
                                <ul className="list-disc ml-5 mt-1">
                                    {(act.details || '').split('\n').map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <input type="text" placeholder="Vai trò" value={act.role} onChange={e => onListChange('activityList', idx, 'role', e.target.value)} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full mt-1 font-bold" />
                                <ul className="list-disc ml-5 mt-1">
                                    {(act.details || '').split('\n').map((line, i) => (
                                        <li key={i}>
                                            <input type="text" value={line} onChange={e => {
                                                const lines = (act.details || '').split('\n');
                                                lines[i] = e.target.value;
                                                onListChange('activityList', idx, 'details', lines.join('\n'));
                                            }} className="border-b border-gray-300 focus:border-primary-500 outline-none w-full" placeholder="Mô tả hoạt động, thành tích..." />
                                        </li>
                                    ))}
                                    <li>
                                        <button type="button" className="text-xs text-primary-600 underline" onClick={() => {
                                            onListChange('activityList', idx, 'details', (act.details ? act.details + '\n' : '\n'));
                                        }}>+ Thêm dòng</button>
                                    </li>
                                </ul>
                            </>
                        )}
                        {data.activityList.length > 1 && !isExporting && <button type="button" className="text-xs text-red-500 underline mt-1" onClick={() => onRemoveList('activityList', idx)}>Xóa</button>}
                    </Box>
                ))}
                {!isExporting && <button type="button" className="text-xs text-primary-600 underline" onClick={() => onAddList('activityList', { time: '', org: '', role: '', details: '' })}>+ Thêm hoạt động</button>}
            </Section>
        </div>
    );
};

export default CVPreview;