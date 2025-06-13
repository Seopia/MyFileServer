"use client"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, File, X, Check, Loader, ArrowRight } from "lucide-react"
import s from './UploadComponent.module.css';
export default function UploadComponent({ uploadState, uploadPercent, setFile, upload, file, setUploadState }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      // 파일 객체를 이벤트로 변환하여 handleFileChange에 전달
      const mockEvent = { target: { files: [droppedFile] } }
      setFile(p=>({...p,file: mockEvent}))
    }
  }

  // 파일 선택 버튼 클릭 핸들러
  const handleSelectClick = () => {
    fileInputRef.current.click()
  }

  // 파일 제거 핸들러
  const handleRemoveFile = () => {
    setFile({file: null, name: ''})
    
    setUploadState({ select: false, loading: false, uploading:false, merging: false});
  }
  
  return (
    <div className={s.uploadComponentWrapper}>
      <AnimatePresence mode="wait">
        {/* 초기 상태: 파일 선택 */}
        {!uploadState.select && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={s.uploadContainer}
          >
            <div
              className={`${s.dropZone} ${isDragging ? s.dragging : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleSelectClick}
            >
              <div className={s.uploadIconContainer}>
                <Upload size={40} className={s.uploadIcon} />
                <div className={s.uploadGlow}></div>
              </div>
              <div className={s.uploadText}>
                <h3 className={s.uploadTitle}>파일 업로드</h3>
                <p className={s.uploadDescription}>
                  클릭하여 파일을 선택하거나
                  <br />
                  파일을 여기에 드래그하세요
                </p>
              </div>
              <div className={s.supportedFormats}>모든 형식 지원</div>
              <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                onChange={(e)=>setFile(p=>({...p, file:e.target.files[0]}))}
                className={s.hiddenInput}
              />
            </div>
          </motion.div>
        )}

        {/* 파일 선택 후: 파일 정보 및 업로드 버튼 */}
        {uploadState.select && !uploadState.loading && (
          <motion.div
            key="file-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={s.fileInfoContainer}
          >
            <div className={s.selectedFileHeader}>
              <h3 className={s.selectedFileTitle}>선택된 파일</h3>
              <button className={s.removeFileButton} onClick={handleRemoveFile}>
                <X size={18} />
              </button>
            </div>

            <div className={s.fileDetails}>
              <div className={s.fileIconContainer}>
                <File size={32} className={s.fileIcon} />
              </div>
              <div className={s.fileInfo}>
                <div className={s.fileNameContainer}>
                  <input
                    type="text"
                    value={file ? file.name : ""}
                    onChange={e=>setFile(p=>({...p, name:e.target.value}))}
                    placeholder="파일 이름을 입력하세요"
                    className={s.fileNameInput}
                  />
                </div>
                <div className={s.fileSize}>{file.file && (file.file.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>

            <motion.button
              className={s.uploadButton}
              onClick={upload}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Upload size={18} className={s.buttonIcon} />
              업로드 시작
            </motion.button>
          </motion.div>
        )}

        {/* 로딩 중 상태 */}
        {uploadState.loading && !uploadState.uploading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={s.progressContainer}
          >
            <div className={s.progressHeader}>
              <h3 className={s.progressTitle}>업로드 준비 중</h3>
              <div className={s.progressPercent}>{uploadPercent}%</div>
            </div>

            <div className={s.progressBarContainer}>
              <motion.div
                className={s.progressBar}
                initial={{ width: "0%" }}
                animate={{ width: `${uploadPercent}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>

            <div className={s.progressStatus}>
              <Loader size={20} className={s.spinnerIcon} />
              <span>파일을 처리하는 중입니다...</span>
            </div>
          </motion.div>
        )}

        {/* 업로드 중 상태 */}
        {uploadState.uploading && !uploadState.merging && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={s.progressContainer}
          >
            <div className={s.progressHeader}>
              <h3 className={s.progressTitle}>업로드 중</h3>
              <div className={s.progressPercent}>{uploadPercent}%</div>
            </div>

            <div className={s.progressBarContainer}>
              <motion.div
                className={s.progressBar}
                initial={{ width: "0%" }}
                animate={{ width: `${uploadPercent}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>

            <div className={s.progressStatus}>
              <Upload size={20} className={s.uploadingIcon} />
              <span>서버에 파일을 업로드하는 중입니다...</span>
            </div>
          </motion.div>
        )}

        {/* 병합 중 상태 */}
        {uploadState.merging && (
          <motion.div
            key="merging"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={s.progressContainer}
          >
            <div className={s.progressHeader}>
              <h3 className={s.progressTitle}>거의 완료됨</h3>
              <div className={s.progressPercent}>99%</div>
            </div>

            <div className={s.progressBarContainer}>
              <motion.div className={s.progressBar} style={{ width: "99%" }}></motion.div>
            </div>

            <div className={s.progressStatus}>
              <div className={s.pulseContainer}>
                <div className={s.pulse}></div>
                <div className={s.pulse}></div>
                <div className={s.pulse}></div>
              </div>
              <span>파일 처리를 완료하는 중입니다...</span>
            </div>
          </motion.div>
        )}

        {/* 완료 상태 (옵션) */}
        {uploadState.complete && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={s.completeContainer}
          >
            <div className={s.completeIconContainer}>
              <Check size={40} className={s.completeIcon} />
              <div className={s.completeGlow}></div>
            </div>
            <h3 className={s.completeTitle}>업로드 완료!</h3>
            <p className={s.completeDescription}>파일이 성공적으로 업로드되었습니다.</p>
            <motion.button className={s.viewFileButton} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <span>파일 보기</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
