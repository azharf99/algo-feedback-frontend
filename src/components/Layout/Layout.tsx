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
  X
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { User as UserIcon } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={handleDrawerToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 bg-white w-64 border-r border-gray-200 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          <span className="text-xl font-bold text-gray-800">Algo Feedback</span>
          <button onClick={handleDrawerToggle} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.filter(item => !item.adminOnly || authState.user?.role === 'Admin').map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.text}>
                  <button
                    onClick={() => {
                      navigate(item.path)
                      setMobileOpen(false)
                    }}
                    className={clsx(
                      "w-full flex items-center px-3 py-2 rounded-md transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <span className={clsx("mr-3", isActive ? "text-blue-700" : "text-gray-400")}>
                      {item.icon}
                    </span>
                    {item.text}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
          <div className="flex items-center">
            <button
              onClick={handleDrawerToggle}
              className="mr-4 text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{currentTitle}</h1>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center focus:outline-none"
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium shadow-sm">
                {userInitial}
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {authState.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {authState.user?.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
