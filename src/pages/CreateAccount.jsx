import { useState } from "react";
import chevronLeftIcon from "../images/icon-chevron-left.svg";
import ellipsisIcon from "../images/icon-ellipsis.svg";
import eyeOffIcon from "../images/icon-eye-off.svg";
import circleCheckIcon from "../images/icon-circle-check.svg";
import circleIcon from "../images/icon-circle.svg";
import chevronRightIcon from "../images/icon-chevron-right.svg";
import googleLogo from "../images/logo-google.svg";
import naverLogo from "../images/logo-naver.svg";
import kakaoLogo from "../images/logo-kakao.svg";
import "../css/pages/CreateAccount.css";

const consents = [
    { id: "terms", label: "[필수] 이용약관 및 개인정보 수집 동의" },
    { id: "age", label: "[필수] 만 14세 이상입니다" },
    { id: "news", label: "[선택] 여행 소식 받기" },
];

const socialProviders = [
    { id: "google", label: "구글", logo: googleLogo, width: 24 },
    { id: "naver", label: "네이버", logo: naverLogo, width: 24 },
    { id: "kakao", label: "카카오", logo: kakaoLogo, width: 28 },
];

const CreateAccount = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [agreed, setAgreed] = useState({
        terms: true,
        age: true,
        news: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    const toggleConsent = (id) => {
        setAgreed((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <div className="create-account">
            <nav className="create-account-nav">
                <button type="button" className="create-account-nav-back" aria-label="뒤로 가기">
                    <img src={chevronLeftIcon} alt="" width={22} height={22} />
                </button>
                <h1 className="create-account-nav-title">계정 만들기</h1>
                <button type="button" className="create-account-nav-more" aria-label="더보기">
                    <img src={ellipsisIcon} alt="" width={21} height={21} />
                </button>
            </nav>

            <main className="create-account-content">
                <header className="create-account-intro">
                    <h2 className="create-account-title">여백과 시작해요</h2>
                    <p className="create-account-subtitle">여행과 대화를 나만의 수첩에.</p>
                </header>

                <form className="create-account-form" onSubmit={handleSubmit}>
                    <div className="create-account-fields">
                        <div className="create-account-field">
                            <label className="create-account-label" htmlFor="name">이름</label>
                            <div className="create-account-input">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="김서연"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="create-account-field">
                            <label className="create-account-label" htmlFor="email">이메일</label>
                            <div className="create-account-input">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seoyeon.kim@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="create-account-field">
                            <label className="create-account-label" htmlFor="password">비밀번호</label>
                            <div className="create-account-input">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="create-account-eye"
                                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                                    aria-pressed={showPassword}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    <img src={eyeOffIcon} alt="" width={18} height={18} />
                                </button>
                            </div>
                            <p className="create-account-hint">영문·숫자·특수문자 포함 8자 이상</p>
                        </div>

                        <div className="create-account-field">
                            <label className="create-account-label" htmlFor="passwordConfirm">비밀번호 확인</label>
                            <div className="create-account-input">
                                <input
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    type={showPasswordConfirm ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={form.passwordConfirm}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="create-account-eye"
                                    aria-label={showPasswordConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
                                    aria-pressed={showPasswordConfirm}
                                    onClick={() => setShowPasswordConfirm((prev) => !prev)}
                                >
                                    <img src={eyeOffIcon} alt="" width={18} height={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <ul className="create-account-consents">
                        {consents.map((consent) => (
                            <li className="create-account-consent" key={consent.id}>
                                <button
                                    type="button"
                                    className="create-account-consent-toggle"
                                    role="checkbox"
                                    aria-checked={agreed[consent.id]}
                                    onClick={() => toggleConsent(consent.id)}
                                >
                                    <img
                                        src={agreed[consent.id] ? circleCheckIcon : circleIcon}
                                        alt=""
                                        width={20}
                                        height={20}
                                    />
                                    <span>{consent.label}</span>
                                </button>
                                <button
                                    type="button"
                                    className="create-account-consent-detail"
                                    aria-label={`${consent.label} 자세히 보기`}
                                >
                                    <img src={chevronRightIcon} alt="" width={14} height={14} />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <button type="submit" className="create-account-submit">
                        동의하고 계정 만들기
                    </button>
                </form>

                <p className="create-account-divider">또는 소셜 계정으로 시작하기</p>

                <ul className="create-account-socials">
                    {socialProviders.map((provider) => (
                        <li className="create-account-social" key={provider.id}>
                            <button
                                type="button"
                                className={`create-account-social-btn ${provider.id}`}
                                aria-label={`${provider.label}로 시작하기`}
                            >
                                <img src={provider.logo} alt="" width={provider.width} height={24} />
                            </button>
                            <span className="create-account-social-label">{provider.label}</span>
                        </li>
                    ))}
                </ul>

                <p className="create-account-login">
                    이미 계정이 있나요?
                    <button type="button" className="create-account-login-link">로그인</button>
                </p>
            </main>
        </div>
    );
}

export default CreateAccount;
