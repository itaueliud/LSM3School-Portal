import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { 
  Users, BookOpen, GraduationCap, Calendar, Plus, Trash2, X, 
  Edit3, CheckCircle, AlertCircle, TrendingUp, Clock, Eye, EyeOff
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="admin-stat-card">
    <div className={`admin-stat-icon ${color}`}>
      <Icon size={28} />
    </div>
    <div className="admin-stat-content">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const routeToTab = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/users': 'users',
    '/subjects': 'subjects',
    '/exams': 'exams'
  };
  const tabToRoute = {
    dashboard: '/',
    users: '/users',
    subjects: '/subjects',
    exams: '/exams'
  };

  const [activeTab, setActiveTab] = useState(routeToTab[location.pathname] || 'dashboard');
  const [editingUser, setEditingUser] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchSubjects, setSearchSubjects] = useState('');
  const [searchExams, setSearchExams] = useState('');
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student',
    grade: 'Grade 1',
    subject: ''
  });
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    grade: 'Grade 1'
  });
  const [examForm, setExamForm] = useState({
    title: '',
    subjectId: '',
    date: '',
    totalMarks: 100,
    grade: 'Grade 1'
  });

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams');
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchSubjects();
    fetchExams();
  }, []);

  useEffect(() => {
    // update active tab when location changes
    setActiveTab(routeToTab[location.pathname] || 'dashboard');
  }, [location.pathname]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      setErrorMessage('Error fetching users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const openExamModal = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setExamForm({
        title: exam.title,
        subjectId: exam.subjectId,
        date: exam.date,
        totalMarks: exam.totalMarks,
        grade: exam.grade
      });
    } else {
      setEditingExam(null);
      setExamForm({ title: '', subjectId: '', date: '', totalMarks: 100, grade: 'Grade 1' });
    }
    setShowExamModal(true);
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingExam) {
        await api.put(`/exams/${editingExam.id}`, examForm);
        showSuccess('Exam updated successfully');
      } else {
        await api.post('/exams', examForm);
        showSuccess('Exam created successfully');
      }
      setShowExamModal(false);
      setEditingExam(null);
      setExamForm({ title: '', subjectId: '', date: '', totalMarks: 100, grade: 'Grade 1' });
      fetchExams();
      fetchStats();
    } catch (error) {
      showError(error.response?.data?.message || 'Error saving exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      setLoading(true);
      await api.delete(`/exams/${id}`);
      showSuccess('Exam deleted successfully');
      fetchExams();
      fetchStats();
    } catch (error) {
      showError('Error deleting exam');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, userForm);
        showSuccess('User updated successfully');
      } else {
        await api.post('/auth/register', userForm);
        showSuccess('User created successfully');
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ email: '', password: '', firstName: '', lastName: '', role: 'student', grade: 'Grade 1', subject: '' });
      fetchUsers();
      fetchStats();
    } catch (error) {
      showError(error.response?.data?.message || 'Error saving user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, subjectForm);
        showSuccess('Subject updated successfully');
      } else {
        await api.post('/subjects', subjectForm);
        showSuccess('Subject created successfully');
      }
      setShowSubjectModal(false);
      setEditingSubject(null);
      setSubjectForm({ name: '', grade: 'Grade 1' });
      fetchSubjects();
    } catch (error) {
      showError(error.response?.data?.message || 'Error saving subject');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      setLoading(true);
      await api.delete(`/users/${id}`);
      showSuccess('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      showError('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      setLoading(true);
      await api.delete(`/subjects/${id}`);
      showSuccess('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      showError('Error deleting subject');
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        grade: user.Student?.grade || 'Grade 1',
        subject: user.Teacher?.subject || ''
      });
    } else {
      setEditingUser(null);
      setUserForm({ email: '', password: '', firstName: '', lastName: '', role: 'student', grade: 'Grade 1', subject: '' });
    }
    setShowUserModal(true);
  };

  const openSubjectModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectForm({ name: subject.name, grade: subject.grade });
    } else {
      setEditingSubject(null);
      setSubjectForm({ name: '', grade: 'Grade 1' });
    }
    setShowSubjectModal(true);
  };

  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchSubjects.toLowerCase())
  );

  const filteredExams = exams.filter(ex =>
    ex.title.toLowerCase().includes(searchExams.toLowerCase()) ||
    (ex.subject?.name || '').toLowerCase().includes(searchExams.toLowerCase())
  );

  return (
    <Layout title="Admin Dashboard">
      <div className="admin-container">
        {successMessage && (
          <div className="admin-alert admin-alert-success">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="admin-alert admin-alert-error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'dashboard' ? 'admin-tab-active' : ''}`} 
            onClick={() => navigate(tabToRoute.dashboard)}
          >
            Dashboard
          </button>
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'admin-tab-active' : ''}`} 
            onClick={() => navigate(tabToRoute.users)}
          >
            Users
          </button>
          <button 
            className={`admin-tab ${activeTab === 'subjects' ? 'admin-tab-active' : ''}`} 
            onClick={() => navigate(tabToRoute.subjects)}
          >
            Subjects
          </button>
          <button 
            className={`admin-tab ${activeTab === 'exams' ? 'admin-tab-active' : ''}`} 
            onClick={() => navigate(tabToRoute.exams)}
          >
            Exams
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="admin-dashboard-section">
            <div className="admin-stats-grid">
              <StatCard icon={GraduationCap} label="Total Students" value={stats.totalStudents || 0} color="blue" />
              <StatCard icon={Users} label="Total Teachers" value={stats.totalTeachers || 0} color="green" />
              <StatCard icon={BookOpen} label="Total Subjects" value={subjects.length} color="orange" />
              <StatCard icon={Calendar} label="Active Exams" value={stats.totalExams || 0} color="red" />
            </div>

            <div className="admin-grid-2">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>Today's Attendance</h3>
                  <TrendingUp size={20} className="admin-header-icon" />
                </div>
                <div className="admin-card-body">
                  <div className="admin-attendance-stats">
                    <div className="admin-attendance-item">
                      <div className="admin-attendance-number success">{stats.todayAttendance?.present || 0}</div>
                      <div className="admin-attendance-label">Present</div>
                    </div>
                    <div className="admin-attendance-divider"></div>
                    <div className="admin-attendance-item">
                      <div className="admin-attendance-number danger">{stats.todayAttendance?.absent || 0}</div>
                      <div className="admin-attendance-label">Absent</div>
                    </div>
                  </div>
                  <div className="admin-progress-container">
                    <div className="admin-progress-bar">
                      <div
                        className="admin-progress-fill"
                        style={{
                          width: `${stats.todayAttendance?.total ? (stats.todayAttendance.present / stats.todayAttendance.total * 100) : 0}%`
                        }}
                      ></div>
                    </div>
                    <div className="admin-progress-text">
                      {Math.round(stats.todayAttendance?.total ? (stats.todayAttendance.present / stats.todayAttendance.total * 100) : 0)}% attendance rate
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>Quick Stats</h3>
                  <Clock size={20} className="admin-header-icon" />
                </div>
                <div className="admin-card-body">
                  <div className="admin-quick-stats">
                    <div className="admin-quick-stat-item">
                      <div className="admin-quick-stat-icon blue">
                        <Users size={18} />
                      </div>
                      <div className="admin-quick-stat-content">
                        <div className="admin-quick-stat-label">Total Users</div>
                        <div className="admin-quick-stat-value">{users.length}</div>
                      </div>
                    </div>
                    <div className="admin-quick-stat-item">
                      <div className="admin-quick-stat-icon green">
                        <BookOpen size={18} />
                      </div>
                      <div className="admin-quick-stat-content">
                        <div className="admin-quick-stat-label">Total Subjects</div>
                        <div className="admin-quick-stat-value">{subjects.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {stats.recentAnnouncements?.length > 0 && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>Recent Announcements</h3>
                </div>
                <div className="admin-announcements-list">
                  {stats.recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="admin-announcement-item">
                      <div className="admin-announcement-icon">
                        <Bell size={18} />
                      </div>
                      <div className="admin-announcement-content">
                        <div className="admin-announcement-title">{announcement.title}</div>
                        <div className="admin-announcement-text">{announcement.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-header-left">
                <h3>All Users</h3>
                <div className="admin-user-count">{filteredUsers.length} users</div>
              </div>
              <button className="admin-btn admin-btn-primary" onClick={() => openUserModal()}>
                <Plus size={18} /> Add User
              </button>
            </div>
            <div className="admin-card-body">
              <div className="admin-search-box">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="admin-search-input"
                />
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="admin-table-row">
                          <td className="admin-table-name">
                            <div className="admin-user-avatar">{u.firstName.charAt(0)}{u.lastName.charAt(0)}</div>
                            <div>
                              <div className="admin-table-strong">{u.firstName} {u.lastName}</div>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td><span className={`admin-badge admin-badge-${u.role}`}>{u.role}</span></td>
                          <td>
                            <span className="admin-status-active">
                              <span className="admin-status-dot"></span>
                              Active
                            </span>
                          </td>
                          <td className="admin-table-actions">
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-secondary" 
                              onClick={() => openUserModal(u)}
                              title="Edit user"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-danger" 
                              onClick={() => handleDeleteUser(u.id)}
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="admin-table-empty">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-header-left">
                <h3>All Subjects</h3>
                <div className="admin-user-count">{filteredSubjects.length} subjects</div>
              </div>
              <button className="admin-btn admin-btn-primary" onClick={() => openSubjectModal()}>
                <Plus size={18} /> Add Subject
              </button>
            </div>
            <div className="admin-card-body">
              <div className="admin-search-box">
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchSubjects}
                  onChange={(e) => setSearchSubjects(e.target.value)}
                  className="admin-search-input"
                />
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Grade</th>
                      <th>Teacher</th>
                      <th>Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((subject) => (
                        <tr key={subject.id} className="admin-table-row">
                          <td className="admin-table-strong">{subject.name}</td>
                          <td>{subject.grade}</td>
                          <td>
                            {subject.teacher?.user ? `${subject.teacher.user.firstName} ${subject.teacher.user.lastName}` : 'Not assigned'}
                          </td>
                          <td>
                            <span className="admin-badge admin-badge-info">{subject.enrollmentCount || 0} students</span>
                          </td>
                          <td className="admin-table-actions">
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-secondary" 
                              onClick={() => openSubjectModal(subject)}
                              title="Edit subject"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-danger" 
                              onClick={() => handleDeleteSubject(subject.id)}
                              title="Delete subject"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="admin-table-empty">
                          No subjects found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'exams' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-header-left">
                <h3>All Exams</h3>
                <div className="admin-user-count">{filteredExams.length} exams</div>
              </div>
              <button className="admin-btn admin-btn-primary" onClick={() => openExamModal()}>
                <Plus size={18} /> Add Exam
              </button>
            </div>
            <div className="admin-card-body">
              <div className="admin-search-box">
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchExams}
                  onChange={(e) => setSearchExams(e.target.value)}
                  className="admin-search-input"
                />
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Grade</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.length > 0 ? (
                      filteredExams.map((exam) => (
                        <tr key={exam.id} className="admin-table-row">
                          <td className="admin-table-strong">{exam.title}</td>
                          <td>{exam.subject?.name || '-'}</td>
                          <td>{exam.grade}</td>
                          <td>{exam.date}</td>
                          <td>{exam.totalMarks}</td>
                          <td className="admin-table-actions">
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-secondary" 
                              onClick={() => openExamModal(exam)}
                              title="Edit exam"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="admin-btn admin-btn-sm admin-btn-danger" 
                              onClick={() => handleDeleteExam(exam.id)}
                              title="Delete exam"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="admin-table-empty">
                          No exams found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {showUserModal && (
          <div className="admin-modal-overlay" onClick={() => setShowUserModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                <button 
                  className="admin-modal-close" 
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="admin-modal-body">
                  <div className="admin-form-grid-2">
                    <div className="admin-form-group">
                      <label>First Name</label>
                      <input 
                        type="text" 
                        value={userForm.firstName} 
                        onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} 
                        required 
                        className="admin-form-input"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        value={userForm.lastName} 
                        onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} 
                        required 
                        className="admin-form-input"
                      />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={userForm.email} 
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} 
                      required 
                      disabled={editingUser}
                      className="admin-form-input"
                    />
                  </div>
                  {!editingUser && (
                    <div className="admin-form-group">
                      <label>Password</label>
                      <input 
                        type="password" 
                        value={userForm.password} 
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} 
                        required 
                        minLength={6} 
                        className="admin-form-input"
                      />
                    </div>
                  )}
                  <div className="admin-form-group">
                    <label>Role</label>
                    <select 
                      value={userForm.role} 
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className="admin-form-input"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>
                  {userForm.role === 'student' && (
                    <div className="admin-form-group">
                      <label>Grade</label>
                      <select 
                        value={userForm.grade} 
                        onChange={(e) => setUserForm({ ...userForm, grade: e.target.value })}
                        className="admin-form-input"
                      >
                        {[...Array(8)].map((_, i) => (
                          <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {userForm.role === 'teacher' && (
                    <div className="admin-form-group">
                      <label>Subject</label>
                      <input 
                        type="text" 
                        value={userForm.subject} 
                        onChange={(e) => setUserForm({ ...userForm, subject: e.target.value })} 
                        placeholder="e.g., Mathematics" 
                        className="admin-form-input"
                      />
                    </div>
                  )}
                </div>
                <div className="admin-modal-footer">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline" 
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingUser(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn admin-btn-primary" 
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showSubjectModal && (
          <div className="admin-modal-overlay" onClick={() => setShowSubjectModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
                <button 
                  className="admin-modal-close" 
                  onClick={() => {
                    setShowSubjectModal(false);
                    setEditingSubject(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateSubject}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label>Subject Name</label>
                    <input 
                      type="text" 
                      value={subjectForm.name} 
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} 
                      required 
                      className="admin-form-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Grade</label>
                    <select 
                      value={subjectForm.grade} 
                      onChange={(e) => setSubjectForm({ ...subjectForm, grade: e.target.value })}
                      className="admin-form-input"
                    >
                      {[...Array(8)].map((_, i) => (
                        <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-outline" 
                    onClick={() => {
                      setShowSubjectModal(false);
                      setEditingSubject(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn admin-btn-primary" 
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Create Subject')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showExamModal && (
          <div className="admin-modal-overlay" onClick={() => setShowExamModal(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingExam ? 'Edit Exam' : 'Add New Exam'}</h3>
                <button
                  className="admin-modal-close"
                  onClick={() => {
                    setShowExamModal(false);
                    setEditingExam(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateExam}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={examForm.title}
                      onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                      required
                      className="admin-form-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Subject</label>
                    <select
                      value={examForm.subjectId}
                      onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
                      required
                      className="admin-form-input"
                    >
                      <option value="">Select subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Grade</label>
                    <select
                      value={examForm.grade}
                      onChange={(e) => setExamForm({ ...examForm, grade: e.target.value })}
                      className="admin-form-input"
                    >
                      {[...Array(8)].map((_, i) => (
                        <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={examForm.date}
                      onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                      required
                      className="admin-form-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Total Marks</label>
                    <input
                      type="number"
                      min="0"
                      value={examForm.totalMarks}
                      onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                      required
                      className="admin-form-input"
                    />
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => {
                      setShowExamModal(false);
                      setEditingExam(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingExam ? 'Update Exam' : 'Create Exam')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
