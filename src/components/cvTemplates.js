// cvTemplates.js

const ORIGIN = 'https://jobook.io.vn';
const VERSION = '20250903'; // đổi số này mỗi lần deploy để tránh cache cũ

// Helper build URL tuyệt đối + chống cache
const buildUrl = (p) => `${ORIGIN}/${p.replace(/^\/+/, '')}?v=${VERSION}`;

const cvTemplates = [
  {
    id: 1,
    name: 'Classic One',
    preview: buildUrl('images/cv-thumbnails/classic-one.svg'),
    style: 'classicOne',
    description: 'Mẫu 1 cột có avatar và các mục như ảnh minh hoạ.'
  },
  {
    id: 2,
    name: 'Sidebar V2',
    preview: buildUrl('images/cv-thumbnails/sidebar-v2.svg'),
    style: 'sidebarV2',
    description: 'Mẫu 2 cột: sidebar trái nền đậm, tiêu đề dạng pill như hình.'
  },
  {
    id: 5,
    name: 'Sidebar Pastel',
    preview: buildUrl('images/cv-thumbnails/sidebar-pastel.svg'),
    style: 'sidebarPastel',
    description: 'Mẫu theo ảnh pastel: header bo cong, avatar tròn, cột trái thông tin + học vấn, phải nội dung.'
  },
  {
    id: 6,
    name: 'Senior',
    preview: buildUrl('images/cv-thumbnails/senior.svg'),
    style: 'senior',
    description: 'Mẫu 1 cột tối giản: tiêu đề in hoa, đường kẻ, bố cục như ảnh.'
  },
  {
    id: 7,
    name: 'Cao cấp',
    preview: buildUrl('images/cv-thumbnails/cao-cap.svg'),
    style: 'caoCap',
    description: 'Header tối, rail trái có icon •, các mục theo ảnh.'
  },
  {
    id: 8,
    name: 'Chuyên nghiệp',
    preview: buildUrl('images/cv-thumbnails/chuyen-nghiep.svg'),
    style: 'chuyenNghiep',
    description: 'Avatar trái, lưới 2 cột: trái (Học vấn, Kinh nghiệm, Hoạt động), phải (Mục tiêu, Kỹ năng, Chứng chỉ, Thông tin thêm).'
  },
  {
    id: 9,
    name: 'Hiện đại',
    preview: buildUrl('images/cv-thumbnails/hien-dai.svg'),
    style: 'hienDai',
    description: 'Header hiện đại với khung ảnh, tên viền đứt màu đỏ, ô liên hệ viền đứt, tiêu đề đỏ + gạch xám, mục 2 cột như ảnh.'
  },
  {
    id: 3,
    name: 'Sidebar V3',
    preview: buildUrl('images/cv-thumbnails/sidebar-v3.svg'),
    style: 'sidebarV3',
    description: 'Mẫu 2 cột: sidebar trái + tiêu đề có icon như ảnh.'
  },
  {
    id: 4,
    name: 'Classic Red',
    preview: buildUrl('images/cv-thumbnails/classic-red.svg'),
    style: 'classicRed',
    description: 'Mẫu nhiều cột, viền đỏ và timeline chấm đỏ như ảnh.'
  }
];

export default cvTemplates;
