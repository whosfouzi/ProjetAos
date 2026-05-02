import React, { useState, useEffect } from 'react';
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
   Edit3,
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
   selectedCourse = null, setSelectedCourse = () => { }, newCourse = { title: '', description: '', specialization: '' }, setNewCourse = () => { }, handleSaveCourse = () => { },
   chapters = [], newChapter = { title: '', description: '', pdfFile: null, order: 1 }, setNewChapter = () => { }, handleCreateChapter = () => { }, handleDeleteChapter = () => { }, handleUpdateChapter = () => { },
   editingChapterId = null, setEditingChapterId = () => { }, editChapterData = { title: '', description: '', pdfFile: null, order: 1 }, setEditChapterData = () => { },
   quizzes = [], addingQuizToChapter = null, setAddingQuizToChapter = () => { }, newQuiz = { title: '', description: '', passingScore: 70 }, setNewQuiz = () => { }, handleCreateQuiz = () => { },
   addingQuestionToQuiz = null, setAddingQuestionToQuiz = () => { }, newQuestion = { text: '', choices: [{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }] }, setNewQuestion = () => { }, handleAddQuestion = () => { },
   allowedSpecializations = [], setView = () => { }, showToast = () => { },
   userProfile = null, username = '', logout = () => { }, dropdownRef = null, dropdownOpen = false, setDropdownOpen = () => { },
   handleDeleteChapterPDF = () => { }, fetchCourseRoster = () => { }, fetchInstructorCourses = () => { },
   filteredEnrollments = [], searchTerm = '', setSearchTerm = () => { }, totalScholars = 0, graduatedCount = 0, avgProgress = 0
}) {

   const [modalQuizData, setModalQuizData] = useState({});
   const [loadingQuizId, setLoadingQuizId] = useState(null);
   const [editingQuestion, setEditingQuestion] = useState(null);
   const [modalChapterQuizzes, setModalChapterQuizzes] = useState([]);

   useEffect(() => {
      if (editingChapterId) {
         const cached = quizzes ? quizzes.filter(q => q && String(q.chapter_id || q.chapter || '').trim() === String(editingChapterId || '').trim()) : [];
         setModalChapterQuizzes(cached);
         const fetchModalData = async () => {
            try {
               const token = localStorage.getItem('token');
               
               // Fetch quizzes in parallel
               const [resFiltered, resAll] = await Promise.all([
                  fetch(`/api/quizzes/quizzes/?chapter_id=${editingChapterId}`, {
                     headers: { 'Authorization': `Bearer ${token}`, 'Bypass-Tunnel-Reminder': 'true' }
                  }),
                  fetch(`/api/quizzes/quizzes/`, {
                     headers: { 'Authorization': `Bearer ${token}`, 'Bypass-Tunnel-Reminder': 'true' }
                  })
               ]);

               let quizzesData = [];
               if (resFiltered.ok) {
                  const d = await resFiltered.json();
                  quizzesData = Array.isArray(d) ? d : (d && Array.isArray(d.results) ? d.results : []);
               }
               
               if (resAll.ok) {
                  const dAll = await resAll.json();
                  const allArr = Array.isArray(dAll) ? dAll : (dAll && Array.isArray(dAll.results) ? dAll.results : []);
                  allArr.forEach(q => {
                     if (q) {
                        const qChapterId = String(q.chapter_id || q.chapter || (q.chapter && q.chapter.id) || '').trim();
                        if (qChapterId === String(editingChapterId || '').trim()) {
                           if (!quizzesData.some(sq => sq.id === q.id)) {
                              quizzesData.push(q);
                           }
                        }
                     }
                  });
               }

               console.log(`Resolved quizzes for chapter ${editingChapterId}`, quizzesData);
               console.log('quizData:', quizzesData);
               setModalChapterQuizzes(quizzesData);
               setModalQuizData(prev => {
                  const updated = { ...prev };
                  quizzesData.forEach(quiz => {
                     if (quiz && quiz.id) {
                        updated[quiz.id] = quiz;
                        fetchQuizDetails(quiz.id);
                     }
                  });
                  return updated;
               });
            } catch (err) {
               console.error("Error fetching quizzes for chapter", err);
            }
         };
         fetchModalData();
      } else {
         setModalChapterQuizzes([]);
      }
   }, [editingChapterId]);

   const fetchQuizDetails = async (quizId) => {
      setLoadingQuizId(quizId);
      try {
         const token = localStorage.getItem('token');
         const res = await fetch(`/api/quizzes/quizzes/${quizId}/`, {
            headers: {
               'Authorization': `Bearer ${token}`,
               'Bypass-Tunnel-Reminder': 'true'
            }
         });
         if (res.ok) {
            const data = await res.json();
            setModalQuizData(prev => ({ ...prev, [quizId]: data }));
         }
      } catch (err) {
         console.error("Error fetching quiz details", err);
      } finally {
         setLoadingQuizId(null);
      }
   };

   const handleToggleAddQuestion = (quizId) => {
      if (addingQuestionToQuiz === quizId) {
         setAddingQuestionToQuiz(null);
      } else {
         setAddingQuestionToQuiz(quizId);
         fetchQuizDetails(quizId);
      }
   };

   const handleAddQuestionLocal = async (quizId) => {
      const localQuiz = modalQuizData[quizId] || quizzes.find(q => q.id === quizId);
      const questionCount = localQuiz?.questions?.length || 0;
      if (questionCount >= 20) {
         showToast("Cannot add more questions. Limit of 20 questions reached.", "error");
         return;
      }

      try {
         const token = localStorage.getItem('token');
         const res = await fetch('/api/quizzes/questions/', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
               'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify({
               quiz: quizId,
               text: newQuestion.text,
               question_type: 'MCQ',
               points: 1,
               order: 1,
               choices: newQuestion.choices.filter(c => c.text !== '')
            })
         });
         if (res.ok) {
            showToast("Question added successfully!");
            setNewQuestion({ text: '', choices: [{ text: '', is_correct: true }, { text: '', is_correct: false }, { text: '', is_correct: false }] });
            await fetchQuizDetails(quizId);
         } else {
            const err = await res.json();
            const errorMessage = typeof err === 'object' ? Object.values(err).flat().join(', ') : (err.detail || "Failed to add question.");
            showToast(errorMessage, "error");
         }
      } catch {
         showToast("Error adding question.", "error");
      }
   };

   const handleDeleteQuestionLocal = async (quizId, questionId) => {
      try {
         const token = localStorage.getItem('token');
         const res = await fetch(`/api/quizzes/questions/${questionId}/`, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Bypass-Tunnel-Reminder': 'true'
            }
         });
         if (res.ok) {
            showToast("Question removed from pool!");
            await fetchQuizDetails(quizId);
         } else {
            showToast("Failed to delete question.", "error");
         }
      } catch {
         showToast("Error deleting question.", "error");
      }
   };

   const handleUpdateQuestionLocal = async (quizId, questionId, qData) => {
      try {
         const token = localStorage.getItem('token');
         const res = await fetch(`/api/quizzes/questions/${questionId}/`, {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json',
               'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify({
               quiz: quizId,
               text: qData.text,
               question_type: qData.question_type || 'MCQ',
               choices: qData.choices.map(c => ({ text: c.text, is_correct: !!c.is_correct }))
            })
         });
         if (res.ok) {
            showToast("Question updated successfully!");
            setEditingQuestion(null);
            await fetchQuizDetails(quizId);
         } else {
            const err = await res.json();
            showToast(err.non_field_errors?.[0] || "Failed to update question.", "error");
         }
      } catch {
         showToast("Error updating question.", "error");
      }
   };

   const handleCreateQuizLocal = async (courseId, chapterId) => {
      await handleCreateQuiz(courseId, chapterId);
      setTimeout(async () => {
         const token = localStorage.getItem('token');
         const res = await fetch(`/api/quizzes/quizzes/?chapter_id=${chapterId}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Bypass-Tunnel-Reminder': 'true' }
         });
         if (res.ok) {
            const d = await res.json();
            const qArr = Array.isArray(d) ? d : (d && Array.isArray(d.results) ? d.results : []);
            setModalChapterQuizzes(qArr);
         }
      }, 500);
   };

   const avatarSrc = userProfile?.profile_picture || null;

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
                  <a onClick={() => { window.location.hash = ''; setView('instructor-dash'); }} className="text-slate-400 px-4 py-3 flex items-center gap-3.5 rounded-xl font-medium hover:bg-white/5 hover:text-slate-100 transition-all cursor-pointer">
                     <LayoutGrid size={18} />
                     <span className="text-xs uppercase tracking-wider">Home</span>
                  </a>
                  <a onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }} className="bg-purple-500/10 text-purple-300 font-semibold px-4 py-3 flex items-center gap-3.5 rounded-xl transition-all cursor-pointer border border-purple-500/10 hover:bg-purple-500/15">
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


            <main className="flex-1 p-8 md:p-12 overflow-x-hidden">
               <div className="max-w-7xl mx-auto space-y-12">

                  {/* Header */}
                  <div className="flex justify-between items-end border-b border-white/5 pb-8">
                     <div>
                        <h1 className="text-4xl font-black font-headline text-slate-50 tracking-tighter">
                           {selectedCourse ? 'Forge Curriculum' : 'Conceptualize Odyssey'}
                        </h1>
                        <p className="text-slate-400 mt-2">
                           {selectedCourse ? `Refining: ${selectedCourse.title}` : 'Drafting a new learning pathway for the platform.'}
                        </p>
                     </div>
                     <button
                        onClick={handleSaveCourse}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-2xl shadow-purple-500/10 hover:brightness-110 transition-all"
                     >
                        {selectedCourse ? 'Update Architecture' : 'Initialize Course'}
                     </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                     {/* Left Column: Course Identity */}
                     <aside className="lg:col-span-4 space-y-8">
                        <div className="premium-card p-6 rounded-2xl space-y-6 border border-white/5 shadow-2xl">
                           {/* Specialization Select */}
                           <div className="space-y-3">
                              <label className="block text-[10px] font-bold font-headline text-purple-400 ml-1 uppercase tracking-widest">Academic Specialization</label>
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
                        </div>                {selectedCourse ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Chapter Cards */}
                              {chapters.map((ch, index) => (
                                 <div key={ch.id} className="premium-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between group transition-all h-[18rem]">
                                    <div>
                                       <div className="flex justify-between items-start mb-4">
                                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-sm border border-purple-500/20">
                                             {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                          </div>
                                          <div className="flex gap-1">
                                             <button
                                                onClick={() => {
                                                   setEditingChapterId(ch.id);
                                                   setEditChapterData({ title: ch.title, description: ch.description || '', pdfFile: null, order: ch.order });
                                                   quizzes.filter(q => q.chapter_id === ch.id).forEach(quiz => fetchQuizDetails(quiz.id));
                                                }}
                                                className="p-2 text-slate-500 hover:text-purple-400 transition-colors"
                                             >
                                                <Edit size={18} />
                                             </button>
                                             <button onClick={() => handleDeleteChapter(selectedCourse.id, ch.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                                <Trash2 size={18} />
                                             </button>
                                          </div>
                                       </div>
                                       <h3 className="text-xl font-bold font-headline text-slate-50 mb-2 leading-tight line-clamp-2">{ch.title}</h3>
                                       <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                                          {ch.description || 'No description provided.'}
                                       </p>
                                    </div>

                                    {ch.pdf_file && (
                                       <div className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-xl border border-white/5">
                                          <FileText size={16} className="text-purple-400 flex-shrink-0" />
                                          <div className="flex-1 overflow-hidden">
                                             <div className="text-[10px] font-bold text-slate-300 truncate">Syllabus PDF Attached</div>
                                          </div>
                                          <button onClick={() => handleDeleteChapterPDF(selectedCourse.id, ch.id)} className="text-slate-500 hover:text-red-400"><X size={14} /></button>
                                       </div>
                                    )}
                                 </div>
                              ))}

                              {/* New Chapter Form Card */}
                              <div className="premium-card p-6 rounded-2xl border-2 border-dashed border-white/10 bg-transparent flex flex-col justify-center space-y-4">
                                 <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                                       <Plus size={24} className="text-purple-400" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-50 mb-0.5">New Chapter</h3>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Extend the curriculum</p>
                                 </div>

                                 <div className="space-y-3">
                                    <div className="grid grid-cols-4 gap-2">
                                       <input type="number" value={newChapter.order} onChange={e => setNewChapter({ ...newChapter, order: parseInt(e.target.value) || 1 })} className="bg-white/5 border-none rounded-xl p-2.5 text-xs text-center text-slate-100 outline-none focus:ring-1 focus:ring-purple-500/30" placeholder="#" />
                                       <input type="text" placeholder="Title" value={newChapter.title} onChange={e => setNewChapter({ ...newChapter, title: e.target.value })} className="col-span-3 bg-white/5 border-none rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-purple-500/30" />
                                    </div>
                                    <textarea placeholder="Description" value={newChapter.description} onChange={e => setNewChapter({ ...newChapter, description: e.target.value })} className="w-full bg-white/5 border-none rounded-xl p-2.5 text-xs resize-none text-slate-100 focus:ring-1 focus:ring-purple-500/30" rows="2" />
                                    <div className="space-y-1">
                                       <label className="text-[9px] font-bold text-purple-400 uppercase ml-1 select-none">Syllabus PDF (Required)</label>
                                       <input type="file" accept="application/pdf" onChange={e => setNewChapter({ ...newChapter, pdfFile: e.target.files[0] })} className="text-[10px] text-slate-400 w-full" />
                                    </div>
                                    <button onClick={() => handleCreateChapter(selectedCourse.id)} disabled={!newChapter.title || !newChapter.pdfFile} className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/10 transition-all hover:brightness-110 disabled:opacity-50 select-none">
                                       Add Chapter
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="h-[400px] premium-card rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-white/5 space-y-4 text-center px-12">
                              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center relative">
                                 <BookOpen size={32} className="text-slate-600" />
                                 <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-white border-4 border-slate-900">
                                    <Lock size={12} />
                                 </div>
                              </div>
                              <div>
                                 <h3 className="text-xl font-bold text-slate-50 mb-1 font-headline">Curriculum Locked</h3>
                                 <p className="text-slate-400 text-xs max-w-sm leading-relaxed">Save the basic course architecture on the left to unlock the curriculum builder and start adding chapters.</p>
                              </div>
                           </div>
                        )}
                     </section>
                  </div>
               </div>
            </main>

            {/* Dynamic & Isolated Chapter Edit Modal */}
            {editingChapterId && (
               <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200 select-none">
                  <div className="premium-card max-w-3xl w-full p-6 rounded-2xl space-y-5 shadow-2xl border border-white/10 max-h-[92vh] overflow-y-auto">
                     {/* Modal Header */}
                     <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="text-lg font-bold text-slate-50 uppercase tracking-wider">
                           Chapter & Quiz Customizer
                        </h3>
                        <button onClick={() => setEditingChapterId(null)} className="text-slate-400 hover:text-white transition-colors">
                           <X size={20} />
                        </button>
                     </div>

                     {/* Edit Chapter Details */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                           <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Section 1: Details</h4>
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Chapter Title</label>
                              <input
                                 type="text"
                                 value={editChapterData.title}
                                 onChange={e => setEditChapterData({ ...editChapterData, title: e.target.value })}
                                 className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-slate-100 text-sm focus:ring-1 focus:ring-purple-500/50 outline-none"
                                 placeholder="Chapter Title"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Description</label>
                              <textarea
                                 value={editChapterData.description}
                                 onChange={e => setEditChapterData({ ...editChapterData, description: e.target.value })}
                                 className="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-slate-100 text-xs focus:ring-1 focus:ring-purple-500/50 resize-none outline-none"
                                 placeholder="Short Description"
                                 rows="3"
                              />
                           </div>
                           {/* Current PDF Details */}
                           {chapters.find(c => c.id === editingChapterId)?.pdf_file && (
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <FileText size={18} className="text-purple-400" />
                                       <span className="text-xs font-bold text-slate-300 truncate max-w-[160px]">
                                          Current PDF: {chapters.find(c => c.id === editingChapterId).pdf_file.split('/').pop()}
                                       </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <a 
                                          href={chapters.find(c => c.id === editingChapterId).pdf_file} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-1 rounded hover:bg-purple-500/30 transition-colors cursor-pointer select-none"
                                       >
                                          View
                                       </a>
                                       <button 
                                          onClick={() => handleDeleteChapterPDF(selectedCourse.id, editingChapterId)}
                                          className="text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-1 rounded hover:bg-red-500/30 transition-colors select-none"
                                       >
                                          Remove
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           )}
                           <div className="space-y-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 block">Update Syllabus (PDF)</label>
                              <input type="file" accept="application/pdf" onChange={e => setEditChapterData({ ...editChapterData, pdfFile: e.target.files[0] })} className="text-[10px] text-slate-400 block w-full bg-white/5 p-2 rounded-xl border border-white/5 cursor-pointer" />
                           </div>
                           <button
                              onClick={() => { handleUpdateChapter(selectedCourse.id, editingChapterId); setEditingChapterId(null); }}
                              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-500/10 transition-all hover:brightness-110"
                           >
                              Save Enhancements
                           </button>
                        </div>

                        {/* Question & Pool Section */}
                        <div className="space-y-4 border-l border-white/5 pl-4 flex flex-col justify-between">
                           <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Section 2: Active Quizzes</h4>
                              {(() => {
                                 const activeChapterQuizzes = modalChapterQuizzes;
                                 if (activeChapterQuizzes.length === 0) {
                                    return addingQuizToChapter === editingChapterId ? (
                                       <div className="p-3 bg-white/5 rounded-xl border border-dashed border-white/10 space-y-2 animate-in fade-in duration-200 mt-2">
                                          <input
                                             type="text"
                                             placeholder="Quiz Title (e.g. Assessment)"
                                             value={newQuiz.title}
                                             onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })}
                                             className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-purple-500/30"
                                          />
                                          <div className="flex gap-2">
                                             <div className="flex-1 space-y-1">
                                                <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Passing %</label>
                                                <input type="number" placeholder="70" value={newQuiz.passingScore} onChange={e => setNewQuiz({ ...newQuiz, passingScore: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs text-slate-100 outline-none" />
                                             </div>
                                             <div className="flex-1 space-y-1">
                                                <label className="text-[8px] font-bold text-slate-400 uppercase ml-1">Goal</label>
                                                <div className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs text-slate-500 font-bold">20 Questions</div>
                                             </div>
                                          </div>
                                          <div className="flex gap-2 pt-1">
                                             <button onClick={() => handleCreateQuizLocal(selectedCourse.id, editingChapterId)} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:brightness-110">Initialize Quiz</button>
                                             <button onClick={() => setAddingQuizToChapter(null)} className="px-3 text-slate-500 text-[10px] font-bold uppercase">Cancel</button>
                                          </div>
                                       </div>
                                    ) : (
                                       <button onClick={() => setAddingQuizToChapter(editingChapterId)} className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 transition-all text-[10px] font-bold uppercase tracking-widest mt-2">
                                          <Plus size={14} /> Add First Quiz
                                       </button>
                                    );
                                 }
                                 return (
                                    <div className="space-y-3 mt-2">
                                       {activeChapterQuizzes.map(quiz => {
                                          const localQuiz = modalQuizData[quiz.id] || quiz;
                                          const questionCount = localQuiz.questions?.length || 0;
                                          const poolReady = questionCount === 20;

                                          return (
                                             <div key={quiz.id} className="premium-card p-3 rounded-xl border border-white/5 space-y-2">
                                                <div className="flex justify-between items-center">
                                                   <div className="flex items-center gap-1.5 overflow-hidden">
                                                      <div className={`w-4 h-4 rounded flex items-center justify-center ${poolReady ? 'bg-emerald-500 text-white' : 'bg-purple-500/20 text-purple-300'}`}>
                                                         {poolReady ? <CheckCircle2 size={10} /> : <HelpCircle size={10} />}
                                                      </div>
                                                      <div className="flex flex-col select-none">
                                                         <span className="text-xs font-bold text-slate-100 truncate max-w-[120px]">{quiz.title}</span>
                                                         <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-tighter">Pool: {questionCount}/20</span>
                                                      </div>
                                                   </div>
                                                   <button
                                                      onClick={() => handleToggleAddQuestion(quiz.id)}
                                                      disabled={questionCount >= 20}
                                                      className={`text-[8px] font-bold uppercase tracking-wider border px-2.5 py-1.5 rounded-lg transition-all ${questionCount >= 20 ? 'opacity-40 cursor-not-allowed border-white/5' : 'text-purple-300 border-purple-500/30 hover:bg-purple-500/10'}`}
                                                   >
                                                      {addingQuestionToQuiz === quiz.id ? 'Close' : questionCount >= 20 ? 'Pool Filled' : '+ Ques'}
                                                   </button>
                                                </div>

                                                {/* Question List and Inline deletion */}
                                                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                                                   {localQuiz.questions && localQuiz.questions.length > 0 ? (
                                                      localQuiz.questions.map((q, idx) => (
                                                         <div key={q.id || idx} className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-200 space-y-2">
                                                            <div className="flex justify-between items-start gap-2">
                                                               <span className="font-bold text-slate-100 leading-normal">{idx + 1}. {q.text}</span>
                                                               <div className="flex gap-1.5 flex-shrink-0">
                                                                  <button
                                                                     onClick={() => setEditingQuestion(editingQuestion && editingQuestion.id === q.id ? null : { id: q.id, text: q.text, choices: q.choices ? q.choices.map(c => ({ ...c })) : [] })}
                                                                     className="text-slate-600 hover:text-purple-400 transition-colors"
                                                                  >
                                                                     <Edit3 size={12} />
                                                                  </button>
                                                                  <button onClick={() => handleDeleteQuestionLocal(quiz.id, q.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                                                                     <Trash2 size={12} />
                                                                  </button>
                                                               </div>
                                                            </div>
                                                            {/* Mapping Choices dynamically for nested display or editing form */}
                                                            {editingQuestion && editingQuestion.id === q.id ? (
                                                               <div className="space-y-3 mt-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                                                  <div className="space-y-1">
                                                                     <label className="text-[8px] font-bold text-purple-400 uppercase">Question Prompt</label>
                                                                     <input
                                                                        type="text"
                                                                        value={editingQuestion.text}
                                                                        onChange={e => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                                                                        className="w-full bg-white/5 border-none rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-purple-500/50 outline-none"
                                                                     />
                                                                  </div>
                                                                  <div className="space-y-1.5">
                                                                     <label className="text-[8px] font-bold text-purple-400 uppercase">Choices</label>
                                                                     {editingQuestion.choices && editingQuestion.choices.map((choice, cidx) => (
                                                                        <div key={cidx} className="flex gap-2 items-center">
                                                                           <button
                                                                              onClick={() => {
                                                                                 const nc = editingQuestion.choices.map((c, i) => ({ ...c, is_correct: i === cidx }));
                                                                                 setEditingQuestion({ ...editingQuestion, choices: nc });
                                                                              }}
                                                                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${choice.is_correct ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                                                           >
                                                                              {choice.is_correct ? <CheckCircle2 size={12} /> : <div className="w-1 h-1 rounded-full bg-current" />}
                                                                           </button>
                                                                           <input
                                                                              type="text"
                                                                              value={choice.text}
                                                                              onChange={e => {
                                                                                 const nc = [...editingQuestion.choices];
                                                                                 nc[cidx].text = e.target.value;
                                                                                 setEditingQuestion({ ...editingQuestion, choices: nc });
                                                                              }}
                                                                              className="flex-1 bg-white/5 border-none rounded-lg p-1.5 text-xs text-slate-100 focus:ring-1 focus:ring-purple-500/50 outline-none"
                                                                           />
                                                                           <button
                                                                              onClick={() => {
                                                                                 const nc = editingQuestion.choices.filter((_, i) => i !== cidx);
                                                                                 setEditingQuestion({ ...editingQuestion, choices: nc });
                                                                              }}
                                                                              className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                                                                           >
                                                                              <Trash2 size={12} />
                                                                           </button>
                                                                        </div>
                                                                     ))}
                                                                     {editingQuestion.choices && editingQuestion.choices.length < 4 && (
                                                                        <button
                                                                           onClick={() => {
                                                                              const nc = [...editingQuestion.choices, { text: '', is_correct: false }];
                                                                              setEditingQuestion({ ...editingQuestion, choices: nc });
                                                                           }}
                                                                           className="text-[9px] font-bold uppercase text-purple-400 hover:text-purple-300 transition-colors mt-1"
                                                                        >
                                                                           + Add Choice
                                                                        </button>
                                                                     )}
                                                                  </div>
                                                                  <div className="flex gap-2 pt-2">
                                                                     <button
                                                                        onClick={() => handleUpdateQuestionLocal(quiz.id, q.id, editingQuestion)}
                                                                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-[10px] uppercase font-bold tracking-wider py-1.5 rounded-lg transition-all"
                                                                     >
                                                                        Save
                                                                     </button>
                                                                     <button
                                                                        onClick={() => setEditingQuestion(null)}
                                                                        className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] uppercase font-bold tracking-wider py-1.5 rounded-lg transition-all"
                                                                     >
                                                                        Cancel
                                                                     </button>
                                                                  </div>
                                                               </div>
                                                            ) : (
                                                               <div className="grid grid-cols-2 gap-1.5 pl-1.5 border-l border-white/10 ml-1">
                                                                  {q.choices && q.choices.map((choice, cidx) => (
                                                                     <div 
                                                                        key={choice.id || cidx} 
                                                                        className={`p-1.5 rounded-lg text-[10px] leading-tight border ${choice.is_correct ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-white/5 border-white/5 text-slate-400'}`}
                                                                     >
                                                                        {choice.text}
                                                                        {choice.is_correct && <span className="text-[8px] uppercase font-black text-emerald-400 ml-1">(Correct)</span>}
                                                                     </div>
                                                                  ))}
                                                               </div>
                                                            )}
                                                         </div>
                                                      ))
                                                   ) : (
                                                      <span className="text-[9px] font-bold uppercase text-slate-600 tracking-wider">No questions added yet</span>
                                                   )}
                                                </div>

                                                {/* Isolated Add Question Expansion */}
                                                {addingQuestionToQuiz === quiz.id && (
                                                   <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2 mt-2 animate-in slide-in-from-top-1 duration-200">
                                                      <div className="space-y-1">
                                                         <label className="text-[8px] font-bold text-purple-400 uppercase">Question Prompt</label>
                                                         <input
                                                            type="text"
                                                            placeholder="e.g. Fundamental concept of..."
                                                            value={newQuestion.text}
                                                            onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                                            className="w-full bg-white/5 border-none rounded-lg p-2 text-xs text-slate-100 focus:ring-1 focus:ring-purple-500/50 outline-none"
                                                         />
                                                      </div>

                                                      <div className="space-y-1.5">
                                                         {newQuestion.choices.map((choice, idx) => (
                                                            <div key={idx} className="flex gap-2 items-center">
                                                               <button
                                                                  onClick={() => {
                                                                     const nc = newQuestion.choices.map((c, i) => ({ ...c, is_correct: i === idx }));
                                                                     setNewQuestion({ ...newQuestion, choices: nc });
                                                                  }}
                                                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${choice.is_correct ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                                               >
                                                                  {choice.is_correct ? <CheckCircle2 size={12} /> : <div className="w-1 w-1 rounded-full bg-current" />}
                                                               </button>
                                                               <input
                                                                  type="text"
                                                                  placeholder={`Choice ${idx + 1}`}
                                                                  value={choice.text}
                                                                  onChange={e => {
                                                                     const nc = [...newQuestion.choices];
                                                                     nc[idx].text = e.target.value;
                                                                     setNewQuestion({ ...newQuestion, choices: nc });
                                                                  }}
                                                                  className="flex-1 bg-white/5 border-none rounded-xl p-2 text-[10px] text-slate-100 focus:ring-1 focus:ring-purple-500/30 outline-none"
                                                               />
                                                               {newQuestion.choices.length > 3 && (
                                                                  <button
                                                                     onClick={() => {
                                                                        const nc = newQuestion.choices.filter((_, i) => i !== idx);
                                                                        if (choice.is_correct && nc.length > 0) nc[0].is_correct = true;
                                                                        setNewQuestion({ ...newQuestion, choices: nc });
                                                                     }}
                                                                     className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                                                                  >
                                                                     <Trash2 size={12} />
                                                                  </button>
                                                               )}
                                                            </div>
                                                         ))}

                                                         {newQuestion.choices.length < 4 && (
                                                            <button
                                                               onClick={() => setNewQuestion({ ...newQuestion, choices: [...newQuestion.choices, { text: '', is_correct: false }] })}
                                                               className="w-full py-1.5 border border-dashed border-white/10 rounded-xl text-[8px] font-bold text-slate-500 uppercase tracking-widest hover:text-purple-300 hover:border-purple-500/30 transition-all"
                                                            >
                                                               + Add Choice
                                                            </button>
                                                         )}
                                                      </div>

                                                      <button
                                                         onClick={() => handleAddQuestionLocal(quiz.id)}
                                                         disabled={!newQuestion.text || newQuestion.choices.filter(c => c.text !== '').length < 3}
                                                         className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold text-[9px] uppercase tracking-wider shadow-lg shadow-purple-500/10 hover:brightness-110 disabled:opacity-40 transition-all select-none"
                                                      >
                                                         Add Question
                                                      </button>
                                                   </div>
                                                )}
                                             </div>
                                          );
                                       })}
                                    </div>
                                 );
                              })()}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
    </div>
  );
}
