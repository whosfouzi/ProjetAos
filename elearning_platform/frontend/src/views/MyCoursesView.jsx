import React from 'react';
import { 
  Bell, 
  Sliders, 
  LogOut, 
  BookOpen, 
  LayoutGrid, 
  Users, 
  Video, 
  ClipboardList, 
  HelpCircle,
  GraduationCap,
  ChevronRight,
  ArrowRight,
  Award,
  Book,
  Play
} from 'lucide-react';

/**
 * MyCoursesView — Stitch "Aura Slate" My Learning Pathways
 */
export default function MyCoursesView({
  myCourses, fetchCourseDetail, handleUnenroll,
  userRole, setView,
  logout, userProfile, username, dropdownRef, dropdownOpen, setDropdownOpen,
  fetchMyCourses, fetchInstructorCourses, setSelectedCourse, setNewCourse,
  fetchCourseRoster
}) {
  // Overall progress across all courses
  const totalCourses = myCourses.length;
  // Calculate average percentage across all enrolled courses
  const totalPctSum = myCourses.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0);
  const overallPct = totalCourses > 0 ? Math.round(totalPctSum / totalCourses) : 0;
  
  // Count how many courses are 100% done
  const completedCoursesCount = myCourses.filter(c => (c.progress_percentage || 0) === 100).length;

  // Pick the most-progressed active course as the "featured" one
  const featured = [...myCourses].sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0))[0];
  const rest = myCourses.filter(c => c.id !== featured?.id);

  const avatarSrc = userProfile?.profile_picture || null;

  return (
    <div className="bg-[var(--bg-app)] text-[var(--on-surface)] font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col transition-colors duration-500">
      <style>{`
        .glass-panel {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
        }
        .bg-glow-orb {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          z-index: -1;
          opacity: 0.1;
        }
        @font-face {
          font-family: 'Material Symbols Outlined';
          font-style: normal;
          font-weight: 100 700;
          src: url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v161/kJExBmTp5zTuihLQBYAcny-2hNTWce_vM22U83r39m50.woff2) format('woff2');
        }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      {/* Ambient Background Effects */}
      <div className="bg-glow-orb bg-primary top-[-200px] left-[-100px]"></div>
      <div className="bg-glow-orb bg-secondary bottom-[-200px] right-[-100px]"></div>

    <div className="w-full">
      <div className="p-12 max-w-[1600px] mx-auto space-y-16">
            {/* Hero header */}
            <header className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-1 bg-primary rounded-full"></div>
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Scholar Odyssey</span>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                <div className="max-w-2xl">
                  <h1 className="font-headline text-6xl md:text-8xl font-black text-[var(--on-surface)] tracking-tighter leading-[0.9] mb-6">
                    Learning <span className="text-primary italic">Pathways.</span>
                  </h1>
                  <p className="font-body text-lg text-[var(--on-surface-variant)] max-w-lg leading-relaxed">
                    {totalCourses > 0
                      ? `You are currently mastering ${totalCourses} course${totalCourses !== 1 ? 's' : ''}. Your global progress is tracking at ${overallPct}% completion.`
                      : 'You haven\'t embarked on any pathways yet. The Atheneum\'s vast knowledge is waiting for its first spark.'}
                  </p>
                </div>

                {/* Overall progress card */}
                {totalCourses > 0 && (
                  <div className="glass-panel p-8 rounded-[3rem] w-full md:w-auto min-w-[320px] shadow-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest">Global Progress</span>
                      <span className="text-2xl font-black text-primary">{overallPct}%</span>
                    </div>
                    <div className="h-3 w-full bg-[var(--surface-high)]/10 rounded-full overflow-hidden relative z-10">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                        style={{ width: `${overallPct}%`, boxShadow: '0 0 15px var(--primary-glow)' }}
                      />
                    </div>
                    <p className="mt-4 text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-widest relative z-10">{completedCoursesCount}/{totalCourses} Pathways Perfected</p>
                  </div>
                )}
              </div>
            </header>

            {/* Empty state */}
            {myCourses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-[var(--surface-low)] border border-dashed border-white/10 rounded-[4rem]">
                <div className="w-24 h-24 bg-[var(--surface-high)]/10 rounded-3xl flex items-center justify-center mb-8 border border-white/5">
                  <BookOpen size={48} className="text-primary/30" />
                </div>
                <h2 className="font-headline text-3xl font-black text-[var(--on-surface)] mb-4 tracking-tighter">A Quiet Library</h2>
                <p className="text-[var(--on-surface-variant)] max-w-sm mx-auto mb-10 leading-relaxed font-body">You haven't embarked on any pathways yet. The Atheneum's vast knowledge is waiting for its first spark.</p>
                <button
                  onClick={() => setView('courses')}
                  className="px-12 py-5 bg-[var(--on-surface)] text-[var(--bg-app)] font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl hover:scale-105 transition-all"
                >
                  Browse Curriculum
                </button>
              </div>
            )}

            {/* Uniform Course Grid */}
            {myCourses.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myCourses.map((course, i) => {
                  const pct = Math.round(course.progress_percentage || 0);
                  const isDone = course.status === 'completed';
                  return (
                    <div key={course.id} className="glass-panel rounded-[3rem] p-10 hover:bg-white/[0.05] transition-all duration-500 flex flex-col border border-white/5 shadow-2xl group relative overflow-hidden">
                      <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-primary`}></div>
                      
                      {/* Visual area with Premium Pattern */}
                      <div className="rounded-[2.5rem] overflow-hidden mb-10 relative bg-[var(--surface-low)] flex items-center justify-center h-56 border border-[var(--glass-border)] group-hover:border-primary/30 transition-all duration-500 shadow-inner">
                        {/* The Pattern Layer */}
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{
                          backgroundImage: `
                            radial-gradient(circle at 2px 2px, rgba(128,128,128,0.1) 1px, transparent 0),
                            linear-gradient(45deg, transparent 48%, rgba(128,128,128,0.05) 50%, transparent 52%),
                            linear-gradient(-45deg, transparent 48%, rgba(128,128,128,0.05) 50%, transparent 52%)
                          `,
                          backgroundSize: '24px 24px, 100px 100px, 100px 100px'
                        }}></div>
                        
                        {/* Progress Glow Orb */}
                        <div 
                          className="absolute w-40 h-40 rounded-full blur-[60px] opacity-20 transition-all duration-1000 group-hover:opacity-40"
                          style={{ 
                            background: `radial-gradient(circle, var(--primary), transparent)`,
                            transform: `scale(${1 + (pct/100)})`,
                            left: '50%',
                            top: '50%',
                            marginLeft: '-80px',
                            marginTop: '-80px'
                          }}
                        ></div>

                        <div className="relative z-10 flex flex-col items-center gap-4">
                           <div className="w-20 h-20 rounded-3xl bg-[var(--surface-high)]/10 border border-white/10 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-700">
                             <BookOpen size={32} className="text-primary group-hover:text-white transition-colors" />
                           </div>
                        </div>

                        {isDone && (
                          <div className="absolute top-8 right-8 animate-bounce">
                            <Award size={32} className="text-primary drop-shadow-[0_0_15px_var(--primary-glow)]" />
                          </div>
                        )}
                        
                        <div className="absolute bottom-8 left-8 flex gap-2">
                           <span className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl tracking-[0.2em] border backdrop-blur-xl shadow-2xl ${isDone ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30' : 'bg-primary/20 text-primary border-primary/30'}`}>
                              {isDone ? 'MASTERED' : 'IN PROGRESS'}
                           </span>
                        </div>
                      </div>

                      <div className="space-y-4 flex-1">
                        <span className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.3em] block">
                          {course.domain || 'ACADEMIC PATH'}
                        </span>
                        <h3 className="font-headline text-3xl font-black text-[var(--on-surface)] line-clamp-2 leading-[1.1] tracking-tighter group-hover:text-primary transition-colors">{course.title}</h3>
                      </div>

                      <div className="mt-12 space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest">{pct}% Mastery</span>
                          </div>
                          <div className="h-2 w-full bg-[var(--surface-high)]/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${pct}%`, boxShadow: '0 0 10px var(--primary-glow)' }} />
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => fetchCourseDetail(course.id, course.enrollment_id)}
                            className="flex-1 py-4 bg-[var(--on-surface)] text-[var(--bg-app)] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            {isDone ? 'Review Research' : 'Resume Odyssey'}
                            <ArrowRight size={14} />
                          </button>
                          {!isDone && (
                            <button onClick={() => handleUnenroll(course.enrollment_id)} className="w-14 h-14 rounded-2xl border border-white/5 text-[var(--on-surface-variant)] hover:text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center group/unenroll">
                              <LogOut size={18} className="transition-transform group-hover/unenroll:rotate-180" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
        </div>
      </div>
    </div>
  );
}
