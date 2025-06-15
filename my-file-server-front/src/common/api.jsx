import axios from "axios";

export const apiUrl = '/api';
// export const apiUrl = 'http://localhost:8080';

const api = axios.create({
    baseURL: apiUrl,
});

// 요청 인터셉터 설정
api.interceptors.request.use(
    (config) => {
        try{
            const token = localStorage.getItem('token');
            if (token) {
                // 토큰이 있으면 헤더에 추가
                config.headers.Authorization = token;
            }
            if(config.headers.ignoreTimeout){
                config.timeout = 0;
            }
            config.credentials = 'include';

            if (config.method === 'post' || config.method === 'put') {
                // POST나 PUT 요청일 경우 FormData 사용
                const formData = new FormData();
                for (const key in config.data) {
                    formData.append(key, config.data[key]);
                }
                config.data = formData;
                config.headers['Content-Type'] = 'multipart/form-data';
                
            }
            return config;
        } catch(e){
            console.log(e);
            
        }
    },
    (error) => {
        console.log(`요청 중에 에러 발생: ${error}`);
        return Promise.reject(error);
    }
);


// 응답 인터셉터 설정
api.interceptors.response.use(
    (response) => {
        // 정상 응답 처리
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/';
            } else if (error.response.status === 401) { // JWT 토큰이 없을 때
                // alert('로그인이 만료되었습니다.');
                localStorage.removeItem('token');
                // window.location.href = '/';
            } else if (error.response.status === 400) {
                console.log(error.response);
                
            }
        } else if (error.request) {
            // 요청 전 에러 발생
            alert('서버와 통신에 문제가 생겼습니다. 콘솔을 확인하세요.');
            // window.location.href = '/not'
            console.log('서버와 통신이 불가능합니다. :', error);
        } else {
            // 요청 자체를 못했을 때
            console.error(`요청 자체 실패: ${error}`);
        }
        return Promise.reject(error);
    }
);

export default api;
