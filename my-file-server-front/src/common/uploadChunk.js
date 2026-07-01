import api from './api';

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * 공통 청킹 업로드 함수
 * 개인 클라우드(/main/chunk)와 그룹 클라우드(/group/chunk) 모두에서 사용합니다.
 *
 * @param {File}     file           - 업로드할 파일 객체
 * @param {string}   description    - 파일 설명(이름)
 * @param {string}   endpoint       - 업로드 API 경로 (예: '/main/chunk', '/group/chunk')
 * @param {Object}   extraParams    - 추가 파라미터 (folderCode, groupCode 등)
 * @param {function} onProgress     - 진행률 콜백 (0~100 숫자 또는 문자열)
 * @param {function} onStateChange  - 업로드 상태 콜백 ({ loading, uploading, merging })
 * @param {function} onComplete     - 완료 콜백 (서버 응답 데이터 전달)
 */
export async function uploadChunk(
    file,
    description,
    endpoint,
    extraParams,
    onProgress,
    onStateChange,
    onComplete
) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    onStateChange({ loading: true, uploading: false, merging: false });

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const isLastChunk = chunkIndex === totalChunks - 1;

        // 마지막 청크(병합 트리거) 전 상태 업데이트
        if (isLastChunk) {
            onStateChange({ loading: true, uploading: false, merging: true });
            onProgress(99);
        } else {
            onStateChange({ loading: true, uploading: true, merging: false });
            onProgress(Math.floor((chunkIndex / totalChunks) * 100));
        }

        const response = await api.post(
            endpoint,
            {
                chunk,
                chunkIndex,
                totalChunks,
                originalFileName: file.name,
                description,
                fileSize: file.size,
                ...extraParams,
            },
            // 마지막 청크는 서버에서 병합을 수행하므로 타임아웃 해제
            { headers: { ignoreTimeout: isLastChunk } }
        );

        if (response.data?.fileCode) {
            // 업로드 및 병합 완료
            onStateChange({ loading: false, uploading: false, merging: false });
            onProgress(100);
            onComplete(response.data);
            return;
        }
    }
}
