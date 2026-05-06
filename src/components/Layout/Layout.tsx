import React, { useState, useRef, useEffect } from 'react'
import {
  Menu as MenuIcon,
  LayoutDashboard,
  Users,
  UsersRound,
  GraduationCap,
  CalendarDays,
  LineChart,
  LogOut,
  X,
  Sun,
  Moon,
  User as UserIcon
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import clsx from 'clsx'

const menuItems = [
  { text: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  { text: 'Students', icon: <Users className="w-5 h-5" />, path: '/students' },
  { text: 'Groups', icon: <UsersRound className="w-5 h-5" />, path: '/groups' },
  { text: 'Courses', icon: <GraduationCap className="w-5 h-5" />, path: '/courses' },
  { text: 'Lessons', icon: <CalendarDays className="w-5 h-5" />, path: '/lessons' },
  { text: 'Sessions', icon: <LineChart className="w-5 h-5" />, path: '/sessions' },
  { text: 'Feedbacks', icon: <LineChart className="w-5 h-5" />, path: '/feedbacks' },
  { text: 'Users', icon: <UserIcon className="w-5 h-5" />, path: '/users', adminOnly: true },
]

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { state: authState, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentTitle = menuItems.find(item => item.path === location.pathname)?.text || 'Algo Feedback System'
  const userInitial = authState.user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={handleDrawerToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 bg-white dark:bg-gray-800 w-64 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col shadow-xl lg:shadow-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <span className="text-xl font-bold text-gray-800 dark:text-white">Algo Feedback</span>
          <button onClick={handleDrawerToggle} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.filter(item => !item.adminOnly || authState.user?.role === 'Admin').map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.text}
                onClick={() => {
                  navigate(item.path)
                  setMobileOpen(false)
                }}
                className={clsx(
                  "w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <span className={clsx("mr-3 transition-colors", isActive ? "text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300")}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.text}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 z-30 shrink-0 transition-colors duration-200">
          <div className="flex items-center">
            <button
              onClick={handleDrawerToggle}
              className="mr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 lg:hidden"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white truncate max-w-[150px] sm:max-w-none">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center focus:outline-none"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm ring-2 ring-transparent hover:ring-blue-100 dark:hover:ring-blue-900 transition-all">
                  {userInitial}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-gray-700 z-50 transform origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {authState.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                      {authState.user?.role}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setProfileOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                  >
                    <UserIcon className="w-4 h-4 mr-2.5" />
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4 mr-2.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
