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
 * InstructorDashView — Stitch "Aura Slate" Instructor Dashboard
 */
export default function InstructorDashView({
  instructorCourses, fetchCourseRoster, setSelectedCourse, setNewCourse, setView,
  handleDeleteCourse, userProfile, username, logout, instructorStats
}) {

  const avatarSrc = userProfile?.profile_picture || null;

  return (
    <div className="bg-[var(--bg-app)] text-[var(--on-surface)] font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col transition-colors duration-500">
      <style>{`
        .glass-panel {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
        }
        .glowing-border {
          box-shadow: 0 0 15px rgba(192, 193, 255, 0.1);
        }
      `}</style>

      {/* Ambient Background Effects */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px] -z-10" />

      <div className="flex flex-1">
        {/* SideNavBar — NO LOCAL NAVBAR ANYMORE */}
        <aside className="h-[calc(100vh-5rem)] w-72 sticky top-20 flex flex-col bg-[var(--bg-app)] shadow-[1px_0_0_0_rgba(255,255,255,0.05)] z-40 hidden md:flex py-8">
          <div className="px-6 mb-10">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-high)]/10 border border-white/5">
              {avatarSrc ? (
                <img className="h-10 w-10 rounded-full object-cover" src={avatarSrc} alt={username} />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Users size={20} />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-[var(--on-surface)] truncate max-w-[120px]">{username}</p>
                <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Lead Educator</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            <a onClick={() => setView('instructor-dash')} className="bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-4 border-primary px-6 py-4 flex items-center gap-4 font-body text-sm uppercase tracking-widest transition-all cursor-pointer">
              <LayoutGrid size={18} /> Home
            </a>
            <a onClick={() => fetchCourseRoster(null)} className="text-[var(--on-surface-variant)] px-6 py-4 opacity-70 flex items-center gap-4 font-body text-sm uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all cursor-pointer">
              <Users size={18} /> Students
            </a>
            <a onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }} className="text-[var(--on-surface-variant)] px-6 py-4 opacity-70 flex items-center gap-4 font-body text-sm uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all cursor-pointer">
              <BookOpen size={18} /> Curriculum
            </a>
          </nav>
          <div className="px-6 mt-auto space-y-2">
            <button
              onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-3 rounded-full text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              New Course
            </button>
            <div className="pt-6 space-y-1">
              <a className="text-[var(--on-surface-variant)] px-6 py-3 opacity-70 flex items-center gap-4 font-body text-xs uppercase tracking-widest hover:text-primary transition-all cursor-pointer">
                <span className="material-symbols-outlined text-sm">help</span> Help Center
              </a>
              <a onClick={logout} className="text-[var(--on-surface-variant)] px-6 py-3 opacity-70 flex items-center gap-4 font-body text-xs uppercase tracking-widest hover:text-error transition-all cursor-pointer">
                <LogOut size={14} /> Logout
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-12">

            {/* Welcome Header */}
            <section className="mb-12">
              <p className="text-primary font-headline text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Instructor Portal</p>
              <h2 className="text-6xl font-black font-headline text-[var(--on-surface)] tracking-tight leading-tight">
                Welcome back, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary" style={{ filter: 'drop-shadow(0 0 12px rgba(192, 193, 255, 0.3))' }}>
                  Scholar {username.split(' ')[0]}.
                </span>
              </h2>
              <p className="text-[var(--on-surface-variant)] mt-4 text-lg font-light max-w-xl leading-relaxed">
                Your curriculum is thriving. You are currently managing {instructorCourses.length} active course{instructorCourses.length !== 1 ? 's' : ''}.
              </p>
            </section>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <div className="md:col-span-2 glass-panel p-8 rounded-3xl border-l-4 border-primary shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-primary/10 transition-transform group-hover:scale-110">
                  <TrendingUp size={120} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">Active Courses</p>
                <h3 className="text-5xl font-black font-headline text-[var(--on-surface)]">
                  {instructorCourses.length}
                </h3>
                <div className="mt-6 flex items-center gap-2 text-secondary text-sm font-bold">
                  <BookOpen size={16} />
                  <span>Modules under management</span>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-3xl shadow-xl hover:bg-white/5 transition-all flex flex-col justify-between">

                <div className="mt-4 flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg-app)] bg-[var(--surface-high)]/10 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" className="w-full h-full object-cover opacity-80" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-app)] bg-[var(--surface-high)]/10 flex items-center justify-center text-[10px] font-bold">
                    +{Math.max(0, (instructorStats.total_enrollments || 0) - 3)}
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-3xl shadow-xl hover:bg-white/5 transition-all">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--on-surface-variant)] mb-2">System Status</p>
                <h3 className="text-4xl font-black font-headline text-[var(--on-surface)]">Live</h3>
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase text-[var(--on-surface-variant)] font-bold tracking-widest">Server health</span>
                    <span className="text-[10px] uppercase text-emerald-400 font-bold">Optimal</span>
                  </div>
                  <div className="w-full bg-[var(--surface-high)]/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-primary h-full w-[100%] shadow-[0_0_8px_rgba(110,231,183,0.4)]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Title */}
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-secondary font-bold text-xs uppercase tracking-[0.3em]">Curriculum Modules</span>
                <h4 className="text-4xl font-bold font-headline mt-1 tracking-tight text-[var(--on-surface)]">Active Courses</h4>
              </div>
              <button onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }}
                className="flex items-center gap-2 text-primary hover:opacity-80 transition-all text-sm font-bold uppercase tracking-widest bg-primary/10 px-6 py-3 rounded-full border border-primary/20">
                <Plus size={16} /> Create New
              </button>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructorCourses.map(course => {
                const courseStat = instructorStats.course_stats?.find(s => s.course_id === course.id);
                const studentCount = courseStat ? courseStat.count : 0;

                return (
                  <div key={course.id} className="group relative bg-[var(--surface-high)]/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:-translate-y-2 border border-white/5 backdrop-blur-sm">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary to-secondary"></div>
                    <div className="p-8 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-[var(--surface-high)]/10 rounded-2xl text-primary" style={{ filter: 'drop-shadow(0 0 8px rgba(192,193,255,0.2))' }}>
                          <BookOpen size={24} />
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full tracking-widest border border-primary/20">
                          {course.domain || 'Domain'}
                        </span>
                      </div>

                      <h5 className="text-2xl font-bold font-headline mb-4 group-hover:text-primary transition-colors min-h-[4rem] line-clamp-2 text-[var(--on-surface)]">
                        {course.title}
                      </h5>

                      <div className="space-y-6 mt-auto">
                        <div>
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-bold">Total Scholars</span>
                            <span className="text-xl font-bold font-headline text-[var(--on-surface)]">{studentCount}</span>
                          </div>
                          <div className="h-12 w-full flex items-end gap-1.5 px-1">
                            {[0.4, 0.6, 0.5, 0.9, 0.7, 1.0, 0.8].map((val, i) => {
                              const seed = (course.id * (i + 1)) % 10 / 10;
                              const height = 30 + (seed * 70);
                              return (
                                <div key={i} className="flex-1 bg-primary/20 rounded-t-md transition-all duration-500 group-hover:bg-primary/40"
                                  style={{ height: `${height}%`, boxShadow: height > 80 ? '0 0 10px rgba(192, 193, 255, 0.3)' : 'none' }}></div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button onClick={() => fetchCourseRoster(course.id)}
                            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-[var(--on-surface-variant)]">
                            Roster
                          </button>
                          <button onClick={() => {
                            setSelectedCourse(course);
                            setNewCourse({ title: course.title, description: course.description, specialization: course.specialization });
                            setView('course-editor');
                          }}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 transition-all hover:brightness-110 active:scale-95">
                            Curriculum
                          </button>
                          <button onClick={() => handleDeleteCourse(course.id)}
                            className="p-3 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/10 transition-all" title="Delete Course">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty State / Create New Card */}
              {instructorCourses.length === 0 && (
                <div onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }}
                  className="md:col-span-3 h-64 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group">
                  <Plus size={48} className="text-[var(--on-surface-variant)] group-hover:text-primary transition-colors mb-4" />
                  <p className="text-[var(--on-surface-variant)] group-hover:text-primary font-bold uppercase tracking-widest text-sm">Create your first course</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
