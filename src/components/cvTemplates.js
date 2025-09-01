// Chỉ giữ một mẫu duy nhất theo yêu cầu
const cvTemplates = [
  {
    id: 1,
    name: 'Classic One',
    preview: '/images/cv-thumbnails/classic-one.svg',
    style: 'classicOne',
    description: 'Mẫu 1 cột có avatar và các mục như ảnh minh hoạ.'
  },
  {
    id: 2,
    name: 'Sidebar V2',
    preview: '/images/cv-thumbnails/sidebar-v2.svg',
    style: 'sidebarV2',
    description: 'Mẫu 2 cột: sidebar trái nền đậm, tiêu đề dạng pill như hình.'
  }
  ,
  {
    id: 3,
    name: 'Sidebar V3',
    preview: '/images/cv-thumbnails/sidebar-v3.svg',
    style: 'sidebarV3',
    description: 'Mẫu 2 cột: sidebar trái + tiêu đề có icon như ảnh.'
  }
  ,
  {
    id: 4,
    name: 'Classic Red',
    preview: '/images/cv-thumbnails/classic-red.svg',
    style: 'classicRed',
    description: 'Mẫu nhiều cột, viền đỏ và timeline chấm đỏ như ảnh.'
  }
];

export default cvTemplates;
