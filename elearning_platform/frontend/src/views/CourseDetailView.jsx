import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Sliders, 
  LogOut, 
  User, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Star,
  Play,
  FileText,
  Clock,
  Award,
  Users,
  Layout,
  Brain,
  Info,
  ChevronDown,
  X
} from 'lucide-react';

/**
 * CourseDetailView — Stitch "Aura Slate" Course Detail / Landing Page
 */
export default function CourseDetailView({
  selectedCourse, chapters, chapterProgress, quizzes,
  expandedChapter, setExpandedChapter,
  enrollCourse, handleMarkChapterViewed, selectQuiz,
  userRole, setView,
  logout, userProfile, username, dropdownRef, dropdownOpen, setDropdownOpen,
  showToast, fetchMyCourses,
  studyMode, setStudyMode,
  fetchCourseRoster
}) {
  const [activeTab, setActiveTab] = useState(studyMode ? 'syllabus' : 'overview');

  const progressCompleted = chapterProgress.filter(p => p.completed).length;
  const progressPct = chapters.length > 0 ? Math.round((progressCompleted / chapters.length) * 100) : 0;
  const allDone = progressPct === 100 && chapters.length > 0;

  // In study mode, find the next unfinished chapter to auto-expand
  const nextChapterId = studyMode
    ? (chapters.find(ch => {
        const prog = chapterProgress.find(p => p.chapter_id === ch.id);
        return !prog?.completed;
      })?.id ?? null)
    : null;

  // Auto-expand next chapter when entering study mode
  useEffect(() => {
    if (studyMode && nextChapterId && expandedChapter !== nextChapterId) {
      setExpandedChapter(nextChapterId);
    }
  }, [studyMode, nextChapterId]);

  // Auto-exit study mode when all chapters completed
  useEffect(() => {
    if (studyMode && allDone) {
      setStudyMode(false);
    }
  }, [studyMode, allDone]);

  const avatarSrc = userProfile?.profile_picture || null;
  const heroBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBNKsXgAMyKYPXaBB4ML7YrHWJACs4ClSxjWju5ShZREWM0b3hWPJo6vD-isrOBssnE2odRUAMB0dmluGT4X8cM2tR1s1AEcw5TnXchHl6lVfJ-25fad0r9-y3RQdChvOJtHs0HmqUVzyfXbxeW2CZ-A1-dM5-x0OMnNlrBjYTN9DA4I0nDnNhQOYwrmhP690XEEKtLNoafCOmGANfO22NQ5BfANepFPEw8wpTa9UVGqh08PV1vszNQQzh27RA2bdmdxYQaMzfuIc';

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--on-surface)] font-body selection:bg-primary selection:text-on-primary transition-colors duration-500">
      <style>{`
        .glass-panel {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
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
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px] -z-10" />
 
      {/* ── Study Mode Banner ── */}
      {studyMode && (
        <div className="fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-8 py-2.5"
          style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(52,211,153,0.1) 100%)', borderBottom: '1px solid rgba(110,231,183,0.2)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: '#6ee7b7' }} />
            <Brain size={16} className="text-emerald-400" />
            <span className="text-emerald-400 font-headline font-bold text-xs uppercase tracking-widest">Study Mode Active</span>
            <span className="text-[var(--on-surface-variant)] text-xs hidden md:inline">— Complete all chapters to finish your session</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-bold text-sm">{progressCompleted}/{chapters.length} chapters</span>
            <button
              onClick={() => setStudyMode(false)}
              className="text-xs text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors px-3 py-1 rounded-full border border-white/10 hover:border-white/20"
            >
              Exit Session
            </button>
          </div>
        </div>
      )}
  
      {/* ── Breadcrumbs / Back ── */}
      <div className="px-12 pt-8">
        <button
          onClick={() => {
            if (studyMode) {
              showToast('Finish your study session first, or click Exit Session to leave.', 'error');
            } else {
              setView(selectedCourse?.enrollment_id ? 'my-courses' : 'courses');
            }
          }}
          className="flex items-center gap-3 text-[var(--on-surface-variant)] hover:text-primary transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-high)]/10 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black">
            Return to {selectedCourse?.enrollment_id ? 'Pathways' : 'Catalog'}
          </span>
        </button>
      </div>
 
      {/* ── Main Hero ── */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} className="w-full h-full object-cover opacity-30" alt="Course Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-app)] via-[var(--bg-app)]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-app)] via-transparent to-transparent" />
        </div>
 
        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-md">
              {selectedCourse?.domain || 'Academic Research'}
            </span>
            <h1 className="text-6xl md:text-7xl font-black font-headline text-[var(--on-surface)] tracking-tighter leading-none">
              {selectedCourse?.title}
            </h1>
            <p className="text-lg text-[var(--on-surface-variant)] font-light max-w-2xl leading-relaxed">
              {selectedCourse?.description || 'Unlock advanced methodologies and foundational principles in this comprehensive module.'}
            </p>
          </div>
 
          <div className="flex flex-wrap gap-6 items-center">
            {selectedCourse?.enrollment_id ? (
              <button 
                onClick={() => { setStudyMode(true); setActiveTab('syllabus'); }}
                className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-widest rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
              >
                <Play size={20} fill="currentColor" />
                {progressPct > 0 ? 'Resume Odyssey' : 'Begin Research'}
              </button>
            ) : (
              <button 
                onClick={() => enrollCourse(selectedCourse.id)}
                className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-widest rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
              >
                <BookOpen size={20} />
                Enroll for Free
              </button>
            )}
            
            <div className="flex items-center gap-8 pl-4 border-l border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--on-surface)]">{chapters.length}</p>
                <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Chapters</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--on-surface)]">{quizzes.length}</p>
                <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Quizzes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--on-surface)]">4.9</p>
                <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* ── Curriculum / Tabs ── */}
      <main className="px-12 pb-24 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Tab Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Tabs Header */}
            <div className="flex gap-10 border-b border-white/5 pb-4">
              {[
                { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
                { id: 'syllabus', label: 'Syllabus', icon: <BookOpen size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute -bottom-[17px] left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_var(--primary-glow)]" />}
                </button>
              ))}
            </div>
 
            {activeTab === 'overview' && (
              <div className="glass-panel p-10 rounded-[3rem] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold font-headline text-[var(--on-surface)]">Academic Objectives</h3>
                  <p className="text-[var(--on-surface-variant)] leading-relaxed font-light">
                    This module is designed to provide a deep understanding of {selectedCourse?.title}. 
                    Students will explore the theoretical frameworks and practical applications required to master this domain.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-[var(--surface-high)]/10 rounded-3xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                       <Layout size={20} />
                    </div>
                    <h4 className="font-bold text-[var(--on-surface)]">Structured Learning</h4>
                    <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">Step-by-step guidance through complex concepts with modular chapters.</p>
                  </div>
                  <div className="p-6 bg-[var(--surface-high)]/10 rounded-3xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                       <Star size={20} />
                    </div>
                    <h4 className="font-bold text-[var(--on-surface)]">Expert Certification</h4>
                    <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">Validate your skills with interactive quizzes and progress tracking.</p>
                  </div>
                </div>
              </div>
            )}
 
            {activeTab === 'syllabus' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {chapters.map((ch, idx) => {
                  const progress = chapterProgress.find(p => p.chapter_id === ch.id);
                  const isCompleted = progress?.completed;
                  const isExpanded = expandedChapter === ch.id;
 
                  return (
                    <div key={ch.id} className={`glass-panel rounded-[2.5rem] overflow-hidden transition-all duration-500 border border-white/5 ${isExpanded ? 'ring-2 ring-primary/20 bg-white/5' : 'hover:bg-white/5'}`}>
                      <div 
                        onClick={() => setExpandedChapter(isExpanded ? null : ch.id)}
                        className="p-8 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border ${isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {isCompleted ? <CheckCircle2 size={20} /> : (idx + 1 < 10 ? `0${idx + 1}` : idx + 1)}
                          </div>
                          <div>
                            <h4 className={`text-xl font-bold font-headline transition-colors ${isCompleted ? 'text-[var(--on-surface-variant)] line-through' : 'text-[var(--on-surface)]'}`}>{ch.title}</h4>
                            <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest mt-1">Foundational Module</p>
                          </div>
                        </div>
                        <ChevronDown size={20} className={`text-[var(--on-surface-variant)] transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
 
                      {isExpanded && (
                        <div className="px-8 pb-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                          <div className="p-6 bg-[var(--surface-high)]/10 rounded-3xl border border-white/5">
                            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed font-light">{ch.description || 'No description available for this chapter.'}</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-4">
                            {ch.pdf_file && (
                              <a 
                                href={ch.pdf_file} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-3 px-6 py-3 bg-[var(--surface-high)]/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--surface-high)]/20 transition-all border border-white/5 text-[var(--on-surface)]"
                              >
                                <FileText size={16} className="text-primary" />
                                Study Guide PDF
                              </a>
                            )}
                            {quizzes.some(q => q.chapter_id === ch.id) && (
                               <button 
                                 onClick={(e) => { 
                                   e.stopPropagation(); 
                                   const targetQuiz = quizzes.find(q => q.chapter_id === ch.id);
                                   if (targetQuiz) selectQuiz(targetQuiz.id); 
                                 }}
                                 className="flex items-center gap-3 px-6 py-3 bg-secondary/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/20 transition-all border border-secondary/20 text-secondary active:scale-95"
                               >
                                 <Brain size={16} />
                                 Take Knowledge Quiz
                               </button>
                             )}
                            {!isCompleted && selectedCourse?.enrollment_id && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMarkChapterViewed(selectedCourse.enrollment_id, ch.id); }}
                                className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                              >
                                <CheckCircle2 size={16} />
                                Mark as Mastered
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* Right: Instructor / Stats Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="glass-panel p-8 rounded-[3rem] space-y-8 border border-white/5 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-high)]/10 flex items-center justify-center text-[var(--on-surface-variant)]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Course Length</p>
                    <p className="text-sm font-bold text-[var(--on-surface)]">~ {chapters.length * 2} Hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-high)]/10 flex items-center justify-center text-[var(--on-surface-variant)]">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Community</p>
                    <p className="text-sm font-bold text-[var(--on-surface)]">1.2k+ Enrolled Scholars</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-high)]/10 flex items-center justify-center text-[var(--on-surface-variant)]">
                    <Award size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Certification</p>
                    <p className="text-sm font-bold text-[var(--on-surface)]">Mastery Diploma</p>
                  </div>
                </div>
              </div>
            </div>
 
            {selectedCourse?.enrollment_id && (
              <div className="glass-panel p-8 rounded-[3rem] bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <h4 className="text-lg font-bold mb-4 text-[var(--on-surface)]">Your Progression</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-2xl font-black text-[var(--on-surface)]">{progressPct}%</span>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Level 1 Scholar</span>
                   </div>
                   <div className="h-3 w-full bg-[var(--surface-high)]/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_var(--primary-glow)]" style={{ width: `${progressPct}%` }} />
                   </div>
                   <p className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed italic">"The path to mastery is paved with consistent inquiry."</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
