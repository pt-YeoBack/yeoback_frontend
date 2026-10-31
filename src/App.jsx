import OnboardingContent from './home';
import Content from './home2';
import Test from './test';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import CreateAccount from './pages/CreateAccount';
import { Route, Routes } from 'react-router-dom';


function App() {

    return (
        <>
        <Routes>
            <Route path='/' Component={Test} />
            <Route path='/home' Component={OnboardingContent} />
            <Route path='/home1' Component={Content} />
            <Route path='/splash' Component={Splash} />
            <Route path='/onboarding' Component={Onboarding} />
            <Route path='/signup' Component={CreateAccount} />
        </Routes>
        </>
    );
}

export default App;