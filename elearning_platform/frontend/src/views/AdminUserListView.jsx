import React, { useState } from 'react';
import { 
  AlertCircle,
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid,
  Library,
  CreditCard,
  ShieldCheck,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

/**
 * AdminUserListView — Restored Aura Slate Edition
 */
export default function AdminUserListView({
  adminUsers,
  fetchAdminUsers,
  handleUpdateUserRole,
  handleDeleteUser,
  userProfile,
  username,
  logout,
  setView,
  dropdownRef,
  dropdownOpen,
  setDropdownOpen,
  adminStats
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const avatarSrc = userProfile?.profile_picture || null;

  const filteredUsers = (adminUsers || []).filter(u => {
    const name = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return (name.includes(search) || email.includes(search)) &&
           (roleFilter === '' || u.role === roleFilter);
  });

  return (
    <div className="w-full bg-[var(--bg-app)] text-[var(--on-surface)] min-h-screen transition-colors duration-500">
      <div className="p-12 max-w-[1600px] mx-auto space-y-12">
        <header className="mb-12 flex justify-between items-center border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[var(--on-surface)] font-headline uppercase mb-2">Member Registry</h1>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]"></div>
               <span className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest">Population: {adminStats?.total_users || 0} Units</span>
            </div>
          </div>
          <button onClick={fetchAdminUsers} className="p-3 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-white/5 rounded-xl transition-all border border-white/5">
             <RefreshCw size={20} />
          </button>
        </header>
          {/* Controls Bar */}
          <section className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="relative group w-full md:w-96">
               <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] group-focus-within:text-primary transition-colors" />
               <input 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-[var(--surface-high)]/10 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-[var(--on-surface)] placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all w-full shadow-2xl" 
                 placeholder="Search global directory..." 
               />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest hidden lg:inline">Filter:</span>
              <div className="flex bg-[var(--surface-high)]/10 p-1 rounded-2xl border border-white/5 w-full md:w-auto">
                <button onClick={() => setRoleFilter('')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === '' ? 'bg-primary text-white shadow-lg' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>All</button>
                <button onClick={() => setRoleFilter('student')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === 'student' ? 'bg-primary text-white shadow-lg' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>Students</button>
                <button onClick={() => setRoleFilter('instructor')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === 'instructor' ? 'bg-primary text-white shadow-lg' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>Instructors</button>
                <button onClick={() => setRoleFilter('admin')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === 'admin' ? 'bg-primary text-white shadow-lg' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}>Admins</button>
              </div>
            </div>
          </section>
 
          {/* User Table */}
          <section className="glass-panel rounded-[3rem] border border-white/5 overflow-hidden shadow-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--on-surface-variant)]">Scholar Profile</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--on-surface-variant)]">Security Clearance</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--on-surface-variant)]">Identification</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--on-surface-variant)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-body">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-10 py-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                           <AlertCircle size={64} />
                           <span className="text-sm font-black uppercase tracking-widest text-[var(--on-surface)]">No matching records found in registry</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.map((user, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-high)]/10 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 shadow-inner">
                            {user.profile_picture ? (
                              <img src={user.profile_picture} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <Users size={24} className="text-[var(--on-surface-variant)]" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[var(--on-surface)] font-bold text-base">{user.username}</span>
                            <span className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">{user.email || 'no-email-recorded'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                           <select 
                             value={user.role} 
                             onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                             className="bg-primary/5 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10 focus:outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none min-w-[140px] text-center"
                           >
                             <option value="student" className="bg-[var(--bg-app)]">Student</option>
                             <option value="instructor" className="bg-[var(--bg-app)]">Instructor</option>
                             <option value="admin" className="bg-[var(--bg-app)]">Administrator</option>
                           </select>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-[var(--on-surface)] text-xs font-mono">UID: {user.id.toString().substring(0,8)}...</span>
                            <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Active Session</span>
                         </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex items-center justify-end gap-3">
                           <button className="p-3 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-white/5 rounded-xl transition-all">
                              <CheckCircle2 size={18} />
                           </button>
                           <button onClick={() => handleDeleteUser(user.id)} className="p-3 text-[var(--on-surface-variant)] hover:text-error hover:bg-error/5 rounded-xl transition-all">
                              <Trash2 size={18} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-10 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
              <p className="text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-widest">Total Population: {filteredUsers.length} Units</p>
              <div className="flex gap-2">
                 <button className="p-3 bg-[var(--surface-high)]/10 text-[var(--on-surface-variant)] rounded-xl hover:text-[var(--on-surface)] transition-all"><ChevronLeft size={18} /></button>
                 <button className="p-3 bg-[var(--surface-high)]/10 text-[var(--on-surface-variant)] rounded-xl hover:text-[var(--on-surface)] transition-all"><ChevronRight size={18} /></button>
              </div>
            </div>
          </section>
      </div>
    </div>
  );
}
