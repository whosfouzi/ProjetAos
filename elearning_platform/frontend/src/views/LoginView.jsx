import { User, Lock, GraduationCap, Users } from 'lucide-react';

/**
 * LoginView — Stitch "Aura Slate" auth screen
 * Props: view, setView, username, setUsername, password, setPassword,
 *        role, setRole, handleLogin, handleRegister
 */
export default function LoginView({ view, setView, username, setUsername, password, setPassword, role, setRole, handleLogin, handleRegister }) {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-[var(--bg-app)] text-[var(--on-surface)] font-body transition-colors duration-500">

      {/* ── Left Side: Immersive panel (desktop only) ── */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 xl:px-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-mesh opacity-60" />
          <img
            alt="Abstract digital network"
            className="w-full h-full object-cover opacity-20 scale-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm91ZfoTFGBneSICh8YFMVG_KKP744xEr8CAzLIbg1RR8aBS7t2QfHjl8tNvUVOUiICrcwbSXe-jLzJb4cpVL6cNxa5LtQ1nUjz8bppwG2lAEAkG4gqQlnfZJZ6dNTWSqEfgpzOxDzjvNcFlhnb7zcUo5pz2d7KLxpWHqGsauYtICUipyypa1gukecnk9fzz0fYzGQIfJn8ZvOs1PC2JzNaDO1alBZrWbCGBDTIxx9nhetMKuTRmz1zIqPY8METbD16e6zpDnQwFU"
          />
        </div>
        <div className="relative z-10 space-y-8">
          <span className="text-3xl font-extrabold tracking-tighter text-primary font-headline">The Atheneum</span>
          <h1 className="text-6xl xl:text-7xl font-extrabold font-headline leading-[1.1] text-[var(--on-surface)] tracking-tight text-glow">
            The future belongs to those <span className="text-primary italic">who learn.</span>
          </h1>
          <p className="text-lg text-[var(--on-surface-variant)] max-w-lg font-body leading-relaxed opacity-80">
            Step into a curated digital sanctuary of knowledge. Join a global community of scholars shaping the new renaissance.
          </p>
        </div>

      </section>

      {/* ── Right Side: Auth form ── */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-[var(--surface-low)] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary opacity-5 blur-[120px]" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          {/* Glass card */}
          <div className="glass-card rounded-2xl p-8 md:p-10 shadow-2xl border border-white/5 bg-[var(--glass-bg)] backdrop-blur-2xl">

            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <span className="text-2xl font-extrabold tracking-tighter text-primary font-headline">The Atheneum</span>
            </div>

            {/* Login / Register toggle */}
            <div className="flex bg-[var(--surface-high)]/10 p-1 rounded-full w-full mb-8">
              <button
                type="button"
                onClick={() => setView('login')}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${view === 'login' ? 'bg-[var(--bg-app)] text-[var(--on-surface)] shadow-sm' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setView('register')}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${view === 'register' ? 'bg-[var(--bg-app)] text-[var(--on-surface)] shadow-sm' : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'}`}
              >
                Register
              </button>
            </div>

            <form className="space-y-5" onSubmit={view === 'login' ? handleLogin : handleRegister}>

              {/* Username */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--on-surface-variant)] font-label ml-1">
                  {view === 'login' ? 'Username' : 'Full Name or Username'}
                </label>
                <div className="relative group">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder={view === 'login' ? 'student_id or username' : 'Your full name'}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-app)] border-none rounded-xl text-[var(--on-surface)] placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--on-surface-variant)] font-label ml-1">Password</label>
                  {view === 'login' && <a className="text-xs text-primary hover:text-secondary transition-colors font-medium" href="#">Forgot Access?</a>}
                </div>
                <div className="relative group">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[var(--bg-app)] border-none rounded-xl text-[var(--on-surface)] placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Role selector — register only */}
              {view === 'register' && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--on-surface-variant)] font-label ml-1">I am a</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'student', icon: GraduationCap, label: 'Student' },
                      { value: 'teacher', icon: Users, label: 'Teacher' },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${role === value ? 'border-primary/50 bg-primary/5 text-primary' : 'border-transparent bg-[var(--bg-app)] text-[var(--on-surface-variant)] hover:text-primary'}`}
                      >
                        <Icon size={24} className="mb-1" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="gradient-btn w-full py-4 rounded-full text-white font-headline font-bold tracking-tight shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                {view === 'login' ? 'Enter Atheneum' : 'Create My Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-4 my-6">
              <div className="flex-grow h-px bg-white/5" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--on-surface-variant)] font-label">Or switch</span>
              <div className="flex-grow h-px bg-white/5" />
            </div>

            <p className="text-center text-sm text-[var(--on-surface-variant)]">
              {view === 'login' ? "Don't have an account? " : 'Already registered? '}
              <button
                type="button"
                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
              >
                {view === 'login' ? 'Create Account' : 'Back to Login'}
              </button>
            </p>
          </div>

          <p className="text-center text-sm text-[var(--on-surface-variant)] opacity-60">
            By entering, you agree to our{' '}
            <a className="underline hover:text-[var(--on-surface)] transition-colors" href="#">Terms of Service</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
