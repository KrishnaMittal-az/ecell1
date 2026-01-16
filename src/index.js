import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { TeamCouncil } from './pages/TeamCouncil';
import { Events } from './pages/Event';
import { TaskManagementProvider, useTaskManagement } from './contexts/TaskManagementContext';
import LoginPage from './pages/auth/LoginPage';
import TasksList from './pages/TasksList';
import TasksDashboard from './components/tasks/dashboard/TasksDashboard';
import TaskAnalytics from './components/tasks/analytics/TaskAnalytics';

const NavbarWrapper = () => {
  const { user, loading } = useTaskManagement()

  if (loading) {
    return (
      <div className="loader-container">
        <span className="loader">
          <img alt='preloader' src='assets/images/logoorange.png' />
        </span>
      </div>
    )
  }

  if (!user) {
    return (
      <div>
        <Outlet />
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
};

const ProtectedRoute = ({ children, allowedYears }) => {
  const { userProfile, loading } = useTaskManagement()

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return <LoginPage />
  }

  if (allowedYears && !allowedYears.includes(userProfile.year)) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger">
          <h4>Access Restricted</h4>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <TaskManagementProvider>
        <NavbarWrapper />
      </TaskManagementProvider>
    ),
    children: [
      { path: '/', element: <Home /> },
      { path: '/gallery', element: <Gallery /> },
      { path: '/councils', element: <TeamCouncil />,
        loader: async ({ request, params }) => {
          return fetch(
            `assets/data/team.json`
          );
        }
      },
      { path: '/events', element: <Events /> },
      
      // Auth routes
      { path: '/login', element: <LoginPage /> },
      
      // Task management routes
      { 
        path: '/tasks', 
        element: (
          <ProtectedRoute>
            <TasksList />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/tasks/dashboard', 
        element: (
          <ProtectedRoute>
            <TasksDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: '/tasks/analytics', 
        element: (
          <ProtectedRoute allowedYears={['3rd']}>
            <TaskAnalytics />
          </ProtectedRoute>
        ) 
      },
    ],
    // errorElement: <NotFound />
  },
]);

const Root = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <React.StrictMode>
      {loading ? (
        <div className='loader-container'>
          <span style={{ display: "block" }} className="loader">
            <img alt='preloader' src='assets/images/logoorange.png' />
          </span>
        </div>
      ) : (
        <RouterProvider router={router} />
      )}
    </React.StrictMode>
  );
};


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Root />
);