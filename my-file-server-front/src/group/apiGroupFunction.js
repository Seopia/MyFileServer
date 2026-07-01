import api from "../common/api";
import { uploadChunk as _uploadChunk } from '../common/uploadChunk';

export const groupFindUser = async (id, callBack) => {
    const res = await api.get(`/main/users?id=${id}`);
    callBack(res.data);
}

export const groupCreateGroup = async (users, name, description, callBack) => {
    const userCodeValues = users
        .filter(user => user.userCode)
        .map(user => user.userCode);
    const res = await api.post('/group', { userCodes: userCodeValues, groupName: name, description: description });
    callBack(res.data);
}

export const groupGetMyGroup = async (callBack) => {
    const res = await api.get('/my-group');
    callBack(res.data);
}

export const groupGetThisGroup = async (groupCode, callBack) => {
    const res = await api.get(`/group?groupCode=${groupCode}`);
    callBack(res.data);
}

export const groupDeleteGroup = async (groupCode, callBack) => {
    const res = await api.delete(`/group?groupCode=${groupCode}`);
    callBack(res.data);
}

/**
 * 그룹 폴더에 소형 파일 업로드 (100MB 미만)
 * @param {File}     file         - 업로드할 파일
 * @param {string}   description  - 파일 설명(이름)
 * @param {number}   folderCode   - 저장할 그룹 폴더 코드
 * @param {function} onProgress   - 진행률 콜백 (0~100)
 * @returns {Promise<Object>} 서버 응답 데이터
 */
export const groupUploadFile = async (file, description, folderCode, onProgress) => {
    const res = await api.post(
        '/group/upload',
        { file, description, folderCode },
        {
            onUploadProgress: (e) => {
                const p = Math.round((e.loaded * 100) / e.total);
                onProgress && onProgress(p);
            },
        }
    );
    return res.data;
};

/**
 * 그룹 폴더에 대용량 파일 청킹 업로드 (100MB 이상)
 * 공통 uploadChunk 모듈을 사용합니다.
 * @param {File}     file         - 업로드할 파일
 * @param {string}   description  - 파일 설명(이름)
 * @param {number}   folderCode   - 저장할 그룹 폴더 코드
 * @param {number}   groupCode    - 그룹 코드
 * @param {function} onComplete   - 완료 콜백 (서버 응답 데이터)
 * @param {function} onProgress   - 진행률 콜백 (0~100)
 * @param {function} setLoading   - 로딩 상태 setter
 */
export async function groupUploadChunk(file, description, folderCode, groupCode, onComplete, onProgress, setLoading) {
    await _uploadChunk(
        file,
        description,
        '/group/chunk',
        { folderCode, groupCode },
        onProgress,
        (state) => setLoading((p) => ({ ...p, upload: state.loading })),
        onComplete
    );
}

/**
 * 그룹 파일 삭제
 * @param {number} fileCode - 삭제할 파일 코드
 */
export const groupDeleteFile = async (fileCode) => {
    await api.delete(`/group/file?fileCode=${fileCode}`);
};

/**
 * 그룹 폴더 삭제 (하위 파일 포함)
 * @param {number} folderCode - 삭제할 폴더 코드
 */
export const groupDeleteFolder = async (folderCode) => {
    await api.delete(`/group/folder?folderCode=${folderCode}`);
};

/**
 * 그룹 정보 수정 (이름, 설명)
 */
export const groupUpdateInfo = async (groupCode, name, description) => {
    console.log(groupCode);
    
    const formData = new FormData();
    formData.append("groupCode", groupCode);
    formData.append("name", name);
    formData.append("description", description);
    return await api.post('/group/update', formData);
};

/**
 * 그룹 멤버 추가 (초대)
 */
export const groupAddMember = async (groupCode, userCode) => {
    const formData = new FormData();
    formData.append("groupCode", groupCode);
    formData.append("userCode", userCode);
    return await api.post('/group/member', formData);
};

/**
 * 그룹 멤버 추방/탈퇴
 */
export const groupKickMember = async (groupCode, userCode) => {
    return await api.delete(`/group/member?groupCode=${groupCode}&userCode=${userCode}`);
};