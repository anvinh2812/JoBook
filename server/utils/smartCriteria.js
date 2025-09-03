// Simple keyword/criteria extraction for IT domain (+work modes, design/UIUX, IoT/embedded, industries)
const TECH_KEYWORDS = [
  // Web / Backend / General Tech
  'javascript','typescript','react','reactjs','nextjs','angular','vue','svelte',
  'node','nodejs','express','nest','nestjs','graphql','rest','grpc',
  'java','spring','springboot','spring-boot',
  'python','django','flask','fastapi',
  'php','laravel','symfony',
  'c#','csharp','.net','dotnet','asp.net','aspnet',
  'c++','cpp','golang','go','rust','ruby','rails',
  'mysql','postgres','postgresql','mssql','sqlserver','mongodb','redis','elasticsearch',
  'docker','kubernetes','k8s','terraform','ansible','helm',
  'aws','azure','gcp','cloud','devops',
  'android','ios','react native','react-native','flutter','kotlin','swift',
  'fullstack','full stack','frontend','front end','backend','back end',
  'qa','tester','data','ml','ai','nlp','dl','machine learning','deep learning',

  // Work modes / Engagement
  'remote','on-site','onsite','hybrid','part-time','part time','full-time','full time',
  'contract','freelance','freelancer','internship',
  // Vietnamese variants
  'từ xa','tu xa','làm từ xa','lam tu xa','làm remote','lam remote',
  'tại chỗ','tai cho','văn phòng','van phong','on site','onsite','tại văn phòng','tai van phong',
  'lai','hybrid','mô hình lai','mo hinh lai',
  'bán thời gian','ban thoi gian','toàn thời gian','toan thoi gian','hợp đồng','hop dong','cộng tác viên','cong tac vien',

  // Design / UI-UX / Creative
  'ui','ux','ui/ux','ux/ui','ui ux','uiux','product design','product designer','ux research','uxr',
  'wireframe','prototype','prototyping','figma','sketch','adobe xd','adobexd','photoshop','illustrator',
  'graphic design','designer','thiết kế','thiet ke','giao diện','giao dien','trải nghiệm người dùng','trai nghiem nguoi dung',
  'thiết kế ui','thiet ke ui','thiết kế ux','thiet ke ux','thiết kế sản phẩm','thiet ke san pham',
  'nghiên cứu người dùng','nghien cuu nguoi dung','khảo sát người dùng','khao sat nguoi dung',
  'khung dây','khung day','nguyên mẫu','nguyen mau','nguyên mẫu nhanh','nguyen mau nhanh',
  'illustration','minh hoạ','minh hoa','vẽ','ve','digital art','concept art','3d','blender','maya','nghệ sĩ','nghe si',

  // IoT / Embedded / Hardware
  'iot','internet of things','embedded','nhúng','nhung','hệ thống nhúng','he thong nhung','phần mềm nhúng','phan mem nhung','lập trình nhúng','lap trinh nhung',
  'firmware','rtos','freertos','zephyr',
  'stm32','esp32','arduino','raspberry pi','raspberry','mcu','soc','arm','cortex-m','vhdl','verilog','fpga',
  'spi','i2c','uart','can bus','canbus','modbus','ble','bluetooth low energy','zigbee','lora','pcb',
  'hardware','electronics','microcontroller','sensor','actuator','cảm biến','cam bien','thiết bị','thiet bi',
  'thiết bị iot','thiet bi iot','thiết bị thông minh','thiet bi thong minh','mạch điện','mach dien','thiết kế mạch','thiet ke mach','bo mạch','bo mach',
  'keil','iar','cubemx','lập trình c nhúng','lap trinh c nhung',

  // Industries / Domains
  'bank','banking','fintech','ngân hàng','ngan hang','tài chính','tai chinh','công nghệ tài chính','cong nghe tai chinh',
  'education','edtech','giáo dục','giao duc','lms','trường học','truong hoc',
  'healthcare','medtech','medical','y tế','y te','hospital','bệnh viện','benh vien',
  'ecommerce','e-commerce','thương mại điện tử','thuong mai dien tu','retail','bán lẻ','ban le','logistics','chuỗi cung ứng','chuoi cung ung','supply chain',
  'manufacturing','sản xuất','san xuat','automotive','ô tô','o to','telecom','viễn thông','vien thong',
  'real estate','bất động sản','bat dong san','insurtech','insurance','bảo hiểm','bao hiem',
  'travel','du lịch','du lich','hospitality','khách sạn','khach san',
  'agritech','nông nghiệp','nong nghiep',
  'energy','năng lượng','nang luong','oil','dầu khí','dau khi','gas','government','chính phủ','chinh phu','public sector','khu vực công','khu vuc cong'
];

