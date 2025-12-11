import Container from './components/Container'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './components/AuthProvider'
import GuestOnly from './components/GuestOnly'
import UserMenu from './components/UserMenu'

import ProfileSettings from './pages/ProfileSettings'

const App = () => {
  function NavAuthLinks() {
    const { user } = useAuth()
    if (!user) {
      return (
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/register" className="hover:underline">Register</Link>
        </nav>
      )
    }
    return (
      <nav className="ml-auto flex items-center gap-4">
        <UserMenu />
      </nav>
    )
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <Container className="py-3 flex items-center gap-6">
              <Link to="/" className="text-lg font-semibold tracking-tight">Blog CMS</Link>
              <NavAuthLinks />
            </Container>
          </header>
          <main>
            <Container className="py-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
                <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
                <Route path="/settings/profile" element={<ProfileSettings />} />
              </Routes>
            </Container>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;