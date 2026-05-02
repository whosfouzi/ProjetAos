import React from 'react';
import {
  LayoutGrid,
  Users,
  BookOpen,
  Video,
  ClipboardList,
  Sliders,
  Bell,
  LogOut,
  Search,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  CheckCircle2
} from 'lucide-react';

/**
 * InstructorDashView — Restyled, Premium Studio Dashboard UI
 */
export default function InstructorDashView({
  instructorCourses = [], fetchCourseRoster = () => {}, setSelectedCourse = () => {}, setNewCourse = () => {}, setView = () => {},
  handleDeleteCourse = () => {}, userProfile = null, username = '', logout = () => {}, instructorStats = {}
}) {

  const avatarSrc = userProfile?.profile_picture || null;
  const safeStats = instructorStats || {};

  return (
    <div className="bg-[#0b0f19] text-slate-200 font-sans min-h-screen flex flex-col antialiased transition-colors duration-500">
      <style>{`
        .premium-card {
          background: rgba(17, 24, 39, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-card:hover {
          background: rgba(17, 24, 39, 0.8);
          border-color: rgba(192, 132, 252, 0.2);
          transform: translateY(-4px);
        }
        .text-glow {
          text-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
        }
      `}</style>

      {/* Modern Background Blur */}
      <div className="fixed top-[-5%] right-[-5%] w-[45%] h-[45%] bg-purple-500/5 rounded-full blur-[140px] -z-10" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="h-[calc(100vh-5rem)] w-64 sticky top-20 flex flex-col bg-[#0d1220] border-r border-white/5 z-40 hidden md:flex py-8">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
              {avatarSrc ? (
                <img className="h-9 w-9 rounded-full object-cover border border-purple-500/30" src={avatarSrc} alt={username} />
              ) : (
                <div className="h-9 w-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Users size={16} />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-100 truncate">{username || "Educator"}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Lead Instructor</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-3">
            <a onClick={() => setView('instructor-dash')} className="bg-purple-500/10 text-purple-300 font-semibold px-4 py-3 flex items-center gap-3.5 rounded-xl transition-all cursor-pointer border border-purple-500/10 hover:bg-purple-500/15">
              <LayoutGrid size={18} />
              <span className="text-xs uppercase tracking-wider">Home</span>
            </a>
            <a onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }} className="text-slate-400 px-4 py-3 flex items-center gap-3.5 rounded-xl font-medium hover:bg-white/5 hover:text-slate-100 transition-all cursor-pointer">
              <BookOpen size={18} />
              <span className="text-xs uppercase tracking-wider">Curriculum</span>
            </a>
          </nav>

          <div className="px-4 mt-auto space-y-3">
            <button
              onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-purple-500/10 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              + Create Course
            </button>
            <div className="pt-2 border-t border-white/5">
              <a onClick={logout} className="text-slate-400 px-4 py-3 flex items-center gap-3.5 font-medium rounded-xl text-xs uppercase tracking-wider hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer">
                <LogOut size={16} /> Logout
              </a>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Panel */}
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-10">

            {/* Welcome Segment */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1.5 select-none">Studio Workspace</p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-50 font-headline tracking-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 text-glow">{username}</span>
                </h1>
                <p className="text-slate-400 mt-2.5 text-base font-normal max-w-xl">
                  Oversee, update, and deploy curriculum modules across the platform.
                </p>
              </div>
              <button 
                onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }}
                className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl border border-purple-500/20 transition-all"
              >
                <Plus size={16} /> Add Module
              </button>
            </section>

            {/* Performance/Bento Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Card 1: Courses count */}
              <div className="premium-card p-6 rounded-2xl flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Courses</span>
                  <BookOpen size={20} className="text-purple-400 opacity-60" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-extrabold text-slate-50">{instructorCourses.length}</h3>
                  <span className="text-xs text-slate-400">Modules</span>
                </div>
              </div>

              {/* Card 2: Students count */}
              <div className="premium-card p-6 rounded-2xl flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Enrolled Scholars</span>
                  <Users size={20} className="text-blue-400 opacity-60" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-extrabold text-slate-50">{safeStats.total_enrollments || 0}</h3>
                  <span className="text-xs text-slate-400">Scholars</span>
                </div>
              </div>

              {/* Card 3: System Status */}
              <div className="premium-card p-6 rounded-2xl flex flex-col justify-between h-40 sm:col-span-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Academic Systems</span>
                  <TrendingUp size={20} className="text-emerald-400 opacity-60" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Cloud Cluster Status</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">Operational</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[100%]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Modules Header */}
            <div className="pt-4 flex justify-between items-center border-b border-white/5 pb-4 select-none">
              <h2 className="text-2xl font-bold font-headline tracking-tight text-slate-50">Modules Under Management</h2>
              <span className="text-xs font-semibold text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-wider">{instructorCourses.length} Active</span>
            </div>

            {/* Responsive Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorCourses.map(course => {
                const courseStat = safeStats.course_stats?.find(s => s.course_id === course.id);
                const studentCount = courseStat ? courseStat.count : 0;

                return (
                  <div key={course.id} className="premium-card p-6 rounded-2xl flex flex-col h-[28rem] select-none">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300">
                        <BookOpen size={20} />
                      </div>
                      <span className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-bold uppercase rounded-lg tracking-wider border border-white/5">
                        {course.domain || 'Core'}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xl font-bold font-headline group-hover:text-purple-400 transition-colors line-clamp-2 text-slate-100 leading-tight">
                          {course.title}
                        </h4>
                        <p className="text-slate-400 mt-2 text-xs line-clamp-3 leading-relaxed font-light">
                          {course.description || "No description provided."}
                        </p>
                      </div>

                      {/* Course Details */}
                      <div className="space-y-4 pt-4">
                        <div className="flex justify-between items-end border-t border-white/5 pt-3">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Total Students</span>
                          <span className="text-lg font-bold font-headline text-slate-100">{studentCount}</span>
                        </div>
                        
                        {/* Tiny Visual Bars chart */}
                        <div className="h-6 flex items-end gap-1 px-0.5">
                          {[0.3, 0.5, 0.4, 0.8, 0.6, 1.0, 0.7].map((val, idx) => {
                            const seed = (course.id * (idx + 1)) % 10 / 10;
                            const hPct = 30 + (seed * 70);
                            return (
                              <div key={idx} className="flex-1 bg-purple-500/20 hover:bg-purple-500/40 rounded-sm transition-all h-full" style={{ height: `${hPct}%` }}></div>
                            );
                          })}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => fetchCourseRoster(course.id)}
                            className="flex-1 px-3 py-2.5 border border-white/5 hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all text-slate-300 bg-white/5">
                            Roster
                          </button>
                          <button onClick={() => {
                            window.location.hash = `#/edit-course/${course.id}`;
                            setSelectedCourse(course);
                            setNewCourse({ title: course.title, description: course.description, specialization: course.specialization });
                            setView('course-editor');
                          }}
                            className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-purple-500/10 hover:brightness-110 transition-all select-none">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteCourse(course.id)}
                            className="p-2.5 border border-red-500/10 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 rounded-xl transition-all" title="Delete Course">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Module directly */}
              {instructorCourses.length === 0 && (
                <div onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }}
                  className="premium-card h-[28rem] rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none group border-dashed hover:border-purple-500/40 border-slate-700/60 transition-all">
                  <div className="p-4 bg-purple-500/10 group-hover:bg-purple-500/20 border border-purple-500/20 group-hover:border-purple-500/30 rounded-full transition-all mb-4 text-purple-300 group-hover:scale-110">
                    <Plus size={32} />
                  </div>
                  <p className="text-slate-400 group-hover:text-purple-300 font-bold uppercase tracking-widest text-xs transition-colors">Start creating modules</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
