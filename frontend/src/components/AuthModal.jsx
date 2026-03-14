import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Wrench, User, Loader, MapPin, Shield } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../redux/authSlice';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const categories = ['Plumber','Electrician','Carpenter','Painter','Mason','Welder'];

const AuthModal = ({ initialTab = 'login', onClose }) => {
  const [tab, setTab]       = useState(initialTab);
  const [role, setRole]     = useState('client');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', city:'', category:'', experience:1 });
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const requestLocation = (userRole) => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        if (userRole === 'worker') {
          await api.patch('/worker/location', { coordinates: [pos.coords.longitude, pos.coords.latitude] });
        }
      } catch {}
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint, payload;
      if (role === 'admin') {
        endpoint = '/auth/admin/login';
        payload  = { email: form.email, password: form.password };
      } else if (tab === 'signup') {
        endpoint = role === 'client' ? '/auth/client/signup' : '/auth/worker/signup';
        payload  = role === 'client'
          ? { name: form.name, email: form.email, phone: form.phone, password: form.password, city: form.city }
          : { name: form.name, email: form.email, phone: form.phone, password: form.password, category: form.category, experience: form.experience };
      } else {
        endpoint = role === 'client' ? '/auth/client/login' : '/auth/worker/login';
        payload  = { email: form.email, password: form.password };
      }
      const { data } = await api.post(endpoint, payload);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success(`Welcome, ${data.user.name}!`);
      requestLocation(data.user.role);
      onClose();
      const dest = data.user.role === 'client' ? '/client/dashboard' : data.user.role === 'admin' ? '/admin/dashboard' : '/worker/dashboard';
      navigate(dest);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const inp = "w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
  const lbl = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
        <motion.div initial={{opacity:0,scale:0.92,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92,y:20}}
          transition={{type:'spring',stiffness:300,damping:30}}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden z-10">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 pt-6 pb-8">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all"><X size={16}/></button>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><Wrench size={15} className="text-white"/></div>
              <span className="font-bold text-white text-lg">SewaPro</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">{tab==='login'?'Welcome back':'Create account'}</h2>
            <p className="text-indigo-200 text-sm mt-1">{tab==='login'?'Login to continue':'Join thousands of users'}</p>
          </div>

          <div className="px-6 -mt-4">
            {/* Tab toggle — only for non-admin */}
            {role !== 'admin' && (
              <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl p-1 flex mb-4 shadow-inner">
                {['login','signup'].map(t => (
                  <button key={t} onClick={()=>setTab(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${tab===t?'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md':'text-gray-500 dark:text-gray-400'}`}>
                    {t==='login'?'Login':'Sign Up'}
                  </button>
                ))}
              </div>
            )}

            {/* Role toggle */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[['client','Client',User],['worker','Worker',Wrench],['admin','Admin',Shield]].map(([r,label,Icon]) => (
                <button key={r} type="button" onClick={()=>{ setRole(r); if(r==='admin') setTab('login'); }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${role===r?'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400':'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}>
                  <Icon size={13}/> {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pb-6">
              {tab==='signup' && role!=='admin' && (
                <div><label className={lbl}>Full Name</label><input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Rahul Patel" className={inp}/></div>
              )}
              <div><label className={lbl}>Email</label><input required type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@email.com" className={inp}/></div>
              {tab==='signup' && role!=='admin' && (
                <div><label className={lbl}>Phone</label><input required value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="10-digit mobile" className={inp} maxLength={10}/></div>
              )}
              {tab==='signup' && role==='client' && (
                <div><label className={lbl}>City</label><input required value={form.city} onChange={e=>set('city',e.target.value)} placeholder="Ahmedabad" className={inp}/></div>
              )}
              {tab==='signup' && role==='worker' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Category</label><select required value={form.category} onChange={e=>set('category',e.target.value)} className={inp}><option value="">Select</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label className={lbl}>Experience (yrs)</label><input type="number" min={0} max={40} value={form.experience} onChange={e=>set('experience',e.target.value)} className={inp}/></div>
                </div>
              )}
              <div>
                <label className={lbl}>Password</label>
                <div className="relative">
                  <input required type={showPass?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)}
                    placeholder={tab==='signup'&&role!=='admin'?'Min 8 chars, 1 uppercase, 1 number, 1 special':'••••••••'} className={inp+' pr-12'}/>
                  <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>
              {role==='admin' && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2.5">
                  <Shield size={12}/> Admin access only — use admin credentials
                </div>
              )}
              {tab==='login' && role!=='admin' && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-3 py-2.5">
                  <MapPin size={12}/> Location access will be requested after login
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98]">
                {loading?<><Loader size={16} className="animate-spin"/> Please wait...</>:tab==='login'||role==='admin'?'Login':'Create Account'}
              </button>
              {role !== 'admin' && (
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  {tab==='login'?"Don't have an account? ":"Already have an account? "}
                  <button type="button" onClick={()=>setTab(tab==='login'?'signup':'login')} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    {tab==='login'?'Sign Up':'Login'}
                  </button>
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
