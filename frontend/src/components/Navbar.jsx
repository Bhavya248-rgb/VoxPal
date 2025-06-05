// components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ChevronDown, ChevronRight } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  {
    name: "Storyteller",
    path: "/storyteller",
    // subItems: [
    //   { name: "Explain Concept", path: "/storyteller/explain" },
    //   { name: "Create a Story", path: "/storyteller/create" }
    // ]
  },
  { name: "VoxCoach", path: "/voice-coach" },
  { name: "VoxBridge", path: "/voice-assist" },
  {name: "TalkMate",path: "/talkmate"},
  { name: "Saved Items", path: "/my-saves" },
  // { name: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const initials = user?.username ? user.username[0].toUpperCase() : 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleExpand = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const isSubItemActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col justify-between transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / App Name */}
          <div className="flex items-center justify-center h-20 border-b">
            <Link
              to="/dashboard"
              className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient"
              onClick={() => setIsOpen(false)}
            >
              VoxPal
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 py-8 flex flex-col space-y-2">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  // Parent item with subitems
                  <div>
                    <div className={`mx-6 px-4 py-3 rounded-lg font-medium text-lg transition w-[90%] flex items-center justify-between
                      ${location.pathname.startsWith(item.path)
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"}
                    `}>
                      <Link
                        to={item.path}
                        className="flex-1"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleExpand(item.name);
                        }}
                        className="ml-2 p-1 hover:bg-indigo-100 rounded-full"
                      >
                        {expandedItems[item.name] ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </button>
                    </div>
                    {/* Subitems */}
                    {expandedItems[item.name] && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className={`block px-4 py-2 rounded-lg text-sm transition
                              ${isSubItemActive(subItem.path)
                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"}
                            `}
                            onClick={() => setIsOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular item without subitems
                  <Link
                    to={item.path}
                    className={`mx-6 px-4 py-3 rounded-lg font-medium text-lg transition
                      ${location.pathname === item.path
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"}
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
        {/* Profile Section */}
        <div className="border-t p-6 relative">
          <button
            className="flex items-center space-x-3 w-full focus:outline-none"
            onClick={() => setProfileOpen((open) => !open)}
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {user?.username ? initials : <User size={24} />}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-indigo-900 text-base truncate">
                {user?.username || 'User'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email || ''}
              </div>
            </div>
            <svg className={`w-4 h-4 ml-2 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute left-6 right-6 bottom-20 bg-white shadow-lg rounded-lg py-2 z-50 animate-fade-in">
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
              </Link>
              <div className="border-t my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-base"
              >
                <LogOut className="mr-2" size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
