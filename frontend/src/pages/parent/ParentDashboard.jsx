import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ParentDashboard = () => {
  const { profile } = useAuth();
  const studentId = profile?.studentId || profile?.student?.id;

  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [homework, setHomework] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [messageTarget, setMessageTarget] = useState('');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (!studentId) return;
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [studentRes, attendanceRes, marksRes, homeworkRes, announcementsRes, contactsRes] = await Promise.all([
        api.get(`/students/${studentId}`),
        api.get(`/attendance/student/${studentId}`),
        api.get(`/marks/student/${studentId}`),
        api.get(`/homework/student/${studentId}`),
        api.get('/announcements'),
        api.get('/messages/contacts')
      ]);
      setStudent(studentRes.data);
      setAttendance(attendanceRes.data);
      setMarks(marksRes.data);
      setHomework(homeworkRes.data);
      setAnnouncements(announcementsRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageTarget || !messageText.trim()) return;
    try {
      await api.post('/messages', { receiverId: Number(messageTarget), content: messageText.trim() });
      setMessageText('');
      alert('Message sent');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  const attendancePct = attendance.length
    ? ((attendance.filter((a) => a.status !== 'absent').length / attendance.length) * 100).toFixed(1)
    : '0.0';
  const avgMarks = marks.length
    ? (marks.reduce((sum, m) => sum + Number(m.marks || 0), 0) / marks.length).toFixed(1)
    : '0.0';

  return (
    <Layout title="Parent Dashboard">
      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
        <button className={`tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>Performance</button>
        <button className={`tab ${activeTab === 'homework' ? 'active' : ''}`} onClick={() => setActiveTab('homework')}>Homework</button>
        <button className={`tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
        <button className={`tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>Messages</button>
      </div>

      {!studentId && (
        <div className="alert alert-error">Parent account is not linked to a student yet. Ask admin to assign a student.</div>
      )}

      {activeTab === 'overview' && (
        <div className="dashboard-grid">
          <div className="stat-card"><div className="stat-content"><h3>{student?.user?.firstName} {student?.user?.lastName}</h3><p>Child</p></div></div>
          <div className="stat-card"><div className="stat-content"><h3>{attendancePct}%</h3><p>Attendance</p></div></div>
          <div className="stat-card"><div className="stat-content"><h3>{avgMarks}</h3><p>Average Marks</p></div></div>
          <div className="stat-card"><div className="stat-content"><h3>{homework.filter((h) => !h.submission).length}</h3><p>Pending Homework</p></div></div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card">
          <div className="card-header"><h3>Attendance Records</h3></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a.id}>
                    <td>{a.date}</td>
                    <td><span className={`badge ${a.status === 'absent' ? 'badge-error' : 'badge-success'}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="card">
          <div className="card-header"><h3>Exam Results</h3></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Exam</th><th>Subject</th><th>Marks</th></tr></thead>
              <tbody>
                {marks.map((m) => (
                  <tr key={m.id}>
                    <td>{m.exam?.title}</td>
                    <td>{m.exam?.subject?.name}</td>
                    <td>{m.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="card">
          <div className="card-header"><h3>Homework Tracking</h3></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Title</th><th>Subject</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {homework.map((h) => (
                  <tr key={h.id}>
                    <td>{h.title}</td>
                    <td>{h.subject?.name}</td>
                    <td>{h.dueDate}</td>
                    <td><span className={`badge ${h.submission ? 'badge-success' : 'badge-warning'}`}>{h.submission ? 'Submitted' : 'Pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card-header"><h3>Announcements</h3></div>
          <div className="card-body">
            {announcements.map((a) => (
              <div key={a.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>{a.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="card">
          <div className="card-header"><h3>Message Teachers / Staff</h3></div>
          <form className="card-body" onSubmit={sendMessage}>
            <div className="form-group">
              <label>Recipient</label>
              <select value={messageTarget} onChange={(e) => setMessageTarget(e.target.value)} required>
                <option value="">Select contact</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.role})</option>)}
              </select>
            </div>
            <div className="form-group"><label>Message</label><textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} required /></div>
            <button className="btn btn-primary" type="submit">Send</button>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default ParentDashboard;
