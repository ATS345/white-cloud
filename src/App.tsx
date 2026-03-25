import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Provider } from 'react-redux'
import { store } from './store'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import Home from './pages/Home'
import Games from './pages/Games'
import GameDetail from './pages/GameDetail'
import Library from './pages/Library'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Download from './pages/Download'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Admin from './pages/admin/Admin'
import Dashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import GameManagement from './pages/admin/GameManagement'

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/admin" element={<Admin />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="games" element={<GameManagement />} />
              </Route>
              <Route path="/" element={
                <>
                  <AppHeader />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/games" element={<Games />} />
                      <Route path="/games/:slug" element={<GameDetail />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/download" element={<Download />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </main>
                  <AppFooter />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </Provider>
  )
}

export default App