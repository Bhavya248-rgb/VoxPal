import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-tr from-indigo-50 to-purple-100 p-6 md:p-12 font-sans ml-0 md:ml-64 pt-16 transition-all">
        <Outlet />
      </div>
    </>
  );
};

export default Layout; 