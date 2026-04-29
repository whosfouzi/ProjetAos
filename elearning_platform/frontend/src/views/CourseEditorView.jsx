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
  Plus,
  Trash2,
  Edit,
  X,
  FileText,
  HelpCircle,
  Lock,
  ChevronDown,
  Layout,
  CheckCircle2
} from 'lucide-react';

/**
 * CourseEditorView — Stitch "Aura Slate" Course Editor & Curriculum Builder
 */
export default function CourseEditorView({
  selectedCourse, newCourse, setNewCourse, handleSaveCourse,
  chapters, newChapter, setNewChapter, handleCreateChapter, handleDeleteChapter, handleUpdateChapter,
  editingChapterId, setEditingChapterId, editChapterData, setEditChapterData,
  quizzes, addingQuizToChapter, setAddingQuizToChapter, newQuiz, setNewQuiz, handleCreateQuiz,
  addingQuestionToQuiz, setAddingQuestionToQuiz, newQuestion, setNewQuestion, handleAddQuestion,
  allowedSpecializations, setView, showToast,
  userProfile, username, logout, dropdownRef, dropdownOpen, setDropdownOpen,
  handleDeleteChapterPDF, fetchCourseRoster, fetchInstructorCourses,
  filteredEnrollments, searchTerm, setSearchTerm, totalScholars, graduatedCount, avgProgress
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
        {/* SideNavBar */}
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
            <a onClick={() => setView('instructor-dash')} className="text-[var(--on-surface-variant)] px-6 py-4 opacity-70 flex items-center gap-4 font-body text-sm uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all cursor-pointer">
              <LayoutGrid size={18} /> Home
            </a>
            <a onClick={() => fetchCourseRoster(null)} className="text-[var(--on-surface-variant)] px-6 py-4 opacity-70 flex items-center gap-4 font-body text-sm uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all cursor-pointer">
              <Users size={18} /> Students
            </a>
            <a onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }} className="bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-4 border-primary px-6 py-4 flex items-center gap-4 font-body text-sm uppercase tracking-widest transition-all cursor-pointer">
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
 
        <main className="flex-1 p-8 md:p-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Header */}
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
              <div>
                <h1 className="text-4xl font-black font-headline text-[var(--on-surface)] tracking-tighter">
                  {selectedCourse ? 'Forge Curriculum' : 'Conceptualize Odyssey'}
                </h1>
                <p className="text-[var(--on-surface-variant)] mt-2">
                  {selectedCourse ? `Refining: ${selectedCourse.title}` : 'Drafting a new learning pathway for the Atheneum.'}
                </p>
              </div>
              <button 
                onClick={handleSaveCourse}
                className="px-8 py-4 bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
              >
                {selectedCourse ? 'Update Architecture' : 'Initialize Course'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Course Identity */}
              <aside className="lg:col-span-4 space-y-8">
                <div className="glass-panel p-8 rounded-[2.5rem] space-y-8 border border-white/5 shadow-2xl">
                  {/* Specialization Select */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold font-headline text-primary/80 ml-1 uppercase tracking-widest">Academic Specialization</label>
                    <div className="relative group">
                      <select
                        value={newCourse.specialization}
                        onChange={e => setNewCourse({ ...newCourse, specialization: e.target.value })}
                        className="w-full bg-[var(--surface-high)]/10 border-none rounded-2xl px-5 py-4 text-[var(--on-surface)] appearance-none focus:ring-2 focus:ring-primary/50 transition-all font-body cursor-pointer"
                        required
                        disabled={!!selectedCourse}
                      >
                        <option value="" className="bg-[var(--bg-app)]">-- Select Expertise --</option>
                        {allowedSpecializations.map(spec => (
                          <option key={spec.id} value={spec.id} className="bg-[var(--bg-app)]">{spec.domain_name} » {spec.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
 
                  {/* Title Input */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold font-headline text-primary/80 ml-1 uppercase tracking-widest">Course Title</label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="w-full bg-[var(--surface-high)]/10 border-none rounded-2xl px-5 py-4 text-[var(--on-surface)] placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 transition-all font-body"
                      placeholder="e.g. Advanced Quantum Narratives"
                      required
                    />
                  </div>
 
                  {/* Description Input */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold font-headline text-primary/80 ml-1 uppercase tracking-widest">Editorial Description</label>
                    <textarea
                      value={newCourse.description}
                      onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                      className="w-full bg-[var(--surface-high)]/10 border-none rounded-2xl px-5 py-4 text-[var(--on-surface)] placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 transition-all font-body resize-none"
                      placeholder="Craft a compelling narrative for your course..."
                      rows="5"
                    />
                  </div>
                </div>
 
                {/* Quick Stats */}
                <div className="flex gap-4 p-4 rounded-[2rem] bg-[var(--surface-low)] border border-white/5">
                  <div className="flex-1 text-center p-4 rounded-2xl bg-[var(--surface-high)]/10">
                    <div className="text-2xl font-bold text-[var(--on-surface)]">{chapters.length}</div>
                    <div className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">Chapters</div>
                  </div>
                  <div className="flex-1 text-center p-4 rounded-2xl bg-[var(--surface-high)]/10">
                    <div className="text-2xl font-bold text-[var(--on-surface)]">{quizzes.length}</div>
                    <div className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">Quizzes</div>
                  </div>
                </div>
              </aside>
 
              {/* Right Column: Curriculum Builder */}
              <section className="lg:col-span-8 space-y-8">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h2 className="text-3xl font-bold font-headline text-[var(--on-surface)] tracking-tight">Chapter Sequence</h2>
                    <p className="text-[var(--on-surface-variant)]">Construct your syllabus milestone by milestone.</p>
                  </div>
                  {!selectedCourse && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20">
                      <Lock size={14} /> Save course first
                    </div>
                  )}
                </div>
 
                {selectedCourse ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chapter Cards */}
                    {chapters.map((ch, index) => (
                      <div key={ch.id} className="glass-panel p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between group hover:shadow-[0_0_40px_rgba(192,193,255,0.05)] transition-all">
                        
                        {editingChapterId === ch.id ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Editing Chapter {ch.order}</span>
                              <button onClick={() => setEditingChapterId(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
                            </div>
                            <input
                              type="text"
                              value={editChapterData.title}
                              onChange={e => setEditChapterData({ ...editChapterData, title: e.target.value })}
                              className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-[var(--on-surface)] text-sm focus:ring-1 focus:ring-primary/50"
                              placeholder="Chapter Title"
                            />
                            <textarea
                              value={editChapterData.description}
                              onChange={e => setEditChapterData({ ...editChapterData, description: e.target.value })}
                              className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-[var(--on-surface)] text-xs focus:ring-1 focus:ring-primary/50 resize-none"
                              placeholder="Short Description"
                              rows="2"
                            />
                            <div className="space-y-2">
                               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Replace PDF</label>
                               <input type="file" accept="application/pdf" onChange={e => setEditChapterData({ ...editChapterData, pdfFile: e.target.files[0] })} className="text-[10px] text-slate-400 block w-full" />
                            </div>
                            <button 
                              onClick={() => handleUpdateChapter(selectedCourse.id, ch.id)}
                              className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/10 transition-all hover:brightness-110"
                            >
                              Save Changes
                            </button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/20">
                                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                </div>
                                <div className="flex gap-1">
                                   <button onClick={() => { setEditingChapterId(ch.id); setEditChapterData({ title: ch.title, description: ch.description || '', pdfFile: null, order: ch.order }); }} className="p-2 text-slate-500 hover:text-primary transition-colors">
                                     <Edit size={18} />
                                   </button>
                                   <button onClick={() => handleDeleteChapter(selectedCourse.id, ch.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                     <Trash2 size={18} />
                                   </button>
                                </div>
                              </div>
                              <h3 className="text-xl font-bold font-headline text-[var(--on-surface)] mb-2 leading-tight">{ch.title}</h3>
                              <p className="text-xs text-[var(--on-surface-variant)] mb-6 line-clamp-2 leading-relaxed">
                                {ch.description || 'No description provided.'}
                              </p>
                            </div>
 
                            <div className="space-y-3">
                              {ch.pdf_file && (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                  <FileText size={20} className="text-primary" />
                                  <div className="flex-1 overflow-hidden">
                                    <div className="text-[10px] font-bold text-[var(--on-surface)] truncate">Syllabus PDF Attached</div>
                                  </div>
                                  <button onClick={() => handleDeleteChapterPDF(selectedCourse.id, ch.id)} className="text-slate-500 hover:text-red-400"><X size={14} /></button>
                                </div>
                              )}
                              
                              {/* Quiz Section */}
                              <div className="space-y-2">
                                  {quizzes.filter(q => q.chapter_id === ch.id).map(quiz => {
                                    const questionCount = quiz.questions?.length || 0;
                                    const poolReady = questionCount === 20;
                                    
                                    return (
                                      <div key={quiz.id} className="space-y-2">
                                        <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${poolReady ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-secondary/10 border-secondary/20'}`}>
                                          <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${poolReady ? 'bg-emerald-500 text-white' : 'bg-secondary text-white'}`}>
                                              {poolReady ? <CheckCircle2 size={14} /> : <HelpCircle size={14} />}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                              <span className={`text-[10px] font-black uppercase tracking-widest truncate ${poolReady ? 'text-emerald-500' : 'text-secondary'}`}>{quiz.title}</span>
                                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Pool: {questionCount}/20 Questions</span>
                                            </div>
                                          </div>
                                          <button 
                                            onClick={() => setAddingQuestionToQuiz(addingQuestionToQuiz === quiz.id ? null : quiz.id)} 
                                            disabled={questionCount >= 20}
                                            className={`text-[9px] font-black uppercase tracking-tighter border px-3 py-1.5 rounded-xl transition-all ${questionCount >= 20 ? 'opacity-50 grayscale cursor-not-allowed' : 'text-secondary border-secondary/30 hover:bg-secondary/20'}`}
                                          >
                                            {addingQuestionToQuiz === quiz.id ? 'Close' : questionCount >= 20 ? 'Pool Complete' : '+ Question'}
                                          </button>
                                        </div>

                                        {addingQuestionToQuiz === quiz.id && (
                                          <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5 space-y-4 mt-2 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                              <label className="text-[8px] font-black text-primary uppercase tracking-widest ml-1">Inquiry Text</label>
                                              <input 
                                                type="text" 
                                                placeholder="e.g. What is the fundamental principle of..." 
                                                value={newQuestion.text} 
                                                onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} 
                                                className="w-full bg-white/5 border-none rounded-xl p-3 text-xs text-[var(--on-surface)] outline-none focus:ring-2 focus:ring-primary/30" 
                                              />
                                            </div>
                                            
                                            <div className="space-y-3">
                                              <div className="flex justify-between items-center">
                                                <label className="text-[8px] font-black text-primary uppercase tracking-widest ml-1">Answer Choices (3-4)</label>
                                                <div className="text-[8px] font-bold text-slate-500 uppercase">Select one correct</div>
                                              </div>
                                              
                                              <div className="space-y-2">
                                                {newQuestion.choices.map((choice, idx) => (
                                                  <div key={idx} className="flex gap-2 items-center">
                                                    <button 
                                                      onClick={() => {
                                                        const nc = newQuestion.choices.map((c, i) => ({...c, is_correct: i === idx}));
                                                        setNewQuestion({...newQuestion, choices: nc});
                                                      }}
                                                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${choice.is_correct ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                                    >
                                                      {choice.is_correct ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                                    </button>
                                                    <input 
                                                      type="text" 
                                                      placeholder={`Choice ${idx + 1}`} 
                                                      value={choice.text} 
                                                      onChange={e => {
                                                        const nc = [...newQuestion.choices];
                                                        nc[idx].text = e.target.value;
                                                        setNewQuestion({...newQuestion, choices: nc});
                                                      }}
                                                      className={`flex-1 bg-white/5 border-none rounded-xl p-3 text-[10px] text-[var(--on-surface)] focus:ring-2 transition-all ${choice.is_correct ? 'focus:ring-emerald-500/30' : 'focus:ring-primary/30'}`}
                                                    />
                                                    {newQuestion.choices.length > 3 && (
                                                      <button 
                                                        onClick={() => {
                                                          const nc = newQuestion.choices.filter((_, i) => i !== idx);
                                                          if (choice.is_correct && nc.length > 0) nc[0].is_correct = true;
                                                          setNewQuestion({...newQuestion, choices: nc});
                                                        }}
                                                        className="p-2 text-slate-600 hover:text-red-400"
                                                      >
                                                        <Trash2 size={14} />
                                                      </button>
                                                    )}
                                                  </div>
                                                ))}
                                                
                                                {newQuestion.choices.length < 4 && (
                                                  <button 
                                                    onClick={() => {
                                                      setNewQuestion({...newQuestion, choices: [...newQuestion.choices, { text: '', is_correct: false }]});
                                                    }}
                                                    className="w-full py-2 border border-dashed border-white/10 rounded-xl text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-primary hover:border-primary/40 transition-all"
                                                  >
                                                    + Add Choice
                                                  </button>
                                                )}
                                              </div>
                                            </div>

                                             <div className="space-y-3">
                                              {newQuestion.choices.filter(c => c.text !== '').length < 3 && (
                                                <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest text-center animate-pulse">
                                                  Pool requirement: 3-4 Choices
                                                </p>
                                              )}
                                              <button 
                                                onClick={() => handleAddQuestion(quiz.id)} 
                                                disabled={!newQuestion.text || newQuestion.choices.filter(c => c.text !== '').length < 3}
                                                className="w-full py-3 bg-gradient-to-r from-secondary to-secondary/80 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                              >
                                                Commit Question to Pool
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  
                                  {addingQuizToChapter === ch.id ? (
                                    <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 space-y-3 animate-in fade-in zoom-in-95">
                                       <input type="text" placeholder="Quiz Title (e.g. Final Assessment)" value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-[var(--on-surface)] outline-none focus:ring-2 focus:ring-primary/30" />
                                       <div className="flex gap-2">
                                         <div className="flex-1 space-y-1">
                                           <label className="text-[8px] font-bold text-slate-500 uppercase ml-1">Passing %</label>
                                           <input type="number" placeholder="70" value={newQuiz.passingScore} onChange={e => setNewQuiz({...newQuiz, passingScore: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-[var(--on-surface)] outline-none" />
                                         </div>
                                         <div className="flex-1 space-y-1">
                                           <label className="text-[8px] font-bold text-slate-500 uppercase ml-1">Pool Goal</label>
                                           <div className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-slate-500 font-bold">20 Questions</div>
                                         </div>
                                       </div>
                                       <div className="flex gap-2 pt-2">
                                          <button onClick={() => handleCreateQuiz(selectedCourse.id, ch.id)} className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">Initialize Pool</button>
                                          <button onClick={() => setAddingQuizToChapter(null)} className="px-4 text-slate-500 text-[10px] font-bold uppercase">Cancel</button>
                                       </div>
                                    </div>
                                 ) : (
                                   quizzes.filter(q => q.chapter_id === ch.id).length === 0 && (
                                     <button onClick={() => setAddingQuizToChapter(ch.id)} className="w-full py-3 bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary/40 transition-all text-[10px] font-bold uppercase tracking-widest">
                                       <Plus size={14} /> Add Quiz
                                     </button>
                                   )
                                 )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
 
                    {/* New Chapter Form Card */}
                    <div className="glass-panel p-8 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-transparent flex flex-col justify-center space-y-6">
                       <div className="flex flex-col items-center justify-center text-center">
                         <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                           <Plus size={32} className="text-primary" />
                         </div>
                         <h3 className="text-lg font-bold text-[var(--on-surface)] mb-1">New Chapter</h3>
                         <p className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">Extend the curriculum</p>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-2">
                            <input type="number" value={newChapter.order} onChange={e => setNewChapter({...newChapter, order: parseInt(e.target.value) || 1})} className="bg-white/5 border-none rounded-xl p-3 text-xs text-center text-[var(--on-surface)] outline-none focus:ring-2 focus:ring-primary/30" placeholder="#" />
                            <input type="text" placeholder="Title" value={newChapter.title} onChange={e => setNewChapter({...newChapter, title: e.target.value})} className="col-span-3 bg-white/5 border-none rounded-xl p-3 text-xs text-[var(--on-surface)] outline-none focus:ring-2 focus:ring-primary/30" />
                          </div>
                          <textarea placeholder="Description" value={newChapter.description} onChange={e => setNewChapter({...newChapter, description: e.target.value})} className="w-full bg-white/5 border-none rounded-xl p-3 text-xs resize-none text-[var(--on-surface)]" rows="2" />
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-primary/60 uppercase ml-1">Syllabus PDF (Required)</label>
                            <input type="file" accept="application/pdf" onChange={e => setNewChapter({...newChapter, pdfFile: e.target.files[0]})} className="text-[10px] text-slate-500 w-full" />
                          </div>
                          <button onClick={() => handleCreateChapter(selectedCourse.id)} disabled={!newChapter.title || !newChapter.pdfFile} className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 disabled:opacity-50">
                            Add Chapter
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[500px] glass-panel rounded-[2.5rem] flex flex-col items-center justify-center border-dashed border-2 border-white/5 space-y-6 text-center px-12">
                    <div className="w-24 h-24 rounded-full bg-[var(--surface-high)]/10 flex items-center justify-center relative">
                       <BookOpen size={48} className="text-slate-600" />
                       <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white border-4 border-[var(--bg-app)]">
                         <Lock size={18} />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-2 font-headline">Curriculum Locked</h3>
                       <p className="text-[var(--on-surface-variant)] text-sm max-w-sm">Save the basic course architecture on the left to unlock the curriculum builder and start adding chapters.</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
