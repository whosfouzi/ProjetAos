import React from 'react';
import { 
  Bell, 
  Sliders, 
  LogOut, 
  Search,
  BookOpen,
  LayoutGrid,
  Users,
  Video,
  ClipboardList,
  HelpCircle,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  Star,
  Plus,
  ArrowRight,
  Filter,
  User,
  ChevronDown
} from 'lucide-react';

// ── Domain color palettes ──────────────────────────────────────────────────
const DOMAIN_PALETTES = [
  { grad: 'from-blue-500 to-cyan-400',     glow: 'rgba(59,130,246,0.25)',  badge: '#93c5fd', bg: 'rgba(59,130,246,0.05)'  },
  { grad: 'from-violet-500 to-purple-400', glow: 'rgba(139,92,246,0.25)', badge: '#c4b5fd', bg: 'rgba(139,92,246,0.05)' },
  { grad: 'from-emerald-500 to-teal-400',  glow: 'rgba(16,185,129,0.25)', badge: '#6ee7b7', bg: 'rgba(16,185,129,0.05)' },
  { grad: 'from-amber-500 to-orange-400',  glow: 'rgba(245,158,11,0.25)', badge: '#fcd34d', bg: 'rgba(245,158,11,0.05)' },
  { grad: 'from-pink-500 to-rose-400',     glow: 'rgba(236,72,153,0.25)', badge: '#f9a8d4', bg: 'rgba(236,72,153,0.05)' },
  { grad: 'from-indigo-500 to-blue-400',   glow: 'rgba(99,102,241,0.25)', badge: '#a5b4fc', bg: 'rgba(99,102,241,0.05)' },
  { grad: 'from-red-500 to-amber-400',     glow: 'rgba(239,68,68,0.25)',  badge: '#fca5a5', bg: 'rgba(239,68,68,0.05)'  },
  { grad: 'from-sky-500 to-indigo-400',    glow: 'rgba(14,165,233,0.25)', badge: '#7dd3fc', bg: 'rgba(14,165,233,0.05)' },
];

const DOMAIN_KEYWORDS = [
  ['computer', 'software', 'programming', 'tech', 'code', 'data', 'network', 'cyber', 'information'],
  ['math', 'calcul', 'algebra', 'statistic', 'logic', 'analysis'],
  ['language', 'english', 'french', 'arabic', 'spanish', 'chinese', 'mandarin', 'literature', 'communication'],
  ['business', 'economic', 'finance', 'management', 'marketing', 'commerce', 'accounting'],
  ['art', 'design', 'music', 'film', 'visual', 'creative', 'media', 'graphic'],
  ['science', 'physics', 'chemistry', 'biology', 'quantum', 'natural'],
  ['history', 'philosophy', 'social', 'political', 'geography', 'sociology'],
  ['engineer', 'mechanical', 'electrical', 'civil', 'industrial'],
];

function getDomainPalette(domain = '', index = 0) {
  if (!domain) return DOMAIN_PALETTES[index % DOMAIN_PALETTES.length];
  const lower = domain.toLowerCase();
  for (let i = 0; i < DOMAIN_KEYWORDS.length; i++) {
    if (DOMAIN_KEYWORDS[i].some(kw => lower.includes(kw))) return DOMAIN_PALETTES[i];
  }
  return DOMAIN_PALETTES[index % DOMAIN_PALETTES.length];
}

/**
 * CoursesView — Stitch "Aura Slate" Course Catalog
 */
