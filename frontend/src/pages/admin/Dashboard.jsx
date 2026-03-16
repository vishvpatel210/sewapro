import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Users, Briefcase, IndianRupee, TrendingUp, Shield, Trash2,
  CheckCircle, XCircle, Map as MapIcon, List, LogOut, Sun, Moon,
  AlertTriangle, RefreshCw, Eye, BarChart2
} from 'lucide-react';
import { logout } from '../../redux/authSlice';
import { toggleTheme } from '../../redux/themeSlice';
import api from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize:[25,41], iconAnchor:[12,41] });

const workerIcon = L.divIcon({ className:'', html:`<div style="width:32px;height:32px;background:#6366f1;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;box-shadow:0 4px 12px rgba(99,102,241,.4)">W</div>`, iconSize:[32,32], iconAnchor:[16,16] });

const TABS = ['Overview','Workers','Clients','Jobs','Commissions','Live Map'];

const AdminDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const { mode } = useSelector(s => s.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState({});
  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [liveWorkers, setLiveWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCategory, setMapCategory] = useState('All');
  const mapRef = useRef(null);

  const fetchStats = async () => {
    try { const { data } = await api.get('/admin/stats'); setStats(data); } catch {}
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sR, wR, cR, jR, commR] = await Promise.all([
        api.get('/admin/stats'), api.get('/admin/workers'),
        api.get('/admin/clients'), api.get('/admin/jobs'),
        api.get('/admin/commissions')
      ]);
      setStats(sR.data); setWorkers(wR.data); setClients(cR.data);
      setJobs(jR.data); setCommissions(commR.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const fetchLiveMap = async () => {
    try { const { data } = await api.get('/admin/live-map'); setLiveWorkers(data); } catch {}
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (tab === 'Live Map') { fetchLiveMap(); const i = setInterval(fetchLiveMap, 30000); return () => clearInterval(i); } }, [tab]);

  const handleSuspend = async (id, name) => {
    const reason = prompt(`Reason for suspending ${name}:`) || 'Admin action';
    try { await api.patch(`/admin/workers/${id}/suspend`, { reason }); toast.success('Worker suspended'); fetchAll(); } catch { toast.error('Failed'); }
  };
  const handleActivate = async (id) => {
    try { await api.patch(`/admin/workers/${id}/activate`); toast.success('Worker activated'); fetchAll(); } catch { toast.error('Failed'); }
  };
  const handleVerify = async (id) => {
    try { await api.patch(`/admin/workers/${id}/verify`); toast.success('Worker verified'); fetchAll(); } catch { toast.error('Failed'); }
  };
  const handleDeleteWorker = async (id) => {
    if (!window.confirm('Delete this worker?')) return;
    try { await api.delete(`/admin/workers/${id}`); toast.success('Deleted'); fetchAll(); } catch { toast.error('Failed'); }
  };
  const handleDeleteClient = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try { await api.delete(`/admin/clients/${id}`); toast.success('Deleted'); fetchAll(); } catch { toast.error('Failed'); }
  };
  const handleMarkPaid = async (id) => {
    try { await api.patch(`/admin/commissions/${id}/mark-paid`); toast.success('Marked as paid'); fetchAll(); } catch { toast.error('Failed'); }
  };

  const statusColor = (s) => ({
    Pending:'bg-amber-100 text-amber-700', Accepted:'bg-indigo-100 text-indigo-700',
    'In-Progress':'bg-blue-100 text-blue-700', Completed:'bg-emerald-100 text-emerald-700',
    Cancelled:'bg-red-100 text-red-600'
  }[s] || 'bg-gray-100 text-gray-600');

  const card = "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm";
  const th = "text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-3 text-left";
  const td = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">A</div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Admin Panel</p>
              <p className="text-[10px] text-red-600 font-semibold uppercase tracking-wide">SewaPro Control</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-all"><RefreshCw size={15}/></button>
            <button onClick={() => dispatch(toggleTheme())} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-all">{mode==='dark'?<Sun size={16} className="text-amber-400"/>:<Moon size={16}/>}</button>
            <button onClick={() => { dispatch(logout()); navigate('/'); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><LogOut size={16}/></button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-3 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tab===t?'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none':'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label:'Total Workers', value: stats.totalWorkers||0, icon: Users, bg:'bg-indigo-50 dark:bg-indigo-900/10', text:'text-indigo-600' },
                { label:'Total Clients', value: stats.totalClients||0, icon: Users, bg:'bg-emerald-50 dark:bg-emerald-900/10', text:'text-emerald-600' },
                { label:'Total Jobs', value: stats.totalJobs||0, icon: Briefcase, bg:'bg-amber-50 dark:bg-amber-900/10', text:'text-amber-500' },
                { label:'Total Revenue', value: `₹${stats.totalRevenue||0}`, icon: IndianRupee, bg:'bg-blue-50 dark:bg-blue-900/10', text:'text-blue-600' },
              ].map((s,i) => (
                <motion.div key={s.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                  className={`${card} p-4`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${s.bg}`}><s.icon size={17} className={s.text}/></div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={`${card} p-4`}><p className="text-xs font-bold text-gray-400 uppercase mb-1">Today's Jobs</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayJobs||0}</p></div>
              <div className={`${card} p-4`}><p className="text-xs font-bold text-gray-400 uppercase mb-1">Completed Jobs</p><p className="text-2xl font-bold text-emerald-600">{stats.completedJobs||0}</p></div>
              <div className={`${card} p-4`}><p className="text-xs font-bold text-gray-400 uppercase mb-1">Pending Commission</p><p className="text-2xl font-bold text-amber-500">₹{stats.pendingCommission||0}</p></div>
            </div>
          </div>
        )}

        {/* WORKERS */}
        {tab === 'Workers' && (
          <div className={card + ' overflow-hidden'}>
            <div className="p-4 border-b border-gray-100 dark:border-slate-800"><p className="font-bold text-gray-900 dark:text-white">All Workers ({workers.length})</p></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800/50"><tr>
                  {['Name','Category','City','Rating','Status','Actions'].map(h=><th key={h} className={th}>{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {workers.map(w => (
                    <tr key={w._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">{w.name[0]}</div>
                          <div><p className="font-semibold text-gray-800 dark:text-white text-xs">{w.name}</p><p className="text-[10px] text-gray-400">{w.email}</p></div>
                        </div>
                      </td>
                      <td className={td}><span className="text-xs font-bold text-indigo-600">{w.category}</span></td>
                      <td className={td + ' text-xs'}>{w.city||'—'}</td>
                      <td className={td}><span className="text-amber-500 font-bold text-xs">{w.rating?.toFixed(1)||'0.0'}★</span></td>
                      <td className={td}>
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${w.isSuspended?'bg-red-100 text-red-600':w.isVerified?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>
                            {w.isSuspended?'Suspended':w.isVerified?'Verified':'Unverified'}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${w.isAvailable?'bg-indigo-100 text-indigo-700':'bg-gray-100 text-gray-500'}`}>
                            {w.isAvailable?'Online':'Offline'}
                          </span>
                        </div>
                      </td>
                      <td className={td}>
                        <div className="flex gap-1 flex-wrap">
                          {!w.isVerified && !w.isSuspended && <button onClick={()=>handleVerify(w._id)} className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-all"><CheckCircle size={10}/> Verify</button>}
                          {!w.isSuspended ? <button onClick={()=>handleSuspend(w._id,w.name)} className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg hover:bg-amber-100 transition-all"><XCircle size={10}/> Suspend</button>
                          : <button onClick={()=>handleActivate(w._id)} className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all"><CheckCircle size={10}/> Activate</button>}
                          <button onClick={()=>handleDeleteWorker(w._id)} className="flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg hover:bg-red-100 transition-all"><Trash2 size={10}/> Delete</button>
                        </div>
                        {w.suspendReason && <p className="text-[9px] text-red-400 mt-0.5 truncate max-w-[150px]">{w.suspendReason}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {workers.length === 0 && <div className="p-10 text-center text-gray-400 text-sm">No workers found</div>}
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {tab === 'Clients' && (
          <div className={card + ' overflow-hidden'}>
            <div className="p-4 border-b border-gray-100 dark:border-slate-800"><p className="font-bold text-gray-900 dark:text-white">All Clients ({clients.length})</p></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800/50"><tr>
                  {['Name','Email','Phone','City','Total Jobs','Actions'].map(h=><th key={h} className={th}>{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {clients.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className={td}><div className="flex items-center gap-2"><div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs">{c.name[0]}</div><span className="font-semibold text-gray-800 dark:text-white text-xs">{c.name}</span></div></td>
                      <td className={td + ' text-xs text-gray-500'}>{c.email}</td>
                      <td className={td + ' text-xs'}>{c.phone}</td>
                      <td className={td + ' text-xs'}>{c.city||'—'}</td>
                      <td className={td}><span className="font-bold text-indigo-600 text-xs">{c.totalJobs||0}</span></td>
                      <td className={td}><button onClick={()=>handleDeleteClient(c._id)} className="flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg hover:bg-red-100 transition-all"><Trash2 size={10}/> Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length === 0 && <div className="p-10 text-center text-gray-400 text-sm">No clients found</div>}
            </div>
          </div>
        )}

        {/* JOBS */}
        {tab === 'Jobs' && (
          <div className={card + ' overflow-hidden'}>
            <div className="p-4 border-b border-gray-100 dark:border-slate-800"><p className="font-bold text-gray-900 dark:text-white">All Jobs ({jobs.length})</p></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800/50"><tr>
                  {['Title','Category','Client','Worker','Amount','Status','Date'].map(h=><th key={h} className={th}>{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {jobs.slice(0,50).map(j => (
                    <tr key={j._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className={td}><p className="font-semibold text-gray-800 dark:text-white text-xs truncate max-w-[140px]">{j.title}</p>{j.isEmergency&&<span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">EMERGENCY</span>}</td>
                      <td className={td + ' text-xs text-indigo-600 font-bold'}>{j.category}</td>
                      <td className={td + ' text-xs'}>{j.clientId?.name||'—'}</td>
                      <td className={td + ' text-xs'}>{j.acceptedBy?.name||'—'}</td>
                      <td className={td}><span className="font-bold text-gray-800 dark:text-white text-xs">₹{j.budget?.max||0}</span></td>
                      <td className={td}><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(j.status)}`}>{j.status}</span></td>
                      <td className={td + ' text-xs text-gray-500'}>{new Date(j.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {jobs.length === 0 && <div className="p-10 text-center text-gray-400 text-sm">No jobs found</div>}
            </div>
          </div>
        )}

        {/* COMMISSIONS */}
        {tab === 'Commissions' && (
          <div className={card + ' overflow-hidden'}>
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <p className="font-bold text-gray-900 dark:text-white">Commissions ({commissions.length})</p>
              <div className="flex gap-3 text-xs">
                <span className="text-amber-600 font-bold">Pending: ₹{commissions.filter(c=>!c.isPaid).reduce((s,c)=>s+c.commissionAmount,0)}</span>
                <span className="text-emerald-600 font-bold">Collected: ₹{commissions.filter(c=>c.isPaid).reduce((s,c)=>s+c.commissionAmount,0)}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800/50"><tr>
                  {['Job','Worker','Client','Job Amount','Commission','Status','QR','Action'].map(h=><th key={h} className={th}>{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {commissions.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className={td + ' text-xs'}>{c.jobId?.title||'—'}</td>
                      <td className={td + ' text-xs font-semibold'}>{c.workerId?.name||'—'}</td>
                      <td className={td + ' text-xs'}>{c.clientId?.name||'—'}</td>
                      <td className={td}><span className="text-xs font-bold text-gray-800 dark:text-white">₹{c.jobAmount||0}</span></td>
                      <td className={td}><span className="text-xs font-bold text-indigo-600">₹{c.commissionAmount||0}</span></td>
                      <td className={td}><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.isPaid?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{c.isPaid?'Paid':'Pending'}</span></td>
                      <td className={td}>{c.qrCode&&<img src={c.qrCode} alt="QR" className="w-10 h-10 rounded"/>}</td>
                      <td className={td}>{!c.isPaid&&<button onClick={()=>handleMarkPaid(c._id)} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-all">Mark Paid</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {commissions.length===0&&<div className="p-10 text-center text-gray-400 text-sm">No commissions yet</div>}
            </div>
          </div>
        )}

        {/* LIVE MAP */}
        {tab === 'Live Map' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <select value={mapCategory} onChange={e=>setMapCategory(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {['All','Plumber','Electrician','Carpenter','Painter','Mason','Welder'].map(c=><option key={c}>{c}</option>)}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">{liveWorkers.filter(w=>mapCategory==='All'||w.category===mapCategory).length} workers online</span>
              <button onClick={fetchLiveMap} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"><RefreshCw size={14}/></button>
            </div>
            <div className={card + ' overflow-hidden'} style={{height:'500px'}}>
              <MapContainer center={[23.0225,72.5714]} zoom={11} style={{height:'100%',width:'100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                {liveWorkers.filter(w=>(mapCategory==='All'||w.category===mapCategory)&&w.liveLocation?.coordinates?.[0]!==0).map(w=>(
                  <Marker key={w._id} position={[w.liveLocation.coordinates[1],w.liveLocation.coordinates[0]]} icon={workerIcon}>
                    <Popup>
                      <div className="p-2 min-w-[180px]">
                        <p className="font-bold text-gray-800 text-sm">{w.name}</p>
                        <p className="text-xs text-indigo-600 font-semibold">{w.category}</p>
                        <p className="text-xs text-amber-500 font-bold">{w.rating?.toFixed(1)}★</p>
                        <p className="text-xs text-gray-500">{w.phone}</p>
                        {w.activeJob&&<p className="text-xs text-emerald-600 font-semibold mt-1">Job: {w.activeJob.title}</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
