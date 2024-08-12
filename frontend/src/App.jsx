import React from "react";
import { Route, Routes } from 'react-router-dom';
import HomePage from './page/home/HomePage';
import SingUpPage from './page/auth/singup/SingUpPage.jsx';
import LoginPage from './page/auth/login/LoginPage';
import Sidebar from './components/common/Sidebar.jsx'
import RightPanel from "./components/common/RightPanel.jsx";
import Notification from "./page/notification/NotificationPage.jsx"
import ProfilePage from "./page/profile/ProfilePage.jsx"
const App = () => {
    return (
        <div className='flex max-w-6xl mx-auto'>
            <Sidebar />
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/signup' element={<SingUpPage />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/notifications' element={<Notification />} />
                <Route path='/profile/:username' element={<ProfilePage />} />

            </Routes>

            <RightPanel />

        </div>
    )
}

export default App