
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
 * @param {*} file 파일
 * @param {*} description 파일 이름
 * @param {*} folderCode 폴더 코드
 * @param {*} callBack 업로드 완료 후 실행 함수
 * @param {*} setPercent 퍼센트
 * @param {*} setLoading 로딩 유무
 */
export async function uploadChunk(file, description, folderCode, callBack, setPercent, setLoading) {
  const chunkSize = 50 * 1024 * 1024; // 50MB
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const chunk = file.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);
      const isMergeChunk = chunkIndex === totalChunks - 2;
      const response = await api.post("/main/chunk", {chunk:chunk,chunkIndex:chunkIndex,totalChunks:totalChunks,originalFileName:file.name,description:description,fileSize:file.size,folderCode:folderCode}
          ,{headers:{ignoreTimeout:isMergeChunk}}
      );
      if(response.data.fileCode){
        //병합 완료 후
          callBack(response.data);
      } else if(isMergeChunk){
        //병합 중
          setPercent(`병합 작업 중..`);
      } else {
        //업로드 중
          setLoading((p)=>({...p, uploadPrepare: false, uploading: true}));
          setPercent(Math.floor((chunkIndex/totalChunks) * 100));
      }
  }
}