import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const getToday = () => new Date().toISOString().split('T')[0];

const TeacherDashboard = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance');
  const [grade, setGrade] = useState(profile?.grade || 'Grade 1');
  const [date, setDate] = useState(getToday());
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [markRows, setMarkRows] = useState({});
  const [homework, setHomework] = useState([]);
  const [homeworkForm, setHomeworkForm] = useState({ title: '', description: '', subjectId: '', dueDate: getToday() });
  const [contacts, setContacts] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [messageTarget, setMessageTarget] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  const gradeOptions = useMemo(() => Array.from({ length: 8 }, (_, i) => `Grade ${i + 1}`), []);

  useEffect(() => {
    fetchCore();
  }, [grade]);

  useEffect(() => {
    if (selectedExam) fetchExamMarks(selectedExam);
  }, [selectedExam]);

  const fetchCore = async () => {
    try {
      const [studentsRes, subjectsRes, examsRes, hwRes, contactsRes, announcementsRes] = await Promise.all([
        api.get('/students', { params: { grade } }),
        api.get('/subjects', { params: { grade } }),
        api.get('/exams', { params: { grade } }),
        api.get('/homework', { params: { grade } }),
        api.get('/messages/contacts'),
        api.get('/announcements', { params: { grade } })
      ]);
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
      setExams(examsRes.data);
      setHomework(hwRes.data);
      setContacts(contactsRes.data);
      setAnnouncements(announcementsRes.data);
      if (!selectedExam && examsRes.data.length > 0) setSelectedExam(examsRes.data[0].id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExamMarks = async (examId) => {
    try {
      const res = await api.get(`/marks/exam/${examId}`);
      const next = {};
      res.data.forEach((m) => {
        next[m.studentId] = { marks: m.marks, feedback: m.feedback || '' };
      });
      setMarkRows(next);
    } catch (error) {
      console.error(error);
    }
  };

  const saveAttendance = async () => {
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        status: attendance[s.id] || 'present'
      }));
      await api.post('/attendance/bulk', { date, grade, records });
      alert('Attendance saved');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save attendance');
    }
  };

  const saveMarks = async () => {
    if (!selectedExam) return;
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        marks: Number(markRows[s.id]?.marks || 0),
        feedback: markRows[s.id]?.feedback || ''
      }));
      await api.post('/marks/bulk', { examId: Number(selectedExam), records });
      alert('Marks saved');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save marks');
    }
  };

  const createHomework = async (e) => {
    e.preventDefault();
    try {
      await api.post('/homework', {
        ...homeworkForm,
        subjectId: Number(homeworkForm.subjectId),
        grade
      });
      setHomeworkForm({ title: '', description: '', subjectId: '', dueDate: getToday() });
      fetchCore();
      alert('Homework created');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create homework');
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

  return (
    <Layout title="Teacher Dashboard">
      <div className="tabs">
        <button className={`tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
        <button className={`tab ${activeTab === 'marks' ? 'active' : ''}`} onClick={() => setActiveTab('marks')}>Marks</button>
        <button className={`tab ${activeTab === 'homework' ? 'active' : ''}`} onClick={() => setActiveTab('homework')}>Homework</button>
        <button className={`tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>Messages</button>
        <button className={`tab ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>Notifications</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label>Grade</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} style={{ maxWidth: 160 }}>
            {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {activeTab === 'attendance' && (
        <div className="card">
          <div className="card-header">
            <h3>Daily Attendance</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <button className="btn btn-primary" onClick={saveAttendance}>Save</button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Student</th><th>Status</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.user?.firstName} {s.user?.lastName}</td>
                    <td>
                      <select
                        value={attendance[s.id] || 'present'}
                        onChange={(e) => setAttendance((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="card">
          <div className="card-header">
            <h3>Exam Marks</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                <option value="">Select exam</option>
                {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <button className="btn btn-primary" onClick={saveMarks} disabled={!selectedExam}>Save</button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Student</th><th>Marks</th><th>Feedback</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.user?.firstName} {s.user?.lastName}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={markRows[s.id]?.marks ?? ''}
                        onChange={(e) => setMarkRows((prev) => ({ ...prev, [s.id]: { ...(prev[s.id] || {}), marks: e.target.value } }))}
                      />
                    </td>
                    <td>
                      <input
                        value={markRows[s.id]?.feedback || ''}
                        onChange={(e) => setMarkRows((prev) => ({ ...prev, [s.id]: { ...(prev[s.id] || {}), feedback: e.target.value } }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3>Create Homework</h3></div>
            <form className="card-body" onSubmit={createHomework}>
              <div className="form-group"><label>Title</label><input value={homeworkForm.title} onChange={(e) => setHomeworkForm((p) => ({ ...p, title: e.target.value }))} required /></div>
              <div className="form-group"><label>Description</label><textarea value={homeworkForm.description} onChange={(e) => setHomeworkForm((p) => ({ ...p, description: e.target.value }))} required /></div>
              <div className="form-group">
                <label>Subject</label>
                <select value={homeworkForm.subjectId} onChange={(e) => setHomeworkForm((p) => ({ ...p, subjectId: e.target.value }))} required>
                  <option value="">Select subject</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Due Date</label><input type="date" value={homeworkForm.dueDate} onChange={(e) => setHomeworkForm((p) => ({ ...p, dueDate: e.target.value }))} required /></div>
              <button className="btn btn-primary" type="submit">Create</button>
            </form>
          </div>
          <div className="card">
            <div className="card-header"><h3>Assigned Homework</h3></div>
            <div className="card-body">
              {homework.map((h) => (
                <div key={h.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 600 }}>{h.title}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{h.subject?.name} | Due: {h.dueDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="card">
          <div className="card-header"><h3>Send Message</h3></div>
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

      {activeTab === 'announcements' && (
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
    </Layout>
  );
};

export default TeacherDashboard;
