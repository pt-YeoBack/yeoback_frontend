import onboardingHero from "../images/onboarding-hero.png";
import calendarDaysIcon from "../images/icon-calendar-days.svg";
import mapPinIcon from "../images/icon-map-pin.svg";
import bookHeartIcon from "../images/icon-book-heart.svg";
import "../css/pages/Onboarding.css";

const features = [
    {
        icon: calendarDaysIcon,
        title: "내 속도에 맞는 여행 계획",
        description: "가고 싶은 곳을 모아 일정을 만들어요.",
    },
    {
        icon: mapPinIcon,
        title: "빈 시간엔, 가까운 발견",
        description: "AI가 주변의 어울리는 장소를 찾아줘요.",
    },
    {
        icon: bookHeartIcon,
        title: "인연도 기록도, 나의 수첩에",
        description: "원할 때만 연결하고, 추억은 저장해요.",
    },
];

const Onboarding = () => {
    return (
        <main className="onboarding">
            <section className="onboarding-intro">
                <header className="onboarding-promise">
                    <img
                        className="onboarding-hero"
                        src={onboardingHero}
                        alt=""
                    />
                    <h1 className="onboarding-title">계획 사이, 새로운 발견 ✈️</h1>
                    <p className="onboarding-subtitle">
                        나만의 속도로 여행하고,
                        <br />
                        우연히 만난 인연까지 간직해요.
                    </p>
                </header>

                <ul className="onboarding-features">
                    {features.map((feature) => (
                        <li className="onboarding-feature" key={feature.title}>
                            <div className="onboarding-feature-symbol">
                                <img
                                    src={feature.icon}
                                    alt=""
                                    width={20}
                                    height={20}
                                />
                            </div>
                            <div className="onboarding-feature-text">
                                <h2 className="onboarding-feature-title">{feature.title}</h2>
                                <p className="onboarding-feature-description">{feature.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <div className="onboarding-actions">
                <button type="button" className="onboarding-btn onboarding-btn-primary">
                    계정 만들기
                </button>
                <button type="button" className="onboarding-btn onboarding-btn-text">
                    로그인
                </button>
            </div>
        </main>
    );
}

export default Onboarding;
