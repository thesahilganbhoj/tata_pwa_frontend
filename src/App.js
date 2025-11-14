import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginScreen from "./screens/LoginScreen"
import HomeScreen from "./screens/HomeScreen"
import ProfileScreen from "./screens/ProfileScreen"

export default function App() {
  const [user, setUser] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setShowProfile(false)
  }

  const handleProfileOpen = () => setShowProfile(true)
  const handleProfileClose = () => setShowProfile(false)

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <LoginScreen onLogin={handleLogin} /> : <Navigate to="/home" />} />

        <Route
          path="/home"
          element={
            user ? (
              showProfile ? (
                <ProfileScreen employee={user} onBack={handleProfileClose} />
              ) : (
                <HomeScreen onLogout={handleLogout} onProfile={handleProfileOpen} employee={user} />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
