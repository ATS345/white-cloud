import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Provider } from 'react-redux'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { store } from './store'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import ErrorBoundary from './components/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const Games = lazy(() => import('./pages/Games'))
const GameDetail = lazy(() => import('./pages/GameDetail'))
const Library = lazy(() => import('./pages/Library'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Orders = lazy(() => import('./pages/Orders'))
const Download = lazy(() => import('./pages/Download'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Profile = lazy(() => import('./pages/Profile'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Admin = lazy(() => import('./pages/admin/Admin'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const GameManagement = lazy(() => import('./pages/admin/GameManagement'))

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '400px',
    background: '#0a0a0f',
  }}>
    <Spin size="large" />
  </div>
)

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#667eea',
            colorBgBase: '#0a0a0f',
            colorBgContainer: 'rgba(255,255,255,0.04)',
            colorBgElevated: '#1a1a2e',
            borderRadius: 8,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
          },
          components: {
            Layout: {
              bodyBg: '#0a0a0f',
              headerBg: 'transparent',
              footerBg: 'transparent',
            },
            Card: {
              colorBgContainer: 'rgba(255,255,255,0.04)',
            },
            Input: {
              colorBgContainer: 'rgba(255,255,255,0.06)',
            },
            Select: {
              colorBgContainer: 'rgba(255,255,255,0.06)',
            },
            Menu: {
              darkItemBg: 'transparent',
            },
          },
        }}
      >
        <ErrorBoundary>
          <Router future={routerFutureConfig}>
            <div className="app" style={{ background: '#0a0a0f', minHeight: '100vh' }}>
              <Routes>
                <Route path="/admin" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Admin />
                  </Suspense>
                }>
                  <Route index element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="users" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <UserManagement />
                    </Suspense>
                  } />
                  <Route path="games" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <GameManagement />
                    </Suspense>
                  } />
                </Route>
                <Route path="/*" element={
                  <>
                    <AppHeader />
                    <main style={{ background: '#0a0a0f', minHeight: 'calc(100vh - 64px)' }}>
                      <Suspense fallback={<LoadingFallback />}>
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
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/profile" element={<Profile />} />
                        </Routes>
                      </Suspense>
                    </main>
                    <AppFooter />
                  </>
                } />
              </Routes>
            </div>
          </Router>
        </ErrorBoundary>
      </ConfigProvider>
    </Provider>
  )
}

export default App
