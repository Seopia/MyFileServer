import React, { useState } from 'react';
import s from './Filedetail.module.css';
import { calcFileSize, canOpenFile, downloadFile, formattedDateTime, getFileIconByExtension } from '../../main/function';
import { Tooltip } from 'react-tooltip';
import { Loading } from '../../common/Loading';
import { useOutletContext } from 'react-router-dom';
import { DownloadCloud, Share2, Trash2 } from 'lucide-react';

const Filedetail = ({ isShowFileDetail, setIsShowFileDetail, selectedFile, handleDeleteFormSubmit }) => {
  const isMobile = useOutletContext();
  const [loading, setLoading] = useState(false);
  const openImage = (fileImage) => {
    if (canOpenFile(selectedFile)) {
      console.log(fileImage);

      window.open(selectedFile.fileFullPath, "_blank", 'width=500,height=500,menubar=no,toolbar=no,location=no,status=no');
    }
  }
  const handleShare = () => {
    const uuid = selectedFile.changedName.split("-").slice(0, 5).join("-");
    navigator.clipboard.writeText('https://cloud.seopia.co.kr/private/file/' + uuid)
    // navigator.clipboard.writeText('http://localhost:3000/private/file/' + uuid)
      .then(() => {
        alert("클립보드에 복사되었습니다!");
      })
      .catch(err => {
        alert("복사에 실패했습니다: " + err);
      });
  }

  return (
    <div className={s.modalOverlay}>
      <Tooltip id="preview-tooltip" />
      <div className={s.modalContainer}>
        {/* Header */}
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>
            <span className={s.titleIcon}>📄</span>
            파일 상세 정보
          </h2>
          <button className={s.closeButton} onClick={() => setIsShowFileDetail(false)}>
            <span className={s.closeIcon}>✕</span>
          </button>
        </div>

        {/* Content */}
        <div className={s.modalContent}>
          {/* Preview Section */}
          <div className={s.previewSection}>
            <div className={s.previewInfo}>
              <span className={s.infoIcon}>💡</span>
              <div className={s.infoText}>
                일부 파일은 {isMobile ? "터치" : "클릭"}하면 크게 볼 수 있습니다.
                <br />
                <strong>아이콘{isMobile ? "을 터치하여" : "에 마우스를 올려"}</strong> 확인해보세요.
              </div>
            </div>

            <div className={s.filePreviewContainer}>
              <div
                className={s.fileIconWrapper}
                data-tooltip-id="preview-tooltip"
                data-tooltip-content={canOpenFile(selectedFile) ? "미리 볼 수 있습니다.😊" : "미리 볼 수 없습니다.😭"}
                onClick={openImage}
              >
                <img
                  src={getFileIconByExtension(selectedFile.fileFullPath) || "/placeholder.svg"}
                  className={s.fileIcon}
                  alt="파일 아이콘"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=64&width=64"
                  }}
                />
                {canOpenFile(selectedFile) && (
                  <div className={s.previewOverlay}>
                    <span className={s.previewIcon}>👁️</span>
                    <span className={s.previewText}>미리보기</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={s.actionSection}>
            <button
              disabled={loading}
              onClick={() => downloadFile(selectedFile, setLoading)}
              className={s.downloadButton}
            >
              {loading ? (
                <Loading text="" />
              ) : (
                <>
                  <DownloadCloud />
                  다운로드
                </>
              )}
            </button>
            <button onClick={() => handleShare(selectedFile.fileCode)} className={s.downloadButton}>
              <Share2 size={20} />
              공유하기
            </button>
            <button onClick={() => handleDeleteFormSubmit(selectedFile.fileCode)} className={s.deleteButton}>
              <Trash2 />
              삭제하기
            </button>
          </div>

          {/* File Information Table */}
          <div className={s.infoSection}>
            <h3 className={s.sectionTitle}>
              <span className={s.sectionIcon}>📋</span>
              파일 정보
            </h3>
            <div className={s.infoTable}>
              <div className={s.infoRow}>
                <div className={s.infoLabel}>
                  <span className={s.labelIcon}>📝</span>
                  이름
                </div>
                <div className={s.infoValue}>{selectedFile.description}</div>
              </div>
              <div className={s.infoRow}>
                <div className={s.infoLabel}>
                  <span className={s.labelIcon}>💾</span>
                  용량
                </div>
                <div className={s.infoValue}>{calcFileSize(selectedFile.size)}</div>
              </div>
              <div className={s.infoRow}>
                <div className={s.infoLabel}>
                  <span className={s.labelIcon}>📅</span>
                  올린 날짜
                </div>
                <div className={s.infoValue}>{formattedDateTime(selectedFile.uploadedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Filedetail;