import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, CalendarDays, Clock3, GraduationCap, MessageSquare, TrendingUp, ClipboardList } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const routeToTab = {
  '/': 'overview',
  '/dashboard': 'overview',
  '/timetable': 'timetable',
  '/exams': 'exams',
  '/homework': 'homework',
  '/notifications': 'notifications',
  '/messages': 'messages',
  '/attendance': 'attendance'
};

const tabToRoute = {
  overview: '/',
  timetable: '/timetable',
  exams: '/exams',
  homework: '/homework',
  notifications: '/notifications',
  messages: '/messages',
  attendance: '/attendance'
};

const MetricCard = ({ icon: Icon, label, value }) => (
  <div className="student-metric card">
    <div className="student-metric-icon"><Icon size={18} /></div>
    <div className="student-metric-content">
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = routeToTab[location.pathname] || 'overview';

  const studentId = profile?.id;
  const grade = profile?.grade;

  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [homework, setHomework] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [exams, setExams] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [conversation, setConversation] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (!studentId) return;
    fetchAcademicData();
    fetchContacts();
  }, [studentId, grade]);

  useEffect(() => {
    if (!selectedContact) {
      setConversation([]);
      return;
    }
    fetchConversation(selectedContact);
  }, [selectedContact]);

  const fetchAcademicData = async () => {
    try {
      const [attendanceRes, marksRes, hwRes, ttRes, examsRes, announcementsRes] = await Promise.all([
        api.get(`/attendance/student/${studentId}`),
        api.get(`/marks/student/${studentId}`),
        api.get(`/homework/student/${studentId}`),
        api.get(`/timetable/grade/${grade}`),
        api.get('/exams', { params: { grade } }),
        api.get('/announcements', { params: { grade } })
      ]);

      setAttendance(attendanceRes.data);
      setMarks(marksRes.data);
      setHomework(hwRes.data);
      setTimetable(ttRes.data);
      setExams(examsRes.data);
      setAnnouncements(announcementsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await api.get('/messages/contacts');
      setContacts(res.data);
      if (res.data.length > 0 && !selectedContact) {
        setSelectedContact(String(res.data[0].id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConversation = async (contactId) => {
    try {
      const res = await api.get(`/messages/conversation/${contactId}`);
      setConversation(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitHomework = async (homeworkId) => {
    try {
      await api.post(`/homework/${homeworkId}/submit`, {
        submissionText: submissions[homeworkId] || '',
        studentId
      });
      fetchAcademicData();
      alert('Homework submitted');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit homework');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedContact || !messageText.trim()) return;
    try {
      await api.post('/messages', {
        receiverId: Number(selectedContact),
        content: messageText.trim()
      });
      setMessageText('');
      fetchConversation(selectedContact);
      fetchContacts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  const attendancePct = useMemo(() => {
    if (attendance.length === 0) return '0.0';
    return ((attendance.filter((a) => a.status !== 'absent').length / attendance.length) * 100).toFixed(1);
  }, [attendance]);

  const avgMarks = useMemo(() => {
    if (marks.length === 0) return '0.0';
    return (marks.reduce((sum, m) => sum + Number(m.marks || 0), 0) / marks.length).toFixed(1);
  }, [marks]);

  const goTab = (tab) => navigate(tabToRoute[tab]);

  return (
    <Layout title="Student Dashboard">
      <div className="student-shell">
        <section className="student-hero">
          <div>
            <p className="student-kicker">Welcome back</p>
            <h2>{user?.firstName} {user?.lastName}</h2>
          </div>
          <div className="student-hero-meta">
            <span><GraduationCap size={16} /> {grade || 'Grade'}</span>
            <span><CalendarDays size={16} /> {new Date().toLocaleDateString()}</span>
          </div>
        </section>

        <div className="tabs student-tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => goTab('overview')}>Overview</button>
          <button className={`tab ${activeTab === 'timetable' ? 'active' : ''}`} onClick={() => goTab('timetable')}>Timetable</button>
          <button className={`tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => goTab('attendance')}>Attendance</button>
          <button className={`tab ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => goTab('exams')}>Exams & Marks</button>
          <button className={`tab ${activeTab === 'homework' ? 'active' : ''}`} onClick={() => goTab('homework')}>Homework</button>
          <button className={`tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => goTab('notifications')}>Notifications</button>
        </div>

        {activeTab === 'overview' && (
          <div className="student-grid student-overview-grid">
            <MetricCard icon={TrendingUp} label="Attendance" value={`${attendancePct}%`} />
            <MetricCard icon={BookOpen} label="Average Marks" value={avgMarks} />
            <MetricCard icon={Clock3} label="Pending Homework" value={homework.filter((h) => !h.submission).length} />
            <MetricCard icon={CalendarDays} label="Total Exams" value={exams.length} />
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="card student-card">
            <div className="card-header"><h3><Clock3 size={18} /> Timetable</h3></div>
            <div className="table-container student-table">
              <table>
                <thead><tr><th>Day</th><th>Subject</th><th>Time</th><th>Room</th></tr></thead>
                <tbody>
                  {timetable.length === 0 ? (
                    <tr><td colSpan="4">No timetable available.</td></tr>
                  ) : (
                    timetable.map((t) => (
                      <tr key={t.id}>
                        <td>{t.dayOfWeek}</td>
                        <td>{t.subject?.name || '-'}</td>
                        <td>{t.startTime} - {t.endTime}</td>
                        <td>{t.room || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'attendance' && (
          <div className="card student-card">
            <div className="card-header"><h3><ClipboardList size={18} /> Attendance</h3></div>
            <div className="table-container student-table">
              <table>
                <thead><tr><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan="2">No attendance records.</td></tr>
                  ) : (
                    attendance.map((a) => (
                      <tr key={a.id}>
                        <td>{a.date}</td>
                        <td><span className={`badge ${a.status === 'absent' ? 'badge-error' : 'badge-success'}`}>{a.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="student-grid student-dual-grid">
            <div className="card student-card">
              <div className="card-header"><h3><CalendarDays size={18} /> Exams</h3></div>
              <div className="table-container student-table">
                <table>
                  <thead><tr><th>Title</th><th>Subject</th><th>Date</th><th>Total</th></tr></thead>
                  <tbody>
                    {exams.length === 0 ? (
                      <tr><td colSpan="4">No exams scheduled.</td></tr>
                    ) : (
                      exams.map((e) => (
                        <tr key={e.id}>
                          <td>{e.title}</td>
                          <td>{e.subject?.name || '-'}</td>
                          <td>{e.date}</td>
                          <td>{e.totalMarks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card student-card">
              <div className="card-header"><h3><TrendingUp size={18} /> Marks</h3></div>
              <div className="table-container student-table">
                <table>
                  <thead><tr><th>Exam</th><th>Subject</th><th>Marks</th></tr></thead>
                  <tbody>
                    {marks.length === 0 ? (
                      <tr><td colSpan="3">No marks available.</td></tr>
                    ) : (
                      marks.map((m) => (
                        <tr key={m.id}>
                          <td>{m.exam?.title || '-'}</td>
                          <td>{m.exam?.subject?.name || '-'}</td>
                          <td>{m.marks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="card student-card">
            <div className="card-header"><h3><BookOpen size={18} /> Homework</h3></div>
            <div className="card-body student-feed">
              {homework.length === 0 && <div className="student-empty">No homework available.</div>}
              {homework.map((h) => (
                <article key={h.id} className="student-feed-item">
                  <div className="student-feed-head">
                    <h4>{h.title}</h4>
                    <span className={`badge ${h.submission ? 'badge-success' : 'badge-warning'}`}>
                      {h.submission ? 'Submitted' : 'Pending'}
                    </span>
                  </div>
                  <p className="student-feed-meta">{h.subject?.name || '-'} | Due: {h.dueDate}</p>
                  <p>{h.description}</p>
                  {!h.submission && (
                    <div className="student-submit-row">
                      <input
                        placeholder="Type your submission"
                        value={submissions[h.id] || ''}
                        onChange={(e) => setSubmissions((p) => ({ ...p, [h.id]: e.target.value }))}
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => submitHomework(h.id)}>Submit</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card student-card">
            <div className="card-header"><h3><Bell size={18} /> Notifications</h3></div>
            <div className="card-body student-feed">
              {announcements.length === 0 && <div className="student-empty">No notifications yet.</div>}
              {announcements.map((a) => (
                <article key={a.id} className="student-feed-item">
                  <h4>{a.title}</h4>
                  <p>{a.content}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="student-grid student-dual-grid">
            <div className="card student-card">
              <div className="card-header"><h3><MessageSquare size={18} /> Contacts</h3></div>
              <div className="card-body student-contact-list">
                {contacts.length === 0 && <div className="student-empty">No contacts found.</div>}
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    className={`student-contact ${String(c.id) === selectedContact ? 'active' : ''}`}
                    onClick={() => setSelectedContact(String(c.id))}
                  >
                    <span>{c.firstName} {c.lastName}</span>
                    <small>{c.role}{c.unreadCount ? ` | ${c.unreadCount} unread` : ''}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="card student-card">
              <div className="card-header"><h3><MessageSquare size={18} /> Conversation</h3></div>
              <div className="chat-container student-chat-container">
                <div className="chat-messages student-chat-messages">
                  {conversation.length === 0 && <div className="student-empty">No messages yet.</div>}
                  {conversation.map((m) => (
                    <div key={m.id} className={`chat-message ${m.senderId === user?.id ? 'sent' : 'received'}`}>
                      {m.content}
                    </div>
                  ))}
                </div>
                <form className="chat-input student-chat-input" onSubmit={sendMessage}>
                  <input
                    placeholder="Type message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={!selectedContact}
                  />
                  <button className="btn btn-primary btn-sm" type="submit" disabled={!selectedContact}>Send</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
