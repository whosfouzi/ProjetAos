import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  Library, 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  Bell, 
  Search,
  Activity,
  UserPlus,
  TrendingUp,
  GraduationCap,
  HelpCircle,
  MoreVertical,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';

/**
 * AdminDashView — Restored Aura Slate Edition
 */
export default function AdminDashView({
  adminStats,
  studentStats,
  adminUsers,
  fetchAdminUsers,
  fetchAdminStats,
  handleUpdateUserRole,
  handleDeleteUser,
  userProfile,
  username,
  logout,
  setView,
  dropdownRef,
  dropdownOpen,
  setDropdownOpen
}) {
  const [health, setHealth] = React.useState({
    auth: 'checking',
    courses: 'checking',
    enroll: 'checking'
  });

  React.useEffect(() => {
    const checkHealth = async () => {
      const results = {};
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      try {
        const auth = await fetch('/api/auth/admin/stats', { headers });
        results.auth = auth.ok ? 'online' : 'offline';
      } catch { results.auth = 'offline'; }
      
      try {
        const courses = await fetch('/api/courses/admin/stats/', { headers });
        results.courses = courses.ok ? 'online' : 'offline';
      } catch { results.courses = 'offline'; }
      
      try {
        const enroll = await fetch('/api/enroll/admin/stats/', { headers });
        results.enroll = enroll.ok ? 'online' : 'offline';
      } catch { results.enroll = 'offline'; }
      
      setHealth(results);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const avatarSrc = userProfile?.profile_picture || null;

  const stats = [
    { label: 'Total Users', value: adminStats?.total_users || '0', change: `+${adminStats?.students || 0} Scholars`, icon: UserPlus, color: 'text-primary' },
    { label: 'Library Assets', value: adminStats?.total_courses || '0', change: 'Total Courses', icon: Library, color: 'text-secondary' },
    { label: 'Completion Rate', value: adminStats?.avg_completion || '0%', change: 'Global Avg', icon: Activity, color: 'text-tertiary' },
    { label: 'Active Enrollments', value: adminStats?.total_enrollments || '0', change: 'Live Pulse', icon: GraduationCap, color: 'text-[#8083ff]' },
  ];

  return (
    <div className="w-full bg-[var(--bg-app)] text-[var(--on-surface)] min-h-screen transition-colors duration-500">
      {/* Main Content Area (No Sidebar) */}
      <div className="p-12 max-w-[1600px] mx-auto space-y-16">
          {/* Hero Heading */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-1 bg-primary rounded-full"></div>
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Administrative Core</span>
            </div>
            <h2 className="text-6xl lg:text-8xl font-black tracking-tighter font-headline text-[var(--on-surface)] leading-[0.9]">
              System <span className="text-primary italic">Overview</span>
            </h2>
            <p className="text-[var(--on-surface-variant)] max-w-xl font-body text-lg leading-relaxed">
              Real-time performance metrics and user engagement distribution across the global digital learning ecosystem.
            </p>
          </section>
 
          {/* Stats Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="glass-panel rounded-[2.5rem] p-8 border border-white/5 transition-all hover:translate-y-[-8px] hover:bg-white/[0.05] duration-500 relative overflow-hidden group shadow-2xl">
                  <div className={`absolute -right-6 -top-6 w-32 h-32 opacity-10 rounded-full blur-3xl transition-all group-hover:opacity-20 ${item.color.replace('text-', 'bg-')}`}></div>
                  <div className="flex flex-col h-full justify-between gap-12 relative z-10">
                    <div className="flex justify-between items-start">
                      <Icon size={40} className={item.color} />
                      <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-emerald-400/10 rounded-full border border-emerald-400/20">{item.change}</span>
                    </div>
                    <div>
                      <p className="text-[var(--on-surface-variant)] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{item.label}</p>
                      <h3 className="text-4xl font-black font-headline text-[var(--on-surface)] tracking-tighter">{item.value}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
 
          {/* Student Statistics Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-1 bg-secondary rounded-full"></div>
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Student Intelligence</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Students', value: (studentStats?.total_students !== undefined && studentStats?.total_students !== null) ? studentStats.total_students : 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', desc: 'All registered' },
                { label: 'Active (30d)', value: (studentStats?.active_students !== undefined && studentStats?.active_students !== null) ? studentStats.active_students : 0, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', desc: 'Logged in recently' },
                { label: 'Inactive (90d+)', value: (studentStats?.inactive_students !== undefined && studentStats?.inactive_students !== null) ? studentStats.inactive_students : 0, icon: UserX, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', desc: 'No recent login' },
                { label: 'Never Logged In', value: (studentStats?.never_logged_in !== undefined && studentStats?.never_logged_in !== null) ? studentStats.never_logged_in : 0, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', desc: 'Registered but inactive' },
                { label: 'Enrolled Students', value: (studentStats?.enrolled_students !== undefined && studentStats?.enrolled_students !== null) ? studentStats.enrolled_students : 0, icon: GraduationCap, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20', desc: 'In at least 1 course' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className={`glass-panel rounded-2xl p-5 border ${item.border} flex flex-col gap-4 relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300`}>
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                      <Icon size={20} className={item.color} />
                    </div>
                    <div>
                      <h3 className={`text-3xl font-black font-headline tracking-tighter ${item.color}`}>{item.value}</h3>
                      <p className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest mt-1">{item.label}</p>
                      <p className="text-[9px] text-[var(--on-surface-variant)] mt-0.5 opacity-60">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Tabbed Data Table (User Management) */}
            <section className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 p-1.5 bg-[var(--surface-high)]/10 rounded-full border border-white/5">
                  <button className="px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-xl transition-all">User Management</button>
                  <button className="px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all">Moderation</button>
                  <button className="px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all">System Logs</button>
                </div>
                <div className="relative group">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" />
                   <input className="bg-[var(--surface-high)]/10 border border-white/5 rounded-full py-2.5 pl-10 pr-6 text-xs text-[var(--on-surface)] placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all w-64" placeholder="Search global registry..." />
                </div>
              </div>
 
              <div className="glass-panel rounded-[3rem] border border-white/5 overflow-hidden shadow-3xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02]">
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--on-surface-variant)]">Scholar Profile</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--on-surface-variant)]">Security Clearance</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--on-surface-variant)]">Status</th>
                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--on-surface-variant)] text-right">Integrity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-body">
                      {(adminUsers || []).slice(0, 5).map((user, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-high)]/10 border border-white/10 flex items-center justify-center overflow-hidden">
                                {user.profile_picture ? (
                                  <img src={user.profile_picture} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <Users size={20} className="text-[var(--on-surface-variant)]" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[var(--on-surface)] font-bold text-sm">{user.username}</span>
                                <span className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                              <span className="text-xs font-bold text-[var(--on-surface-variant)]">Operational</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <button className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-all">
                                <MoreVertical size={18} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-10 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                  <p className="text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-widest">Showing subset of {adminStats?.total_users || 0} entities</p>
                  <button onClick={() => setView('admin-users')} className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:text-secondary transition-all flex items-center gap-2">
                    Expand Full Registry <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </section>
 
            {/* Sidebar Widgets */}
            <aside className="lg:col-span-4 space-y-12">
              {/* System Health Widget */}
              <div className="glass-panel rounded-[3rem] border border-white/5 p-10 relative overflow-hidden group shadow-2xl">
                <h4 className="text-[var(--on-surface)] font-black font-headline mb-10 text-xl flex items-center gap-3">
                  <Activity size={24} className="text-secondary" />
                  System Health
                </h4>
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-[var(--surface-high)]/10 rounded-3xl border border-white/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[var(--on-surface)]">Auth Core</span>
                      <span className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Global SSO</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${health.auth === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>{health.auth === 'online' ? 'Online' : 'Offline'}</span>
                      <div className={`w-3 h-3 rounded-full ${health.auth === 'online' ? 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]'} ${health.auth === 'online' ? 'animate-pulse' : ''}`}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-[var(--surface-high)]/10 rounded-3xl border border-white/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[var(--on-surface)]">Course Engine</span>
                      <span className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Primary Cluster</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${health.courses === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>{health.courses === 'online' ? 'Online' : 'Offline'}</span>
                      <div className={`w-3 h-3 rounded-full ${health.courses === 'online' ? 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]'} ${health.courses === 'online' ? 'animate-pulse' : ''}`}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-[var(--surface-high)]/10 rounded-3xl border border-white/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[var(--on-surface)]">Enrollment Hub</span>
                      <span className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Active Processing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${health.enroll === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>{health.enroll === 'online' ? 'Online' : 'Offline'}</span>
                      <div className={`w-3 h-3 rounded-full ${health.enroll === 'online' ? 'bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]'} ${health.enroll === 'online' ? 'animate-pulse' : ''}`}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-widest">Uptime (30d)</span>
                  <span className="text-primary font-black text-sm">99.998%</span>
                </div>
              </div>
 
              {/* System Insight Card */}
              <div className="glass-panel rounded-[3rem] border border-white/5 p-10 bg-gradient-to-br from-secondary/10 to-transparent shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="mb-8">
                   <div className="w-16 h-16 rounded-2xl bg-[var(--surface-high)]/10 flex items-center justify-center">
                      <Activity size={32} className="text-secondary" />
                   </div>
                </div>
                <h4 className="text-[var(--on-surface)] font-black text-2xl mb-4 font-headline tracking-tighter">System Insight</h4>
                <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed mb-10 font-body">
                  Knowledge distribution has increased by <span className="text-emerald-400 font-bold">{adminStats?.growth || '0%'}</span> since the last maintenance window. Highest engagement currently detected in the <span className="text-primary font-bold">Member Registry</span> core.
                </p>
                <button className="w-full py-4 border border-secondary text-secondary font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-secondary/10 transition-all active:scale-95">
                  Optimize Clusters
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
  );
}
