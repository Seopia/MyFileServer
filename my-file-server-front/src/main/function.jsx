import axios from "axios";
import api from "../common/api";

//개인 클라우드 파일 가져오는 함수임
export const getMyFile = async (page,setMyFiles, setTotalElements) => {
    const res = await api.get(`/main/file?page=${page}`);
    console.log(res);
    
    setTotalElements && setTotalElements(res.data.totalElements);
    setMyFiles(res.data.content);
}
//공용 클라우드 파일 가져오는 함수임
export const getPublicFile = async (page,setMyFiles, setTotalElements) => {
    const res = await api.get(`/main/file/public?page=${page}`);
    setTotalElements && setTotalElements(res.data.totalElements);
    setMyFiles(res.data.content);
}

//파일 지우는 함수임
export const deleteFile = async (fileCode) => {
    await api.delete(`/main/file/${fileCode}`);
}

//파일 다운로드 하는 함수임
export const downloadFile = async (file, setLoading) => {    
  setLoading(true);
    if(file.size > (100 * 1024 * 1024)){
      window.open(file.fileFullPath, '_blank');
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
      link.setAttribute('download', file.originalName); // 다운로드할 파일 이름 설정
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch((error) => {
      window.open(fileFullPath, '_blank');
    })
    .finally(()=>{
      setLoading(false);
    })
};

//시간을 이쁘게 출력해주는 함수임
export const formattedDateTime = (createAt) => {
  if(!createAt) return;
  const today = new Date();

  const formattedDate = `${createAt[0]}-${String(createAt[1]).padStart(2, '0')}-${String(createAt[2]).padStart(2, '0')}T${String(createAt[3]).padStart(2, '0')}:${String(createAt[4]).padStart(2, '0')}:${String(createAt[5]).padStart(2, '0')}`;
  const createDate = new Date(formattedDate);
  
  const diffMs = today - createDate;
  const diffInMinutes = Math.floor(diffMs / (1000 * 60));
  const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "방금 전";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInDays < 1) return `${diffInDays}일 전`;

  return `${createAt[0]}.${String(createAt[1]).padStart(2, '0')}.${String(createAt[2]).padStart(2, '0')} ${String(createAt[3]).padStart(2, '0')}:${String(createAt[4]).padStart(2, '0')}`;
}
//클릭해서 열 수 있는 파일인지 체크하는 함수
export const canOpenFile = (file) => {
  try{
    const extention = file.description.split('.').pop();
    switch(extention){
      case 'jpg':
      case 'png':
      case 'jpeg':
      case 'gif':
      case 'webp':
      case 'mp3':
      case 'mp4':
          return true;
      default:
        return false;
    }
  } catch(e){
    return false;
  }
}
//확장자에 따라서 아이콘 정해주는 함수
export const getFileIconByExtension = (fileFullPath) =>{  
  let extention = fileFullPath.split('.').pop();
  switch(extention){
    case 'jpg':
    case 'png':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return fileFullPath;
    case 'zip': return '/zip.png'
    case 'mp3': return '/mp3.png'
    case 'mp4': return '/mp4.png'
    case 'pdf': return '/pdf.png'
    case 'hwp':
    case 'hwpx':
      return '/hancom.png'
    default: return '/defaultImage.png'
  }
}

//문자열 n번 째 다음부터 ...으로 대체 하는 함수
export const truncateString = (str, n, showExtenstion) => {
  if(showExtenstion){
    if(str.length > n){
      const extention = str.split('.').pop();
      return str.slice(0,n - extention.length) + "..." + extention;
    }
  }
  if (str.length > n) {
      return str.slice(0, n) + "...";
  }
  return str;
}

//파일 사이즈 Byte 받아서 이쁘게 계산해주는 함수임
export const calcFileSize = (size) => {
  if (size < 1024) {
    return size + " Bytes";
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + " KB";
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }
};

export const prettyCategory = (category) => {
  let result;
  if(category==='game') return '게임';
  if(category==='software') return '소프트웨어';
  if(category==='music') return '음악';
  if(category==='movie') return '영화';
  if(category==='drama') return '드라마';
  if(category==='tv') return 'TV 프로그램';
  if(category==='porn') return '성인';
  if(category==='none') return '기타';
}