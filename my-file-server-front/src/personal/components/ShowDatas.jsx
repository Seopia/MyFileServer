import s from './ShowDatas.module.css';

const ShowDatas = ({ folder, intoFolder, file, showDetailOfFile, handleContextMenu, getFileIconByExtension }) => {
    if (folder) {
        const { folderCode, folderName } = folder
        return (
            <div key={folderCode} className={s.itemWrapper}>
                <div
                    onContextMenu={(e) => handleContextMenu(e, folderCode)}
                    className={s.folderContainer}
                    onClick={() => intoFolder(folderCode)}
                >
                    <div className={s.iconContainer}>
                        <div className={s.folderIcon}><img width={64} alt='error' src='/folder.png' /></div>
                        <div className={s.folderGlow}></div>
                    </div>
                    <div className={s.itemName}>{folderName}</div>
                </div>
            </div>
        )
    }

    if (file) {
        const { fileCode, description } = file
        return (
            <div key={fileCode} className={s.itemWrapper}>
                <div onClick={() => showDetailOfFile(file)} className={s.fileContainer}>
                    <div className={s.iconContainer}>
                        <img
                            src={getFileIconByExtension(file.fileFullPath) || "/placeholder.svg"}
                            className={s.fileIcon}
                            alt="파일 아이콘"
                            onError={(e) => {
                                e.target.src = "/placeholder.svg?height=64&width=64"
                            }}
                        />
                        <div className={s.fileGlow}></div>
                    </div>
                    <div className={s.itemName}>{description}</div>
                </div>
            </div>
        )
    }

    return (
        <div className={s.emptyState}>
            <span className={s.emptyIcon}>📂</span>
            <span className={s.emptyText}>폴더 또는 파일이 존재하지 않습니다.</span>
        </div>
    )
}

export default ShowDatas;