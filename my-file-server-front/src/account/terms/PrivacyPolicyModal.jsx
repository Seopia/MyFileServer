
import s from './TermsModal.module.css';
const PrivacyPolicyModal = ({ isOpen, setIsOpen }) => {

    return (
        <div className={`${s.modal} ${isOpen ? s.open : s.close}`}>
            <div className={s.modalBackdrop}>
                <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
                    <h2>개인정보 처리방침</h2>
                    <div className={s.termsText}>
                        <button style={{padding:10}} onClick={() => setIsOpen(false)}>약관 닫기</button>
                        <p><strong>최종 개정일: 2025년 6월 12일</strong></p>
                        <p>Seopia Cloud (이하 “회사” 또는 “서비스”)는 『개인정보 보호법』 등 관련 법령에 따라 이용자의 개인정보를 보호하며,
                            아래와 같이 개인정보 처리방침을 수립하여 이용자 권익을 보호하고 있습니다.</p>
                        <p><strong>제1조 (목적)</strong><br />
                            이 약관은 Seopia Cloud (이하 "서비스")가 제공하는 클라우드 기반 파일 공유 및 보관 서비스(이하 "서비스")의 이용과 관련하여, 이용자와 서비스 제공자 간의 권리·의무 및 책임사항 등을 규정함을 목적으로 합니다.</p>

                        <p><strong>제1조 (개인정보의 수집 항목 및 수집 방법)</strong><br />
                            <ol>
                                <li>수집 항목</li>
                                <ul><li>[회원가입 시] 필수: 이메일(ID), 비밀번호, 닉네임</li><li>[서비스 이용 시 자동 수집] IP주소, 쿠키, 서비스 이용 기록, 접속 로그</li></ul>
                                <li>수집 방법</li>
                                <ul><li>회원가입 및 서비스 이용 시 이용자가 직접 입력</li><li>서비스 이용 중 자동 수집</li></ul>
                            </ol>
                        </p>

                        <p><strong>제2조 (개인정보의 수집 및 이용 목적)</strong><br />
                            수집한 개인정보는 다음 목적을 위해 사용됩니다.
                            <ul>
                                <li>회원 식별 및 로그인</li>
                                <li>파일 업로드/다운로드 기록 관리</li>
                                <li>공용 게시물 작성 및 댓글 기능 제공</li>
                                <li>서비스 제공 및 이용 통계 분석</li>
                                <li>고객문의 응대 및 불만 처리</li>
                                <li>법령상 의무 이행</li>
                            </ul>
                        </p>

                        <p><strong>제3조 (개인정보의 보유 및 이용 기간)</strong><br />
                            <ul>
                                <li>이용자의 개인정보는 회원 탈퇴 시 즉시 파기됩니다.</li>
                                <li>단, 다음 정보는 법령에 따라 일정 기간 보관됩니다:</li>
                                <ul>
                                    <li>전자상거래법에 따른 계약 또는 청약철회 등에 관한 기록: 5년</li>
                                    <li>통신비밀보호법에 따른 로그 기록: 3개월</li>
                                </ul>
                            </ul>
                        </p>

                        <p><strong>제4조 (개인정보의 제3자 제공)</strong><br />
                            회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
                            다만, 다음 경우에는 예외로 합니다.
                            <ul>
                                <li>이용자가 사전에 동의한 경우</li>
                                <li>법령에 의해 제출이 요구된 경우</li>
                            </ul> </p>

                        <p><strong>제5조 (개인정보 처리의 위탁)</strong><br />
                            현재 회사는 개인정보 처리를 외부 업체에 위탁하지 않습니다.</p>

                        <p><strong>제6조 (이용자의 권리와 행사 방법)</strong><br />
                            이용자는 언제든지 다음 권리를 행사할 수 있습니다.
                            <ul>
                                <li>개인정보 열람, 수정, 삭제 요청</li>
                                <li>회원탈퇴(개인정보 파기 요청 포함)</li>
                            </ul>요청은 이메일 또는 사이트 내 고객센터를 통해 처리됩니다.</p>

                        <p><strong>제7조 (개인정보의 파기 절차 및 방법)</strong><br />
                            <ol>
                                <li>파기 절차: 회원 탈퇴 시 즉시 파기 대상 정보를 선별하여 삭제</li>
                                <li>파기 방법: 전자적 파일 형태는 복구 불가능한 방식으로 영구 삭제</li>
                            </ol></p>

                        <p><strong>제8조 (쿠키의 운영)</strong><br />
                            서비스는 개인화된 서비스를 제공하기 위해 쿠키(cookie)를 사용할 수 있습니다.
                            이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</p>

                        <p><strong>제9조 (개인정보 보호책임자)</strong><br />
                            회사는 개인정보 관련 민원 처리를 위해 아래 책임자를 지정합니다.
                            <ul>
                                <li>이메일: wjdwltjq7289@gmail.com</li>
                                <li>문의 가능 시간: 평일 10:00 ~ 18:00</li>
                            </ul></p>
                        <p><strong>제10조 (변경사항 고지)</strong><br />
                            본 개인정보 처리방침은 법령 또는 서비스 정책에 따라 변경될 수 있으며,
                            변경 시 홈페이지를 통해 사전 공지합니다.</p>
                        <p><strong>부칙</strong><br />
                            본 약관은 2025년 6월 12일부터 적용됩니다.</p>

                    </div>

                    <button style={{padding:10}} onClick={() => setIsOpen(false)}>약관 닫기</button>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicyModal;