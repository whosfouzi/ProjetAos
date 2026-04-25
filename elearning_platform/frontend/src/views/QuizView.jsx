import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Brain, 
  CheckCircle2, 
  X,
  HelpCircle,
  Clock,
  BookOpen,
  Award,
  ArrowRight as ArrowRightIcon
} from 'lucide-react';

/**
 * QuizView — Stitch "Aura Slate" Quiz Assessment
 */
export default function QuizView({
  activeQuiz, activeAttempt, answers, setAnswers, quizResult,
  submitQuiz, userRole,
  selectedCourse, setView, fetchMyCourses,
  setStudyMode
}) {
  // Filter questions based on activeAttempt.selected_questions if available
  const allQuestions = activeQuiz.questions || [];
  const selectedQuestionIds = activeAttempt?.selected_questions || [];
  
  const questions = selectedQuestionIds.length > 0
    ? allQuestions.filter(q => selectedQuestionIds.includes(q.id))
    : allQuestions;
    
  const total = questions.length;
  const [currentIdx, setCurrentIdx] = useState(0);

  const current = questions[currentIdx];
  const progressPct = total > 0 ? Math.round(((currentIdx + 1) / total) * 100) : 0;
  const selectedChoice = current ? answers[current.id] : null;
  const allAnswered = questions.every(q => answers[q.id]);
  const isLast = currentIdx === total - 1;

  const handleBack = () => setCurrentIdx(i => Math.max(0, i - 1));
  const handleNext = () => {
    if (isLast) {
      submitQuiz();
    } else {
      setCurrentIdx(i => Math.min(total - 1, i + 1));
    }
  };

  const choiceLabels = ['A', 'B', 'C', 'D', 'E'];

  // ── Results screen ──────────────────────────────────────────────────────────
  if (quizResult) {
    const passed = quizResult.passed;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[var(--bg-app)] text-[var(--on-surface)] font-body selection:bg-primary selection:text-on-primary transition-colors duration-500">
        {/* Ambient glows */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: passed ? 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)' }} />
        </div>

        <div className="w-full max-w-xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-8xl mb-6">{passed ? '🎉' : (activeAttempt?.attempt_number >= 2 ? '❌' : '📚')}</div>
          <div className="space-y-2">
            <h1 className="font-headline font-black text-5xl tracking-tighter" style={{ color: passed ? 'var(--primary)' : 'var(--error)' }}>
              {passed ? 'Assessment Passed!' : (activeAttempt?.attempt_number >= 2 ? 'Assessment Failed' : 'Keep Studying')}
            </h1>
            <p className="text-[var(--on-surface-variant)] font-light text-lg">
              {passed 
                ? `You achieved a score of ${quizResult.score}%` 
                : (activeAttempt?.attempt_number >= 2 
                    ? `Final score: ${quizResult.score}%. No more attempts remaining.` 
                    : `You achieved a score of ${quizResult.score}%. One final attempt available.`)}
            </p>
          </div>

          <div className="text-7xl font-headline font-black my-6 tracking-tighter" style={{ color: passed ? 'var(--primary)' : 'var(--error)' }}>
            {quizResult.score}%
          </div>

          <div className="glass-panel rounded-3xl p-8 text-left grid grid-cols-2 gap-8 border border-white/5 bg-[var(--glass-bg)] backdrop-blur-xl">
            <div>
              <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-black mb-1">Scholarship Module</p>
              <p className="font-bold text-[var(--on-surface)] line-clamp-1">{activeQuiz.title}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-black mb-1">Integrity Status</p>
              <p className="font-black uppercase tracking-widest text-sm" style={{ color: passed ? 'var(--primary)' : 'var(--error)' }}>{passed ? 'VALIDATED' : 'REJECTED'}</p>
            </div>
          </div>

          {!passed && activeAttempt?.attempt_number < 2 && (
             <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <HelpCircle size={16} />
                One Retake Available with Different Questions
             </div>
          )}

          <button
            onClick={() => {
              if (passed) {
                setStudyMode(true);
                setView('course-detail');
              } else {
                setView('course-detail');
                fetchMyCourses();
              }
            }}
            className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-2xl text-white"
            style={passed
              ? { background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', boxShadow: '0 0 20px var(--primary-glow)' }
              : { background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', boxShadow: '0 0 20px var(--primary-glow)' }
            }
          >
            {passed ? 'Enter Study Mode' : (activeAttempt?.attempt_number >= 2 ? 'Return to Research' : 'Prepare for Retake')}
          </button>
        </div>
      </div>
    );
  }

  // ── Question screen ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--on-surface)] font-body flex flex-col selection:bg-primary selection:text-on-primary transition-colors duration-500">
      
      {/* ── Top bar ── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[var(--bg-app)]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-12">
          <div className="text-2xl font-black tracking-tighter text-primary uppercase cursor-pointer" onClick={() => setView('courses')}>Aura Scholar</div>
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-[var(--surface-high)]/10 border border-white/5">
             <Brain size={14} className="text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Knowledge Assessment</span>
          </div>
        </div>
        <button
          onClick={() => {
            if (selectedCourse?.enrollment_id) setView('course-detail');
            else setView('my-courses');
          }}
          className="text-[10px] font-black tracking-widest uppercase text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all"
        >
          Abort Mission
        </button>
      </header>

      {/* ── Main ── */}
      <main className="pt-32 pb-36 px-6 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center">

        {/* Progress bar */}
        <div className="w-full mb-16 space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
               <p className="text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-widest">Active Module</p>
               <h4 className="text-sm font-bold text-[var(--on-surface)]">{activeQuiz.title}</h4>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-primary font-black uppercase tracking-widest">Question {currentIdx + 1} of {total}</p>
               <p className="text-2xl font-black text-[var(--on-surface)]">{progressPct}%</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[var(--surface-high)]/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary to-secondary"
              style={{ width: `${progressPct}%`, boxShadow: '0 0 15px var(--primary-glow)' }}
            />
          </div>
        </div>

        {/* Question card */}
        {current && (
          <section className="w-full flex flex-col items-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-full glass-panel p-12 md:p-16 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden bg-[var(--glass-bg)] backdrop-blur-xl">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Query {currentIdx + 1}</span>
                <h2 className="text-3xl md:text-5xl font-black font-headline text-[var(--on-surface)] leading-tight tracking-tight">
                  {current.text}
                </h2>
              </div>
            </div>

            {/* Answer choices */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              {current.choices.map((choice, idx) => {
                const isSelected = selectedChoice === choice.id;
                const label = choiceLabels[idx] || String(idx + 1);
                return (
                  <button
                    key={choice.id}
                    disabled={!!quizResult}
                    onClick={() => !quizResult && setAnswers({ ...answers, [current.id]: choice.id })}
                    className={`group relative flex items-center p-8 rounded-[2rem] text-left transition-all duration-300 active:scale-95 border ${isSelected ? 'bg-primary/10 border-primary/40 shadow-[0_0_40px_rgba(192,193,255,0.1)]' : 'bg-[var(--surface-high)]/5 border-white/5 hover:bg-white/5'}`}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-6 transition-all duration-500 ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)]'}`}>
                      <span className="font-headline font-black text-sm">{label}</span>
                    </div>
                    <span className={`text-lg font-medium leading-relaxed transition-colors ${isSelected ? 'text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)]'}`}>
                      {choice.text}
                    </span>
                    {isSelected && (
                      <div className="absolute right-8">
                        <CheckCircle2 size={24} className="text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ── Bottom nav ── */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-12 py-8 bg-[var(--bg-app)]/80 backdrop-blur-xl border-t border-white/5">
        <button
          onClick={handleBack}
          disabled={currentIdx === 0}
          className="flex items-center gap-3 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-white/5 transition-all disabled:opacity-0"
        >
          <ArrowLeft size={16} />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!selectedChoice || (isLast && userRole === 'instructor')}
          className="flex items-center gap-3 px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-secondary text-white shadow-2xl shadow-primary/20 hover:scale-105"
        >
          {isLast
            ? (userRole === 'instructor' ? 'Preview Mode' : 'Complete Assessment')
            : 'Next Question'}
          {isLast ? <Check size={18} /> : <ArrowRight size={18} />}
        </button>
      </footer>
    </div>
  );
}
