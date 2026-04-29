import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Sliders, 
  LogOut, 
  User, 
  BookOpen, 
  LayoutGrid, 
  Users, 
  Video, 
  ClipboardList, 
  HelpCircle,
  Calendar,
  Edit,
  AlertTriangle,
  Mail,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

/**
 * ProfileView — Stitch "Aura Slate" Profile & Settings
 */
export default function ProfileView({
  userProfile, userRole, username,
  profilePicFile, setProfilePicFile,
  bioInput, setBioInput,
  handleUpdateProfile,
  setView, logout,
  dropdownRef, dropdownOpen, setDropdownOpen,
  fetchMyCourses, fetchInstructorCourses, setSelectedCourse, setNewCourse,
  initialSection = 'profile',
  fetchCourseRoster
}) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [editUsername, setEditUsername] = useState(username || '');
  const [editEmail, setEditEmail] = useState(userProfile?.email || '');

  useEffect(() => {
    setEditUsername(username || '');
    setEditEmail(userProfile?.email || '');
  }, [username, userProfile]);

  const avatarSrc = (profilePicFile instanceof Blob)
    ? URL.createObjectURL(profilePicFile)
    : userProfile?.profile_picture || null;

  const joinedDate = userProfile?.date_joined
    ? new Date(userProfile.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
    : 'N/A';

  return (
    <div className="bg-[var(--bg-app)] text-[var(--on-surface)] font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col transition-colors duration-500">
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
 
      <div className="flex flex-1 pt-8">
        {/* SideNavBar — Only for Instructor */}
        {userRole === 'instructor' && (
          <aside className="h-[calc(100vh-5rem)] w-72 sticky top-20 flex flex-col bg-[var(--bg-app)] shadow-[1px_0_0_0_rgba(255,255,255,0.05)] z-40 hidden md:flex py-8">
            <div className="px-6 mb-10">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-high)]/10 border border-white/5">
                {avatarSrc ? (
                  <img className="h-10 w-10 rounded-full object-cover" src={avatarSrc} alt={username} />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                     <span className="material-symbols-outlined text-primary">person</span>
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
              <a onClick={() => { setSelectedCourse(null); setNewCourse({ title: '', description: '', specialization: '' }); setView('course-editor'); }} className="text-[var(--on-surface-variant)] px-6 py-4 opacity-70 flex items-center gap-4 font-body text-sm uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all cursor-pointer">
                <BookOpen size={18} /> Curriculum
              </a>
              <a className="text-[var(--on-surface-variant)] px-6 py-4 opacity-70 flex items-center gap-4 font-body text-sm uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all cursor-pointer">
                <Video size={18} /> Live Sessions
              </a>
              <a className="text-[var(--on-surface-variant)] px-6 py-4 opacity-70 flex items-center gap-4 font-body text-sm uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all cursor-pointer">
                <ClipboardList size={18} /> Assignments
              </a>
              <a onClick={() => setActiveSection('settings')} className="text-[var(--on-surface-variant)] px-6 py-4 opacity-70 flex items-center gap-4 font-body text-sm uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all cursor-pointer">
                <Sliders size={18} /> Settings
              </a>
            </nav>
          </aside>
        )}
 
        {/* Main Content */}
        <main className="flex-1 p-8 md:p-12 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Page header */}
            <section className="mb-10">
              <span className="text-primary font-headline text-[10px] uppercase tracking-[0.3em] font-black">Identity Portal</span>
              <h1 className="text-5xl font-black font-headline text-[var(--on-surface)] tracking-tight mt-2">
                {activeSection === 'settings' ? 'Scholar Settings' : 'Scholar Identity'}
              </h1>
              <p className="text-[var(--on-surface-variant)] text-lg mt-4 font-light leading-relaxed">
                {activeSection === 'settings'
                  ? 'Refine your academic profile and personal metadata.'
                  : 'Your unique scholarship signature within the Atheneum.'}
              </p>
            </section>
 
            {/* Section tabs */}
            <div className="flex border-b border-white/5 gap-10 mb-10 pb-4">
              {[
                { key: 'profile', icon: <User size={16} />, label: 'Profile' },
                { key: 'settings', icon: <Sliders size={16} />, label: 'Settings' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={`pb-4 text-[11px] uppercase tracking-[0.2em] font-black transition-all flex items-center gap-2 relative ${activeSection === tab.key ? 'text-primary' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeSection === tab.key && <div className="absolute -bottom-[17px] left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_var(--primary-glow)]" />}
                </button>
              ))}
            </div>
 
            {/* ── Profile view ── */}
            {activeSection === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-panel p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Avatar */}
                    <div className="relative group flex-shrink-0">
                      <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-primary/20 bg-[var(--surface-low)] flex items-center justify-center">
                        {avatarSrc
                          ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                          : <User size={64} className="text-primary/30" />
                        }
                      </div>
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                        {userRole}
                      </span>
                    </div>
 
                    {/* Info */}
                    <div className="flex-1 w-full space-y-8">
                      <div>
                        <h2 className="font-headline text-4xl font-black text-[var(--on-surface)]">{username}</h2>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-2 text-[var(--on-surface-variant)] text-xs">
                             <Calendar size={14} />
                             Joined {joinedDate}
                           </div>
                           <div className="w-1 h-1 rounded-full bg-white/10" />
                           <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                             <ShieldCheck size={14} />
                             Verified Scholar
                           </div>
                        </div>
                      </div>
 
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-black">Email Residence</p>
                          <div className="flex items-center gap-2 text-[var(--on-surface)] font-medium">
                             <Mail size={16} className="text-primary" />
                             {userProfile?.email || 'scholar@atheneum.edu'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-black">Account Integrity</p>
                          <div className="flex items-center gap-2 text-[var(--on-surface)] font-medium">
                             <CheckCircle2 size={16} className="text-emerald-400" />
                             Full Access
                          </div>
                        </div>
                      </div>
 
                      {userProfile?.bio && (
                        <div className="pt-8 border-t border-white/5">
                          <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest font-black mb-3">Academic Biography</p>
                          <p className="text-[var(--on-surface-variant)] leading-relaxed font-light italic">"{userProfile.bio}"</p>
                        </div>
                      )}
                    </div>
                  </div>
 
                  <div className="mt-12 flex gap-4 justify-end">
                    <button
                      onClick={() => setActiveSection('settings')}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-white/10 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
                    >
                      <Edit size={16} />
                      Modify Identity
                    </button>
                    <button
                      onClick={() => setView(userRole === 'instructor' ? 'instructor-dash' : 'courses')}
                      className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/10 hover:scale-105 active:scale-95"
                    >
                      Return to Research
                    </button>
                  </div>
                </div>
              </div>
            )}
 
            {/* ── Settings view ── */}
            {activeSection === 'settings' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-panel p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Avatar upload */}
                    <div className="relative group cursor-pointer flex-shrink-0">
                      <label htmlFor="pfp-upload" className="cursor-pointer">
                        <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-primary/20 bg-[var(--surface-low)] flex items-center justify-center">
                          {avatarSrc
                            ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                            : <User size={64} className="text-primary/30" />
                          }
                        </div>
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Edit size={32} className="text-white" />
                        </div>
                        <p className="text-center text-[10px] text-[var(--on-surface-variant)] mt-4 font-black uppercase tracking-widest">Replace Visual</p>
                      </label>
                      <input type="file" accept="image/*" id="pfp-upload" className="hidden" onChange={e => setProfilePicFile(e.target.files[0])} />
                    </div>
 
                    {/* Editable fields */}
                    <div className="flex-1 space-y-6 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80 ml-2">Display Name</label>
                          <input
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[var(--on-surface)] outline-none transition-all placeholder:text-slate-600 focus:ring-2 focus:ring-primary/40 focus:bg-white/10"
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/80 ml-2">Email Address</label>
                          <input
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[var(--on-surface)] outline-none transition-all placeholder:text-slate-600 focus:ring-2 focus:ring-primary/40 focus:bg-white/10"
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/80 ml-2">Biography</label>
                        <textarea
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-[var(--on-surface)] outline-none transition-all placeholder:text-slate-600 focus:ring-2 focus:ring-primary/40 focus:bg-white/10 resize-none font-light"
                          rows={4}
                          value={bioInput}
                          onChange={e => setBioInput(e.target.value)}
                          placeholder="Craft your scholarship narrative..."
                        />
                      </div>
                    </div>
                  </div>
 
                  <div className="mt-12 flex gap-4 justify-end">
                    <button onClick={() => setActiveSection('profile')} className="px-8 py-3.5 rounded-2xl border border-white/10 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">
                      Discard
                    </button>
                    <button
                      onClick={() => handleUpdateProfile({ username: editUsername, email: editEmail, bio: bioInput })}
                      className="px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/10 hover:scale-105 active:scale-95"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
 
                {/* Danger Zone */}
                <section className="mt-12">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle size={20} className="text-error" />
                    <h2 className="text-xl font-headline font-black text-error uppercase tracking-widest">Danger Zone</h2>
                  </div>
                  <div className="glass-panel p-10 rounded-[3rem] border-error/20 bg-error/5 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl space-y-2">
                      <h3 className="text-xl font-bold text-error">Terminate Scholarship</h3>
                      <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed font-light">
                        Permanent deletion of your scholar identity. This action will purge all academic progress, research data, and credentials from the Atheneum.
                      </p>
                    </div>
                    <button
                      className="px-8 py-4 rounded-2xl border border-error/50 text-error font-black uppercase tracking-widest text-[10px] hover:bg-error hover:text-white transition-all shadow-lg shadow-error/10"
                      onClick={() => window.confirm('Are you absolutely sure? This action cannot be undone.') && logout()}
                    >
                      Delete Account
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
