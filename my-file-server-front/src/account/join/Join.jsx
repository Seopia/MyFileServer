import { useEffect, useState } from 'react';
import s from './Join.module.css';
import { useNavigate } from 'react-router-dom';
import { loginUrl } from '../../common/url';
import TermsModal from '../terms/TermsModal';
import PrivacyPolicyModal from '../terms/PrivacyPolicyModal';
import api from '../../common/api';

const Join = () => {
    const nav = useNavigate();
    const [signupData, setSignupData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        nickname: "",
    })
    const [termsOpen, setTermsOpen] = useState(false);
    const [policyOpen, setPolicyOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [focusedField, setFocusedField] = useState("")
    const [validationErrors, setValidationErrors] = useState({})
    const [duplicateStatus, setDuplicateStatus] = useState({
        username: null, // null, 'checking', 'available', 'taken'
        nickname: null,
    })
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [formProgress, setFormProgress] = useState(0)

    // 비밀번호 강도 계산
    const calculatePasswordStrength = (password) => {
        let strength = 0
        if (password.length >= 8) strength += 25
        if (/[a-z]/.test(password)) strength += 25
        if (/[A-Z]/.test(password)) strength += 25
        if (/[0-9]/.test(password)) strength += 25
        if (/[^A-Za-z0-9]/.test(password)) strength += 25
        return Math.min(strength, 100)
    }

    // 폼 진행률 계산
    const calculateFormProgress = () => {
        const fields = ["username", "password", "confirmPassword", "nickname"]
        const filledFields = fields.filter((field) => signupData[field]?.trim()).length
        return (filledFields / fields.length) * 100
    }

    // 실시간 유효성 검사
    const validateField = (field, value) => {
        const errors = { ...validationErrors }

        switch (field) {
            case "username":
                if (!value) {
                    errors.username = "아이디를 입력해주세요"
                } else if (value.length < 6) {
                    errors.username = "아이디는 6자 이상이어야 합니다"
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    errors.username = "아이디는 영문, 숫자, 언더스코어만 사용 가능합니다"
                } else {
                    delete errors.username
                }
                break

            case "password":
                if (!value) {
                    errors.password = "비밀번호를 입력해주세요"
                } else if (value.length < 8) {
                    errors.password = "비밀번호는 8자 이상이어야 합니다"
                } else {
                    delete errors.password
                }
                break

            case "confirmPassword":
                if (!value) {
                    errors.confirmPassword = "비밀번호 확인을 입력해주세요"
                } else if (value !== signupData.password) {
                    errors.confirmPassword = "비밀번호가 일치하지 않습니다"
                } else {
                    delete errors.confirmPassword
                }
                break

            case "nickname":
                if (!value) {
                    errors.nickname = "닉네임을 입력해주세요"
                } else if (value.length < 2) {
                    errors.nickname = "닉네임은 2자 이상이어야 합니다"
                } else if (value.length > 20) {
                    errors.nickname = "닉네임은 20자 이하여야 합니다"
                } else {
                    delete errors.nickname
                }
                break
        }

        setValidationErrors(errors)
    }

    // 입력값 변경 처리
    const handleInputChange = (field, value) => {
        setSignupData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // 중복 체크 상태 초기화
        if (field === "username" || field === "nickname") {
            setDuplicateStatus((prev) => ({
                ...prev,
                [field]: null,
            }))
        }

        // 실시간 유효성 검사
        validateField(field, value)

        // 비밀번호 강도 계산
        if (field === "password") {
            setPasswordStrength(calculatePasswordStrength(value))
        }

        // 비밀번호 확인 재검사
        if (field === "password" && signupData.confirmPassword) {
            validateField("confirmPassword", signupData.confirmPassword)
        }
    }

    // 중복 체크 처리
    const handleDuplicateCheck = async (field) => {
        console.log(field);

        const value = signupData[field]
        if (!value || validationErrors[field]) return

        setDuplicateStatus((prev) => ({
            ...prev,
            [field]: "checking",
        }))

        try {
            if (field === 'username') {
                const res = await api.get(`/join/valid?value=${signupData.username}&field=${field}`);
                await new Promise((resolve) => setTimeout(resolve, 1000))

                setDuplicateStatus((prev) => ({
                    ...prev,
                    [field]: res.data ? "taken" : "available",
                }))
            } else {
                const res = await api.get(`/join/valid?value=${signupData.nickname}&field=${field}`);
                await new Promise((resolve) => setTimeout(resolve, 1000))

                setDuplicateStatus((prev) => ({
                    ...prev,
                    [field]: res.data ? "taken" : "available",
                }))
            }

        } catch (error) {
            setDuplicateStatus((prev) => ({
                ...prev,
                [field]: null,
            }))
        }
    }

    // 회원가입 처리
    const handleSignup = () => {
        setIsLoading(true);
        api.post(`/join`, { id: signupData.username, password: signupData.password, nickname: signupData.nickname });
        setTimeout(() => {
            setIsLoading(false)
            nav(loginUrl);
        }, 2000)
    }

    // 로그인 페이지로 이동
    const handleLogin = () => {
        nav(loginUrl);
    }

    // 폼 제출 처리
    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('ss');

        // 모든 필드 유효성 검사
        Object.keys(signupData).forEach((field) => {
            validateField(field, signupData[field])
        })

        // 중복 체크 확인
        if (duplicateStatus.username !== "available" || duplicateStatus.nickname !== "available") {
            alert("아이디와 닉네임 중복 확인을 완료해주세요")
            return
        }

        // 에러가 없으면 회원가입 진행
        if (Object.keys(validationErrors).length === 0) {
            handleSignup()
        }
    }

    // 진행률 업데이트
    useEffect(() => {
        setFormProgress(calculateFormProgress())
    }, [signupData])

    // 비밀번호 강도 색상
    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return "#ef4444"
        if (passwordStrength < 50) return "#f59e0b"
        if (passwordStrength < 75) return "#eab308"
        return "#22c55e"
    }

    // 비밀번호 강도 텍스트
    const getPasswordStrengthText = () => {
        if (passwordStrength < 25) return "매우 약함"
        if (passwordStrength < 50) return "약함"
        if (passwordStrength < 75) return "보통"
        return "강함"
    }



    return (
        <div className={s.signupContainer}>
            {/* 배경 장식 요소들 */}
            <div className={s.backgroundDecorations}>
                <div className={s.floatingShape1}></div>
                <div className={s.floatingShape2}></div>
                <div className={s.floatingShape3}></div>
                <div className={s.gradientOrb1}></div>
                <div className={s.gradientOrb2}></div>
            </div>

            {/* 메인 회원가입 카드 */}
            <div className={s.signupCard}>
                {/* 헤더 */}
                <div className={s.signupHeader}>
                    <div className={s.logoContainer}>
                        <div className={s.logo}>
                            <span className={s.logoIcon}>☁️</span>
                            <span className={s.logoText}>Seopia Cloud</span>
                        </div>
                        <div className={s.logoSubtext}>새로운 계정을 만들어보세요</div>
                    </div>

                    {/* 진행률 표시 */}
                    <div className={s.progressContainer}>
                        <div className={s.progressLabel}>
                            <span className={s.progressIcon}>📊</span>
                            가입 진행률: {Math.round(formProgress)}%
                        </div>
                        <div className={s.progressBar}>
                            <div
                                className={s.progressFill}
                                style={{
                                    width: `${formProgress}%`,
                                    backgroundColor: formProgress === 100 ? "#22c55e" : "#7965c1",
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 회원가입 폼 */}
                <form className={s.signupForm} onSubmit={handleSubmit}>
                    <div className={s.welcomeText}>
                        <h2 className={s.welcomeTitle}>계정 만들기</h2>
                        <p className={s.welcomeSubtitle}>회원가입은 <strong style={{ fontSize: '1.2em' }}> 지섭이 </strong>의 승인이 필요해요 신청하고 기다려주세요</p>
                    </div>

                    {/* 아이디 입력 필드 */}
                    <div className={s.inputGroup}>
                        <label className={s.inputLabel} htmlFor="username">
                            <span className={s.labelIcon}>👤</span>
                            아이디
                            <span className={s.required}>*</span>
                        </label>
                        <div className={s.inputWithButton}>
                            <div
                                className={`${s.inputWrapper} ${focusedField === "username" ? s.focused : ""} ${validationErrors.username ? s.error : ""}`}
                            >
                                <span className={s.inputIcon}>📧</span>
                                <input
                                    id="username"
                                    type="text"
                                    className={s.input}
                                    placeholder="영문, 숫자 (6자 이상)"
                                    value={signupData.username || ""}
                                    onChange={(e) => handleInputChange("username", e.target.value)}
                                    onFocus={() => setFocusedField("username")}
                                    onBlur={() => setFocusedField("")}
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                className={`${s.duplicateButton} ${duplicateStatus.username === "available" ? s.success : ""} ${duplicateStatus.username === "taken" ? s.error : ""}`}
                                onClick={() => handleDuplicateCheck("username")}
                                disabled={!signupData.username || validationErrors.username || duplicateStatus.username === "checking"}
                            >
                                {duplicateStatus.username === "checking" ? (
                                    <div className={s.spinner}></div>
                                ) : duplicateStatus.username === "available" ? (
                                    <>
                                        <span className={s.checkIcon}>✅</span>
                                        사용가능
                                    </>
                                ) : duplicateStatus.username === "taken" ? (
                                    <>
                                        <span className={s.errorIcon}>❌</span>
                                        중복됨
                                    </>
                                ) : (
                                    "중복확인"
                                )}
                            </button>
                        </div>
                        {validationErrors.username && (
                            <div className={s.errorMessage}>
                                <span className={s.errorIcon}>⚠️</span>
                                {validationErrors.username}
                            </div>
                        )}
                    </div>

                    {/* 닉네임 입력 필드 */}
                    <div className={s.inputGroup}>
                        <label className={s.inputLabel} htmlFor="nickname">
                            <span className={s.labelIcon}>🏷️</span>
                            닉네임
                            <span className={s.required}>*</span>
                        </label>
                        <div className={s.inputWithButton}>
                            <div
                                className={`${s.inputWrapper} ${focusedField === "nickname" ? s.focused : ""} ${validationErrors.nickname ? s.error : ""}`}
                            >
                                <span className={s.inputIcon}>✨</span>
                                <input
                                    id="nickname"
                                    type="text"
                                    className={s.input}
                                    placeholder="다른 사용자에게 보여질 이름 (2-20자)"
                                    value={signupData.nickname || ""}
                                    onChange={(e) => handleInputChange("nickname", e.target.value)}
                                    onFocus={() => setFocusedField("nickname")}
                                    onBlur={() => setFocusedField("")}
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                className={`${s.duplicateButton} ${duplicateStatus.nickname === "available" ? s.success : ""} ${duplicateStatus.nickname === "taken" ? s.error : ""}`}
                                onClick={() => handleDuplicateCheck("nickname")}
                                disabled={!signupData.nickname || validationErrors.nickname || duplicateStatus.nickname === "checking"}
                            >
                                {duplicateStatus.nickname === "checking" ? (
                                    <div className={s.spinner}></div>
                                ) : duplicateStatus.nickname === "available" ? (
                                    <>
                                        <span className={s.checkIcon}>✅</span>
                                        사용가능
                                    </>
                                ) : duplicateStatus.nickname === "taken" ? (
                                    <>
                                        <span className={s.errorIcon}>❌</span>
                                        중복됨
                                    </>
                                ) : (
                                    "중복확인"
                                )}
                            </button>
                        </div>
                        {validationErrors.nickname && (
                            <div className={s.errorMessage}>
                                <span className={s.errorIcon}>⚠️</span>
                                {validationErrors.nickname}
                            </div>
                        )}
                    </div>

                    {/* 비밀번호 입력 필드 */}
                    <div className={s.inputGroup}>
                        <label className={s.inputLabel} htmlFor="password">
                            <span className={s.labelIcon}>🔒</span>
                            비밀번호
                            <span className={s.required}>*</span>
                        </label>
                        <div
                            className={`${s.inputWrapper} ${focusedField === "password" ? s.focused : ""} ${validationErrors.password ? s.error : ""}`}
                        >
                            <span className={s.inputIcon}>🔑</span>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={s.input}
                                placeholder="8자 이상, 영문/숫자 조합"
                                value={signupData.password || ""}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                onFocus={() => setFocusedField("password")}
                                onBlur={() => setFocusedField("")}
                                required
                            />
                            <button
                                type="button"
                                className={s.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                            >
                                <span className={s.toggleIcon}>{showPassword ? "🙈" : "👁️"}</span>
                            </button>
                        </div>
                        {signupData.password && (
                            <div className={s.passwordStrength}>
                                <div className={s.strengthLabel}>
                                    <span className={s.strengthIcon}>🛡️</span>
                                    비밀번호 강도: <span style={{ color: getPasswordStrengthColor() }}>{getPasswordStrengthText()}</span>
                                </div>
                                <div className={s.strengthBar}>
                                    <div
                                        className={s.strengthFill}
                                        style={{
                                            width: `${passwordStrength}%`,
                                            backgroundColor: getPasswordStrengthColor(),
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        {validationErrors.password && (
                            <div className={s.errorMessage}>
                                <span className={s.errorIcon}>⚠️</span>
                                {validationErrors.password}
                            </div>
                        )}
                    </div>

                    {/* 비밀번호 확인 입력 필드 */}
                    <div className={s.inputGroup}>
                        <label className={s.inputLabel} htmlFor="confirmPassword">
                            <span className={s.labelIcon}>🔐</span>
                            비밀번호 확인
                            <span className={s.required}>*</span>
                        </label>
                        <div
                            className={`${s.inputWrapper} ${focusedField === "confirmPassword" ? s.focused : ""} ${validationErrors.confirmPassword ? s.error : ""} ${signupData.confirmPassword && !validationErrors.confirmPassword ? s.success : ""}`}
                        >
                            <span className={s.inputIcon}>🔄</span>
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                className={s.input}
                                placeholder="위에서 입력한 비밀번호를 다시 입력"
                                value={signupData.confirmPassword || ""}
                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                onFocus={() => setFocusedField("confirmPassword")}
                                onBlur={() => setFocusedField("")}
                                required
                            />
                            <button
                                type="button"
                                className={s.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                            >
                                <span className={s.toggleIcon}>{showConfirmPassword ? "🙈" : "👁️"}</span>
                            </button>
                            {signupData.confirmPassword && !validationErrors.confirmPassword && (
                                <span className={s.successIcon}>✅</span>
                            )}
                        </div>
                        {validationErrors.confirmPassword && (
                            <div className={s.errorMessage}>
                                <span className={s.errorIcon}>⚠️</span>
                                {validationErrors.confirmPassword}
                            </div>
                        )}
                    </div>

                    {/* 약관 동의 */}
                    <div className={s.termsSection}>
                        <label className={s.checkboxContainer}>
                            <input type="checkbox" className={s.checkbox} required />
                            <span className={s.checkboxCustom}></span>
                            <span className={s.checkboxLabel}>
                                <span className={s.required}>*</span>
                                <button onClick={() => setTermsOpen(true)} type="button" className={s.termsLink}>
                                    이용약관
                                </button>{" "}
                                및
                                <button onClick={() => setPolicyOpen(true)} type="button" className={s.termsLink}>
                                    개인정보처리방침
                                </button>
                                에 동의합니다
                            </span>
                        </label>
                    </div>

                    {/* 회원가입 버튼 */}
                    <button type="submit" className={s.signupButton} disabled={isLoading || formProgress < 100}>
                        {isLoading ? (
                            <div className={s.loadingContainer}>
                                <div className={s.spinner}></div>
                                <span>계정 생성 중...</span>
                            </div>
                        ) : (
                            <>
                                <span className={s.buttonIcon}>🎉</span>
                                계정 만들기
                            </>
                        )}
                    </button>

                    {/* 구분선 */}
                    <div className={s.divider}>
                        <span className={s.dividerText}>또는</span>
                    </div>

                    {/* 로그인 버튼 */}
                    <button type="button" className={s.loginButton} onClick={handleLogin}>
                        <span className={s.buttonIcon}>🔑</span>
                        이미 계정이 있어요
                    </button>
                </form>

                {/* 푸터 */}
                <div className={s.signupFooter}>
                    <p className={s.footerText}>
                        이미 계정이 있으신가요?{" "}
                        <button className={s.footerLink} onClick={handleLogin}>
                            로그인하기
                        </button>
                    </p>
                </div>
            </div>

            {/* 보안 정보 카드 */}
            <div className={s.securityCard}>
                <div className={s.securityContent}>
                    <h3 className={s.securityTitle}>
                        <span className={s.securityIcon}>🔐</span>
                        계정 보안
                    </h3>
                    <ul className={s.securityList}>
                        <li className={s.securityItem}>
                            <span className={s.securityItemIcon}>🛡️</span>
                            강력한 암호화로 데이터 보호
                        </li>
                        <li className={s.securityItem}>
                            <span className={s.securityItemIcon}>🔍</span>
                            실시간 보안 모니터링
                        </li>
                        <li className={s.securityItem}>
                            <span className={s.securityItemIcon}>🚫</span>
                            스팸 및 악성 코드 차단
                        </li>
                        <li className={s.securityItem}>
                            <span className={s.securityItemIcon}>📧</span>
                            이메일 인증으로 안전 확보
                        </li>
                    </ul>
                </div>
            </div>
            <TermsModal isOpen={termsOpen} setIsOpen={setTermsOpen} />
            <PrivacyPolicyModal isOpen={policyOpen} setIsOpen={setPolicyOpen} />
        </div>
    )
}

export default Join;