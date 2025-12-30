import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import GameDetail from '../pages/GameDetail';
import GameLibrary from '../pages/GameLibrary';
import UserCenter from '../pages/UserCenter';
import Login from '../pages/Login';
import Register from '../pages/Register';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'game/:id',
        element: <GameDetail />,
      },
      {
        path: 'library',
        element: <GameLibrary />,
      },
      {
        path: 'user',
        element: <UserCenter />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);

export default router;