const ROLE_KEYWORDS = [
  'intern','fresher','junior','middle','mid','senior','lead','leader','architect',
  'engineer','developer','dev','tester','qa','sdet','pm','product manager','scrum master',
  // Design & Creative roles
  'designer','product designer','ui designer','ux designer','ui/ux designer','graphic designer','illustrator','artist',
  // Vietnamese roles & synonyms
  'kỹ sư','ky su','lập trình viên','lap trinh vien','nhà phát triển','nha phat trien',
  'kiểm thử','kiem thu','chuyên viên kiểm thử','chuyen vien kiem thu','qa engineer','kỹ sư kiểm thử','ky su kiem thu',
  'quản lý sản phẩm','quan ly san pham','trưởng nhóm','truong nhom','kiến trúc sư','kien truc su',
  'thực tập','thuc tap','thực tập sinh','thuc tap sinh','cộng tác viên','cong tac vien',
  'nhà thiết kế','nha thiet ke','thiết kế ui','thiet ke ui','thiết kế ux','thiet ke ux','người minh hoạ','nguoi minh hoa','hoạ sĩ','hoa si',
  // Contracting
  'freelancer','contractor'
];

const normalize = (s) => (s || '').toLowerCase();

function extractYears(text) {
  const t = normalize(text);
  // Vietnamese and English patterns
  const m = t.match(/(\d{1,2})\s*(năm|nam|yrs?|years?|y)/);
  if (m) {
    const y = parseInt(m[1], 10);
    if (!Number.isNaN(y)) return Math.min(30, Math.max(0, y));
  }
  if (/(intern|fresher)/.test(t)) return 0;
  if (/junior/.test(t)) return 1;
  if (/(middle|mid)/.test(t)) return 2;
  if (/senior/.test(t)) return 3; // 3+ years
  return null;
}

function extractTokens(text) {
  const t = normalize(text);
  const skills = new Set();
  TECH_KEYWORDS.forEach(k => { if (t.includes(k)) skills.add(k); });
  const roles = new Set();
  ROLE_KEYWORDS.forEach(k => { if (t.includes(k)) roles.add(k); });
  const years = extractYears(t);
  return { skills: Array.from(skills), roles: Array.from(roles), years };
}

function buildLikeParams(tokens) {
  // Build ILIKE patterns for SQL
  const all = [...(tokens.skills||[]), ...(tokens.roles||[])];
  // Deduplicate and create patterns like %keyword%
  const set = new Set(all);
  return Array.from(set).map(k => `%${k}%`);
}

function computeScore(text, tokens) {
  const t = normalize(text);
  let score = 0;
  (tokens.skills||[]).forEach(k => { if (t.includes(k)) score += 3; });
  (tokens.roles||[]).forEach(k => { if (t.includes(k)) score += 2; });
  if (tokens.years !== null && tokens.years !== undefined) {
    // heuristic bumps for seniority hints
    if (tokens.years === 0 && /(intern|fresher)/.test(t)) score += 2;
    if (tokens.years >= 1 && tokens.years <= 2 && /(junior|1\s*[-–to]?\s*2|1-2|1 to 2)/.test(t)) score += 2;
    if (tokens.years >= 3 && /(senior|3\+|3\s*plus|3\s*\+|\b3\b|4|5)/.test(t)) score += 2;
  }
  return score;
}

module.exports = {
  extractTokens,
  buildLikeParams,
  computeScore,
};
