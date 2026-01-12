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

const NavbarWrapper = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <NavbarWrapper />,
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