import React, { useState } from 'react';
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
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Star,
  Plus,
  HelpCircle,
  FileText
} from 'lucide-react';

const CourseRosterView = ({ 
  enrollments = [], 
  selectedCourse,
  setView, 
  userProfile, 
  username, 
  logout,
  dropdownRef,
  dropdownOpen,
  setDropdownOpen,
  fetchCourseRoster,
  fetchInstructorCourses,
  setNewCourse,
  setSelectedCourse
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter enrollments based on search and selected course
  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = e.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(e.student_id).includes(searchTerm);
    const matchesCourse = selectedCourse ? e.course_id === selectedCourse.id : true;
    return matchesSearch && matchesCourse;
  });

  const totalScholars = filteredEnrollments.length;
  const graduatedCount = filteredEnrollments.filter(e => e.status === 'completed').length;
  const avgProgress = totalScholars > 0 
    ? (filteredEnrollments.reduce((acc, curr) => acc + curr.progress_percentage, 0) / totalScholars).toFixed(1)
    : 0;

  const avatarSrc = userProfile?.profile_picture || null;

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glowing-border {
          box-shadow: 0 0 15px rgba(192, 193, 255, 0.1);
        }
        .bg-glow-orb {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          z-index: -1;
          opacity: 0.15;
        }
      `}</style>

      {/* Ambient Background Effects */}
      <div className="bg-glow-orb bg-primary top-[-200px] left-[-100px]"></div>
      <div className="bg-glow-orb bg-secondary bottom-[-200px] right-[-100px]"></div>



      <div className="flex flex-1">
        {/* SideNavBar */}
        <aside className="h-[calc(100vh-6rem)] w-72 sticky top-24 flex flex-col bg-[var(--bg-app)] shadow-[1px_0_0_0_rgba(255,255,255,0.05)] z-40 hidden md:flex py-8">

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
            <a onClick={() => setView('instructor-dash')} className="text-[var(--on-surface-variant)] px-6 py-4 opacity-70 flex items-center gap-4 font-body text-sm uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all cursor-pointer">
              <LayoutGrid size={18} /> Home
            </a>
            <a onClick={() => fetchCourseRoster(null)} className="bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-4 border-primary px-6 py-4 flex items-center gap-4 font-body text-sm uppercase tracking-widest transition-all cursor-pointer">
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
                <HelpCircle size={16} /> Help Center
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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <p className="text-primary font-headline text-[10px] uppercase tracking-[0.3em] font-bold">Academic Database</p>
                <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface">
                  {selectedCourse ? 'Course Roster' : 'Student Roster'}
                </h1>
                {selectedCourse && (
                  <p className="text-[var(--on-surface-variant)] font-body text-sm">Viewing students enrolled in: <span className="text-primary font-bold">{selectedCourse.title}</span></p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <input
                    className="w-72 bg-[var(--surface-high)]/10 border border-white/5 rounded-full py-3 px-6 pl-12 text-sm font-body text-[var(--on-surface)] placeholder:text-slate-600 focus:ring-2 focus:ring-primary/40 transition-all outline-none"
                    placeholder="Search Scholar Name or ID..." 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button
                  className="bg-gradient-to-r from-secondary to-primary text-on-primary-container font-headline font-bold px-6 py-3 rounded-full text-sm shadow-xl shadow-secondary/10 hover:opacity-90 transition-all flex items-center gap-2"
                  onClick={() => {
                    const csv = [
                      ['Scholar ID', 'Name', 'Email', 'Course', 'Enrollment Date', 'Progress', 'Status'],
                      ...filteredEnrollments.map(e => [
                        e.student_id,
                        e.student_name,
                        e.student_email,
                        e.course_title,
                        new Date(e.enrolled_at).toLocaleDateString(),
                        `${e.progress_percentage}%`,
                        e.status
                      ])
                    ].map(row => row.join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('href', url);
                    a.setAttribute('download', `roster_${new Date().toISOString().split('T')[0]}.csv`);
                    a.click();
                  }}
                >
                  <Download size={18} />
                  Download CSV
                </button>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-8 border-b border-white/5 mb-8">
              <button 
                onClick={() => setActiveTab('roster')}
                className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'roster' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Scholar Roster
                {activeTab === 'roster' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />}
              </button>
              <button 
                onClick={() => setActiveTab('curriculum')}
                className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'curriculum' ? 'text-secondary' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Curriculum Structure
                {activeTab === 'curriculum' && <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary rounded-full shadow-[0_0_10px_var(--secondary)]" />}
              </button>
            </div>

            {activeTab === 'roster' ? (
              <div className="glass-panel glowing-border rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-8 py-6 font-headline font-bold text-slate-400 uppercase tracking-widest text-[11px]">Scholar ID & Name</th>
                        <th className="px-8 py-6 font-headline font-bold text-slate-400 uppercase tracking-widest text-[11px]">Enrollment Date</th>
                        <th className="px-8 py-6 font-headline font-bold text-slate-400 uppercase tracking-widest text-[11px]">Current Progress</th>
                        <th className="px-8 py-6 font-headline font-bold text-slate-400 uppercase tracking-widest text-[11px]">Status</th>
                        <th className="px-8 py-6 font-headline font-bold text-slate-400 uppercase tracking-widest text-[11px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredEnrollments.length > 0 ? (
                        filteredEnrollments.map((enroll) => (
                          <tr key={enroll.id} className="hover:bg-white/[0.04] transition-all cursor-pointer group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-all flex items-center justify-center bg-surface-container-high text-primary">
                                  <Users size={20} />
                                </div>
                                <div>
                                  <p className="font-headline font-bold text-on-surface">{enroll.student_name}</p>
                                  <p className="font-headline text-[10px] text-primary/70 tracking-widest">UID-{enroll.student_id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 font-headline text-sm text-on-surface/80">
                              {new Date(enroll.enrolled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-8 py-6">
                              <div className="w-48 space-y-2">
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#c0c1ff] to-[#ddb7ff] rounded-full shadow-[0_0_10px_rgba(192,193,255,0.4)] transition-all duration-500"
                                    style={{ width: `${enroll.progress_percentage}%` }}
                                  ></div>
                                </div>
                                <p className="text-[10px] font-headline font-bold text-secondary text-right">{enroll.progress_percentage}%</p>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border shadow-[0_0_10px_rgba(192,193,255,0.1)] ${
                                enroll.status === 'completed' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-primary/10 text-primary border-primary/20'
                              }`}>
                                {enroll.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button className="text-slate-500 hover:text-on-surface transition-colors">
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-8 py-20 text-center text-slate-500 font-headline">
                            No scholars found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Footer / Pagination */}
                <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-headline">Showing {filteredEnrollments.length} of {totalScholars} Scholars</p>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-primary transition-colors disabled:opacity-30">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="px-4 text-xs font-bold text-on-surface">Page 1 of 1</span>
                    <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-primary transition-colors disabled:opacity-30">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {chapters.length > 0 ? (
                  chapters.map((ch, idx) => {
                    const quiz = quizzes.find(q => q.chapter_id === ch.id);
                    return (
                      <div key={ch.id} className="glass-panel p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row gap-8 hover:bg-white/[0.02] transition-all group">
                        <div className="flex-shrink-0 w-16 h-16 rounded-[1.5rem] bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                           <span className="text-xl font-black font-headline">{idx + 1}</span>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-2xl font-bold font-headline text-on-surface group-hover:text-secondary transition-colors">{ch.title}</h4>
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Module Chapter</p>
                            </div>
                            {ch.pdf_file && (
                              <a 
                                href={ch.pdf_file} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/40 transition-all"
                              >
                                <FileText size={14} /> PDF Guide
                              </a>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-400 leading-relaxed font-light line-clamp-2">
                            {ch.description || 'No description provided for this academic module.'}
                          </p>
                          
                          <div className="pt-4 flex flex-wrap gap-4">
                            {quiz ? (
                              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                <CheckCircle2 size={16} />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase tracking-widest">{quiz.title}</span>
                                  <span className="text-[8px] font-bold opacity-70 uppercase tracking-tighter">
                                    Pool: {quiz.questions?.length || 0} Questions
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/5 border border-dashed border-amber-500/20 text-amber-500/70">
                                <HelpCircle size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">No Assessment Linked</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex md:flex-col justify-center gap-3">
                          <button 
                            onClick={() => {
                              setSelectedCourse(selectedCourse);
                              setView('course-editor');
                            }}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-all"
                            title="Edit Chapter Structure"
                          >
                            <Sliders size={20} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-24 glass-panel rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                      <BookOpen size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold font-headline text-on-surface">No Chapters Defined</h3>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto font-light">This course currently has no academic chapters. Visit the Curriculum Studio to start building.</p>
                    </div>
                    <button 
                      onClick={() => setView('course-editor')}
                      className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Enter Curriculum Studio
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stats Overview Bento Grid Segment */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-extrabold text-[var(--on-surface)]">{totalScholars}</h3>
                  <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-bold">Enrolled Scholars</p>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-extrabold text-[var(--on-surface)]">{graduatedCount}</h3>
                  <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-bold">Graduated</p>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-extrabold text-[var(--on-surface)]">{avgProgress}%</h3>
                  <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-bold">Avg. Completion Rate</p>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400">
                  <Star size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-extrabold text-[var(--on-surface)]">4.9</h3>
                  <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-bold">Scholar Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseRosterView;
