// src/pdf-templates/ClassicOnePDF.jsx
import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
    Link,
} from "@react-pdf/renderer";

// ────────────────────────────────────────────────
// Đăng ký font tiếng Việt (NotoSans)
// ────────────────────────────────────────────────
Font.register({
    family: "NotoSans",
    fonts: [
        { src: "/fonts/NotoSans-Regular.ttf" },
        { src: "/fonts/NotoSans-Bold.ttf", fontWeight: "bold" },
        { src: "/fonts/NotoSans-Italic.ttf", fontStyle: "italic" },
    ],
});

// ────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
    page: {
        fontFamily: "NotoSans",
        fontSize: 11,
        paddingTop: 32,
        paddingBottom: 36,
        paddingHorizontal: 36,
        lineHeight: 1.45,
        color: "#111827",
        backgroundColor: "#FFFFFF",
    },
    row: { flexDirection: "row" },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 14,
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: "#E5E7EB",
        marginRight: 16,
    },
    headerRight: { flex: 1 },
    fullName: { fontSize: 20, fontWeight: "bold" },
    position: { fontSize: 12, marginTop: 3, fontStyle: "italic" },
    contact: { marginTop: 6, fontSize: 10, color: "#374151" },
    contactItem: { marginRight: 10 },
    section: { marginTop: 12 },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
        marginBottom: 6,
        color: "#111827",
    },
    rule: { height: 2, backgroundColor: "#1F2937", marginBottom: 6 },
    item: { marginBottom: 6 },
    itemTitle: { fontWeight: "bold" },
    itemSub: { color: "#374151" },
    bulletLine: { flexDirection: "row", gap: 4 },
    bullet: { marginRight: 6 },
    pill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: "#F3F4F6",
        marginRight: 6,
        marginBottom: 4,
        fontSize: 10,
    },
    project: { marginBottom: 8 },
});

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
const safeArr = (v) => (Array.isArray(v) ? v : []);
const hasText = (v) => typeof v === "string" && v.trim().length > 0;

const Section = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.rule} />
        {children}
    </View>
);

const Bullets = ({ items }) =>
    safeArr(items).length ? (
        <View>
            {items.map((t, i) =>
                hasText(t) ? (
                    <View key={i} style={styles.bulletLine}>
                        <Text style={styles.bullet}>•</Text>
                        <Text>{t}</Text>
                    </View>
                ) : null
            )}
        </View>
    ) : null;

