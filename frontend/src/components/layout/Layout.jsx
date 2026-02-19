import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardList,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  Settings,
  Clock,
  BarChart3
} from 'lucide-react';

const Layout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
      { icon: MessageSquare, label: 'Messages', path: '/messages' },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { icon: Users, label: 'Users', path: '/users' },
          { icon: BookOpen, label: 'Subjects', path: '/subjects' },
          { icon: ClipboardList, label: 'Attendance', path: '/attendance' },
          { icon: Calendar, label: 'Exams', path: '/exams' },
          { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        ];
      case 'teacher':
        return [
          ...baseItems,
          { icon: ClipboardList, label: 'Attendance', path: '/attendance' },
          { icon: Calendar, label: 'Exams', path: '/exams' },
          { icon: BookOpen, label: 'Homework', path: '/homework' },
          { icon: Clock, label: 'Timetable', path: '/timetable' },
        ];
      case 'student':
        return [
          ...baseItems,
          { icon: Clock, label: 'Timetable', path: '/timetable' },
          { icon: Calendar, label: 'Exams', path: '/exams' },
          { icon: BookOpen, label: 'Homework', path: '/homework' },
        ];
      case 'parent':
        return [
          ...baseItems,
          { icon: ClipboardList, label: "Child's Attendance", path: '/attendance' },
          { icon: Calendar, label: "Child's Exams", path: '/exams' },
          { icon: BookOpen, label: "Child's Homework", path: '/homework' },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GraduationCap size={28} />
            <h2>LSM3</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              className="btn btn-outline"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
              id="menu-toggle"
            >
              <Menu size={20} />
            </button>
            <h1 className="header-title">{title}</h1>
          </div>

          <div className="header-actions">
            <div className="user-info">
              <div className="user-avatar">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.firstName} {user?.lastName}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
