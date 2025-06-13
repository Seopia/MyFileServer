import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const scrollMap = new Map();

export default function ScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();
  const path = location.pathname + location.search;

  // 나가기 전 저장
  useLayoutEffect(() => {
    return () => {
      const y = window.scrollY;
      scrollMap.set(path, y);
    };
  }, [path]);

useLayoutEffect(() => {
  if (navType === 'POP') {
    const y = scrollMap.get(path) ?? 0;

    // 렌더 끝난 뒤로 한 프레임 밀어서 실행
    setTimeout(() => {
      console.log('📌 실제 스크롤 복원 실행됨:', y);
      window.scrollTo(0, y);
    }, 50);
  } else {
    window.scrollTo(0, 0);
  }
}, [path, navType]);

  return null;
}