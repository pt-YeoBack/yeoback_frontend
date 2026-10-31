import yeobaekLogo from "../images/yeobaek-logo.svg";
import "../css/pages/Splash.css";

const Splash = () => {
    return (
        <main className="splash">
            <div className="splash-brand">
                <img
                    className="splash-logo"
                    src={yeobaekLogo}
                    alt="여백 Yeobaek"
                    width={194}
                    height={194}
                />
            </div>
        </main>
    );
}

export default Splash;