export default function CoursesView({
  courses, searchQuery, setSearchQuery, selDomainId, setSelDomainId,
  selSpecId, setSelSpecId, catalogDomains, catalogSpecializations,
  catalogPage, setCatalogPage, catalogTotalPages,
  fetchFilteredSpecs, setCatalogSpecializations,
  fetchCourseDetail, enrollCourse, userRole,
  setView, fetchMyCourses,
  logout, userProfile, username, dropdownRef, dropdownOpen, setDropdownOpen,
  fetchInstructorCourses, setSelectedCourse, setNewCourse, fetchCourseRoster
}) {
  
  const avatarSrc = userProfile?.profile_picture || null;
  const filteredCourses = courses;

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

      <div className="w-full">
        <div className="p-12 max-w-[1600px] mx-auto space-y-16">
          
          {/* Header */}
          <header className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-1 bg-primary rounded-full"></div>
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Scholar Catalog</span>
            </div>
            <div className="max-w-2xl">
              <h1 className="font-headline text-6xl md:text-8xl font-black text-[var(--on-surface)] tracking-tighter leading-[0.9] mb-6">
                Explore the <span className="text-primary italic">Atheneum.</span>
              </h1>
              <p className="font-body text-lg text-[var(--on-surface-variant)] max-w-lg leading-relaxed">
                Discover curated pathways designed to transform curiosity into mastery. Enroll in any course to begin your academic odyssey.
              </p>
            </div>
          </header>

          {/* Search and Filters */}
          <section className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-high)]/10 border border-white/10 rounded-2xl py-3 pl-12 pr-5 text-[var(--on-surface)] placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={selDomainId}
                  onChange={e => {
                    const dId = e.target.value;
                    setSelDomainId(dId);
                    setSelSpecId('');
                    setCatalogPage(1);
                    if (dId) fetchFilteredSpecs(dId);
                    else setCatalogSpecializations([]);
                  }}
                  className="h-full bg-[var(--surface-high)]/10 border border-white/10 rounded-2xl pl-4 pr-10 py-3 text-[var(--on-surface)] appearance-none outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm cursor-pointer min-w-[160px]"
                  style={{ backgroundColor: 'var(--surface-high)', color: 'var(--on-surface)' }}
                >
                  <option value="">All Domains</option>
                  {catalogDomains.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selSpecId}
                  onChange={e => { setSelSpecId(e.target.value); setCatalogPage(1); }}
                  className="h-full bg-[var(--surface-high)]/10 border border-white/10 rounded-2xl pl-4 pr-10 py-3 text-[var(--on-surface)] appearance-none outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm cursor-pointer min-w-[160px] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--surface-high)', color: 'var(--on-surface)' }}
                  disabled={!selDomainId}
                >
                  <option value="">All Specialties</option>
                  {catalogSpecializations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </section>

          {/* Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course, idx) => {
              const palette = getDomainPalette(course.domain, idx);
              return (
                <div 
                  key={course.id} 
                  onClick={() => fetchCourseDetail(course.id)}
                  className="glass-panel rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-300 flex flex-col border border-white/5 shadow-lg group cursor-pointer relative overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${palette.grad}`}></div>
                  
                  {/* Course Visual Banner */}
                  <div className="rounded-xl overflow-hidden mb-4 relative bg-[var(--surface-low)] flex items-center justify-center h-32 border border-[var(--glass-border)] group-hover:border-primary/20 transition-all duration-300">
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, ${palette.badge} 1px, transparent 0)`,
                        backgroundSize: '20px 20px'
                    }}></div>
                    
                    <div 
                      className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                      style={{ background: palette.bg, border: `1px solid ${palette.badge}40` }}
                    >
                      <BookOpen size={22} style={{ color: palette.badge }} />
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span 
                        className="px-2.5 py-1 border text-[9px] font-bold uppercase rounded-lg tracking-wider"
                        style={{ background: `${palette.badge}18`, color: palette.badge, borderColor: `${palette.badge}30` }}
                      >
                        {course.domain || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1.5">
                    <span className="text-[9px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest block">
                      {course.specialization || 'General Studies'}
                    </span>
                    <h3 className="font-bold text-base text-[var(--on-surface)] line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-[var(--on-surface-variant)] text-xs line-clamp-2 leading-relaxed">
                      {course.description || 'No description available.'}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${palette.badge}20` }}>
                        <User size={11} style={{ color: palette.badge }} />
                      </div>
                      <span className="text-[9px] font-bold text-[var(--on-surface-variant)] uppercase tracking-widest">Faculty Lead</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: palette.badge }}>
                      <span>View</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
          
          {/* Pagination */}
          {catalogTotalPages > 1 && (
            <div className="flex justify-center items-center gap-6 pt-12 border-t border-white/5">
              <button 
                disabled={catalogPage === 1}
                onClick={() => setCatalogPage(catalogPage - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-[var(--surface-high)]/10 border border-white/5 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <ChevronRight className="rotate-180 transition-transform group-hover:-translate-x-1" size={14} />
                Previous Cycle
              </button>
              
              <div className="flex items-center gap-3">
                <div className="h-1 w-8 bg-primary rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  {catalogPage} / {catalogTotalPages}
                </span>
                <div className="h-1 w-8 bg-[var(--surface-high)]/10 rounded-full"></div>
              </div>

              <button 
                disabled={catalogPage === catalogTotalPages}
                onClick={() => setCatalogPage(catalogPage + 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-[var(--surface-high)]/10 border border-white/5 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                Next Cycle
                <ChevronRight className="transition-transform group-hover:translate-x-1" size={14} />
              </button>
            </div>
          )}

          {filteredCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-[var(--surface-low)] border border-dashed border-white/10 rounded-[4rem]">
              <div className="w-24 h-24 bg-[var(--surface-high)]/10 rounded-3xl flex items-center justify-center mb-8 border border-white/5">
                <Search size={48} className="text-primary/30" />
              </div>
              <h2 className="font-headline text-3xl font-black text-[var(--on-surface)] mb-4 tracking-tighter">No Knowledge Found</h2>
              <p className="text-[var(--on-surface-variant)] max-w-sm mx-auto leading-relaxed font-body">Your search query did not match any of the Atheneum's pathways. Try refining your parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