// ────────────────────────────────────────────────
// Main PDF
// ────────────────────────────────────────────────
const ClassicOnePDF = ({ data }) => {
    const {
        fullName,
        appliedPosition,
        email,
        phone,
        website,
        address,
        summary,
        dob,
        gender,
        avatar,
        educationList,
        experienceList,
        activityList,
        certificatesList,
        awardsList,
        skillsList,
        projectsList,
    } = data || {};

    // Chuẩn hóa skillLines
    const skillLines = safeArr(skillsList)
        .map((s) => [s?.name, s?.description].filter(hasText).join(" - ").trim())
        .filter(hasText);


    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    {data.avatar && <Image src={data.avatar} style={styles.avatar} />}
                    <View style={styles.headerRight}>
                        {/* Họ tên + vị trí */}
                        <Text style={styles.fullName}>
                            {hasText(fullName) ? fullName : "Họ Tên"}
                        </Text>
                        <Text style={styles.position}>
                            {hasText(appliedPosition) ? appliedPosition : "Vị trí ứng tuyển"}
                        </Text>

                        {/* Thông tin liên hệ */}
                        <View style={[styles.col, styles.contact]}>
                            {hasText(dob) && (
                                <Text style={styles.contactItem}>Ngày sinh: {dob}</Text>
                            )}
                            {hasText(gender) && (
                                <Text style={styles.contactItem}>Giới tính: {gender}</Text>
                            )}
                            {hasText(phone) && (
                                <Text style={styles.contactItem}>Điện thoại: {phone}</Text>
                            )}
                            {/* Email clickable */}
                            {hasText(email) && (
                                <Link
                                    src={`mailto:${email}`}
                                    style={{ color: "#1D4ED8", textDecoration: "none", marginRight: 10 }}
                                >
                                    Email: {email}
                                </Link>
                            )}

                            {/* Website clickable */}
                            {hasText(website) && (
                                <Link
                                    src={website.startsWith("http") ? website : `https://${website}`}
                                    style={{ color: "#1D4ED8", textDecoration: "none", marginRight: 10 }}
                                >
                                    Website: {website}
                                </Link>
                            )}

                            {/* Address */}
                            {hasText(address) && (
                                <Text style={styles.contactItem}>Địa chỉ: {address}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Mục tiêu nghề nghiệp */}
                {hasText(summary) && (
                    <Section title="Mục tiêu nghề nghiệp">
                        <Text>{summary}</Text>
                    </Section>
                )}

                {/* Học vấn */}
                {safeArr(educationList).length > 0 && (
                    <Section title="Học vấn">
                        {educationList.map((edu, i) => (
                            <View key={i} style={styles.item}>
                                <Text style={styles.itemTitle}>
                                    {hasText(edu?.school) ? edu.school : "Tên trường"}{" "}
                                    {hasText(edu?.major) ? `— ${edu.major}` : ""}
                                </Text>
                                {hasText(edu?.time) && <Text style={styles.itemSub}>{edu.time}</Text>}
                                {hasText(edu?.result) && <Text>Kết quả: {edu.result}</Text>}
                                {hasText(edu?.note) && <Text>Ghi chú: {edu.note}</Text>}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Kinh nghiệm làm việc */}
                {safeArr(experienceList).length > 0 && (
                    <Section title="Kinh nghiệm làm việc">
                        {experienceList.map((exp, i) => (
                            <View key={i} style={styles.item}>
                                <Text style={styles.itemTitle}>
                                    {hasText(exp?.company) ? exp.company : "Tên tổ chức"}
                                    {hasText(exp?.position) ? ` — ${exp.position}` : ""}
                                </Text>
                                {hasText(exp?.time) && <Text style={styles.itemSub}>{exp.time}</Text>}
                                {hasText(exp?.details) && <Bullets items={String(exp.details).split("\n")} />}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Hoạt động */}
                {safeArr(activityList).length > 0 && (
                    <Section title="Hoạt động">
                        {activityList.map((act, i) => (
                            <View key={i} style={styles.item}>
                                <Text style={styles.itemTitle}>
                                    {hasText(act?.org) ? act.org : "Tên tổ chức"}
                                    {hasText(act?.role) ? ` — ${act.role}` : ""}
                                </Text>
                                {hasText(act?.time) && <Text style={styles.itemSub}>{act.time}</Text>}
                                {hasText(act?.details) && <Bullets items={String(act.details).split("\n")} />}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Chứng chỉ */}
                {safeArr(certificatesList).length > 0 && (
                    <Section title="Chứng chỉ">
                        {certificatesList.map((c, i) => (
                            <View key={i} style={styles.item}>
                                <Text style={styles.itemTitle}>
                                    {hasText(c?.name) ? c.name : "Tên chứng chỉ"}
                                </Text>
                                {hasText(c?.time) && <Text style={styles.itemSub}>{c.time}</Text>}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Giải thưởng */}
                {safeArr(awardsList).length > 0 && (
                    <Section title="Danh hiệu & Giải thưởng">
                        {awardsList.map((a, i) => (
                            <View key={i} style={styles.item}>
                                <Text style={styles.itemTitle}>
                                    {hasText(a?.title) ? a.title : "Tên giải thưởng"}
                                </Text>
                                {hasText(a?.time) && <Text style={styles.itemSub}>{a.time}</Text>}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Kỹ năng */}
                {skillLines.length > 0 && (
                    <Section title="Kỹ năng">
                        <Bullets items={skillLines} />
                    </Section>
                )}

                {/* Dự án */}
                {safeArr(projectsList).length > 0 && (
                    <Section title="Dự án">
                        {projectsList.map((p, i) => (
                            <View key={i} style={styles.project}>
                                <Text style={styles.itemTitle}>
                                    {hasText(p?.name) ? p.name : "Tên dự án"}
                                </Text>
                                {hasText(p?.description) && <Text>{p.description}</Text>}
                                {Array.isArray(p?.technologies) && p.technologies.length > 0 && (
                                    <View style={[styles.row, { flexWrap: "wrap", marginTop: 4 }]}>
                                        {p.technologies.map(
                                            (t, idx) =>
                                                hasText(t) && (
                                                    <Text key={idx} style={styles.pill}>
                                                        {t}
                                                    </Text>
                                                )
                                        )}
                                    </View>
                                )}
                            </View>
                        ))}
                    </Section>
                )}
            </Page>
        </Document>
    );
};

export default ClassicOnePDF;
