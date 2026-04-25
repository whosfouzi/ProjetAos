import React, { useState, useEffect, useRef } from 'react';
import {
  LogOut,
  User,
  Bell,
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
  ChevronDown as ChevronDownIcon,
  ChevronUp,
  Edit,
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

import './App.css';
import LoginView from './views/LoginView.jsx';
import CoursesView from './views/CoursesView.jsx';
import CourseDetailView from './views/CourseDetailView.jsx';
import MyCoursesView from './views/MyCoursesView.jsx';
import ProfileView from './views/ProfileView.jsx';
import QuizView from './views/QuizView.jsx';
import InstructorDashView from './views/InstructorDashView.jsx';
import CourseEditorView from './views/CourseEditorView.jsx';
import CourseRosterView from './views/CourseRosterView.jsx';
import AdminDashView from './views/AdminDashView.jsx';
import AdminUserListView from './views/AdminUserListView.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'student');
  const [view, setView] = useState(token ? 
    (localStorage.getItem('view') || 
     (localStorage.getItem('user_role') === 'instructor' || localStorage.getItem('user_role') === 'teacher' ? 'instructor-dash' : 
      localStorage.getItem('user_role') === 'admin' ? 'admin-dash' : 'courses'))
    : 'login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // For registration

  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(() => {
    const saved = localStorage.getItem('selectedCourse');
    return saved ? JSON.parse(saved) : null;
  });
  const [instructorStats, setInstructorStats] = useState({ total_enrollments: 0, course_stats: [] });
  const [instructorEnrollments, setInstructorEnrollments] = useState([]);
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
  const [activeQuiz, setActiveQuiz] = useState(() => {
    const saved = localStorage.getItem('activeQuiz');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeAttempt, setActiveAttempt] = useState(() => {
    const saved = localStorage.getItem('activeAttempt');
    return saved ? JSON.parse(saved) : null;
  });
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [lessonProgress, setLessonProgress] = useState([]);
  
  // Admin states
  const [adminStats, setAdminStats] = useState({ total_users: 0, students: 0, instructors: 0, total_courses: 0, total_enrollments: 0 });
  const [studentStats, setStudentStats] = useState({ total_students: 0, active_students: 0, inactive_students: 0, never_logged_in: 0, enrolled_students: 0 });
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminEnrollments, setAdminEnrollments] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminEnrollmentSearch, setAdminEnrollmentSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('');
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);
  const [adminInactiveFilter, setAdminInactiveFilter] = useState(false);
  const [adminSubView, setAdminSubView] = useState('overview');

  // New states for instructor quiz builder
  const [addingQuizToChapter, setAddingQuizToChapter] = useState(null);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', passingScore: 70 });
  const [addingQuestionToQuiz, setAddingQuestionToQuiz] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ text: '', choices_attributes: [{text: '', is_correct: true}, {text: '', is_correct: false}] });
  const [userProfile, setUserProfile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [bioInput, setBioInput] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [message, setMessage] = useState(null);

  const [msgType, setMsgType] = useState('success');

  const showToast = (text, type = 'success') => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Persist important state
  useEffect(() => {
    if (view) localStorage.setItem('view', view);
  }, [view]);

  useEffect(() => {
    if (selectedCourse) localStorage.setItem('selectedCourse', JSON.stringify(selectedCourse));
    else localStorage.removeItem('selectedCourse');
  }, [selectedCourse]);

  useEffect(() => {
    if (activeQuiz) localStorage.setItem('activeQuiz', JSON.stringify(activeQuiz));
    else localStorage.removeItem('activeQuiz');
  }, [activeQuiz]);

  useEffect(() => {
    if (activeAttempt) localStorage.setItem('activeAttempt', JSON.stringify(activeAttempt));
    else localStorage.removeItem('activeAttempt');
  }, [activeAttempt]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    if (token && !userProfile) {
        // Slight delay to ensure state synchronization during login flow
        const timer = setTimeout(() => {
            fetchUserProfile(token);
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [token, userProfile]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    setToken(null);
    setUserId(null);
    setUserRole('student');
    setUserProfile(null);
    setProfilePicFile(null);
    setUsername('');
    setPassword('');
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
    } catch {
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

        if (data.role === 'instructor' || data.role === 'teacher') {
          setView('instructor-dash');
          fetchInstructorCourses(data.access);
        } else if (data.role === 'admin') {
          setView('admin-dash');
          fetchAdminStats();
        } else {
          setView('courses');
          fetchCourses(data.access);
        }
        fetchUserProfile(data.access);
      } else {
        showToast("Invalid credentials.", "error");
      }
    } catch {
      showToast("Connection error.", "error");
    }
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch('/api/auth/profile/me/', {
        headers: { 'Authorization': `Bearer ${authToken || token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
        setBioInput(data.bio || '');
      }
    } catch {
      console.error("Failed to fetch profile");
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append('bio', bioInput);
    if (profilePicFile) {
        formData.append('profile_picture', profilePicFile);
    }

    try {
        const res = await fetch('/api/auth/profile/me/', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        if (res.ok) {
            const data = await res.json();
            setUserProfile(data);
            showToast("Profile updated successfully!");
            setProfilePicFile(null);
        } else {
            const errorData = await res.json();
            // Handle nested error objects (like { profile_picture: ["Upload a valid image..."] })
            const errorMsg = typeof errorData === 'object' 
                ? Object.values(errorData).flat().join(', ') 
                : (errorData.detail || "Failed to update profile.");
            showToast(errorMsg, "error");
        }
    } catch {
        showToast("Error connecting to server.", "error");
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
    } catch {
      showToast("Error loading your courses.", "error");
    }
  };

  const fetchInstructorDashboardStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/enroll/admin/stats/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInstructorStats(data);
      }
    } catch (err) {
      console.error("Error fetching instructor stats:", err);
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
        fetchInstructorDashboardStats();
        fetchChapters(savedData.id);
      } else {
        const errorData = await res.json();
        showToast(errorData.detail || "Error saving course.", "error");
      }
    } catch {
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
        fetchInstructorDashboardStats();
      } else {
        showToast("Failed to delete course. You might not have permission.", "error");
      }
    } catch {
      showToast("Connection error while deleting.", "error");
    }
  };

  const fetchCourseRoster = async (courseId) => {
    try {
      const res = await fetch('/api/enroll/admin/enrollments/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInstructorEnrollments(data);
        if (courseId) {
          const course = instructorCourses.find(c => c.id === courseId);
          setSelectedCourse(course);
        } else {
          setSelectedCourse(null);
        }
        setView('course-roster');
      }
    } catch {
      showToast("Error loading roster.", "error");
    }
  };

  const fetchAdminStats = async () => {
    try {
      // Aggregate stats from multiple services
      const [authRes, courseRes, enrollRes, studentRes] = await Promise.all([
        fetch('/api/auth/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/courses/admin/stats/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/enroll/admin/stats/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/auth/admin/student-stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const stats = {};
      if (authRes.ok) Object.assign(stats, await authRes.json());
      if (courseRes.ok) Object.assign(stats, await courseRes.json());
      if (enrollRes.ok) Object.assign(stats, await enrollRes.json());
      
      setAdminStats(stats);

      // Student-specific stats
      if (studentRes.ok) {
        const sData = await studentRes.json();
        setStudentStats(prev => ({
          ...prev,
          ...sData,
          // enrolled_students comes from enrollment service (unique_students field)
          enrolled_students: stats.unique_students || 0,
        }));
      }
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
    } catch {
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
    } catch {
      showToast("Error loading enrollment registry.", "error");
    }
  };

  const fetchInstructorEnrollments = async () => {
    try {
      const res = await fetch('/api/enroll/admin/enrollments/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInstructorEnrollments(await res.json());
      }
    } catch {
      showToast("Error loading course rosters.", "error");
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
    } catch {
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
    } catch {
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
    } catch {
      showToast("Error loading courses.", "error");
    }
  };

  const fetchCatalogDomains = async () => {
    try {
      const res = await fetch('/api/courses/domains/');
      if (res.ok) {
        setCatalogDomains(await res.json());
      }
    } catch {
      console.error("Error fetching domains");
    }
  };

  const fetchFilteredSpecs = async (domainId) => {
    try {
      const res = await fetch(`/api/courses/specializations/?domain_id=${domainId}`);
      if (res.ok) {
        setCatalogSpecializations(await res.json());
      }
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
            setActiveAttempt(attempt);
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
                  total_questions: data.questions_per_attempt || attempt.total_questions
              });
            } else {
              setQuizResult(null);
            }
          } else {
            setActiveAttempt(null);
            setQuizResult(null);
          }
        } catch(e) {
          setQuizResult(null);
        }

        setAnswers(prefilledAnswers);
        setView('quiz-taking');
      }
    } catch {
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
        
        // Instant sync with backend
        fetchMyCourses(); 
        if (selectedCourse?.enrollment_id) {
          fetchLessonProgress(selectedCourse.enrollment_id);
        }
      }
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
        fetchInstructorDashboardStats();
        fetchAllowedSpecializations();
      } else if (view === 'admin-dash') {
        fetchAdminStats();
        fetchAdminUsers(); // Always fetch for the "Recent Entities" widget
        if (adminSubView === 'enrollments') fetchAdminEnrollments();
      } else if (view === 'course-editor') {
        fetchAllowedSpecializations();
      } else if (view === 'quizzes') {
        fetchQuizzes(token);
      }
    }
  }, [view, token, searchQuery, selDomainId, selSpecId, catalogPage]);

  if (view === 'login' || view === 'register') {
    return (
      <LoginView
        view={view} setView={setView}
        username={username} setUsername={setUsername}
        password={password} setPassword={setPassword}
        role={role} setRole={setRole}
        handleLogin={handleLogin} handleRegister={handleRegister}
      />
    );
  }

// ── Global Shell Component ──────────────────────────────────────────────
const GlobalShell = ({ 
  children, userRole, view, setView, searchQuery, setSearchQuery, 
  setCatalogPage, theme, toggleTheme, dropdownRef, dropdownOpen, 
  setDropdownOpen, username, userProfile, profilePicFile, logout, 
  message, msgType 
}) => {
  const avatarSrc = (profilePicFile instanceof Blob) 
    ? URL.createObjectURL(profilePicFile) 
    : (userProfile?.profile_picture || null);
  
  return (
    <div className={`min-h-screen transition-colors duration-500 bg-[var(--bg-app)] text-[var(--on-surface)] font-body selection:bg-primary selection:text-on-primary`}>
      {/* Universal Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] h-24 flex items-center justify-between px-12 bg-[var(--bg-app)]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-16">
          <div 
            className="text-2xl font-black tracking-tighter text-primary uppercase cursor-pointer" 
            onClick={() => setView(userRole === 'admin' ? 'admin-dash' : (userRole === 'instructor' || userRole === 'teacher') ? 'instructor-dash' : 'courses')}
          >
            Aura {userRole === 'admin' ? 'Nexus' : 'Scholar'}
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {userRole === 'admin' ? (
              <>
                <button onClick={() => setView('admin-dash')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${view === 'admin-dash' ? 'text-primary' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>Intelligence Hub</button>
                <button onClick={() => setView('admin-users')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${view === 'admin-users' ? 'text-primary' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>Registry</button>
                <button onClick={() => setView('courses')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${view === 'courses' ? 'text-primary' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>Catalog</button>
              </>
            ) : (userRole === 'instructor' || userRole === 'teacher') ? (
              <>
                <button onClick={() => setView('instructor-dash')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${view === 'instructor-dash' ? 'text-primary' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>Studio Dashboard</button>
                <button onClick={() => setView('courses')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${view === 'courses' ? 'text-primary' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>Public Library</button>
              </>
            ) : (
              <>
                <button onClick={() => setView('my-courses')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${view === 'my-courses' ? 'text-primary' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>My Pathways</button>
                <button onClick={() => setView('courses')} className={`text-[10px] font-black uppercase tracking-widest transition-all ${view === 'courses' ? 'text-primary' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>Browser</button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
            <input 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCatalogPage(1); // Reset pagination on new search
                if (view !== 'courses' && view !== 'my-courses') {
                  setView('courses'); // Auto-navigate to catalog when searching
                }
              }}
              className="bg-[var(--surface-high)]/10 border border-white/5 rounded-full py-2.5 pl-10 pr-6 text-xs text-[var(--on-surface)] placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all w-64" 
              placeholder="Query system repository..." 
            />
          </div>

          <div className="flex items-center gap-6 pl-6 border-l border-white/10">
            {/* Celestial Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="text-[var(--on-surface-variant)] hover:text-primary transition-all p-2 rounded-xl hover:bg-white/5 relative group"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[200] pointer-events-none">
                 Cycle to {theme === 'dark' ? 'Lumina' : 'Umbra'}
              </span>
            </button>

            <button className="text-[var(--on-surface-variant)] hover:text-primary transition-all relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]"></span>
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1 rounded-2xl hover:bg-white/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center overflow-hidden">
                  {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" alt="" /> : <User size={20} className="text-primary" />}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface)] leading-none mb-1">{username}</p>
                  <p className="text-[8px] font-bold uppercase tracking-tighter text-[var(--on-surface-variant)] leading-none">{userRole}</p>
                </div>
                <ChevronDownIcon size={14} className={`text-[var(--on-surface-variant)] transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-[var(--surface)]/95 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[110]">
                  <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] mb-4">Identity Profile</p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                           {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" alt="" /> : <User size={24} className="text-primary" />}
                        </div>
                        <div>
                           <p className="font-bold text-[var(--on-surface)] text-sm">{username}</p>
                           <p className="text-[10px] text-slate-500 uppercase tracking-widest">{(userRole === 'instructor' || userRole === 'teacher') ? 'Instructor' : userRole}</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-2">
                     <button onClick={() => { setView('profile'); setDropdownOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-white/5 transition-all">
                        <User size={16} className="text-primary" /> Profile Settings
                     </button>
                     <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all">
                        <LogOut size={16} /> Terminate Session
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="pt-24 min-h-screen bg-[var(--bg-app)]">
        {children}
      </main>

      {message && (
        <div className={`toast ${msgType === 'error' ? 'toast-error' : 'toast-success'}`}>
          {msgType === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {message}
        </div>
      )}
    </div>
  );
};


  // Wrapper for all authenticated views
  const renderAuthenticatedView = () => {
    if (view === 'course-detail' && selectedCourse) {
      return (
        <CourseDetailView
          selectedCourse={selectedCourse}
          chapters={chapters}
          chapterProgress={chapterProgress}
          quizzes={quizzes}
          expandedChapter={expandedChapter}
          setExpandedChapter={setExpandedChapter}
          enrollCourse={enrollCourse}
          handleMarkChapterViewed={handleMarkChapterViewed}
          selectQuiz={selectQuiz}
          userRole={userRole}
          setView={setView}
          showToast={showToast}
          fetchMyCourses={fetchMyCourses}
          studyMode={studyMode}
          setStudyMode={setStudyMode}
          fetchCourseRoster={fetchCourseRoster}
        />
      );
    }

    if (view === 'my-courses') {
      return (
        <MyCoursesView
          myCourses={myCourses}
          fetchCourseDetail={fetchCourseDetail}
          handleUnenroll={handleUnenroll}
          userRole={userRole}
          setView={setView}
          fetchMyCourses={fetchMyCourses}
          fetchInstructorCourses={fetchInstructorCourses}
          setSelectedCourse={setSelectedCourse}
          setNewCourse={setNewCourse}
        />
      );
    }

    if (view === 'quiz-taking' && activeQuiz) {
      return (
        <QuizView
          activeQuiz={activeQuiz}
          activeAttempt={activeAttempt}
          answers={answers}
          setAnswers={setAnswers}
          quizResult={quizResult}
          submitQuiz={submitQuiz}
          userRole={userRole}
          selectedCourse={selectedCourse}
          setView={setView}
          fetchMyCourses={fetchMyCourses}
          setStudyMode={setStudyMode}
        />
      );
    }

    if (view === 'instructor-dash') {
      if (userRole !== 'instructor' && userRole !== 'teacher') { setView('courses'); return null; }
      return (
        <InstructorDashView
          instructorCourses={instructorCourses}
          fetchCourseRoster={fetchCourseRoster}
          setSelectedCourse={setSelectedCourse}
          setNewCourse={setNewCourse}
          setView={setView}
          handleDeleteCourse={handleDeleteCourse}
          fetchInstructorCourses={fetchInstructorCourses}
          instructorStats={instructorStats}
          userProfile={userProfile}
          username={username}
          logout={logout}
          dropdownRef={dropdownRef}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
        />
      );
    }

    if (view === 'course-editor') {
      if (userRole !== 'instructor' && userRole !== 'teacher') { setView('courses'); return null; }
      return (
        <CourseEditorView
          selectedCourse={selectedCourse}
          newCourse={newCourse}
          setNewCourse={setNewCourse}
          handleSaveCourse={handleSaveCourse}
          chapters={chapters}
          newChapter={newChapter}
          setNewChapter={setNewChapter}
          handleCreateChapter={handleCreateChapter}
          handleDeleteChapter={handleDeleteChapter}
          handleUpdateChapter={handleUpdateChapter}
          editingChapterId={editingChapterId}
          setEditingChapterId={setEditingChapterId}
          editChapterData={editChapterData}
          setEditChapterData={setEditChapterData}
          quizzes={quizzes}
          addingQuizToChapter={addingQuizToChapter}
          setAddingQuizToChapter={setAddingQuizToChapter}
          newQuiz={newQuiz}
          setNewQuiz={setNewQuiz}
          handleCreateQuiz={handleCreateQuiz}
          addingQuestionToQuiz={addingQuestionToQuiz}
          setAddingQuestionToQuiz={setAddingQuestionToQuiz}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          handleAddQuestion={handleAddQuestion}
          allowedSpecializations={allowedSpecializations}
          setView={setView}
          showToast={showToast}
          handleDeleteChapterPDF={handleDeleteChapterPDF}
          fetchCourseRoster={fetchCourseRoster}
          fetchInstructorCourses={fetchInstructorCourses}
        />
      );
    }

    if (view === 'course-roster') {
      if (userRole !== 'instructor' && userRole !== 'teacher') { setView('courses'); return null; }
      return (
        <CourseRosterView
          enrollments={instructorEnrollments}
          selectedCourse={selectedCourse}
          setView={setView}
        />
      );
    }

    if (view === 'admin-dash') {
      return (
        <AdminDashView
          adminStats={adminStats}
          studentStats={studentStats}
          adminUsers={adminUsers}
          fetchAdminUsers={fetchAdminUsers}
          fetchAdminStats={fetchAdminStats}
          handleUpdateUserRole={handleUpdateUserRole}
          handleDeleteUser={handleDeleteUser}
          userProfile={userProfile}
          username={username}
          logout={logout}
          setView={setView}
          dropdownRef={dropdownRef}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
        />
      );
    }

    if (view === 'admin-users') {
      return (
        <AdminUserListView
          adminUsers={adminUsers}
          adminStats={adminStats}
          handleUpdateUserRole={handleUpdateUserRole}
          handleDeleteUser={handleDeleteUser}
          adminSearch={adminSearch}
          setAdminSearch={setAdminSearch}
          adminRoleFilter={adminRoleFilter}
          setAdminRoleFilter={setAdminRoleFilter}
          setView={setView}
        />
      );
    }

    if (view === 'profile') {
      return (
        <ProfileView
          userProfile={userProfile}
          userRole={userRole}
          username={username}
          profilePicFile={profilePicFile}
          setProfilePicFile={setProfilePicFile}
          bioInput={bioInput}
          setBioInput={setBioInput}
          handleUpdateProfile={handleUpdateProfile}
          showToast={showToast}
          setView={setView}
        />
      );
    }

    return (
      <CoursesView
        courses={courses}
        fetchCourseDetail={fetchCourseDetail}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        domainFilter={domainFilter}
        setDomainFilter={setDomainFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        userRole={userRole}
        catalogDomains={catalogDomains}
        catalogSpecializations={catalogSpecializations}
        selDomainId={selDomainId}
        setSelDomainId={setSelDomainId}
        selSpecId={selSpecId}
        setSelSpecId={setSelSpecId}
        catalogPage={catalogPage}
        setCatalogPage={setCatalogPage}
        catalogTotalPages={catalogTotalPages}
        setCatalogTotalPages={setCatalogTotalPages}
        setView={setView}
        userProfile={userProfile}
        fetchFilteredSpecs={fetchFilteredSpecs}
        setCatalogSpecializations={setCatalogSpecializations}
      />
    );
  };

  return (
    <GlobalShell
      userRole={userRole}
      view={view}
      setView={setView}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      setCatalogPage={setCatalogPage}
      theme={theme}
      toggleTheme={toggleTheme}
      dropdownRef={dropdownRef}
      dropdownOpen={dropdownOpen}
      setDropdownOpen={setDropdownOpen}
      username={username}
      userProfile={userProfile}
      profilePicFile={profilePicFile}
      logout={logout}
      message={message}
      msgType={msgType}
    >
      {renderAuthenticatedView()}
    </GlobalShell>
  );
}

export default App;