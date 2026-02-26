import { useEffect, useRef, useState } from 'react';
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
  BarChart3,
  User,
  ChevronDown
} from 'lucide-react';

const Layout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef(null);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

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
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>}
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
              className="btn btn-outline menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h1 className="header-title">{title}</h1>
          </div>

          <div className="header-actions">
            <div className="user-menu" ref={menuRef}>
              <button className="user-menu-trigger" onClick={() => setUserMenuOpen((prev) => !prev)}>
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user?.firstName} {user?.lastName}</span>
                    <span className="user-role">{user?.role}</span>
                  </div>
                </div>
                <ChevronDown size={18} />
              </button>

              {userMenuOpen && (
                <div className="user-menu-dropdown">
                  <button
                    className="user-menu-item"
                    onClick={() => {
                      setShowProfileModal(true);
                      setUserMenuOpen(false);
                    }}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </button>
                  <button className="user-menu-item" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>

      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Profile Details</h3>
              <button className="btn btn-outline" onClick={() => setShowProfileModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body profile-body">
              <div className="profile-row"><span>First Name</span><strong>{user?.firstName || '-'}</strong></div>
              <div className="profile-row"><span>Last Name</span><strong>{user?.lastName || '-'}</strong></div>
              <div className="profile-row"><span>Email</span><strong>{user?.email || '-'}</strong></div>
              <div className="profile-row"><span>Role</span><strong>{user?.role || '-'}</strong></div>
              <div className="profile-row"><span>Phone</span><strong>{user?.phone || '-'}</strong></div>
              {user?.role === 'student' && <div className="profile-row"><span>Grade</span><strong>{profile?.grade || '-'}</strong></div>}
              {user?.role === 'student' && <div className="profile-row"><span>Student ID</span><strong>{profile?.studentId || '-'}</strong></div>}
              {user?.role === 'teacher' && <div className="profile-row"><span>Employee ID</span><strong>{profile?.employeeId || '-'}</strong></div>}
              {user?.role === 'teacher' && <div className="profile-row"><span>Subject</span><strong>{profile?.subject || '-'}</strong></div>}
              {user?.role === 'parent' && <div className="profile-row"><span>Linked Student ID</span><strong>{profile?.studentId || '-'}</strong></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
