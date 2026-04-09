import React, { useState, useEffect } from 'react';
import {
  LogOut,
  User,
  Lock,
  BookOpen,
  ChevronRight,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Trophy,
  PlusCircle,
  Trash2,
  Search,
  Filter,
  FileText,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  LayoutDashboard,
  BarChart3,
  Users
} from 'lucide-react';

import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'student');
  const [view, setView] = useState(token ? (localStorage.getItem('user_role') === 'instructor' ? 'instructor-dash' : 'courses') : 'login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // For registration

  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [allowedSpecializations, setAllowedSpecializations] = useState([]);

  const [newCourse, setNewCourse] = useState({ title: '', description: '', specialization: '' });
  const [newLesson, setNewLesson] = useState({ title: '', content: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Hierarchical Catalog Filter States
  const [catalogDomains, setCatalogDomains] = useState([]);
  const [catalogSpecializations, setCatalogSpecializations] = useState([]);
  const [selDomainId, setSelDomainId] = useState('');
  const [selSpecId, setSelSpecId] = useState('');
  
  // Pagination States
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);

  // Chapter state
  const [chapters, setChapters] = useState([]);
  const [newChapter, setNewChapter] = useState({ title: '', description: '', pdfFile: null, order: 1 });
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editChapterData, setEditChapterData] = useState({ title: '', description: '', pdfFile: null, order: 1 });
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [chapterProgress, setChapterProgress] = useState([]);

  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [lessonProgress, setLessonProgress] = useState([]);
  
  // Admin states
  const [adminStats, setAdminStats] = useState({ total_users: 0, students: 0, instructors: 0, total_courses: 0, total_enrollments: 0 });
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminEnrollments, setAdminEnrollments] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminEnrollmentSearch, setAdminEnrollmentSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('');
  const [adminInactiveFilter, setAdminInactiveFilter] = useState(false);
  const [adminSubView, setAdminSubView] = useState('overview');

  // New states for instructor quiz builder
  const [addingQuizToChapter, setAddingQuizToChapter] = useState(null);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', passingScore: 70 });
  const [addingQuestionToQuiz, setAddingQuestionToQuiz] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ text: '', choices_attributes: [{text: '', is_correct: true}, {text: '', is_correct: false}] });
  const [message, setMessage] = useState(null);

  const [msgType, setMsgType] = useState('success');

  const showToast = (text, type = 'success') => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    setToken(null);
    setUserId(null);
    setUserRole('student');
    setView('login');
    showToast("Logged out successfully");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      if (res.ok) {
        showToast("Account created! Please login.");
        setView('login');
      } else {
        const data = await res.json();
        showToast(data.username ? data.username[0] : "Registration failed.", "error");
      }
    } catch (err) {
      showToast("Connection error.", "error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access);
        setUserId(data.user_id);
        setUserRole(data.role);
        localStorage.setItem('token', data.access);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('user_role', data.role);

        showToast(`Welcome back, ${username}! Role: ${data.role}`);

        if (data.role === 'instructor') {
          setView('instructor-dash');
          fetchInstructorCourses(data.access);
        } else {
          setView('courses');
          fetchCourses(data.access);
        }
      } else {
        showToast("Invalid credentials.", "error");
      }
    } catch (err) {
      showToast("Connection error.", "error");
    }
  };

  const fetchInstructorCourses = async (authToken) => {
    try {
      const res = await fetch('/api/courses/?my_courses=true', {
        headers: { 'Authorization': `Bearer ${authToken || token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInstructorCourses(data.results ? data.results : data);
      }
    } catch (err) {
      showToast("Error loading your courses.", "error");
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const payload = {
        title: newCourse.title,
        description: newCourse.description,
        specialization: newCourse.specialization
    };

    const url = selectedCourse ? `/api/courses/${selectedCourse.id}/` : '/api/courses/';
    const method = selectedCourse ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedData = await res.json();
        showToast(selectedCourse ? "Course updated!" : "Course saved! Curriculum Builder Unlocked.");
        setSelectedCourse(savedData);
        setNewCourse({
          title: savedData.title,
          description: savedData.description,
          specialization: savedData.specialization
        });
        fetchInstructorCourses();
        fetchChapters(savedData.id);
      } else {
        const errorData = await res.json();
        showToast(errorData.detail || "Error saving course.", "error");
      }
    } catch (err) {
      showToast("Error saving course.", "error");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to permanently delete this course?")) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast("Course deleted successfully.");
        fetchInstructorCourses();
      } else {
        showToast("Failed to delete course. You might not have permission.", "error");
      }
    } catch (err) {
      showToast("Connection error while deleting.", "error");
    }
  };

  const fetchCourseRoster = async (courseId) => {
    try {
      const res = await fetch(`/api/enroll/enrollments/course/${courseId}/roster/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourseStudents(data);
        setView('course-roster');
      }
    } catch (err) {
      showToast("Error loading roster.", "error");
    }
  };

  const fetchAdminStats = async () => {
    try {
      // Aggregate stats from multiple services
      const [authRes, courseRes, enrollRes] = await Promise.all([
        fetch('/api/auth/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/courses/admin/stats/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/enroll/admin/stats/', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const stats = {};
      if (authRes.ok) Object.assign(stats, await authRes.json());
      if (courseRes.ok) Object.assign(stats, await courseRes.json());
      if (enrollRes.ok) Object.assign(stats, await enrollRes.json());
      
      setAdminStats(stats);
    } catch (err) {
      console.error("Failed to load admin stats", err);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (adminSearch) params.append('search', adminSearch);
      if (adminRoleFilter) params.append('role', adminRoleFilter);
      if (adminInactiveFilter) params.append('inactive', 'true');
      
      const res = await fetch(`/api/auth/admin/users?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAdminUsers(await res.json());
      }
    } catch (err) {
      showToast("Error loading user list.", "error");
    }
  };

  const fetchAdminEnrollments = async () => {
    try {
      const res = await fetch('/api/enroll/admin/enrollments/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAdminEnrollments(await res.json());
      }
    } catch (err) {
      showToast("Error loading enrollment registry.", "error");
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/auth/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        showToast("User role updated.");
        fetchAdminUsers();
        fetchAdminStats();
      }
    } catch (err) {
      showToast("Failed to update role.", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user account?")) return;
    try {
      const res = await fetch(`/api/auth/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("User deleted.");
        fetchAdminUsers();
        fetchAdminStats();
      }
    } catch (err) {
      showToast("Failed to delete user.", "error");
    }
  };

  const fetchAllowedSpecializations = async () => {
    try {
      const res = await fetch('/api/courses/expertise/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllowedSpecializations(data);
        // If creating new and only one specialization, auto-select it
        if (!selectedCourse && data.length === 1) {
          setNewCourse(prev => ({ ...prev, specialization: data[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load specializations", err);
    }
  };

  const fetchCourses = async (authToken) => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selDomainId) params.append('domain_id', selDomainId);
      if (selSpecId) params.append('specialization_id', selSpecId);
      params.append('page', catalogPage);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/courses/${queryString}`, {
        headers: { 'Authorization': `Bearer ${authToken || token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results) {
           setCourses(data.results);
           setCatalogTotalPages(Math.ceil(data.count / 12));
        } else {
           setCourses(data);
           setCatalogTotalPages(1);
        }
      } else {
        showToast("Session expired.", "error");
        logout();
      }
    } catch (err) {
      showToast("Error loading courses.", "error");
    }
  };

  const fetchCatalogDomains = async () => {
    try {
      const res = await fetch('/api/courses/domains/');
      if (res.ok) {
        setCatalogDomains(await res.json());
      }
    } catch (err) {
      console.error("Error fetching domains");
    }
  };

  const fetchFilteredSpecs = async (domainId) => {
    try {
      const res = await fetch(`/api/courses/specializations/?domain_id=${domainId}`);
      if (res.ok) {
        setCatalogSpecializations(await res.json());
      }
    } catch (err) {
      console.error("Error fetching specializations");
    }
  };

  const fetchMyCourses = async () => {
    try {
      const res = await fetch('/api/enroll/enrollments/my_courses/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyCourses(data);
      }
    } catch (err) {
      showToast("Error loading my courses.", "error");
    }
  };

  const fetchCourseDetail = async (id, enrollmentId = null) => {
    try {
      const res = await fetch(`/api/courses/${id}/`);
      if (res.ok) {
        const data = await res.json();
        if (enrollmentId) data.enrollment_id = enrollmentId;
        setSelectedCourse(data);
        // Fetch chapters for this course
        fetchChapters(id);
        if (token) fetchQuizzes(token);
        // If enrolled, fetch chapter progress
        if (enrollmentId) fetchChapterProgress(enrollmentId);
        setView('course-detail');
      }
    } catch (err) {
      showToast("Error loading course details.", "error");
    }
  };

  const fetchChapters = async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/chapters/`);
      if (res.ok) {
        const data = await res.json();
        setChapters(data);
      }
    } catch (err) {
      showToast("Error loading chapters.", "error");
    }
  };

  const fetchChapterProgress = async (enrollmentId) => {
    try {
      const res = await fetch(`/api/enroll/enrollments/${enrollmentId}/progress/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChapterProgress(data.progress || []);
      }
    } catch (err) {
      console.error("Error fetching chapter progress");
    }
  };

  const handleMarkChapterViewed = async (enrollmentId, chapterId) => {
    try {
      const res = await fetch('/api/enroll/progress/mark_viewed/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enrollment_id: enrollmentId, chapter_id: chapterId })
      });
      if (res.ok) {
        const data = await res.json();
        fetchChapterProgress(enrollmentId);
        fetchMyCourses();
        if (data.completed) showToast("Chapter completed! ✓");
      }
    } catch (err) {
      showToast("Error updating progress.", "error");
    }
  };

  const handleCreateChapter = async (courseId) => {
    const formData = new FormData();
    formData.append('title', newChapter.title);
    if (newChapter.description) formData.append('description', newChapter.description);
    formData.append('order', newChapter.order);
    formData.append('course', courseId);
    if (newChapter.pdfFile) formData.append('pdf_file', newChapter.pdfFile);
    try {
      const res = await fetch(`/api/courses/${courseId}/chapters/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        showToast("Chapter added!");
        setNewChapter({ title: '', description: '', pdfFile: null, order: chapters.length + 2 });
        fetchChapters(courseId);
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to create chapter.", "error");
      }
    } catch (err) {
      showToast("Connection error.", "error");
    }
  };

  const handleDeleteChapter = async (courseId, chapterId) => {
    if (!window.confirm("Delete this chapter? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/courses/chapters/${chapterId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Chapter deleted.");
        fetchChapters(courseId);
      }
    } catch {
      showToast("Failed to delete chapter.", "error");
    }
  };

  const handleUpdateChapter = async (courseId, chapterId) => {
    const formData = new FormData();
    formData.append('title', editChapterData.title);
    if (editChapterData.description) formData.append('description', editChapterData.description);
    formData.append('order', editChapterData.order);
    formData.append('course', courseId);
    if (editChapterData.pdfFile) formData.append('pdf_file', editChapterData.pdfFile);
    try {
      const res = await fetch(`/api/courses/chapters/${chapterId}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        showToast("Chapter updated!");
        setEditingChapterId(null);
        fetchChapters(courseId);
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to update chapter.", "error");
      }
    } catch (err) {
      showToast("Connection error.", "error");
    }
  };

  const handleDeleteChapterPDF = async (courseId, chapterId) => {
    if (!window.confirm("Remove PDF from this chapter?")) return;
    try {
      const res = await fetch(`/api/courses/chapters/${chapterId}/pdf/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("PDF removed.");
        fetchChapters(courseId);
      }
    } catch {
      showToast("Failed to remove PDF.", "error");
    }
  };

  const fetchQuizzes = async (authToken) => {
    try {
      const res = await fetch('/api/quizzes/quizzes/', {
        headers: { 'Authorization': `Bearer ${authToken || token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (err) {
      showToast("Error loading quizzes.", "error");
    }
  };

  const selectQuiz = async (quizId) => {
    try {
      const res = await fetch(`/api/quizzes/quizzes/${quizId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveQuiz(data);
        
        let prefilledAnswers = {};
        try {
          // Use the new dedicated endpoint for fetching the current student's attempt
          const attemptRes = await fetch(`/api/quizzes/quizzes/${quizId}/my-attempt/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (attemptRes.ok) {
            const attempt = await attemptRes.json();
            // Map answers (store as string keys for state, but choice IDs are integers)
            attempt.answers.forEach(ans => {
               prefilledAnswers[ans.question.toString()] = ans.selected_choice;
            });
            // Update quiz result state immediately if an attempt exists
            if (attempt.completed_at) {
              setQuizResult({
                  score: attempt.percentage,
                  passed: attempt.percentage >= data.passing_score,
                  correct_answers: attempt.score,
                  total_questions: data.total_questions || attempt.total_questions
              });
            }
          } else {
            setQuizResult(null);
          }
        } catch(e) {
          setQuizResult(null);
        }

        setAnswers(prefilledAnswers);
        setView('quiz-taking');
      }
    } catch (err) {
      showToast("Error loading quiz details.", "error");
    }
  };

  const handleCreateQuiz = async (courseId, chapterId) => {
    try {
      const res = await fetch('/api/quizzes/quizzes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newQuiz.title,
          description: newQuiz.description,
          course_id: courseId,
          chapter_id: chapterId,
          duration_minutes: 30,
          passing_score: newQuiz.passingScore
        })
      });
      if (res.ok) {
        showToast("Quiz created successfully!");
        setNewQuiz({ title: '', description: '', passingScore: 70 });
        setAddingQuizToChapter(null);
        fetchQuizzes(token);
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to create quiz.", "error");
      }
    } catch {
      showToast("Error creating quiz.", "error");
    }
  };

  const handleAddQuestion = async (quizId) => {
    try {
      const res = await fetch('/api/quizzes/questions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quiz: quizId,
          text: newQuestion.text,
          question_type: 'MCQ',
          points: 1,
          order: 1,
          choices: newQuestion.choices_attributes.filter(c => c.text !== '')
        })
      });
      if (res.ok) {
        showToast("Question added successfully!");
        setNewQuestion({ text: '', choices_attributes: [{text: '', is_correct: true}, {text: '', is_correct: false}] });
        setAddingQuestionToQuiz(null);
        fetchQuizzes(token);
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to add question.", "error");
      }
    } catch {
      showToast("Error adding question.", "error");
    }
  };

  const submitQuiz = async () => {
    try {
      const res = await fetch(`/api/quizzes/quizzes/${activeQuiz.id}/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizResult(data);
        showToast(`Quiz completed! Score: ${data.score}%`);
        fetchMyCourses(); // Refresh global course percentage
        if (selectedCourse?.enrollment_id) {
          fetchChapterProgress(selectedCourse.enrollment_id); // Refresh local unit checkmarks
        }
      }
    } catch (err) {
      showToast("Error submitting quiz.", "error");
    }
  };

  const fetchLessonProgress = async (enrollmentId) => {
    try {
      const res = await fetch(`/api/enroll/enrollments/${enrollmentId}/progress/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLessonProgress(data.progress);
      }
    } catch (err) {
      showToast("Error loading lesson progress.", "error");
    }
  };

  const handleMarkLessonComplete = async (enrollmentId, lessonId) => {
    try {
      const res = await fetch('/api/enroll/progress/complete_lesson/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enrollment_id: enrollmentId, lesson_id: lessonId })
      });
      if (res.ok) {
        fetchLessonProgress(enrollmentId);
        fetchMyCourses();
        showToast("Lesson completed!");
      }
    } catch (err) {
      showToast("Error updating progress.", "error");
    }
  };


  const enrollCourse = async (courseId) => {
    try {
      const res = await fetch('/api/enroll/enrollments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: courseId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Enrolled successfully!");
        fetchMyCourses();
      } else {
        showToast(data.error || "Enrollment failed.", "error");
      }
    } catch (err) {
      showToast("Connection error.", "error");
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to unenroll from this course? Your progress will be lost.")) return;
    try {
      const res = await fetch(`/api/enroll/enrollments/${enrollmentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast("Unenrolled successfully!");
        fetchMyCourses();
        if (view === 'course-detail') {
          setView('my-courses');
        }
      } else {
        showToast("Unenrollment failed.", "error");
      }
    } catch (err) {
      showToast("Connection error.", "error");
    }
  };

  useEffect(() => {
    if (token) {
      if (view === 'courses') {
        fetchCatalogDomains();
        fetchCourses(token);
      } else if (view === 'my-courses') {
        fetchMyCourses();
      } else if (view === 'instructor-dash') {
        fetchInstructorCourses();
        fetchAllowedSpecializations();
      } else if (view === 'admin-dash') {
        fetchAdminStats();
        if (adminSubView === 'users') fetchAdminUsers();
        if (adminSubView === 'enrollments') fetchAdminEnrollments();
      } else if (view === 'course-editor') {
        fetchAllowedSpecializations();
      } else if (view === 'quizzes') {
        fetchQuizzes(token);
      }
    }
  }, [view, token, searchQuery, selDomainId, selSpecId, catalogPage]);

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo-container">
          <GraduationCap size={28} />
          <span>Academic Portal</span>
        </div>
        {token && (
          <div className="nav-user">
            {userRole === 'student' ? (
              <>
                <button onClick={() => setView('courses')} className={`btn btn-ghost ${view === 'courses' ? 'active' : ''}`}>Catalog</button>
                <button onClick={() => { setView('my-courses'); fetchMyCourses(); }} className={`btn btn-ghost ${view === 'my-courses' ? 'active' : ''}`}>My Learning</button>
              </>
            ) : (
              <>
                <button onClick={() => { setView('instructor-dash'); fetchInstructorCourses(); }} className={`btn btn-ghost ${view === 'instructor-dash' ? 'active' : ''}`}>Instructor Dash</button>
                <button onClick={() => {
                  setSelectedCourse(null);
                  setNewCourse({ title: '', description: '', specialization: '' });
                  setView('course-editor');
                }} className={`btn btn-ghost ${view === 'course-editor' ? 'active' : ''}`}>Create Course</button>
              </>
            )}

            {userRole === 'admin' && (
              <button onClick={() => { setView('admin-dash'); setAdminSubView('overview'); fetchAdminStats(); }} className={`btn btn-ghost ${view === 'admin-dash' ? 'active' : ''}`}>Admin Portal</button>
            )}
            <span className="user-badge" style={{ background: userRole === 'instructor' ? '#ede9fe' : '#f1f5f9', color: userRole === 'instructor' ? '#6d28d9' : '#64748b' }}>
              {userRole.charAt(0) + userRole.slice(1)}
            </span>
            <button onClick={logout} className="btn btn-ghost" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </nav>

      <main className="auth-wrapper">
        {view === 'login' && (
          <div className="lms-card auth-card">
            <div className="auth-header">
              <h2>Student Login</h2>
              <p className="text-muted">Access the academic portal</p>
            </div>
            <form onSubmit={handleLogin} className="auth-form">
              <div className="input-group">
                <User className="input-icon" size={18} />
                <input type="text" placeholder="Student ID or Username" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary">
                Secure Login <ChevronRight size={18} />
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span className="text-muted">Not registered? </span>
                <button type="button" onClick={() => setView('register')} className="btn btn-ghost" style={{ padding: '0 5px', color: 'var(--primary)' }}>Create an account</button>
              </div>
            </form>
          </div>
        )}

        {view === 'register' && (
          <div className="lms-card auth-card">
            <div className="auth-header">
              <h2>Join University</h2>
              <p className="text-muted">Create your academic account</p>
            </div>
            <form onSubmit={handleRegister} className="auth-form">
              <div className="input-group">
                <User className="input-icon" size={18} />
                <input type="text" placeholder="Full Name or Username" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="role-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label className={`role-chip ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>
                  Student
                </label>
                <label className={`role-chip ${role === 'instructor' ? 'active' : ''}`} onClick={() => setRole('instructor')}>
                  Instructor
                </label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ background: role === 'instructor' ? 'var(--primary)' : 'var(--secondary)' }}>
                Register Account <ChevronRight size={18} />
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span className="text-muted">Already registered? </span>
                <button type="button" onClick={() => setView('login')} className="btn btn-ghost" style={{ padding: '0 5px' }}>Return to login</button>
              </div>
            </form>
          </div>
        )}

        {view === 'instructor-dash' && (
          <div className="content-wrapper" style={{ width: '100%' }}>
            <div className="section-header">
              <h1>Instructor Dashboard</h1>
              <p className="text-muted">Manage your authored courses and monitor student involvement.</p>
            </div>
            <div className="course-grid">
              {instructorCourses.map(c => (
                <div key={c.id} className="lms-card course-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className="course-title">{c.title}</h3>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <span className="badge" style={{ fontSize: '0.6rem', background: '#e0f2fe', color: '#0369a1' }}>{c.domain}</span>
                      </div>
                    </div>
                    <p className="course-desc">{c.description}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>Category:</span> {c.category}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => fetchCourseRoster(c.id)} className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }}>
                      View Roster
                    </button>
                    <button onClick={() => {
                      setSelectedCourse(c);
                      setNewCourse({ title: c.title, description: c.description, specialization: c.specialization });
                      setView('course-editor');
                    }} className="btn btn-primary" style={{ flex: 1 }}>
                      Edit Course
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="btn btn-ghost"
                      style={{ padding: '0.5rem', color: 'var(--error)', border: '1px solid var(--error)' }}
                      title="Delete Course"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="lms-card course-card create-new" onClick={() => {
                setSelectedCourse(null);
                setNewCourse({ title: '', description: '', specialization: '' });
                setView('course-editor');
              }}>
                <PlusCircle size={48} className="text-muted" />
                <h3>Create New Course</h3>
              </div>
            </div>
          </div>
        )}

        {view === 'course-editor' && (
          <div className="content-wrapper" style={{ width: '100%', maxWidth: '700px' }}>
            <button onClick={() => setView('instructor-dash')} className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>← Back to Dashboard</button>
            <div className="lms-card">
              <h2 style={{ marginBottom: '1.5rem' }}>{selectedCourse ? 'Edit Course' : 'Create New Curricular Course'}</h2>
              <form onSubmit={handleSaveCourse} className="auth-form">
                <div className="input-group-label" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Academic Specialization & Domain</label>
                  <select
                    value={newCourse.specialization}
                    onChange={e => setNewCourse({ ...newCourse, specialization: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                    required
                    disabled={!!selectedCourse}
                  >
                    <option value="">-- Select your Expertise --</option>
                    {allowedSpecializations.map(spec => (
                      <option key={spec.id} value={spec.id}>
                        {spec.domain_name} &raquo; {spec.name}
                      </option>
                    ))}
                  </select>
                  {allowedSpecializations.length === 0 && (
                    <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.5rem' }}>You have no verified specializations. Please contact administration.</p>
                  )}
                </div>
                <div className="input-group-label" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems 101"
                    value={newCourse.title}
                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group-label" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Description</label>
                  <textarea
                    placeholder="Detailed course description..."
                    value={newCourse.description}
                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                    rows={4}
                    style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">{selectedCourse ? 'Update Course' : 'Save Course Identity'}</button>
              </form>
            </div>

            {!selectedCourse && (
              <div className="lms-card" style={{ marginTop: '1.5rem', textAlign: 'center', padding: '2rem', border: '1px dashed var(--border)', background: '#f8fafc' }}>
                <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Curriculum Builder Locked</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Save the basic course identity details above to unlock the ability to construct chapters and attach syllabus PDF materials.</p>
              </div>
            )}

            {/* Chapter Manager UI */}
            {selectedCourse && (
              <div className="lms-card" style={{ marginTop: '1.5rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Course Curriculum Builder</h2>

                {/* List Existing Chapters */}
                {chapters.length > 0 ? (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Existing Chapters</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {chapters.map(ch => (
                        <div key={ch.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                          {editingChapterId === ch.id ? (
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed var(--border)' }}>
                              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Edit Chapter</h4>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Order</label>
                                  <input type="number" value={editChapterData.order} onChange={e => setEditChapterData({ ...editChapterData, order: parseInt(e.target.value) || 1 })} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Title</label>
                                  <input type="text" value={editChapterData.title} onChange={e => setEditChapterData({ ...editChapterData, title: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} />
                                </div>
                              </div>
                              <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Description</label>
                                <textarea value={editChapterData.description} onChange={e => setEditChapterData({ ...editChapterData, description: e.target.value })} rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }} />
                              </div>
                              <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Replace PDF (Optional)</label>
                                {ch.pdf_file && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                    <span>Current: <a href={ch.pdf_file} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>View PDF</a></span>
                                    <button onClick={() => handleDeleteChapterPDF(selectedCourse.id, ch.id)} className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', color: 'var(--error)', fontSize: '0.75rem', border: '1px solid var(--error)' }}>Remove PDF</button>
                                  </div>
                                )}
                                <input type="file" accept="application/pdf" onChange={e => setEditChapterData({ ...editChapterData, pdfFile: e.target.files[0] })} style={{ fontSize: '0.8rem' }} />
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingChapterId(null)} className="btn btn-ghost" style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)' }}>Cancel</button>
                                <button onClick={() => handleUpdateChapter(selectedCourse.id, ch.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Save Changes</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                <div style={{ fontWeight: 600 }}>Chapter {ch.order}: {ch.title}</div>
                                {ch.pdf_file && <a href={ch.pdf_file} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View PDF</a>}
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => { setEditingChapterId(ch.id); setEditChapterData({ title: ch.title, description: ch.description || '', pdfFile: null, order: ch.order }); }} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--primary)' }} title="Edit Chapter">
                                  <Edit size={18} />
                                </button>
                                <button onClick={() => handleDeleteChapter(selectedCourse.id, ch.id)} className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--error)' }} title="Delete Chapter">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>

                            {/* Quiz Builder Sub-Section */}
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                              <h5 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Chapter Quizzes</h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {quizzes.filter(q => q.chapter_id === ch.id).map(quiz => (
                                  <div key={quiz.id}>
                                    <div style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem', background: '#f8fafc', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <strong>{quiz.title}</strong> - {quiz.total_questions || 0} questions (Pass: {quiz.passing_score}%)
                                      </div>
                                      <button onClick={() => setAddingQuestionToQuiz(addingQuestionToQuiz === quiz.id ? null : quiz.id)} className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                                        {addingQuestionToQuiz === quiz.id ? 'Close' : '+ Add Question'}
                                      </button>
                                    </div>
                                    
                                    {/* Question Builder Form */}
                                    {addingQuestionToQuiz === quiz.id && (
                                      <div style={{ padding: '1rem', border: '1px solid var(--border)', borderTop: 'none', background: '#fff', borderBottomLeftRadius: '0.25rem', borderBottomRightRadius: '0.25rem' }}>
                                        <input type="text" placeholder="Question Text (e.g., What is gravity?)" value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} style={{ width: '100%', marginBottom: '0.5rem', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid var(--border)' }} />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                          <input type="text" placeholder="Correct Answer text" value={newQuestion.choices_attributes[0].text} onChange={e => { const newC = [...newQuestion.choices_attributes]; newC[0].text = e.target.value; setNewQuestion({...newQuestion, choices_attributes: newC}) }} style={{ width: '50%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid var(--success)', background: '#f0fdf4' }} />
                                          <input type="text" placeholder="Wrong Answer text" value={newQuestion.choices_attributes[1].text} onChange={e => { const newC = [...newQuestion.choices_attributes]; newC[1].text = e.target.value; setNewQuestion({...newQuestion, choices_attributes: newC}) }} style={{ width: '50%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid var(--error)', background: '#fef2f2' }} />
                                        </div>
                                        <button onClick={() => handleAddQuestion(quiz.id)} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', width: '100%' }}>Save Question</button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {quizzes.filter(q => q.chapter_id === ch.id).length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No quizzes assigned yet.</span>}
                              </div>

                              {addingQuizToChapter === ch.id ? (
                                <div style={{ padding: '0.75rem', border: '1px dashed var(--border)', borderRadius: '0.25rem', background: '#fff' }}>
                                  <input type="text" placeholder="Quiz Title" value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} style={{ width: '100%', marginBottom: '0.5rem', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid var(--border)' }} />
                                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input type="number" placeholder="Passing Score (%)" value={newQuiz.passingScore} onChange={e => setNewQuiz({...newQuiz, passingScore: e.target.value})} style={{ width: '50%', padding: '0.4rem', fontSize: '0.8rem', border: '1px solid var(--border)' }} />
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleCreateQuiz(selectedCourse.id, ch.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Save Quiz</button>
                                    <button onClick={() => setAddingQuizToChapter(null)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid var(--border)' }}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setAddingQuizToChapter(ch.id)} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', border: '1px dashed var(--primary)', color: 'var(--primary)' }}>+ Create Draft Quiz</button>
                              )}
                            </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted" style={{ marginBottom: '2rem' }}>No chapters added to this course yet.</p>
                )}

                {/* Add New Chapter Form */}
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Add New Chapter</h3>
                  <div className="input-group-label" style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Chapter Order / Number</label>
                    <input type="number" value={newChapter.order} onChange={e => setNewChapter({ ...newChapter, order: parseInt(e.target.value) || 1 })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
                  </div>
                  <div className="input-group-label" style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Chapter Title</label>
                    <input type="text" placeholder="e.g. Introduction to Variables" value={newChapter.title} onChange={e => setNewChapter({ ...newChapter, title: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
                  </div>
                  <div className="input-group-label" style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Short Description (Optional)</label>
                    <textarea value={newChapter.description} onChange={e => setNewChapter({ ...newChapter, description: e.target.value })} rows={2} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
                  </div>
                  <div className="input-group-label" style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Chapter PDF (Required)</label>
                    <input type="file" accept="application/pdf" onChange={e => setNewChapter({ ...newChapter, pdfFile: e.target.files[0] })} style={{ fontSize: '0.85rem' }} />
                  </div>
                  <button onClick={() => handleCreateChapter(selectedCourse.id)} disabled={!newChapter.title} className="btn btn-secondary" style={{ width: '100%' }}>Add Chapter</button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'course-roster' && (
          <div className="content-wrapper" style={{ width: '100%', maxWidth: '800px' }}>
            <button onClick={() => setView('instructor-dash')} className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>← Back to Dashboard</button>
            <div className="lms-card">
              <div className="section-header" style={{ border: 'none', marginBottom: '2rem' }}>
                <h1>Student Roster</h1>
                <p className="text-muted">Currently enrolled students for this course section.</p>
              </div>
              <div className="table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Student ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Enrolled On</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseStudents.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>User #{s.student_id}</td>
                        <td style={{ padding: '1rem' }}>{new Date(s.enrolled_at).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${s.status === 'completed' ? 'badge-success' : ''}`} style={{ fontSize: '0.7rem' }}>
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === 'courses' && (
          <div className="content-wrapper" style={{ width: '100%' }}>
            <div className="section-header" style={{ marginBottom: '2rem' }}>
              <div>
                <h1>Course Catalog</h1>
                <p className="text-muted">Browse academic programs and enroll in curriculum sections.</p>
              </div>
            </div>

            <div className="filter-bar lms-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-input" style={{ flex: 2, minWidth: '250px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by keyword..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCatalogPage(1); }}
                  style={{ width: '100%', paddingLeft: '2.5rem', height: '42px' }}
                />
              </div>
              
              <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  value={selDomainId}
                  onChange={e => {
                    const dId = e.target.value;
                    setSelDomainId(dId);
                    setSelSpecId('');
                    setCatalogPage(1);
                    if (dId) fetchFilteredSpecs(dId);
                    else setCatalogSpecializations([]);
                  }}
                  style={{ flex: 1, height: '42px', padding: '0 0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', background: 'white' }}
                >
                  <option value="">All Domains</option>
                  {catalogDomains.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  value={selSpecId}
                  onChange={e => { setSelSpecId(e.target.value); setCatalogPage(1); }}
                  disabled={!selDomainId}
                  style={{ 
                    flex: 1, 
                    height: '42px', 
                    padding: '0 0.5rem', 
                    border: '1px solid var(--border)', 
                    borderRadius: '0.5rem', 
                    background: 'white',
                    opacity: selDomainId ? 1 : 0.5,
                    cursor: selDomainId ? 'pointer' : 'not-allowed'
                  }}
                >
                  <option value="">All Specializations</option>
                  {catalogSpecializations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => { 
                  setSearchQuery(''); 
                  setSelDomainId(''); 
                  setSelSpecId(''); 
                  setCatalogPage(1);
                  setCatalogSpecializations([]);
                }}
                className="btn btn-ghost"
                style={{ height: '42px', border: '1px solid var(--border)', padding: '0 1.5rem' }}
              >
                Reset
              </button>
            </div>

            <div className="course-grid">
              {courses.map((c) => (
                <div key={c.id} className="lms-card course-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className="course-title">{c.title}</h3>
                      <span className="badge" style={{ fontSize: '0.6rem', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>{c.domain}</span>
                    </div>
                    <p className="course-desc">{c.description}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600 }}>Category:</span> {c.category}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => fetchCourseDetail(c.id)} className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }}>
                      Syllabus
                    </button>
                    <button
                      onClick={() => enrollCourse(c.id)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      disabled={userRole === 'instructor'}
                    >
                      {userRole === 'instructor' ? 'Restricted' : 'Enroll'}
                    </button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="empty-state">
                  <p className="text-muted">No courses are currently available in the catalog.</p>
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {catalogTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  className="btn btn-ghost" 
                  disabled={catalogPage <= 1}
                  onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                  style={{ border: '1px solid var(--border)' }}
                >
                  Previous
                </button>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  Page <span style={{ fontWeight: 600, color: 'var(--text)' }}>{catalogPage}</span> of {catalogTotalPages}
                </span>
                <button 
                  className="btn btn-ghost" 
                  disabled={catalogPage >= catalogTotalPages}
                  onClick={() => setCatalogPage(p => Math.min(catalogTotalPages, p + 1))}
                  style={{ border: '1px solid var(--border)' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'course-detail' && selectedCourse && (
          <div className="content-wrapper" style={{ width: '100%', maxWidth: '960px' }}>
            <button onClick={() => setView(selectedCourse.enrollment_id ? 'my-courses' : 'courses')} className="btn btn-ghost" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border)' }}>← Back</button>

            {/* Course Header */}
            <div className="lms-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-header">
                <div className="detail-icon"><BookOpen size={36} color="var(--primary)" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{selectedCourse.title}</h1>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <span className="badge" style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '0.7rem' }}>{selectedCourse.domain}</span>
                        <span className="badge" style={{ background: '#fefce8', color: '#854d0e', border: '1px solid #fde68a', fontSize: '0.7rem' }}>{selectedCourse.category}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {selectedCourse.status === 'completed' && <span className="badge badge-success">🏆 Completed</span>}
                    </div>
                  </div>
                  <p className="text-muted" style={{ marginTop: '0.75rem', lineHeight: '1.6' }}>{selectedCourse.description}</p>
                </div>
              </div>

              {/* Progress bar (for enrolled students) */}
              {selectedCourse.enrollment_id && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Course Progress</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                      {chapterProgress.filter(p => p.completed).length} / {chapterProgress.length} chapters
                    </span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                      width: `${chapterProgress.length > 0 ? Math.round((chapterProgress.filter(p => p.completed).length / chapterProgress.length) * 100) : 0}%`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    {chapterProgress.length > 0 ? Math.round((chapterProgress.filter(p => p.completed).length / chapterProgress.length) * 100) : 0}% complete
                  </div>
                </div>
              )}
            </div>

            {/* Chapters / Curriculum */}
            <div>
              <h2 style={{ marginBottom: '1rem', fontWeight: 700 }}>📚 Course Curriculum</h2>
              {chapters.length === 0 ? (
                <div className="lms-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p className="text-muted">No chapters have been added to this course yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {chapters.map((ch, idx) => {
                    const prog = chapterProgress.find(p => p.chapter_id === ch.id);
                    const isCompleted = prog?.completed;
                    const isViewed = prog?.viewed;
                    return (
                      <div key={ch.id} className="lms-card" style={{ border: isCompleted ? '2px solid var(--secondary)' : '1px solid var(--border)' }}>
                        <div
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => setExpandedChapter(expandedChapter === ch.id ? null : ch.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              background: isCompleted ? 'var(--secondary)' : isViewed ? '#fef3c7' : 'var(--border)',
                              color: isCompleted ? 'white' : '#374151', fontWeight: 700, fontSize: '0.85rem'
                            }}>
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>Chapter {ch.order}: {ch.title}</div>
                              {ch.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{ch.description}</div>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {isCompleted && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Completed</span>}
                            {isViewed && !isCompleted && <span className="badge" style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#92400e' }}>In Progress</span>}
                            {!isViewed && <span className="badge" style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#64748b' }}>Not Started</span>}
                            {expandedChapter === ch.id ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                          </div>
                        </div>

                        {expandedChapter === ch.id && (
                          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
                            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>Access the material below. You must view the content to unlock progress and attempt assessments.</p>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              {ch.pdf_file ? (
                                <a
                                  href={ch.pdf_file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-primary"
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                                  onClick={() => selectedCourse.enrollment_id && handleMarkChapterViewed(selectedCourse.enrollment_id, ch.id)}
                                >
                                  <FileText size={16} /> Open PDF Materials
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No PDF uploaded for this chapter.</span>
                              )}
                              {quizzes?.filter(q => q.chapter_id === ch.id).map((quiz, i) => (
                                <button
                                  key={quiz.id}
                                  className={!isViewed ? "btn btn-ghost" : "btn btn-secondary"}
                                  style={{ 
                                    fontSize: '0.85rem', 
                                    opacity: !isViewed ? 0.6 : 1, 
                                    cursor: !isViewed ? 'not-allowed' : 'pointer',
                                    border: !isViewed ? '1px dashed var(--border)' : 'none',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.4rem' 
                                  }}
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (isViewed) selectQuiz(quiz.id); 
                                    else showToast("Open PDF to unlock quiz", "error");
                                  }}
                                  title={!isViewed ? "Open PDF to unlock quiz" : ""}
                                >
                                  {!isViewed ? <Lock size={14} /> : <BookOpen size={14} />} 
                                  Take Quiz: {quiz.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Enroll CTA if not enrolled */}
              {!selectedCourse.enrollment_id && (
                <div className="lms-card" style={{ marginTop: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #f8faff, #f0f5ff)' }}>
                  <GraduationCap size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ marginBottom: '0.5rem' }}>Ready to Start Learning?</h3>
                  <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Enroll to unlock all {chapters.length} chapters and track your progress.</p>
                  <button
                    onClick={() => enrollCourse(selectedCourse.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem' }}
                    disabled={userRole === 'instructor'}
                  >
                    {userRole === 'instructor' ? 'Instructors Cannot Enroll' : 'Enroll in This Course'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}




        {view === 'my-courses' && (
          <div className="content-wrapper" style={{ width: '100%' }}>
            <div className="section-header">
              <h1>My Learning Plan</h1>
              <p className="text-muted">Track your academic progress across your enrolled courses.</p>
            </div>

            <div className="course-grid">
              {myCourses.map((course) => (
                <div key={course.id} className="lms-card course-card">
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <CheckCircle2 size={24} style={{ color: 'var(--secondary)' }} />
                      <h3 className="course-title" style={{ margin: 0 }}>{course.title}</h3>
                    </div>
                    <div className="progress-container">
                      <div className="progress-label">
                        <span>Completion</span>
                        <span>{course.progress_percentage}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${course.progress_percentage}%`, background: 'var(--secondary)' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => fetchCourseDetail(course.id, course.enrollment_id)}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      Study Now
                    </button>
                    {course.status === 'completed' ? (
                      <div className="btn btn-ghost" style={{ flex: 0.5, background: 'var(--success-bg)', color: 'var(--success-text)', fontSize: '0.8rem' }}>
                        Certificate Available
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUnenroll(course.enrollment_id)}
                        className="btn btn-ghost"
                        style={{ border: '1px solid var(--error)', color: 'var(--error)', padding: '0.5rem', fontSize: '0.85rem' }}
                        title="Unenroll"
                      >
                        Unenroll
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {myCourses.length === 0 && (
                <div className="empty-state">
                  <BookOpen size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
                  <p className="text-muted" style={{ fontWeight: 500 }}>You are not currently enrolled in any courses.</p>
                  <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Please visit the Course Catalog to register.</p>
                  <button onClick={() => setView('courses')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                    Go to Course Catalog
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'quiz-taking' && activeQuiz && (
          <div className="content-wrapper" style={{ width: '100%', maxWidth: '800px' }}>
            <div className="lms-card">
              <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 700 }}>
                  <HelpCircle color="var(--primary)" /> {activeQuiz.title}
                </h2>
                <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Select the most correct answer for each prompt. Ensure all answers are selected before submitting.</p>
              </div>

              {activeQuiz.questions.map((q, qIndex) => (
                <div key={q.id} className="quiz-question">
                  <p>{qIndex + 1}. {q.text}</p>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {q.choices.map(c => (
                      <label
                        key={c.id}
                        className={`quiz-choice ${answers[q.id] === c.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === c.id}
                          onChange={() => setAnswers({ ...answers, [q.id]: c.id })}
                          disabled={!!quizResult}
                          style={{ width: 'auto', margin: 0, boxShadow: 'none', cursor: quizResult ? 'not-allowed' : 'pointer' }}
                        />
                        <span style={{ opacity: quizResult ? 0.7 : 1 }}>{c.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {!quizResult ? (
                <button
                  onClick={submitQuiz}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '1.05rem', padding: '1rem' }}
                  disabled={userRole === 'instructor'}
                >
                  {userRole === 'instructor' ? 'Submissions Restricted for Teachers' : 'Submit Assessment'}
                </button>
              ) : (
                <div className="lms-card" style={{ textAlign: 'center', marginTop: '2rem', border: '2px solid var(--border)', background: '#f8fafc' }}>
                  <Trophy size={48} color={quizResult.passed ? "var(--secondary)" : "var(--error)"} style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    {quizResult.passed ? '🎉 Assessment Passed!' : '❌ Assessment Failed'}
                  </h3>
                  <p style={{ fontSize: '2.5rem', fontWeight: 800, color: quizResult.passed ? 'var(--secondary)' : 'var(--error)', marginBottom: '0.5rem' }}>
                    {quizResult.score}%
                  </p>
                  <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                    You got {quizResult.correct_answers} of {quizResult.total_questions} questions correct.
                    {!quizResult.passed && ` (Passing score: ${activeQuiz.passing_score}%)`}
                  </p>
                  <button onClick={() => { 
                    if (selectedCourse && selectedCourse.enrollment_id) {
                      fetchCourseDetail(selectedCourse.id, selectedCourse.enrollment_id);
                    } else {
                      setView('my-courses');
                      fetchMyCourses();
                    }
                  }} className="btn btn-ghost" style={{ border: '1px solid var(--border)', margin: '0 auto' }}>
                    {quizResult.passed ? 'Continue to Next Unit' : 'Review Assessment (Locked)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {view === 'admin-dash' && (
          <div className="admin-container" style={{ display: 'flex', width: '100%', minHeight: 'calc(100vh - 120px)', gap: '2rem', padding: '1rem' }}>
            {/* Admin Sidebar */}
            <aside className="admin-sidebar" style={{ width: '240px', background: 'white', borderRight: '1px solid var(--border)', padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '20px' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LayoutDashboard size={22} /> Portal
                </h2>
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={() => { setAdminSubView('overview'); fetchAdminStats(); }} 
                  className={`btn btn-ghost ${adminSubView === 'overview' ? 'active' : ''}`}
                  style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '0.8rem 1rem' }}
                >
                  <BarChart3 size={20} /> Dashboard
                </button>
                <button 
                  onClick={() => { setAdminSubView('users'); fetchAdminUsers(); }} 
                  className={`btn btn-ghost ${adminSubView === 'users' ? 'active' : ''}`}
                  style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '0.8rem 1rem' }}
                >
                  <Users size={20} /> User Management
                </button>
                <button 
                  onClick={() => { setAdminSubView('enrollments'); fetchAdminEnrollments(); }} 
                  className={`btn btn-ghost ${adminSubView === 'enrollments' ? 'active' : ''}`}
                  style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '0.8rem 1rem' }}
                >
                  <Trophy size={20} /> Enrollment Registry
                </button>
              </nav>
            </aside>

            {/* Admin Main Content */}
            <main className="admin-main" style={{ flex: 1 }}>
              {adminSubView === 'overview' && (
                <div className="admin-overview">
                  <div className="section-header" style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Academic Oversight</h1>
                    <p className="text-muted">Real-time platform activity and member distribution.</p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="lms-card" style={{ padding: '2rem' }}>
                      <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>NETWORK MEMBERS</p>
                      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{adminStats.total_users || 0}</h2>
                      <div style={{ height: '4px', width: '40px', background: 'var(--primary)', marginTop: '1rem' }} />
                    </div>
                    <div className="lms-card" style={{ padding: '2rem' }}>
                      <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>ACTIVE STUDENTS</p>
                      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{adminStats.students || 0}</h2>
                      <div style={{ height: '4px', width: '40px', background: 'var(--secondary)', marginTop: '1rem' }} />
                    </div>
                    <div className="lms-card" style={{ padding: '2rem' }}>
                      <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>FACULTY STAFF</p>
                      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6' }}>{adminStats.instructors || 0}</h2>
                      <div style={{ height: '4px', width: '40px', background: '#8b5cf6', marginTop: '1rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="lms-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 className="text-muted" style={{ fontSize: '0.85rem' }}>Total Curricular Courses</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{adminStats.total_courses || 0}</div>
                      </div>
                      <BookOpen size={40} className="text-muted" style={{ opacity: 0.2 }} />
                    </div>
                    <div className="lms-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 className="text-muted" style={{ fontSize: '0.85rem' }}>Enrolled Unique Students</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{adminStats.total_enrollments || 0}</div>
                      </div>
                      <Trophy size={40} className="text-muted" style={{ opacity: 0.2 }} />
                    </div>
                  </div>

                  {/* Course Performance Breakdown */}
                  <div className="lms-card" style={{ padding: '2rem', marginTop: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Course Popularity Index</h3>
                      <span className="badge" style={{ fontSize: '0.75rem', background: '#f8fafc', color: 'var(--text-muted)' }}>
                        {adminStats.course_stats?.length || 0} Academic Sections
                      </span>
                    </div>
                    {adminStats.course_stats && adminStats.course_stats.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {adminStats.course_stats.map((c, idx) => {
                          const maxCount = adminStats.course_stats[0].count;
                          const width = (c.count / maxCount) * 100;
                          return (
                            <div key={c.course_id}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{c.title}</span>
                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.count} Unique Learners</span>
                              </div>
                              <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ 
                                  height: '100%', 
                                  width: `${width}%`, 
                                  background: idx === 0 ? 'linear-gradient(90deg, var(--primary), var(--secondary))' : 'var(--secondary)',
                                  borderRadius: '5px',
                                  transition: 'width 1s ease-out'
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border)', borderRadius: '0.75rem', background: '#f8fafc' }}>
                        <p className="text-muted">No student participation data available for current metrics.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {adminSubView === 'users' && (
                <div className="admin-users">
                  <div className="section-header" style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Member Directory</h1>
                    <p className="text-muted">Manage system access, roles, and identify inactive accounts.</p>
                  </div>

                  <div className="lms-card" style={{ padding: '0', border: '1px solid var(--border)' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', background: '#f8fafc', flexWrap: 'wrap' }}>
                      <div className="search-bar" style={{ flex: 1, minWidth: '200px', background: 'white' }}>
                        <Search className="search-icon" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search unique username or email..." 
                          value={adminSearch} 
                          onChange={e => { setAdminSearch(e.target.value); fetchAdminUsers(); }} 
                        />
                      </div>
                      <select 
                        className="btn btn-ghost" 
                        style={{ border: '1px solid var(--border)', background: 'white', padding: '0 1rem' }}
                        value={adminRoleFilter}
                        onChange={e => { setAdminRoleFilter(e.target.value); fetchAdminUsers(); }}
                      >
                        <option value="">Filter: All Roles</option>
                        <option value="student">Role: Student</option>
                        <option value="instructor">Role: Instructor</option>
                        <option value="admin">Role: Admin</option>
                      </select>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '0 0.5rem' }}>
                        <input 
                          type="checkbox" 
                          checked={adminInactiveFilter} 
                          onChange={e => { setAdminInactiveFilter(e.target.checked); fetchAdminUsers(); }} 
                          style={{ width: '18px', height: '18px' }}
                        />
                        Flag Inactive Members
                      </label>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9' }}>MEMBER DETAILS</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9' }}>ACCESS LEVEL</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9' }}>LAST ACTIVITY</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9' }}>MANAGEMENT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No members found matching your criteria.</td></tr>
                          ) : adminUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700 }}>{user.username}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email || 'Email not verified'}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <select 
                                  value={user.role} 
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  className="btn btn-ghost"
                                  style={{ border: '1px solid var(--border)', fontSize: '0.85rem', height: '32px', background: 'white' }}
                                  disabled={userId == user.id}
                                >
                                  <option value="student">Student</option>
                                  <option value="instructor">Instructor</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                                {user.last_login ? (
                                  <span style={{ color: (new Date() - new Date(user.last_login)) > 15552000000 ? 'var(--error)' : 'inherit' }}>
                                    {new Date(user.last_login).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--error)', fontWeight: 600 }}>Never Logged In</span>
                                )}
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <button 
                                  onClick={() => handleDeleteUser(user.id)} 
                                  className="btn btn-ghost" 
                                  style={{ color: 'var(--error)', padding: '0.5rem', borderRadius: '0.5rem' }}
                                  title="Permanently Delete Account"
                                  disabled={userId == user.id}
                                >
                                  <Trash2 size={20} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {adminSubView === 'enrollments' && (
                <div className="admin-enrollments">
                  <div className="section-header" style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Enrollment Registry</h1>
                    <p className="text-muted">Global tracking of student participation and course completion rates.</p>
                  </div>

                  <div className="lms-card" style={{ padding: '0', border: '1px solid var(--border)' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', background: '#f8fafc' }}>
                      <div className="search-bar" style={{ flex: 1, background: 'white' }}>
                        <Search className="search-icon" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search student or course..." 
                          value={adminEnrollmentSearch} 
                          onChange={e => setAdminEnrollmentSearch(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9' }}>STUDENT</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9' }}>COURSE</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9' }}>PROGRESS</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9' }}>STATUS</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9' }}>ENROLLED ON</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminEnrollments
                            .filter(enroll => {
                              const s = adminEnrollmentSearch.toLowerCase();
                              return enroll.student_name.toLowerCase().includes(s) || 
                                     (enroll.student_email && enroll.student_email.toLowerCase().includes(s)) ||
                                     enroll.course_title.toLowerCase().includes(s);
                            })
                            .length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No enrollments found matching your search.</td></tr>
                          ) : adminEnrollments
                            .filter(enroll => {
                              const s = adminEnrollmentSearch.toLowerCase();
                              return enroll.student_name.toLowerCase().includes(s) || 
                                     (enroll.student_email && enroll.student_email.toLowerCase().includes(s)) ||
                                     enroll.course_title.toLowerCase().includes(s);
                            })
                            .map(enroll => (
                            <tr key={enroll.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ fontWeight: 700 }}>{enroll.student_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{enroll.student_email || 'No email provided'}</div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ fontWeight: 600 }}>{enroll.course_title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {enroll.course_id}</div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <div style={{ width: '120px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                                    <span>Progress</span>
                                    <span>{enroll.progress_percentage}%</span>
                                  </div>
                                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${enroll.progress_percentage}%`, background: enroll.progress_percentage === 100 ? 'var(--secondary)' : 'var(--primary)' }} />
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                <span style={{ 
                                  padding: '0.25rem 0.6rem', 
                                  borderRadius: '1rem', 
                                  fontSize: '0.7rem', 
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  background: enroll.status === 'completed' ? '#f0fdf4' : '#eff6ff',
                                  color: enroll.status === 'completed' ? '#166534' : '#1e40af',
                                  border: enroll.status === 'completed' ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
                                }}>
                                  {enroll.status}
                                </span>
                              </td>
                              <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                                {new Date(enroll.enrolled_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </main>

      {message && (
        <div className={`toast ${msgType === 'error' ? 'toast-error' : 'toast-success'}`}>
          {msgType === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {message}
        </div>
      )}
    </div>
  );
}
export default App;