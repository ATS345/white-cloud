import { BrowserRouter, Routes, Route, useEffect } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Provider, useDispatch } from 'react-redux'
import store from './store'
import { initializeCart } from './store/cartSlice'

// 导入页面组件
import HomePage from './pages/HomePage'
import GameListPage from './pages/GameListPage'
import GameDetailPage from './pages/GameDetailPage'
import LibraryPage from './pages/LibraryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import DeveloperDashboard from './pages/DeveloperDashboard'
import DeveloperGamesPage from './pages/DeveloperGamesPage'
import DeveloperSalesPage from './pages/DeveloperSalesPage'
import DeveloperFinancesPage from './pages/DeveloperFinancesPage'
import NotFoundPage from './pages/NotFoundPage'

// 导入布局组件
import Header from './components/Header'
import Footer from './components/Footer'

// 初始化组件
const AppInitializer = () => {
  const dispatch = useDispatch()
  
  useEffect(() => {
    // 初始化购物车统计信息
    dispatch(initializeCart())
  }, [dispatch])
  
  return null
}

// 创建主题
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#ec4899',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

function App() {
  return (
    <Provider store={store}>
      <AppInitializer />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div className="app-container">
            <Header />
            <main className="main-content">
              <Routes>
                {/* 公共路由 */}
                <Route path="/" element={<HomePage />} />
                <Route path="/games" element={<GameListPage />} />
                <Route path="/game/:id" element={<GameDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />

                {/* 需要登录的路由 */}
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />

                {/* 开发者路由 */}
                <Route path="/developer" element={<DeveloperDashboard />} />
                <Route path="/developer/games" element={<DeveloperGamesPage />} />
                <Route path="/developer/sales" element={<DeveloperSalesPage />} />
                <Route path="/developer/finances" element={<DeveloperFinancesPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

export default App