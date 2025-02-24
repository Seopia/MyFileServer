import axios from "axios";
import api from "../../common/api"

export const getPublicFileByCategoryAndSearchWord = async (category, searchWord, page,callBack) => {    
    const res = await api.get(`/public?category=${category||'all'}&searchWord=${searchWord||''}&page=${page||0}`);
    callBack(res.data);
}
export const writeLog = async (fileCode) => {
    await api.post(`/public/download?fileCode=${fileCode}`);
}

export const getFileByFileCode = async (fileCode, callBack) => {
    try{
        const res = await api.get(`/public/detail?fileCode=${fileCode}`);
        callBack(res.data);
    } catch(err){
        alert(err.response.data);
        window.location.href = '/public';
    }
}
export const deletePublicFile = async (fileCode,callBack) => {
    const res = await api.delete(`/public?fileCode=${fileCode}`);
    if(res.data){
        callBack();
    } else {
        alert('파일이 존재하지 않거나 로그인한 본인이 아닙니다.');
    }
}

export const recommendPublicFile = async (fileCode, callBack) => {
    const res = await api.post(`/public/recommend?fileCode=${fileCode}`);
    if(!res.data){
        alert('이미 추천한 파일입니다.');
    } else {
        callBack();
    }
}

export const getCommentPublicFile = async (fileCode, callBack) => {
    const res = await api.get(`/public/comment?fileCode=${fileCode}`);
    callBack(res.data);
} 
export const writeCommentPublicFile = async (fileCode, commentInput, callBack) =>{
    const res = await api.post(`/public/comment?fileCode=${fileCode}&content=${commentInput}`);
    callBack(res.data);
}
export const deleteCommentPublicFile = async (comment, callBack) => {
    const res = await api.delete(`/public/comment?commentCode=${comment.publicFileCommentCode}`);
    callBack(res.data);
}
/**
 * 파일을 10MB 쪼개서 서버에 업로드하고, 변경된 파일 이름을 return하는 함수
 * @param {*} file 업로드할 파일
 * @param {*} uploadingFunction 업로드 중 실행할 함수(현재 %)
 * @param {*} mergeringFunction 병합 작업 중 실행할 함수
 * @param {*} completeFunction 업로드 완료 후 실행할 함수(바뀐 파일 이름)
 */
export const uploadEarly = async (file, uploadingFunction, mergeringFunction, completeFunction) => {
    const chunkSize = 10 * 1024 * 1024; //청크 사이즈 10MB
    const totalChunk = Math.ceil(file.size / chunkSize);    //총 청크 개수

    for(let chunkIndex=0; chunkIndex<totalChunk; chunkIndex++){
        const chunk = file.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);
        const isMergeChunk = chunkIndex === totalChunk - 2;
        const res = await api.post(`/public/early`,{
            chunk:chunk,
            chunkIndex: chunkIndex,
            totalChunk: totalChunk,
            originalFileName: file.name,
        },{headers:{ignoreTimeout:isMergeChunk}});
        if(typeof res.data === 'string'){
            console.log(res.data);
            completeFunction(res.data);
        } else if(isMergeChunk){
            mergeringFunction();
        } else {
            uploadingFunction(Math.floor((chunkIndex/totalChunk)*100));            
        }

    }
}
export const uploadEarlyWithSmallFile = async (file, callBack) => {
    const res = await api.post(`/public/early/small`,{file:file});
    callBack(res.data); 
}

export const downloadPublicFile = async (file) => {
    if(file.size > (100 * 1024 * 1024)){
        window.open(file.fileFullPath, '_blank');
        return;
      }  
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
      })
}
