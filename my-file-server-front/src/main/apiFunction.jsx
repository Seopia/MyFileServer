
import axios from "axios";
import api from "../common/api";
/**
 * 개인 클라우드의 폴더 안에 있는 파일 가져오는 함수
 * @param {number} folderCode 무슨 폴더 안에 파일 가져올지
 * @param {function} callBack 콜백함수
 */
export const getPrivateFile = async (folderCode, callBack) => {
    const res = await api.get(`/main/folder?folderCode=${folderCode}`);
    callBack(res.data);
}
//공용 클라우드 파일 가져오는 함수임
export const getPublicFile = async (page, callBack) => {
    const res = await api.get(`/main/file/public?page=${page}`);
    callBack(res.data);
}
/**
 * 폴더 만들기
 * @param {string} folderName 폴더 이름 
 * @param {number} folderCode 폴더 코드
 * @param {function} callBack 콜백 함수(a) 메게변수는 서버 응답.data
 */
export const createFolder = async (folderName, folderCode, callBack) => {
    const res = await api.post(`/main/folder`,{folderName:folderName,folderCode:folderCode});
    callBack(res.data);
}
/**
 * /main/upload
 * 개인 클라우드 파일 업로드 함수
 * @param {file} file 파일 예)e.target.files[0]
 * @param {string} description  파일 이름
 * @param {number} folderCode 파일이 들어갈 폴더 코드
 * @param {function} callBack 콜백 함수(a) 메게변수는 서버응답.data
 */
export const creataPrivateFile = async (file,description,folderCode,callBack) => {
    const res = await api.post(`/main/upload`,{file:file,description:description,folderCode:folderCode});
    callBack(res.data);
}

/**
 * 
 * @param {*} file 
 * @param {*} description 
 * @param {*} callBack 
 */
export const createPublicFile = async(file, description, callBack) => {
  console.log(file);
  
  const res = await api.post(`/main/upload/public`,{file: file, description: description});
  callBack(res.data);
}

/**
 * 파일 다운로드하는 함수
 * @param {File} file 서버에서 응답한 파일 객체 
 */
export const download = async (file) => {
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
      link.setAttribute('download', file.originalName); // 다운로드할 파일 이름 설정
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch((error) => {
      window.open(fileFullPath, '_blank');
    });
}

//파일 지우는 함수임
export const deleteFile = async (fileCode, callBack) => {
    await api.delete(`/main/file/${fileCode}`);
    callBack();
}
/**
 * 개인 클라우드 전용 파일 분할 업로드 함수
 * 내부적으로 공통 uploadChunk 모듈을 사용합니다.
 * @param {File}     file          - 업로드할 파일
 * @param {string}   description   - 파일 설명(이름)
 * @param {number}   folderCode    - 저장할 폴더 코드
 * @param {function} setPercent    - 퍼센트 상태 setter
 * @param {function} setUploadState - 업로드 상태 setter
 * @param {function} callBack      - 완료 콜백
 */
export async function uploadChunk(file, description, folderCode, setPercent, setUploadState, callBack) {
    const { uploadChunk: _uploadChunk } = await import('../common/uploadChunk');
    await _uploadChunk(
        file,
        description,
        '/main/chunk',
        { folderCode },
        setPercent,
        (state) => setUploadState((p) => ({ ...p, ...state })),
        callBack
    );
}