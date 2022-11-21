import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Login from './context/Auth/pages/Login/Login'
import AuthProvider from './context/Auth/provider'
import './index.scss'
import Home from './pages/Home/Home'
import AppRouter from './pages/Router'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <AuthProvider>
        <AppRouter />
    </AuthProvider>
)
