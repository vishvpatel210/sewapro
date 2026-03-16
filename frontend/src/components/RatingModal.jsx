import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Camera, Trash2, Loader } from 'lucide-react';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const labels = ['Poor','Fair','Good','Very Good','Excellent'];

const RatingModal = ({ jobId, workerName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    files.slice(0, 3 - photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotos(p => [...p, ev.target.result].slice(0, 3));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a rating');
    setLoading(true);
    try {
      await api.post(`/client/jobs/${jobId}/rate`, { rating, review, reviewPhotos: photos });
      toast.success('Rating submitted!');
      onSubmit?.();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:0.92,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92}}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-5">
          <div><h3 className="font-bold text-gray-900 dark:text-white">Rate Worker</h3><p className="text-xs text-gray-500 mt-0.5">{workerName}</p></div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-400"><X size={16}/></button>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center mb-5">
          <div className="flex gap-2 mb-2">
            {[1,2,3,4,5].map(i => (
              <button key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(i)}
                className="transition-transform hover:scale-110 active:scale-95">
                <Star size={32} className={i<=(hover||rating)?'fill-amber-400 text-amber-400':'text-gray-300 dark:text-gray-600'}/>
              </button>
            ))}
          </div>
          {(hover||rating)>0 && <p className="text-sm font-bold text-amber-500">{labels[(hover||rating)-1]}</p>}
        </div>

        <textarea value={review} onChange={e=>setReview(e.target.value)} rows={3} placeholder="Write a review (optional)..."
          className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"/>

        {/* Photo upload */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Add Photos (optional, max 3)</p>
          <div className="flex gap-2 flex-wrap">
            {photos.map((p,i) => (
              <div key={i} className="relative">
                <img src={p} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 dark:border-slate-700"/>
                <button onClick={()=>setPhotos(photos.filter((_,j)=>j!==i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X size={10}/>
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <label className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all">
                <Camera size={16} className="text-gray-400"/>
                <span className="text-[9px] text-gray-400 mt-0.5">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd}/>
              </label>
            )}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading||!rating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
          {loading?<><Loader size={16} className="animate-spin"/>Submitting...</>:'Submit Rating'}
        </button>
      </motion.div>
    </div>
  );
};

export default RatingModal;
