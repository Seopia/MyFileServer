import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../common/api";
import s from './FileShareDownload.module.css';
import {
    Download,
    Calendar,
    HardDrive,
    Eye,
    User,
    Clock,
    ImageIcon,
    Music,
    Video,
    Archive,
    Code,
    FileIcon,
} from "lucide-react"
import { formatFileSize, getFileIcon, isPreviewable } from "../../common/functions";
import { formattedDateTime } from "../../main/function";
import axios from "axios";
import { mainUrl } from "../../common/url";
const FileShareDonwload = () => {
    const { fileUUID } = useParams();
    const [isLoading, setIsLoading] = useState(false)
    const [file, setFile] = useState({});
    const nav = useNavigate();
    const FileIcon = getFileIcon(file.fileFullPath);
    const fileName = file.fileFullPath ? file.fileFullPath.split("/").pop() : "Unknown File"
    const getPrivateFile = async () => {
        try {
            const res = await api.get(`/main/open/file?uuid=${fileUUID}`);
            setFile(res.data);
        } catch (err) {
            if (err.status === 400) {
                alert(err.response.data);
                nav('/');
            }
        }
    }
    const handleDownload = async () => {
        setIsLoading(true);
        if (file.size > (100 * 1024 * 1024)) {
            window.open(file.fileFullPath, '_blank');
            setIsLoading(false);
            return;
        }
        await api.post(`/main/download-count/${file.fileCode}`);
        const fileFullPath = file.fileFullPath;

        axios({
            url: fileFullPath,
            method: 'GET',
            responseType: 'blob',
            headers: {
                Authorization: localStorage.getItem("token") // JWT 토큰 추가
            },
        })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', file.fileName); // 다운로드할 파일 이름 설정
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                window.open(fileFullPath, '_blank');
            })
            .finally(() => {
                setIsLoading(false);
            })
    }
    useEffect(() => {
        getPrivateFile();
    }, [])
    return (
        <div className={s.pageContainer}>

            {/* 배경 효과 */}
            <div className={s.backgroundEffects}>
                <div className={s.gradientOrb1}></div>
                <div className={s.gradientOrb2}></div>
                <div className={s.gridPattern}></div>
            </div>

            <div className={s.container}>
                {/* 헤더 섹션 */}
                <header>
                    <div onClick={()=>nav(mainUrl)} className={s.itr}>
                        <img src='/icon.png' width={100} className={s.fileIcon} />
                        <h1 className={s.fileName}>Seopia Cloud</h1>
                    </div>
                </header>
                <header className={s.header}>
                    <div className={s.fileIconContainer}>
                        <FileIcon size={48} className={s.fileIcon} />
                        <div className={s.iconGlow}></div>
                    </div>
                    <div className={s.headerContent}>
                        <h1 className={s.fileName}>{file.fileName}</h1>
                        <div className={s.fileMetadata}>
                            <div className={s.metaItem}>
                                <HardDrive size={16} className={s.metaIcon} />
                                <span>{formatFileSize(file.size)}</span>
                            </div>
                            <div className={s.metaItem}>
                                <Calendar size={16} className={s.metaIcon} />
                                <span>{formattedDateTime(file.uploadedAt)}</span>
                            </div>
                            <div className={s.metaItem}>
                                <Download size={16} className={s.metaIcon} />
                                <span>{file.downloadCount}회 다운로드</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 메인 콘텐츠 */}
                <div className={s.mainContent}>
                    {/* 파일 설명 카드 */}
                    {/* <div className={s.card}>
                        <div className={s.cardHeader}>
                            <FileText size={20} className={s.cardIcon} />
                            <h2 className={s.cardTitle}>파일 설명</h2>
                        </div>
                        <div className={s.cardContent}>
                            <p className={s.description}>{file.description}</p>
                        </div>
                    </div> */}

                    {/* 액션 버튼들 */}
                    <div className={s.actionSection}>
                        <button className={`${s.actionButton} ${s.primaryButton}`} onClick={handleDownload} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className={s.spinner}></div>
                                    <span>다운로드 중...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={20} />
                                    <span>다운로드</span>
                                </>
                            )}
                        </button>

                        {/* {isPreviewable(file.fileFullPath) && (
                            <button className={`${s.actionButton} ${s.secondaryButton}`} onClick={handlePreview}>
                                <Eye size={20} />
                                <span>미리보기</span>
                            </button>
                        )} */}

                        {/* <button className={`${s.actionButton} ${s.secondaryButton}`} onClick={handleShare}>
                            <Share2 size={20} />
                            <span>공유하기</span>
                        </button> */}
                    </div>

                    {/* 메모 카드 */}
                    {file.memo && (
                        <div className={s.card}>
                            <div className={s.cardHeader}>
                                <User size={20} className={s.cardIcon} />
                                <h2 className={s.cardTitle}>업로더</h2>
                            </div>
                            <div className={s.cardContent}>
                                <div className={s.memoContent}>
                                    <p className={s.memo}>{file.memo}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 파일 정보 카드 */}
                    <div className={s.card}>
                        <div className={s.cardHeader}>
                            <Clock size={20} className={s.cardIcon} />
                            <h2 className={s.cardTitle}>파일 정보</h2>
                        </div>
                        <div className={s.cardContent}>
                            <div className={s.infoGrid}>
                                {/* <div className={s.infoItem}>
                                    <span className={s.infoLabel}>파일 코드</span>
                                    <span className={s.infoValue}>#{file.fileCode}</span>
                                </div> */}
                                <div className={s.infoItem}>
                                    <span className={s.infoLabel}>파일 크기</span>
                                    <span className={s.infoValue}>{formatFileSize(file.size)}</span>
                                </div>
                                <div className={s.infoItem}>
                                    <span className={s.infoLabel}>업로드 일시</span>
                                    <span className={s.infoValue}>{formattedDateTime(file.uploadedAt)}</span>
                                </div>
                                <div className={s.infoItem}>
                                    <span className={s.infoLabel}>다운로드 횟수</span>
                                    <span className={s.infoValue}>{file.downloadCount}회</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FileShareDonwload;