import {
    Download,
    Calendar,
    HardDrive,
    Eye,
    Share2,
    Heart,
    User,
    Clock,
    FileText,
    ImageIcon,
    Music,
    Video,
    Archive,
    Code,
    FileIcon,
} from "lucide-react"
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
// 파일 타입별 아이콘 매핑
export const getFileIcon = (filePath) => {
  if (!filePath) return FileText

  const extension = filePath.split(".").pop()?.toLowerCase()

  const iconMap = {
    // 이미지
    jpg: ImageIcon,
    jpeg: ImageIcon,
    png: ImageIcon,
    gif: ImageIcon,
    bmp: ImageIcon,
    svg: ImageIcon,
    webp: ImageIcon,
    // 비디오
    mp4: Video,
    avi: Video,
    mov: Video,
    wmv: Video,
    flv: Video,
    webm: Video,
    mkv: Video,
    // 오디오
    mp3: Music,
    wav: Music,
    flac: Music,
    aac: Music,
    ogg: Music,
    wma: Music,
    // 압축
    zip: Archive,
    rar: Archive,
    "7z": Archive,
    tar: Archive,
    gz: Archive,
    // 코드
    js: Code,
    html: Code,
    css: Code,
    py: Code,
    java: Code,
    cpp: Code,
    c: Code,
    php: Code,
    // 기본
    default: FileText,
  }

  return iconMap[extension] || iconMap.default
}
// 파일 타입 확인
export const isPreviewable = (filePath) => {
  if (!filePath) return false
  const extension = filePath.split(".").pop()?.toLowerCase()
  const previewableTypes = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp","mp4"]
  return previewableTypes.includes(extension)
}