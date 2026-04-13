import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  User as UserIcon, 
  LogOut, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  Clock, 
  Calendar,
  BarChart3,
  BrainCircuit,
  Award,
  ArrowRight,
  FileText,
  Library,
  Send,
  Loader2,
  Upload,
  FileUp,
  Github,
  Linkedin,
  MapPin,
  School,
  GraduationCap,
  Mail,
  ExternalLink,
  Edit3,
  Briefcase,
  DollarSign,
  MessageSquare,
  History,
  Users,
  Zap,
  ShieldCheck,
  Globe,
  UserCircle,
  Lightbulb,
  Facebook,
  Twitter,
  Instagram,
  ChevronDown,
  Quote,
  RotateCcw,
  TrendingUp,
  Target,
  Trophy,
  Activity,
  Sparkles,
  Trash2,
  Shield,
  XCircle,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { User, AptitudeScore, Booking, Availability } from './types';
import { cn, APTITUDE_SECTIONS, ROLES, MOCK_QUESTIONS } from './constants';

// --- Components ---

const Button = ({ className, variant = 'primary', size = 'md', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost', size?: 'sm' | 'md' | 'lg' }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  return (
    <button 
      className={cn('rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50', variants[variant], sizes[size], className)} 
      {...props} 
    />
  );
};

const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn('bg-white border border-gray-100 rounded-2xl p-6 shadow-sm', onClick && "cursor-pointer", className)}
  >
    {children}
  </div>
);

// --- Sub-Views ---

// --- Sub-Views ---

const ExpertAvailabilityManager = ({ expertId, onUpdate }: { expertId: number, onUpdate: () => void }) => {
  const [slots, setSlots] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const days = Array.from({ length: 3 }, (_, i) => addDays(startOfToday(), i));
  const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  useEffect(() => {
    fetch(`/api/availability/${expertId}?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => setSlots(data))
      .catch(e => console.error(e));
  }, [expertId]);

  const toggleSlot = (time: string) => {
    const day = days[activeDay];
    const [t, p] = time.split(' ');
    let [h, m] = t.split(':').map(Number);
    if (p === 'PM' && h !== 12) h += 12;
    if (p === 'AM' && h === 12) h = 0;
    
    const start = new Date(day);
    start.setHours(h, m, 0, 0);
    
    if (start < new Date()) return;

    const isoStart = start.toISOString();
    const exists = slots.find(s => s.start_time === isoStart);

    if (exists) {
      setSlots(slots.filter(s => s.start_time !== isoStart));
    } else {
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      setSlots([...slots, { start_time: isoStart, end_time: end.toISOString() }]);
    }
  };

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expert_id: expertId, slots })
      });
      if (res.ok) {
        setStatus('success');
        onUpdate();
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {days.map((day, idx) => (
          <Button
            key={day.toISOString()}
            variant={activeDay === idx ? 'primary' : 'outline'}
            onClick={() => setActiveDay(idx)}
            className="rounded-full"
          >
            {format(day, 'EEE, MMM d')}
          </Button>
        ))}
      </div>

      <Card className="p-6">
        <h4 className="font-bold mb-4">Select Availability for {format(days[activeDay], 'MMMM d, yyyy')}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {TIME_SLOTS.map(time => {
            const day = days[activeDay];
            const [t, p] = time.split(' ');
            let [h, m] = t.split(':').map(Number);
            if (p === 'PM' && h !== 12) h += 12;
            if (p === 'AM' && h === 12) h = 0;
            const d = new Date(day);
            d.setHours(h, m, 0, 0);
            
            if (d < new Date()) {
              return (
                <Button key={time} variant="outline" disabled className="h-12 rounded-xl font-bold opacity-30 cursor-not-allowed">
                  {time}
                </Button>
              )
            }

            const iso = d.toISOString();
            const selected = slots.some(s => s.start_time === iso);

            return (
              <Button
                key={time}
                variant={selected ? 'primary' : 'outline'}
                onClick={() => toggleSlot(time)}
                className={cn(
                  "h-12 rounded-xl font-bold transition-all",
                  selected && "bg-indigo-600 hover:bg-indigo-700"
                )}
              >
                {time}
              </Button>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{slots.length} slots selected</span>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8" 
          onClick={save} 
          disabled={status === 'saving'}
        >
          {status === 'saving' ? "Saving..." : status === 'success' ? "Saved!" : "Save Availability"}
        </Button>
      </div>
    </div>
  );
}

const ExpertDashboardView = ({ user, bookings, setView, fetchUserData }: { user: User, bookings: Booking[], setView: (v: any) => void, fetchUserData: (u: User) => void }) => {
  const [earnings, setEarnings] = useState<{ total: number, count: number } | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsRes, reviewsRes] = await Promise.all([
          fetch(`/api/experts/${user.id}/earnings`),
          fetch(`/api/experts/${user.id}/reviews`)
        ]);
        if (earningsRes.ok) setEarnings(await earningsRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const upcomingInterviews = bookings.filter(b => new Date(b.start_time) > new Date()).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const todayInterviews = bookings.filter(b => isSameDay(parseISO(b.start_time), new Date()));
  
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-10 pb-12">
      <StudentProfileModal 
        student={selectedStudent} 
        isOpen={!!selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full -ml-48 -mb-48" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Expert Dashboard
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Welcome, <span className="text-indigo-400">{user.name.split(' ')[0]}</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Manage your availability, prepare for upcoming sessions, and provide impactful feedback to help students succeed.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setView('profile')}
              className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              <UserCircle className="w-5 h-5" />
              Manage Profile
            </button>
            <button 
              onClick={() => setView('history')}
              className="px-8 py-4 bg-slate-800 text-white font-bold rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2"
            >
              <History className="w-5 h-5" />
              Session History
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Next Session Card */}
        <Card className="p-6 border-none bg-indigo-600 shadow-xl shadow-indigo-200 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md">Next Up</span>
            </div>
            <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider">Next Session</p>
            {upcomingInterviews.length > 0 ? (
              <div className="mt-2">
                <h3 className="text-2xl font-black truncate">{upcomingInterviews[0].student_name}</h3>
                <div className="flex items-center gap-2 mt-2 text-indigo-100 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {format(parseISO(upcomingInterviews[0].start_time), 'MMM d, h:mm a')}
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <h3 className="text-2xl font-black">No Sessions</h3>
                <p className="text-indigo-100 font-bold text-xs mt-1 italic opacity-60">Enjoy your free time!</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border-none bg-white shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">Earnings</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Earnings</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">₹{earnings?.total || 0}</h3>
          <p className="text-emerald-600 font-bold text-xs mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            From {earnings?.count || 0} sessions
          </p>
        </Card>

        <Card className="p-6 border-none bg-white shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">Rating</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Avg Rating</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{avgRating}</h3>
          <p className="text-amber-600 font-bold text-xs mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            From {reviews.length} reviews
          </p>
        </Card>

        <Card className="p-6 border-none bg-white shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <Clock className="w-6 h-6 text-rose-600" />
            </div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg">Today</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Interviews</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{todayInterviews.length}</h3>
          <p className="text-rose-600 font-bold text-xs mt-1">Scheduled for today</p>
        </Card>
      </div>

      {/* Expert Resources & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Availability Manager */}
          <Card className="p-8 border-none bg-white shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" /> 
                  Manage Availability
                </h4>
                <p className="text-slate-500 text-sm mt-1">Set your open slots for the next 3 days. Past slots are hidden.</p>
              </div>
            </div>
            <ExpertAvailabilityManager expertId={user.id} onUpdate={() => fetchUserData(user)} />
          </Card>

          {/* Upcoming Sessions List */}
          <Card className="p-8 border-none bg-white shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> 
                Upcoming Sessions
              </h4>
              <Button variant="outline" size="sm" onClick={() => setView('interviews')}>View All</Button>
            </div>
            <div className="space-y-4">
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.slice(0, 5).map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-bold border border-slate-200 shadow-sm">
                        {booking.student_name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{booking.student_name}</p>
                        <p className="text-xs text-slate-500">{format(parseISO(booking.start_time), 'EEEE, MMM d • h:mm a')}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setSelectedStudent(booking)}
                    >
                      View Profile
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">No upcoming sessions scheduled.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Recent Reviews */}
          <Card className="p-8 border-none bg-white shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Recent Reviews
            </h4>
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.slice(0, 3).map((review, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{review.student_name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 italic">"{review.feedback}"</p>
                    <p className="text-[10px] text-slate-400">{format(parseISO(review.start_time), 'MMM d, yyyy')}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No reviews yet.</p>
              )}
              {reviews.length > 3 && (
                <Button variant="ghost" size="sm" className="w-full text-indigo-600" onClick={() => setView('reviews')}>
                  See all reviews
                </Button>
              )}
            </div>
          </Card>

          {/* Expert Tips */}
          <Card className="p-8 border-none bg-indigo-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full -mr-16 -mt-16" />
            <h4 className="text-lg font-black mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Expert Tips
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">01</div>
                <p className="text-xs text-indigo-100 leading-relaxed">Review student resumes 15 mins before the session starts.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">02</div>
                <p className="text-xs text-indigo-100 leading-relaxed">Provide actionable feedback on both technical and soft skills.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">03</div>
                <p className="text-xs text-indigo-100 leading-relaxed">Keep your availability updated to get more bookings.</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-8 border-none bg-white shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-6">Quick Actions</h4>
            <div className="space-y-3">
              <button onClick={() => setView('interviews')} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                <span className="font-bold text-sm">View All Interviews</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setView('history')} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                <span className="font-bold text-sm">Past Sessions</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setView('profile')} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                <span className="font-bold text-sm">Update Profile</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StudentProfileModal = ({ student, isOpen, onClose }: { student: any, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-blue-700">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-[2rem] bg-white p-2 shadow-xl">
              <div className="w-full h-full rounded-[1.5rem] bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-black">
                {student.student_photo ? (
                  <img src={student.student_photo} alt="" className="w-full h-full object-cover rounded-[1.5rem]" referrerPolicy="no-referrer" />
                ) : (
                  student.student_name?.charAt(0)
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{student.student_name}</h3>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-1">{student.role} Aspirant</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium">{student.student_email}</span>
                </div>
                {student.student_college && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium">{student.student_college} ({student.student_grad_year})</span>
                  </div>
                )}
                {student.student_city && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium">{student.student_city}, {student.student_state}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {student.student_github && (
                  <a href={student.student_github} target="_blank" className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                    <Github className="w-5 h-5 text-slate-700" />
                  </a>
                )}
                {student.student_linkedin && (
                  <a href={student.student_linkedin} target="_blank" className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                    <Linkedin className="w-5 h-5 text-slate-700" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {student.student_skills?.split(',').map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Bio</h4>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{student.student_bio || 'No bio provided.'}"
                </p>
              </div>

              {student.student_resume && (
                <Button className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Resume
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const DashboardView = ({ 
  user, 
  scores, 
  bookings, 
  setView, 
  fetchUserData 
}: { 
  user: User, 
  scores: AptitudeScore[], 
  bookings: Booking[], 
  setView: (v: any) => void, 
  fetchUserData: (u: User) => void 
}) => {
  useEffect(() => {
    fetchUserData(user);
  }, [user]);

  if (user.role === 'expert') {
    return (
      <ExpertDashboardView 
        user={user} 
        bookings={bookings} 
        setView={setView} 
        fetchUserData={fetchUserData} 
      />
    );
  }

  const mockTests = scores.filter(s => s.section === "Full Mock Test").sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const latestMock = mockTests[0];
  const mockTestCount = mockTests.length;
  
  const mockAccuracy = mockTestCount 
    ? Math.round(mockTests.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0) / mockTestCount) 
    : 0;

  const chartData = mockTests.slice(0, 7).reverse().map((m, i) => ({
    name: `Test ${mockTestCount - mockTests.slice(0, 7).length + i + 1}`,
    accuracy: Math.round((m.score / m.total) * 100),
    fullDate: format(parseISO(m.timestamp), 'MMM d')
  }));

  const aggregateSectionScores = () => {
    const data: Record<string, { score: number, total: number }> = {};
    scores.forEach(s => {
      // Only include scores that were part of a Full Mock Test
      // We check for truthy is_mock (could be 1 or true)
      if (s.section === "Full Mock Test" || !s.is_mock) return;
      if (!data[s.section]) data[s.section] = { score: 0, total: 0 };
      data[s.section].score += s.score;
      data[s.section].total += s.total;
    });
    
    // Only show the 3 sections included in the mock test
    const mockSections = ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"];
    
    return mockSections.map(name => {
      const val = data[name] || { score: 0, total: 0 };
      return {
        name: name.split(' ')[0],
        fullName: name,
        accuracy: val.total > 0 ? Math.round((val.score / val.total) * 100) : 0,
        fullMark: 100
      };
    });
  };

  const sectionData = aggregateSectionScores();
  const bestSection = [...sectionData].sort((a, b) => b.accuracy - a.accuracy)[0];

  const getSuggestedRole = () => {
    if (!bestSection || bestSection.accuracy === 0) return "Keep practicing!";
    const name = bestSection.fullName;
    if (name === "Quantitative Aptitude") return "Data Analyst / Finance";
    if (name === "Logical Reasoning") return "Software Engineer / AI";
    if (name === "Verbal Ability") return "Product Manager / HR";
    return "Full Stack Developer";
  };

  const interviewCount = bookings.length;
  const readinessScore = Math.min(100, Math.round(
    (mockAccuracy * 0.6) + 
    (Math.min(5, mockTestCount) * 4) + 
    (Math.min(3, interviewCount) * 6.6)
  ));

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 blur-3xl rounded-full -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Your Placement Journey
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Welcome back, <span className="text-indigo-100">{user.name.split(' ')[0]}</span>!
            </h2>
            <p className="text-lg text-indigo-100 max-w-xl leading-relaxed">
              You're making great progress. Your current job readiness score is <span className="font-bold text-white">{readinessScore}%</span>. Keep it up!
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setView('aptitude')}
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              <BrainCircuit className="w-5 h-5" />
              Practice Now
            </button>
            <button 
              onClick={() => setView('interviews')}
              className="px-8 py-4 bg-indigo-500 text-white font-bold rounded-2xl border-2 border-indigo-400 hover:bg-indigo-400 transition-all active:scale-95 flex items-center gap-2"
            >
              <Video className="w-5 h-5" />
              Book Interview
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow border-none bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">Overall</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Mock Avg Accuracy</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-3xl font-black text-slate-900">{mockAccuracy}%</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500 mb-1.5" />
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${mockAccuracy}%` }} />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow border-none bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <Trophy className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">Strength</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Best Section</p>
          <h3 className="text-xl font-black text-slate-900 mt-1 truncate">{bestSection && bestSection.accuracy > 0 ? bestSection.fullName : 'N/A'}</h3>
          <p className="text-emerald-600 font-bold text-xs mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {bestSection && bestSection.accuracy > 0 ? `${bestSection.accuracy}% Accuracy` : 'No data yet'}
          </p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow border-none bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Target className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">Career</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Suggested Role</p>
          <h3 className="text-xl font-black text-slate-900 mt-1 truncate">{getSuggestedRole()}</h3>
          <p className="text-amber-600 font-bold text-xs mt-1">Based on your skills</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow border-none bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <Calendar className="w-6 h-6 text-rose-600" />
            </div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg">Schedule</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Interviews</p>
          <h3 className="text-xl font-black text-slate-900 mt-1">{bookings.length} Scheduled</h3>
          <p className="text-slate-400 text-xs mt-1 truncate">
            {bookings[0] ? `Next: ${format(parseISO(bookings[0].start_time), 'MMM d, h:mm a')}` : 'No upcoming sessions'}
          </p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none bg-white shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> 
                Skills Breakdown
              </h4>
              <p className="text-slate-500 text-sm mt-1">Your accuracy across all aptitude domains</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sectionData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Accuracy"
                    dataKey="accuracy"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h5 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Domain Analysis</h5>
              {sectionData.map((s, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 font-bold">{s.fullName}</span>
                    <span className="text-indigo-600 font-black">{s.accuracy}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-1000" 
                      style={{ width: `${s.accuracy}%` }} 
                    />
                  </div>
                </div>
              ))}
              <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs text-indigo-800 font-bold leading-relaxed">
                  💡 <span className="font-black">Expert Tip:</span> {(!bestSection || bestSection.accuracy === 0) 
                    ? "Take your first Full Mock Test to see your skills breakdown and get personalized career suggestions."
                    : `Your ${bestSection.fullName} is exceptional. Focus on ${[...sectionData].sort((a,b) => a.accuracy - b.accuracy)[0]?.fullName} to balance your profile.`}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="p-8 border-none bg-white shadow-sm">
            <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-600" /> 
                Recent Mock Tests
              </div>
              {mockTestCount > 0 && (
                <span className="text-xs font-bold text-slate-400">{mockTestCount} Total</span>
              )}
            </h4>
            <div className="space-y-4">
              {mockTests.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <BookOpen className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-400 mb-6 text-sm font-medium">No mock tests taken yet</p>
                  <Button variant="outline" size="sm" onClick={() => setView('aptitude')} className="rounded-xl">Take Your First Test</Button>
                </div>
              ) : (
                mockTests.slice(0, 5).map(m => (
                  <div key={m.id} className="group p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all cursor-default">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-black text-slate-900">Full Mock Test</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{format(parseISO(m.timestamp), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black">
                        {m.total > 0 ? Math.round((m.score/m.total)*100) : 0}%
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: `${m.total > 0 ? (m.score/m.total)*100 : 0}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 text-right">{m.score}/{m.total} Correct Answers</p>
                  </div>
                ))
              )}
            </div>

            {scores.filter(s => s.section !== "Full Mock Test" && !s.is_mock).length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Practice Sessions</h5>
                <div className="space-y-3">
                  {scores
                    .filter(s => s.section !== "Full Mock Test" && !s.is_mock)
                    .slice(0, 3)
                    .map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-slate-300" />
                          <span className="font-bold text-slate-700">{s.section}</span>
                        </div>
                        <span className="text-slate-500 font-medium">{s.score}/{s.total}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-8 border-none bg-indigo-900 text-white shadow-xl">
            <h4 className="text-lg font-black mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> 
              Next Steps
            </h4>
            <div className="space-y-4">
              {[
                { label: "Analyze your latest resume", icon: FileText, view: 'resume' },
                { label: "Review technical resources", icon: Library, view: 'resources' },
                { label: "Schedule a mock interview", icon: Video, view: 'interviews' }
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => setView(action.view)}
                  className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="w-4 h-4 text-indigo-300 group-hover:text-white transition-colors" />
                    <span className="text-sm font-bold text-indigo-100 group-hover:text-white transition-colors">{action.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-8 border-none bg-white shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600" /> 
              Upcoming Interviews
            </h4>
            <p className="text-slate-500 text-sm mt-1">Manage your scheduled sessions with industry experts</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setView('interviews')} className="rounded-xl">View All</Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Video className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold mb-6">No interviews scheduled yet</p>
              <Button onClick={() => setView('interviews')} className="rounded-xl px-8">Book Your First Session</Button>
            </div>
          ) : (
            bookings.slice(0, 3).map(b => (
              <div key={b.id} className="relative group p-6 rounded-[2rem] bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl">
                    {b.expert_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{b.expert_name}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{b.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold">{format(parseISO(b.start_time), 'EEEE, MMM d')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold">{format(parseISO(b.start_time), 'h:mm a')}</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Confirmed</span>
                  <button onClick={() => setView('interviews')} className="text-indigo-600 font-black text-xs hover:underline">Join Meeting</button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

const AptitudeView = ({ 
  user, 
  fetchUserData 
}: { 
  user: User, 
  fetchUserData: (u: User) => void 
}) => {
  const [section, setSection] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const answersRef = React.useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const currentQuestionRef = React.useRef(currentQuestion);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);

  // Reset timer whenever the question changes
  useEffect(() => {
    if (quizStarted && !quizFinished) {
      setTimeLeft(60);
    }
  }, [currentQuestion, quizStarted, quizFinished]);

  // Per-question countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !quizFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up for this question — auto-advance
            const questions = getQuestions();
            const curQ = currentQuestionRef.current;
            if (curQ >= questions.length - 1) {
              // Last question — finish the quiz
              clearInterval(timer);
              finishQuiz(answersRef.current);
            } else {
              // Move to next question
              setCurrentQuestion(curQ + 1);
            }
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, quizFinished]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizStarted && !quizFinished) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && quizStarted && !quizFinished) {
        finishQuiz(answersRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, quizFinished]);

  const startInstructions = (s: string) => {
    setSection(s);
    setShowInstructions(true);
  };

  const startQuiz = () => {
    setShowInstructions(false);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizFinished(false);
    setTimeLeft(60);
  };

  const getQuestions = () => {
    if (section === "Full Mock Test") {
      return Object.entries(MOCK_QUESTIONS)
        .filter(([secName]) => secName !== "Data Interpretation")
        .flatMap(([secName, qs]) => 
          qs.map(q => ({ ...q, sectionName: secName }))
        ).slice(0, 75);
    }
    return (MOCK_QUESTIONS[section!] || []).map(q => ({ ...q, sectionName: section }));
  };

  const handleSelectOption = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = idx;
    setAnswers(newAnswers);
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    const questions = getQuestions();
    
    if (section === "Full Mock Test") {
      const sectionResults: Record<string, { correct: number, total: number }> = {};
      questions.forEach((q, i) => {
        const ans = finalAnswers[i];
        const sec = q.sectionName;
        if (!sectionResults[sec]) sectionResults[sec] = { correct: 0, total: 0 };
        sectionResults[sec].total++;
        if (ans === q.correct) sectionResults[sec].correct++;
      });

      const promises = Object.entries(sectionResults).map(([sec, res]) => 
        fetch('/api/aptitude/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: user?.id,
            section: sec,
            score: res.correct,
            total: res.total,
            is_mock: true
          })
        })
      );
      
      let totalCorrect = 0;
      let totalQuestions = 0;
      Object.values(sectionResults).forEach(r => {
        totalCorrect += r.correct;
        totalQuestions += r.total;
      });

      promises.push(fetch('/api/aptitude/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id,
          section: "Full Mock Test",
          score: totalCorrect,
          total: totalQuestions,
          is_mock: true
        })
      }));

      await Promise.all(promises);
    } else {
      let correct = 0;
      questions.forEach((q, i) => {
        if (finalAnswers[i] === q.correct) correct++;
      });
      
      await fetch('/api/aptitude/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id,
          section,
          score: correct,
          total: questions.length
        })
      });
    }
    
    setQuizFinished(true);
    await fetchUserData(user!);
  };

  if (showInstructions && !quizStarted) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="p-10 border-none shadow-2xl rounded-[3rem]">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
            <BrainCircuit className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-6">Instructions for {section}</h2>
          <ul className="space-y-4 mb-8 text-slate-600 font-medium">
            <li className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              Each question has a <span className="font-black text-indigo-600">60-second timer</span>. Answer before time runs out!
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              When the timer expires, the quiz <span className="font-black text-slate-900">automatically moves to the next question</span>.
            </li>
            <li className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              You <span className="font-black text-rose-600">cannot go back</span> to a previous question once you move forward.
            </li>
            <li className="flex items-start gap-3">
              <Target className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              The test automatically submits if you leave the page.
            </li>
          </ul>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setShowInstructions(false)} className="flex-1 py-4 rounded-2xl font-bold">Cancel</Button>
            <Button onClick={startQuiz} className="flex-1 py-4 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700">Start Test</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!quizStarted && !showInstructions) {
    return (
      <div className="space-y-10 pb-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 blur-3xl rounded-full -ml-32 -mb-32" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                <BrainCircuit className="w-3.5 h-3.5 text-amber-300" />
                Master Your Skills
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
                Aptitude <span className="text-indigo-100">Preparation</span>
              </h2>
              <p className="text-lg text-indigo-100 max-w-xl leading-relaxed">
                Sharpen your mind with our curated questions. Each question has a 60-second timer to simulate real exam pressure.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {APTITUDE_SECTIONS.map(s => (
            <Card 
              key={s.name} 
              className={cn(
                "group relative overflow-hidden p-8 border-none bg-white shadow-sm hover:shadow-xl transition-all cursor-pointer rounded-[2rem]",
                s.name === "Full Mock Test" ? "bg-indigo-900 text-white shadow-indigo-200" : ""
              )} 
              onClick={() => startInstructions(s.name)}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110",
                s.name === "Full Mock Test" ? "bg-white/10" : "bg-indigo-50"
              )}>
                <BrainCircuit className={cn(
                  "w-7 h-7",
                  s.name === "Full Mock Test" ? "text-white" : "text-indigo-600"
                )} />
              </div>
              
              <h3 className="font-black text-xl mb-3">{s.name}</h3>
              <p className={cn(
                "text-sm leading-relaxed mb-6",
                s.name === "Full Mock Test" ? "text-indigo-200" : "text-slate-500"
              )}>
                {s.name === "Full Mock Test" 
                  ? "The ultimate challenge. 75 questions covering Quantitative, Logical, and Verbal domains to test your accuracy."
                  : `Master ${s.name.toLowerCase()} with ${s.questions} targeted questions from real placement papers.`}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                  s.name === "Full Mock Test" ? "bg-white/10 text-white" : "bg-indigo-50 text-indigo-600"
                )}>
                  {s.questions} Questions
                </div>
                <div className={cn(
                  "flex items-center font-black text-sm group-hover:translate-x-1 transition-transform",
                  s.name === "Full Mock Test" ? "text-white" : "text-indigo-600"
                )}>
                  Start <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const questions = getQuestions();
    const correct = answers.filter((ans, i) => ans === questions[i].correct).length;
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="p-10 text-center border-none shadow-2xl rounded-[3rem]">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trophy className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Quiz Completed!</h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            Great effort! You've successfully completed the <span className="font-bold text-indigo-600">{section}</span>.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-slate-400 text-xs uppercase font-black tracking-widest mb-2">Your Score</p>
              <p className="text-4xl font-black text-slate-900">{correct} <span className="text-xl text-slate-400">/ {questions.length}</span></p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-slate-400 text-xs uppercase font-black tracking-widest mb-2">Accuracy</p>
              <p className="text-4xl font-black text-emerald-600">{Math.round((correct/questions.length)*100)}%</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full py-6 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-100" onClick={() => setQuizStarted(false)}>
              Back to Aptitude
            </Button>
            <Button variant="ghost" className="w-full text-slate-400 font-bold" onClick={() => startInstructions(section!)}>
              <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const questions = getQuestions();
  const q = questions[currentQuestion];

  if (!q) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{section}</h3>
            <p className="text-slate-400 text-sm font-bold">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xl shadow-sm transition-colors",
            timeLeft <= 10 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-white text-slate-900"
          )}>
            <Clock className={cn("w-5 h-5", timeLeft <= 15 ? "text-rose-600" : "text-indigo-600")} />
            0:{String(timeLeft).padStart(2, '0')}
          </div>
          <div className="hidden md:block w-48 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} 
            />
          </div>
        </div>
      </div>

      <Card className="p-8 md:p-12 border-none shadow-2xl rounded-[3rem] bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
          <div 
            className={cn(
              "h-full transition-all duration-1000 linear",
              timeLeft <= 10 ? "bg-rose-500" : "bg-indigo-500"
            )} 
            style={{ width: `${(timeLeft / 60) * 100}%` }} 
          />
        </div>

        {/* Per-question timer label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time remaining for this question</span>
          <span className={cn("text-xs font-black", timeLeft <= 10 ? "text-rose-600" : "text-indigo-600")}>{timeLeft}s</span>
        </div>

        <p className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-12">
          {q.text}
        </p>

        <div className="grid gap-4">
          {q.options.map((opt: string, i: number) => {
            const isSelected = answers[currentQuestion] === i;
            return (
              <button 
                key={i}
                className={cn(
                  "group w-full p-6 text-left rounded-[1.5rem] border-2 transition-all flex items-center justify-between",
                  isSelected ? "border-indigo-600 bg-indigo-50" : "border-slate-50 hover:border-indigo-600 hover:bg-indigo-50"
                )}
                onClick={() => handleSelectOption(i)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors",
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={cn("text-lg font-bold transition-colors",
                    isSelected ? "text-indigo-900" : "text-slate-700 group-hover:text-indigo-900"
                  )}>{opt}</span>
                </div>
                <div className={cn("w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                  isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 group-hover:border-indigo-600"
                )}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
      
      <div className="mt-8 flex justify-end items-center px-4">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentQuestion(p => Math.min(questions.length - 1, p + 1))}
            className="text-slate-500 hover:text-indigo-600 font-bold"
          >
            Skip Question
          </Button>
          {currentQuestion === questions.length - 1 ? (
             <Button 
               onClick={() => finishQuiz(answers)}
               className="rounded-xl px-8 font-bold bg-emerald-600 hover:bg-emerald-700"
             >
               Submit Test
             </Button>
          ) : (
             <Button 
               onClick={() => setCurrentQuestion(p => p + 1)}
               className="rounded-xl px-8 font-bold bg-indigo-600 flex items-center gap-2"
             >
               Next <ChevronRight className="w-4 h-4" />
             </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const RatingModal = ({ booking, isOpen, onClose, onRate }: { booking: Booking, isOpen: boolean, onClose: () => void, onRate: (rating: number, feedback: string) => void }) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl"
      >
        <h3 className="text-2xl font-black text-slate-900 mb-2">Rate Session</h3>
        <p className="text-slate-500 mb-8">Provide feedback for your session with {booking.student_name}</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                    rating >= s ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-300 hover:bg-slate-100"
                  )}
                >
                  <Star className={cn("w-6 h-6", rating >= s && "fill-amber-600")} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did the student do well? Where can they improve?"
              className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-12 font-bold">Cancel</Button>
            <Button onClick={() => onRate(rating, feedback)} className="flex-1 rounded-2xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700">Submit Rating</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InterviewsView = ({ 
  user, 
  bookings, 
  fetchUserData 
}: { 
  user: User, 
  bookings: Booking[], 
  fetchUserData: (u: User) => void 
}) => {
  const [bookingStep, setBookingStep] = useState<'list' | 'select_role' | 'select_expert' | 'select_slot'>('list');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
  const [availableExperts, setAvailableExperts] = useState<User[]>([]);
  const [expertSlots, setExpertSlots] = useState<Availability[]>([]);
  const [viewingStudentProfile, setViewingStudentProfile] = useState<Booking | null>(null);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (bookingStep === 'list' && user) {
      timeout = setInterval(() => {
        fetchUserData(user);
      }, 5000);
    }
    return () => clearInterval(timeout);
  }, [bookingStep, user, fetchUserData]);

  const startBooking = () => setBookingStep('select_role');

  const handleRoleSelect = async (role: string) => {
    setSelectedRole(role);
    const res = await fetch(`/api/experts?role=${encodeURIComponent(role)}&t=${Date.now()}`);
    setAvailableExperts(await res.json());
    setBookingStep('select_expert');
  };

  const handleExpertSelect = async (expert: User) => {
    setSelectedExpert(expert);
    const res = await fetch(`/api/availability/${expert.id}?t=${Date.now()}`);
    const allSlots = await res.json();
    setExpertSlots(allSlots.filter((s: any) => s.status === 'available' && new Date(s.start_time) > new Date()));
    setBookingStep('select_slot');
  };

  const confirmBooking = async (slot: Availability) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: user?.id,
        expert_id: selectedExpert?.id,
        role: selectedRole,
        start_time: slot.start_time,
        end_time: slot.end_time,
        slot_id: slot.id
      })
    });
    if (res.ok) {
      alert('Interview booked successfully!');
      setBookingStep('list');
      fetchUserData(user!);
    }
  };

  const joinMeeting = async (booking: Booking) => {
    if (user?.role === 'student') {
      const res = await fetch(`/api/bookings/${booking.id}/join`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'student' }) 
      });
      const data = await res.json();
      if (data.expert_joined) {
        window.open(booking.meet_link, '_blank');
      } else {
        alert('Please wait for the expert to join the meeting first.');
      }
    } else {
      await fetch(`/api/bookings/${booking.id}/join`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'expert' }) 
      });
      window.open(booking.meet_link, '_blank');
    }
  };

  const handleRate = async (rating: number, feedback: string) => {
    if (!ratingBooking) return;
    const res = await fetch(`/api/bookings/${ratingBooking.id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback })
    });
    if (res.ok) {
      setRatingBooking(null);
      fetchUserData(user!);
    }
  };

  return (
    <div className="space-y-8">
      {ratingBooking && (
        <RatingModal 
          booking={ratingBooking} 
          isOpen={!!ratingBooking} 
          onClose={() => setRatingBooking(null)} 
          onRate={handleRate} 
        />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Mock Interviews</h2>
          <p className="text-slate-500 mt-1">Manage your scheduled sessions and feedback</p>
        </div>
        {user?.role === 'student' && bookingStep === 'list' && (
          <Button onClick={startBooking} className="flex gap-2 items-center px-8 py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold">
            <Video className="w-5 h-5" /> Book New Interview
          </Button>
        )}
      </div>

      {bookingStep === 'list' ? (
        <div className="grid gap-6">
          {bookings.length === 0 ? (
            <Card className="text-center py-24 bg-white border-none shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">No interviews scheduled yet</h3>
            </Card>
          ) : (
            bookings.map(b => (
              <Card key={b.id} className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 hover:shadow-md transition-shadow">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl">
                    {(user?.role === 'student' ? b.expert_name : b.student_name)?.[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900">{user?.role === 'student' ? b.expert_name : b.student_name}</h4>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{b.role} Interview</p>
                    <div className="flex items-center gap-6 mt-3">
                      <span className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                        <Calendar className="w-4 h-4 text-indigo-400" /> {format(parseISO(b.start_time), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                        <Clock className="w-4 h-4 text-indigo-400" /> {format(parseISO(b.start_time), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {user?.role === 'expert' && (
                    <Button variant="outline" onClick={() => setViewingStudentProfile(b)} className="rounded-xl font-bold">View Profile</Button>
                  )}
                  {user?.role === 'expert' && b.status === 'scheduled' && (
                    <Button variant="outline" onClick={() => setRatingBooking(b)} className="rounded-xl font-bold border-amber-200 text-amber-700 hover:bg-amber-50">Rate Student</Button>
                  )}
                  {b.status === 'scheduled' ? (
                    <div className="flex flex-col items-end gap-1">
                      <Button 
                        onClick={() => joinMeeting(b)} 
                        disabled={user?.role === 'expert' ? new Date() < new Date(b.start_time) : !b.expert_joined}
                        className={cn("flex gap-2 items-center rounded-xl px-8 font-bold transition-all", 
                          (user?.role === 'expert' ? new Date() < new Date(b.start_time) : !b.expert_joined)
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed border-none shadow-none"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        )}
                      >
                        <Video className="w-4 h-4" /> Join Meeting
                      </Button>
                      {user?.role === 'expert' && new Date() < new Date(b.start_time) && (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available at start time</span>
                      )}
                      {user?.role === 'student' && !b.expert_joined && (
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin inline" /> Waiting for expert
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-4 h-4", i < (b.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                        ))}
                      </div>
                      {b.feedback && <p className="text-xs text-slate-500 italic max-w-[200px] text-right">"{b.feedback}"</p>}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      ) : bookingStep === 'select_role' ? (
        <div className="grid md:grid-cols-3 gap-4">
          {ROLES.map(r => (
            <Card key={r} className="hover:border-indigo-600 cursor-pointer transition-all" onClick={() => handleRoleSelect(r)}>
              <h4 className="font-bold">{r}</h4>
              <p className="text-xs text-slate-500 mt-1">Find experts for this role</p>
            </Card>
          ))}
        </div>
      ) : bookingStep === 'select_expert' ? (
        <div className="grid gap-4">
          {availableExperts.length === 0 ? (
            <p className="text-center py-12 text-slate-500">No experts available for this role right now.</p>
          ) : (
            availableExperts.map(e => (
              <Card key={e.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{e.name}</h4>
                  <p className="text-sm text-slate-500">{e.expertise}</p>
                </div>
                <Button onClick={() => handleExpertSelect(e)}>View Availability</Button>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {expertSlots.length === 0 ? (
            <p className="col-span-3 text-center py-12 text-slate-500">No available slots for this expert.</p>
          ) : (
            expertSlots.map(s => (
              <Card key={s.id} className="text-center">
                <p className="font-bold">{format(parseISO(s.start_time), 'MMM d')}</p>
                <p className="text-indigo-600 font-medium my-2">{format(parseISO(s.start_time), 'h:mm a')}</p>
                <Button variant="outline" className="w-full" onClick={() => confirmBooking(s)}>Select Slot</Button>
              </Card>
            ))
          )}
        </div>
      )}

      {viewingStudentProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
          >
            <button 
              onClick={() => setViewingStudentProfile(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-indigo-100">
                {viewingStudentProfile.student_photo ? (
                  <img src={viewingStudentProfile.student_photo} alt={viewingStudentProfile.student_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-indigo-600 text-3xl font-bold">
                    {viewingStudentProfile.student_name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{viewingStudentProfile.student_name}</h3>
                <p className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {viewingStudentProfile.student_email}
                </p>
                <p className="text-indigo-600 text-sm font-bold mt-1 uppercase tracking-wider">{viewingStudentProfile.role} Aspirant</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">About Student</h4>
                <p className="text-slate-600 leading-relaxed">{viewingStudentProfile.student_bio || 'No bio provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Education</h4>
                  <p className="font-bold text-slate-800">{viewingStudentProfile.student_college || 'N/A'}</p>
                  <p className="text-xs text-slate-500">{viewingStudentProfile.student_city}, {viewingStudentProfile.student_state}</p>
                  <p className="text-xs text-slate-500 mt-1">Class of {viewingStudentProfile.student_grad_year || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Links</h4>
                  <div className="flex gap-3">
                    {viewingStudentProfile.student_github && (
                      <a href={viewingStudentProfile.student_github} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {viewingStudentProfile.student_linkedin && (
                      <a href={viewingStudentProfile.student_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006396] transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {viewingStudentProfile.student_resume && (
                      <a href={viewingStudentProfile.student_resume} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        <FileText className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingStudentProfile.student_skills ? viewingStudentProfile.student_skills.split(',').map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {s.trim()}
                    </span>
                  )) : <p className="text-xs text-slate-400 italic">No skills listed.</p>}
                </div>
              </div>
            </div>

            <Button className="w-full mt-8" onClick={() => setViewingStudentProfile(null)}>Close Profile</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const HistoryView = ({ user, bookings }: { user: User, bookings: Booking[] }) => {
  const completedSessions = bookings.filter(b => b.status === 'completed').sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Session History</h2>
          <p className="text-slate-500 mt-1">Review your past interview sessions and feedback</p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm">
          {completedSessions.length} Total Sessions
        </div>
      </div>

      <div className="grid gap-4">
        {completedSessions.length === 0 ? (
          <Card className="text-center py-20 bg-white border-none shadow-sm">
            <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No completed sessions yet</h3>
          </Card>
        ) : (
          completedSessions.map(b => (
            <Card key={b.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xl">
                  {b.student_name?.[0]}
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">{b.student_name}</h4>
                  <p className="text-slate-500 text-sm font-medium">{b.role} Interview</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" /> {format(parseISO(b.start_time), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" /> {format(parseISO(b.start_time), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < (b.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                  ))}
                </div>
                {b.feedback && (
                  <p className="text-xs text-slate-500 italic max-w-xs text-right">"{b.feedback}"</p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const EarningsView = ({ user }: { user: User }) => {
  const [earningsData, setEarningsData] = useState<{ total: number, count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/experts/${user.id}/earnings`)
      .then(res => res.json())
      .then(data => {
        setEarningsData(data);
        setLoading(false);
      });
  }, [user.id]);

  const chartData = [
    { name: 'Mon', amount: 150 },
    { name: 'Tue', amount: 200 },
    { name: 'Wed', amount: 100 },
    { name: 'Thu', amount: 300 },
    { name: 'Fri', amount: 250 },
    { name: 'Sat', amount: 400 },
    { name: 'Sun', amount: 150 },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Earnings Overview</h2>
          <p className="text-slate-500 mt-1">Track your income and session performance</p>
        </div>
        <Button className="flex gap-2 items-center">
          <FileUp className="w-4 h-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100">
          <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-2">Total Earnings</p>
          <h3 className="text-4xl font-black">${earningsData?.total || 0}</h3>
          <div className="mt-4 flex items-center gap-2 text-indigo-200 text-xs font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5% from last month</span>
          </div>
        </Card>

        <Card className="p-8 bg-white border-none shadow-sm">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Completed Sessions</p>
          <h3 className="text-4xl font-black text-slate-900">{earningsData?.count || 0}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% completion rate</span>
          </div>
        </Card>

        <Card className="p-8 bg-white border-none shadow-sm">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Avg. Per Session</p>
          <h3 className="text-4xl font-black text-slate-900">$50</h3>
          <div className="mt-4 flex items-center gap-2 text-indigo-600 text-xs font-bold">
            <Zap className="w-4 h-4" />
            <span>Standard industry rate</span>
          </div>
        </Card>
      </div>

      <Card className="p-8 border-none shadow-sm bg-white">
        <h4 className="text-lg font-black text-slate-900 mb-8">Weekly Revenue</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="#4f46e5" 
                radius={[6, 6, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

const ReviewsView = ({ user }: { user: User }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/experts/${user.id}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      });
  }, [user.id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Student Reviews</h2>
          <p className="text-slate-500 mt-1">What students are saying about your mentorship</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900">{avgRating}</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("w-3 h-3", i < Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
              ))}
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{reviews.length} Reviews</p>
        </div>
      </div>

      <div className="grid gap-6">
        {reviews.length === 0 ? (
          <Card className="text-center py-20 bg-white border-none shadow-sm">
            <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No reviews yet</h3>
          </Card>
        ) : (
          reviews.map((r, i) => (
            <Card key={i} className="p-8 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                    {r.student_name?.[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{r.student_name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{format(parseISO(r.start_time), 'MMMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed italic text-lg">"{r.feedback}"</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const ProfileView = ({ user, setUser }: { user: User, setUser: (u: User) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [formData, setFormData] = useState({
    bio: user.bio || '',
    expertise: user.expertise || '',
    resume_url: user.resume_url || '',
    photo_url: user.photo_url || '',
    college: user.college || '',
    city: user.city || '',
    state: user.state || '',
    github_url: user.github_url || '',
    linkedin_url: user.linkedin_url || '',
    skills: user.skills || '',
    grad_year: user.grad_year || '',
    company: user.company || '',
    years_of_experience: user.years_of_experience || ''
  });

  const isProfileComplete = user.role === 'expert' 
    ? (user.bio && user.expertise && user.linkedin_url && user.photo_url && user.company && user.years_of_experience && user.college)
    : (user.bio && user.college && user.github_url && user.linkedin_url && user.photo_url);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo_url' | 'resume_url') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: user.id })
      });
      
      const contentType = res.headers.get("content-type");
      if (res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const updatedUser = await res.json();
          setUser(updatedUser);
          localStorage.setItem('prep_user', JSON.stringify(updatedUser));
          setJustSaved(true);
        } else {
          throw new Error("Server returned success but not JSON");
        }
      } else {
        let errorMessage = res.statusText;
        if (contentType && contentType.includes("application/json")) {
          const err = await res.json();
          errorMessage = err.error || errorMessage;
        }
        alert(`Failed to update profile: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      alert(`An error occurred: ${error.message || 'Please check the file size.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormData({
      bio: user.bio || '',
      expertise: user.expertise || '',
      resume_url: user.resume_url || '',
      photo_url: user.photo_url || '',
      college: user.college || '',
      city: user.city || '',
      state: user.state || '',
      github_url: user.github_url || '',
      linkedin_url: user.linkedin_url || '',
      skills: user.skills || '',
      grad_year: user.grad_year || '',
      company: user.company || '',
      years_of_experience: user.years_of_experience || ''
    });
    setIsEditing(true);
    setJustSaved(false);
  };

  if (isEditing) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">{isProfileComplete ? 'Edit Your Profile' : 'Complete Your Profile'}</h2>
            <p className="text-slate-500">
              {user.role === 'expert' 
                ? 'Showcase your expertise to help students trust your guidance' 
                : 'Add more details to help experts understand your background'}
            </p>
          </div>
          <Button variant="ghost" onClick={() => { setIsEditing(false); setJustSaved(false); }}>Cancel</Button>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Professional Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                    {formData.photo_url ? (
                      <img src={formData.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <input 
                    type="file"
                    accept="image/*"
                    className="flex-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={e => handleFileChange(e, 'photo_url')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {user.role === 'expert' ? 'Professional Title / Expertise' : 'Target Role / Expertise'}
                </label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={user.role === 'expert' ? "e.g. Senior Software Engineer" : "e.g. Frontend Developer"}
                  value={formData.expertise}
                  onChange={e => setFormData({...formData, expertise: e.target.value})}
                />
              </div>
              {user.role === 'expert' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Company</label>
                    <input 
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Google, Microsoft"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Years of Experience</label>
                    <input 
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. 5+ years"
                      value={formData.years_of_experience}
                      onChange={e => setFormData({...formData, years_of_experience: e.target.value})}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Graduation Year</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 2025"
                    value={formData.grad_year}
                    onChange={e => setFormData({...formData, grad_year: e.target.value})}
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  {user.role === 'expert' ? 'Professional Summary / Bio' : 'Bio'}
                </label>
                <textarea 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  placeholder={user.role === 'expert' ? "Describe your professional journey and how you can help..." : "Tell us about yourself..."}
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {user.role === 'expert' ? 'Highest Qualification / University' : 'College Name'}
                </label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={user.role === 'expert' ? "e.g. MS in CS, Stanford University" : "e.g. IIT Bombay"}
                  value={formData.college}
                  onChange={e => setFormData({...formData, college: e.target.value})}
                />
              </div>
              {user.role === 'student' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input 
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="City"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input 
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="State"
                      value={formData.state}
                      onChange={e => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                </div>
              ) : null}
              {user.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium mb-1">GitHub Profile Link</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://github.com/username"
                    value={formData.github_url}
                    onChange={e => setFormData({...formData, github_url: e.target.value})}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn Profile Link</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin_url}
                  onChange={e => setFormData({...formData, linkedin_url: e.target.value})}
                />
              </div>
              {user.role === 'student' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                    <input 
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. React, Node.js, Python"
                      value={formData.skills}
                      onChange={e => setFormData({...formData, skills: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Resume (PDF)</label>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                        <FileUp className="w-6 h-6" />
                      </div>
                      <input 
                        type="file"
                        accept=".pdf"
                        className="flex-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        onChange={e => handleFileChange(e, 'resume_url')}
                      />
                    </div>
                    {formData.resume_url && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> File ready to upload</p>}
                  </div>
                </>
              )}
            </div>
            {justSaved ? (
              <Button 
                type="button" 
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2"
                onClick={() => {
                  setIsEditing(false);
                  setJustSaved(false);
                }}
              >
                <CheckCircle2 className="w-5 h-5" /> View Profile
              </Button>
            ) : (
              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile Details'}
              </Button>
            )}
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4">
      {!isProfileComplete && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-amber-900 font-bold">Incomplete Profile</p>
              <p className="text-amber-700 text-sm">
                {user.role === 'expert' 
                  ? 'Complete your profile to help students understand your expertise and book sessions.' 
                  : 'Complete your profile to stand out to experts when booking sessions!'}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleEdit} className="bg-amber-600 hover:bg-amber-700 text-white border-none">
            Complete Now
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-32 h-32 rounded-3xl overflow-hidden bg-indigo-100 border-4 border-white shadow-xl flex items-center justify-center shrink-0">
            {user.photo_url ? (
              <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-indigo-600 text-5xl font-bold uppercase">
                {user.name[0]}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                {user.role}
              </span>
              {user.expertise && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                  {user.expertise}
                </span>
              )}
              {user.role === 'expert' && user.company && (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                  @ {user.company}
                </span>
              )}
            </div>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4 text-slate-400" /> {user.email}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleEdit} className="flex gap-2 items-center border-slate-200 hover:bg-slate-50 font-bold">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900 uppercase tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <UserIcon className="w-4 h-4" />
              </div>
              {user.role === 'expert' ? 'Professional Summary' : 'About Me'}
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg font-medium">
              {user.bio || (user.role === 'expert' ? 'This expert has not provided a professional summary yet.' : 'No bio provided yet.')}
            </p>
          </Card>

          {user.role === 'expert' ? (
            <Card className="p-8">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900 uppercase tracking-tight">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Award className="w-4 h-4" />
                </div>
                Professional Expertise
              </h3>
              <div className="space-y-8">
                <div className="flex items-start gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 shrink-0 border border-slate-100">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-slate-900 text-xl tracking-tight">{user.company || 'Current Company Not Specified'}</p>
                    <p className="text-indigo-600 font-bold text-lg">{user.expertise}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-500 font-bold">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> {user.years_of_experience || 'N/A'} Experience
                      </span>
                      {user.college && (
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-slate-400" /> {user.college}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900 uppercase tracking-tight">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <School className="w-4 h-4" />
                </div>
                Education & Skills
              </h3>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-black text-slate-900 text-xl tracking-tight">{user.college || 'College Not Specified'}</p>
                  <div className="flex items-center gap-4 mt-2 text-slate-500 font-bold">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" /> Class of {user.grad_year || 'N/A'}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {user.city}, {user.state}
                    </span>
                  </div>
                </div>
                {user.skills && (
                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Technical Proficiency</p>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.split(',').map((skill, i) => (
                        <span key={i} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Professional Links</h3>
            <div className="space-y-3">
              {user.linkedin_url && (
                <a 
                  href={user.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#0077B5]/5 border border-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5" />
                    <span className="font-bold">LinkedIn</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
              {user.github_url && (
                <a 
                  href={user.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/5 border border-slate-900/10 text-slate-900 hover:bg-slate-900/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5" />
                    <span className="font-bold">GitHub</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
              {!user.linkedin_url && !user.github_url && (
                <p className="text-slate-400 text-sm italic text-center py-4">No professional links added</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Resume / CV</h3>
            {user.resume_url ? (
              <Button 
                variant="outline" 
                className="w-full h-14 flex gap-3 items-center justify-center border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-black rounded-2xl"
                onClick={() => window.open(user.resume_url!, '_blank')}
              > 
                <FileText className="w-5 h-5" /> View Document
              </Button>
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-100 text-center">
                <p className="text-slate-400 text-sm font-bold">No resume uploaded</p>
              </div>
            )}
          </Card>

          {user.role === 'expert' && (
            <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <h4 className="font-black text-2xl mb-3 tracking-tight">Ready to Mentor?</h4>
                <p className="text-indigo-100 text-sm font-medium mb-8 leading-relaxed">Keep your availability updated so students can book sessions with you.</p>
                <Button className="w-full h-12 bg-white text-indigo-600 hover:bg-indigo-50 border-none font-black rounded-xl shadow-lg">
                  Manage Schedule
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ResumeAnalyzerView = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'ats'>('overview');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  };

  const analyzeResume = async () => {
    if (!file || !targetRole) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetRole', targetRole);

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze resume');
      }

      const data = await response.json();
      setAnalysis(data);
      setActiveTab('overview');
    } catch (error: any) {
      console.error(error);
      alert('Error analyzing resume: ' + error.message);
    }
    setLoading(false);
  };

  const resetAnalyzer = () => {
    setFile(null);
    setTargetRole('');
    setAnalysis(null);
    setLoading(false);
    setActiveTab('overview');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'stroke-emerald-500', label: 'Excellent' };
    if (score >= 60) return { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'stroke-amber-500', label: 'Good' };
    if (score >= 40) return { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'stroke-orange-500', label: 'Fair' };
    return { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'stroke-rose-500', label: 'Needs Work' };
  };

  const getCategoryColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    if (pct >= 25) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-400/20 blur-3xl rounded-full -ml-32 -mb-32" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              Powered by Claude AI
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Resume <span className="text-indigo-200">Analyzer</span>
            </h2>
            <p className="text-lg text-indigo-100 max-w-xl leading-relaxed">
              Get an instant ATS score, detailed breakdown, and actionable suggestions to make your resume stand out.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {!analysis && (
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 space-y-6 border-none shadow-sm bg-white">
            <div>
              <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Target Role</label>
              <select
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-slate-800"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              >
                <option value="">Select a role...</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="relative group">
              <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Upload PDF Resume</label>
              <div className={cn(
                "border-2 border-dashed rounded-[1.5rem] p-10 transition-all flex flex-col items-center justify-center text-center cursor-pointer",
                file ? "border-emerald-400 bg-emerald-50/50" : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50"
              )}>
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
                  file ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                )}>
                  {file ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                <h4 className="font-bold text-slate-700 text-lg">
                  {file ? file.name : "Click or drag to upload"}
                </h4>
                <p className="text-slate-500 text-sm mt-1">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF files only, max 5MB"}
                </p>
              </div>
            </div>

            <Button
              className="w-full py-5 text-lg flex items-center justify-center gap-2 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              onClick={analyzeResume}
              disabled={loading || !file || !targetRole}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
              {loading ? 'Analyzing with Claude AI...' : 'Analyze Resume'}
            </Button>
          </Card>

          <Card className="p-8 border-none shadow-sm bg-white flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
              <BrainCircuit className="w-12 h-12 text-indigo-400" />
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-3">AI-Powered Analysis</h4>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed mb-8">
              Our system uses Claude AI to deeply understand your resume, then scores it across 6 key categories with actionable feedback.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {[
                { icon: Target, label: "ATS Score" },
                { icon: CheckCircle2, label: "Strengths" },
                { icon: AlertTriangle, label: "Improvements" },
                { icon: Zap, label: "Keywords" }
              ].map((item, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Results Section */}
      {analysis && (
        <div className="space-y-8">
          {/* Score + Summary Row */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Score Card */}
            <Card className="p-8 border-none shadow-sm bg-white flex flex-col items-center justify-center text-center">
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    className={getScoreColor(analysis.score).ring}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(analysis.score / 100) * 327} 327`}
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-4xl font-black", getScoreColor(analysis.score).text)}>{analysis.score}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">/100</span>
                </div>
              </div>
              <span className={cn("px-4 py-1.5 rounded-full text-sm font-black", getScoreColor(analysis.score).bg, getScoreColor(analysis.score).text)}>
                {getScoreColor(analysis.score).label}
              </span>
              <p className="text-sm text-slate-500 mt-3">For <span className="font-bold text-indigo-600">{analysis.targetRole}</span></p>
            </Card>

            {/* Parsed Info Card */}
            <Card className="lg:col-span-2 p-8 border-none shadow-sm bg-white">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Detected Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Name", value: analysis.parsedInfo.name, icon: UserIcon },
                  { label: "Email", value: analysis.parsedInfo.email || "Not detected", icon: Mail },
                  { label: "Phone", value: analysis.parsedInfo.phone || "Not detected", icon: Phone },
                  { label: "Skills", value: `${analysis.parsedInfo.skillsCount} detected`, icon: Zap },
                  { label: "Experience", value: `${analysis.parsedInfo.experienceCount} positions`, icon: Briefcase },
                  { label: "Education", value: `${analysis.parsedInfo.educationCount} entries`, icon: GraduationCap }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {analysis.parsedInfo.skills.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Detected Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.parsedInfo.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex gap-1">
            {([
              { id: 'overview', label: 'Score Breakdown', icon: BarChart3 },
              { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
              { id: 'ats', label: 'ATS Optimization', icon: Shield }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all",
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.breakdown.map((item: any, i: number) => (
                <Card key={i} className="p-6 border-none shadow-sm bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-bold text-slate-800 text-sm">{item.category}</h5>
                    <span className={cn(
                      "px-2 py-0.5 rounded-lg text-xs font-black",
                      (item.score / item.max) >= 0.75 ? "bg-emerald-50 text-emerald-600" :
                      (item.score / item.max) >= 0.5 ? "bg-amber-50 text-amber-600" :
                      "bg-rose-50 text-rose-600"
                    )}>
                      {item.score}/{item.max}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000", getCategoryColor(item.score, item.max))}
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{item.feedback}</p>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Strengths */}
              <Card className="p-8 border-none shadow-sm bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">Strengths</h4>
                    <p className="text-xs text-slate-400">{analysis.strengths.length} identified</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {analysis.strengths.length > 0 ? analysis.strengths.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{s}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic py-4 text-center">No specific strengths detected. Upload a more complete resume.</p>
                  )}
                </div>
              </Card>

              {/* Suggestions */}
              <Card className="p-8 border-none shadow-sm bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">Suggestions</h4>
                    <p className="text-xs text-slate-400">{analysis.suggestions.length} recommendations</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {analysis.suggestions.length > 0 ? analysis.suggestions.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{s}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic py-4 text-center">Your resume looks great! No suggestions.</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'ats' && (
            <div className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* ATS Issues */}
                <Card className="p-8 border-none shadow-sm bg-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">ATS Issues</h4>
                      <p className="text-xs text-slate-400">{analysis.atsOptimization.issues.length} found</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {analysis.atsOptimization.issues.length > 0 ? analysis.atsOptimization.issues.map((issue: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-rose-50/50 rounded-xl">
                        <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-700 font-medium">{issue}</span>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                        <p className="text-sm text-emerald-600 font-bold">No ATS issues detected!</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Keywords */}
                <Card className="p-8 border-none shadow-sm bg-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">Keyword Match</h4>
                      <p className="text-xs text-slate-400">For {analysis.targetRole}</p>
                    </div>
                  </div>

                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Matched Keywords</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {analysis.atsOptimization.matchedKeywords.length > 0 ? analysis.atsOptimization.matchedKeywords.map((kw: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {kw}
                      </span>
                    )) : (
                      <p className="text-sm text-slate-400 italic">No matching keywords found</p>
                    )}
                  </div>

                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Missing Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.atsOptimization.missingKeywords.length > 0 ? analysis.atsOptimization.missingKeywords.map((kw: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {kw}
                      </span>
                    )) : (
                      <p className="text-sm text-emerald-600 font-bold">All keywords covered!</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* ATS Tips */}
              <Card className="p-8 border-none shadow-sm bg-indigo-900 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="w-6 h-6 text-amber-400" />
                  <h4 className="font-black text-lg">ATS Optimization Tips</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.atsOptimization.tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white/10 rounded-xl">
                      <ChevronRight className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
                      <span className="text-sm text-indigo-100 font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Reset Button */}
          <div className="text-center">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-2 mx-auto"
              onClick={resetAnalyzer}
            >
              <RotateCcw className="w-4 h-4" /> Analyze Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ResourcesView = ({ setView }: { setView: (v: any) => void }) => {
  const [showHrQuestions, setShowHrQuestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'hr' | 'technical' | 'behavioral' | 'company'>('hr');

  const hrQuestions = [
    { q: "Tell me about yourself", a: "Focus on your professional journey, key achievements, and why you're a fit for this specific role." },
    { q: "What are your strengths and weaknesses?", a: "Be honest. For weaknesses, show how you're working to improve them." },
    { q: "Why should we hire you?", a: "Connect your skills directly to the company's needs and culture." },
    { q: "Where do you see yourself in 5 years?", a: "Show ambition but also commitment to the company's growth." },
    { q: "What is your greatest professional achievement?", a: "Use the STAR method to describe a specific result you achieved." },
    { q: "How do you handle stress and pressure?", a: "Give an example of a high-pressure situation and how you stayed calm." },
    { q: "What motivates you?", a: "Connect your personal passion to the work you'll be doing." },
    { q: "Why are you leaving your current job?", a: "Stay positive. Focus on seeking new challenges and growth." },
    { q: "What are your salary expectations?", a: "Research market rates and provide a range based on your experience." },
    { q: "How do you handle conflict with a coworker?", a: "Show empathy and a focus on professional resolution." },
    { q: "What do you know about our company?", a: "Demonstrate that you've done your research on their mission and products." },
    { q: "What is your dream job?", a: "Align your answer with the role you're interviewing for." },
    { q: "How do you stay organized?", a: "Mention specific tools or methods you use to manage your time." },
    { q: "What is your leadership style?", a: "Focus on empowering others and achieving collective goals." },
    { q: "How do you handle failure?", a: "Show that you learn from mistakes and take responsibility." },
    { q: "What are your long-term career goals?", a: "Show that you have a plan and that this role fits into it." },
    { q: "What is your preferred work environment?", a: "Be honest about what helps you perform at your best." },
    { q: "How do you handle criticism?", a: "Show that you're open to feedback and use it to improve." },
    { q: "What is the most difficult decision you've made?", a: "Explain your reasoning process and the outcome." },
    { q: "What are you passionate about?", a: "Show your human side and how it fuels your work ethic." },
    { q: "What other companies are you interviewing with?", a: "Be honest but don't name names. Show you're in demand." },
    { q: "How do you handle a difficult boss?", a: "Focus on communication and finding common ground." },
    { q: "What are you looking for in a new position?", a: "Focus on growth, impact, and cultural fit." },
    { q: "What is your biggest regret?", a: "Choose something professional and show what you learned." },
    { q: "How do you deal with ambiguity?", a: "Show that you can take initiative and find clarity." },
    { q: "What is your greatest fear?", a: "Choose something that shows you care about your work quality." },
    { q: "How do you handle a heavy workload?", a: "Focus on prioritization and time management." },
    { q: "What makes you unique?", a: "Highlight a specific skill or experience that sets you apart." },
    { q: "How do you stay updated with industry trends?", a: "Mention blogs, podcasts, or courses you follow." },
    { q: "Do you have any questions for us?", a: "Always have 2-3 thoughtful questions ready about the team or role." }
  ];

  const technicalRoadmap = [
    { title: "Data Structures", topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables"] },
    { title: "Algorithms", topics: ["Sorting", "Searching", "Dynamic Programming", "Greedy", "Backtracking"] },
    { title: "Core CS", topics: ["OS Concepts", "DBMS", "Computer Networks", "OOPs"] },
    { title: "System Design", topics: ["Scalability", "Load Balancing", "Caching", "Microservices"] }
  ];

  const behavioralTips = [
    { step: "Situation", desc: "Set the scene and provide context." },
    { step: "Task", desc: "Explain the challenge or goal." },
    { step: "Action", desc: "Describe exactly what you did." },
    { step: "Result", desc: "Share the positive outcome and what you learned." }
  ];

  const checklist = [
    "Research the company and its culture",
    "Prepare 2-3 questions for the interviewer",
    "Test your audio/video setup for virtual interviews",
    "Dress professionally, even for remote calls",
    "Keep a copy of your resume and a notepad handy",
    "Practice the STAR method for behavioral questions"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
            <Library className="w-3.5 h-3.5" />
            Learning Center
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Placement Resources</h2>
          <p className="text-slate-500 text-lg max-w-xl">Master every stage of your interview journey with our curated guides and expert tips.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Resource Tabs */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
              {(['hr', 'technical', 'behavioral', 'company'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all capitalize",
                    activeTab === tab 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  )}
                >
                  {tab === 'hr' ? 'HR Prep' : tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'hr' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Common HR Questions</h3>
                      <p className="text-slate-500 mt-1">Master the most frequently asked non-technical questions.</p>
                    </div>
                    <Button onClick={() => setShowHrQuestions(true)} className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      view more such questions
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {hrQuestions.slice(0, 4).map((item, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                        <h4 className="font-bold text-indigo-600 mb-2">Q: {item.q}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {technicalRoadmap.map((section, i) => (
                      <div key={i} className="space-y-4">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                          {section.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {section.topics.map((topic, j) => (
                            <span key={j} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors cursor-default">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-indigo-600 rounded-2xl text-white flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">Ready for a Mock Technical Interview?</h4>
                      <p className="text-indigo-100 text-sm">Test your skills with industry experts from top tech companies.</p>
                    </div>
                    <Button variant="secondary" onClick={() => setView('interviews')}>Book Now</Button>
                  </div>
                </div>
              )}

              {activeTab === 'behavioral' && (
                <div className="space-y-8">
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-600" />
                      The STAR Method Guide
                    </h3>
                    <p className="text-emerald-800 text-sm leading-relaxed mb-6">
                      The STAR method is a structured manner of responding to behavioral-based interview questions by discussing the specific Situation, Task, Action, and Result of the situation you are describing.
                    </p>
                    <div className="grid sm:grid-cols-4 gap-4">
                      {behavioralTips.map((tip, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{tip.step}</span>
                          <p className="text-xs text-slate-600 mt-1 font-medium">{tip.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900">Common Behavioral Questions</h4>
                    <ul className="space-y-3">
                      {[
                        "Tell me about a time you failed.",
                        "Describe a situation where you had to work with a difficult teammate.",
                        "Give an example of a time you showed leadership.",
                        "Tell me about a time you had to learn something new quickly."
                      ].map((q, i) => (
                        <li key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium text-slate-700">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { name: "Google", focus: "Algorithms, System Design, Cultural Fit (Googliness)" },
                      { name: "Amazon", focus: "Leadership Principles, Scalability, Data Structures" },
                      { name: "Meta", focus: "Product Sense, Coding Efficiency, Behavioral" },
                      { name: "Microsoft", focus: "Problem Solving, OS Fundamentals, Design Patterns" }
                    ].map((company, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg transition-all group">
                        <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{company.name}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          <span className="font-bold text-slate-700">Key Focus:</span> {company.focus}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-slate-400 text-sm italic">More company guides coming soon...</p>
                </div>
              )}
            </div>
          </div>

          {/* Preserved Block: Need a Mock Interview? */}
          <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-3xl font-black">Need a Mock Interview?</h3>
                <p className="text-indigo-100 max-w-md">
                  Practice with industry veterans and get real-time feedback to boost your confidence.
                </p>
              </div>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => setView('interviews')}
                className="px-10 py-6 text-lg font-bold shadow-xl active:scale-95"
              >
                Book Your Session
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Preserved Block: Interview Checklist */}
          <Card className="bg-slate-900 text-white p-8">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              Interview Checklist
            </h3>
            <ul className="space-y-6">
              {checklist.map((item, i) => (
                <li key={i} className="flex gap-4 text-sm text-slate-300 group">
                  <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-emerald-500 transition-colors">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* New: Quick Tips Card */}
          <Card className="bg-amber-50 border-amber-100 p-8">
            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Pro Tip
            </h3>
            <p className="text-amber-800 text-sm leading-relaxed italic">
              "Always research the interviewer on LinkedIn before the call. Knowing their background helps you ask better questions and build rapport."
            </p>
          </Card>

          {/* New: Downloadable Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: "Resume Templates", icon: FileText },
                { label: "Salary Negotiation Guide", icon: DollarSign },
                { label: "Coding Cheat Sheets", icon: BookOpen }
              ].map((link, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HR Questions Modal */}
      <AnimatePresence>
        {showHrQuestions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHrQuestions(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">30+ Common HR Questions</h3>
                  <p className="text-slate-500">Master the art of non-technical interviews</p>
                </div>
                <button 
                  onClick={() => setShowHrQuestions(false)}
                  className="p-3 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-slate-100"
                >
                  <LogOut className="w-6 h-6 text-slate-400 rotate-180" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {hrQuestions.map((item, i) => (
                    <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{item.q}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                <Button onClick={() => setShowHrQuestions(false)} size="lg" className="px-12">Close Guide</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingView = ({ setView }: { setView: (v: any) => void }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const companies = [
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_(2012).svg" },
    { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  ];

  const benefits = [
    {
      title: "Real Industry Experts",
      description: "Learn directly from professionals working at Google, Meta, and Amazon. Get the inside scoop on what they really look for.",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "AI-Powered Tools",
      description: "Our smart resume analyzer and adaptive aptitude tests give you an instant edge in the first rounds.",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Personalized Roadmap",
      description: "No more guessing. We analyze your strengths and weaknesses to build a custom path to your dream job.",
      icon: MapPin,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Proven Success Rate",
      description: "94% of our students land a job within 6 months. Our methods are tested, trusted, and results-driven.",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  const features = [
    { 
      icon: BrainCircuit, 
      title: "Adaptive Aptitude", 
      desc: "Our AI-powered quizzes adjust difficulty based on your performance, ensuring you're always challenged.",
      color: "bg-blue-50 text-blue-600"
    },
    { 
      icon: Video, 
      title: "Expert Interviews", 
      desc: "Get real-time feedback from professionals working at Google, Meta, and Amazon.",
      color: "bg-indigo-50 text-indigo-600"
    },
    { 
      icon: FileText, 
      title: "Resume Scoring", 
      desc: "Upload your resume and get an instant score with actionable tips to beat the ATS.",
      color: "bg-emerald-50 text-emerald-600"
    },
    { 
      icon: BarChart3, 
      title: "Progress Analytics", 
      desc: "Visualize your growth with detailed charts and section-wise performance breakdowns.",
      color: "bg-amber-50 text-amber-600"
    },
    { 
      icon: ShieldCheck, 
      title: "Verified Experts", 
      desc: "Every mentor on our platform undergoes a rigorous vetting process to ensure quality guidance.",
      color: "bg-purple-50 text-purple-600"
    },
    { 
      icon: Globe, 
      title: "Global Community", 
      desc: "Connect with peers and mentors from across the globe to broaden your perspective.",
      color: "bg-rose-50 text-rose-600"
    }
  ];

  const steps = [
    { title: "Build Your Profile", desc: "Tell us about your target roles and current skill level." },
    { title: "Practice & Refine", desc: "Take aptitude tests and book mock interviews with experts." },
    { title: "Get Placed", desc: "Use data-driven insights to land your dream job at top companies." }
  ];

  const faqs = [
    { q: "How do I book a mock interview?", a: "Once you register, go to the 'Interviews' section, select your target role, choose an expert, and pick a time slot that works for you." },
    { q: "Are the aptitude tests free?", a: "We offer a range of free practice tests. Premium users get access to advanced section-wise mastery and AI-driven insights." },
    { q: "Can I become an expert mentor?", a: "Yes! If you have 3+ years of industry experience, you can apply through our 'Expert Portal' to start mentoring students." },
    { q: "Is the resume analyzer accurate?", a: "Our analyzer uses the same technology as modern ATS systems to ensure your resume is optimized for top-tier companies." }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Award className="w-6 h-6" />
            </div>
            <span>PrepMaster</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#comparison" className="hover:text-indigo-600 transition-colors">Why Us</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('login')}
              className="px-5 py-2.5 text-slate-600 font-semibold hover:text-indigo-600 transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => setView('register')}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 blur-[120px] rounded-full opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 blur-[120px] rounded-full opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold mb-8">
              <Zap className="w-4 h-4" />
              <span>The #1 Placement Prep Platform</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Placement</span> Journey.
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              Connect with industry veterans, master technical aptitude, and optimize your profile for the world's most innovative companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setView('register')}
                className="px-10 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-4 bg-white text-slate-900 text-lg font-bold rounded-2xl border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Meet Our Experts
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" alt="User" />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-500 font-medium">Trusted by 15,000+ students</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                alt="Students collaborating" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent" />
            </div>
            
            {/* Floating Cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 z-20 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 hidden xl:block"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Interview Status</p>
                  <p className="text-lg font-bold text-slate-900">Successfully Placed!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[94%] bg-emerald-500 rounded-full" />
                </div>
                <span className="text-sm font-bold text-slate-600">94%</span>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 hidden xl:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Aptitude Score</p>
                  <p className="text-lg font-bold text-slate-900">Top 1% Globally</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-500 font-bold uppercase tracking-widest text-xs mb-12">Our Mentors Come From</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all">
            {companies.map((company, i) => (
              <img 
                key={i} 
                src={company.logo} 
                alt={company.name} 
                className="h-8 lg:h-10 object-contain"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4">Everything You Need</h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6">
              A complete toolkit for your career success.
            </h3>
            <p className="text-xl text-slate-600">
              We've combined the most effective preparation methods into a single, cohesive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all bg-white group"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.color)}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-12">
                Your path to placement in <span className="text-indigo-600">3 simple steps.</span>
              </h3>
              <div className="space-y-12">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-2">{step.title}</h4>
                      <p className="text-lg text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setView('register')}
                className="mt-16 px-10 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
              >
                Get Started Now
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/5 blur-3xl rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" 
                className="relative rounded-[3rem] shadow-2xl" 
                alt="Team working"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="comparison" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6">Why Choose PrepMaster?</h3>
            <p className="text-xl text-slate-600">We don't just provide tests; we provide a complete ecosystem for your career growth.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex gap-6 p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all bg-white group">
                <div className={cn("flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", benefit.bg, benefit.color)}>
                  <benefit.icon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-3">{benefit.title}</h4>
                  <p className="text-lg text-slate-600 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <h3 className="text-4xl font-extrabold text-slate-900 text-center mb-16">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-lg font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", activeFaq === i && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-6 text-slate-600 leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-indigo-600 rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 blur-3xl rounded-full -ml-32 -mb-32" />
            
            <h3 className="text-4xl lg:text-6xl font-extrabold mb-8 relative z-10">Ready to accelerate your career?</h3>
            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto relative z-10">
              Join thousands of students who are already mastering their placement journey with PrepMaster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button 
                onClick={() => setView('register')}
                className="px-12 py-5 bg-white text-indigo-600 text-xl font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-xl active:scale-95"
              >
                Get Started for Free
              </button>
              <button className="px-12 py-5 bg-indigo-500 text-white text-xl font-bold rounded-2xl border-2 border-indigo-400 hover:bg-indigo-400 transition-all active:scale-95">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2 font-bold text-2xl text-white mb-8">
                <Award className="w-8 h-8 text-indigo-500" />
                PrepMaster
              </div>
              <p className="leading-relaxed mb-8">
                Empowering the next generation of tech talent through expert mentorship and data-driven preparation.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-sm">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Aptitude Tests</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Mock Interviews</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Resume Analyzer</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Career Pathing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-sm">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Our Mentors</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-sm">Newsletter</h4>
              <p className="mb-6">Get the latest career tips and platform updates.</p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2026 PrepMaster. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AuthView = ({ 
  type, 
  authForm, 
  setAuthForm, 
  handleLogin, 
  handleRegister, 
  loading, 
  setView 
}: { 
  type: 'login' | 'register', 
  authForm: any, 
  setAuthForm: any, 
  handleLogin: (e: React.FormEvent) => void, 
  handleRegister: (e: React.FormEvent) => void, 
  loading: boolean, 
  setView: (v: any) => void 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 blur-[120px] rounded-full opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 blur-[120px] rounded-full opacity-60" />
    </div>

    <Card className="w-full max-w-lg p-10 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] bg-white rounded-[2.5rem]">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{type === 'login' ? 'Welcome Back' : 'Join PrepMaster'}</h2>
        <p className="text-slate-500 mt-2 font-medium">
          {type === 'login' ? 'Continue your professional journey' : 'Start your path to placement success'}
        </p>
      </div>

      <form onSubmit={type === 'login' ? handleLogin : handleRegister} className="space-y-6">
        {type === 'register' && (
          <>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <input 
                required
                placeholder="John Doe"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                value={authForm.name}
                onChange={e => setAuthForm({...authForm, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  className={cn(
                    "py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2", 
                    authForm.role === 'student' 
                      ? "bg-indigo-50 border-indigo-600 text-indigo-600" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                  onClick={() => setAuthForm({...authForm, role: 'student'})}
                >
                  <GraduationCap className="w-5 h-5" />
                  Student
                </button>
                <button 
                  type="button"
                  className={cn(
                    "py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2", 
                    authForm.role === 'expert' 
                      ? "bg-indigo-50 border-indigo-600 text-indigo-600" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                  onClick={() => setAuthForm({...authForm, role: 'expert'})}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Expert
                </button>
              </div>
            </div>
            {authForm.role === 'expert' && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expertise Role</label>
                <select 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
                  value={authForm.expertise}
                  onChange={e => setAuthForm({...authForm, expertise: e.target.value})}
                >
                  <option value="">Select Role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
          </>
        )}
        
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
          <input 
            type="email"
            required
            placeholder="name@company.com"
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            value={authForm.email}
            onChange={e => setAuthForm({...authForm, email: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
          <input 
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            value={authForm.password}
            onChange={e => setAuthForm({...authForm, password: e.target.value})}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            type === 'login' ? 'Sign In' : 'Create Account'
          )}
        </Button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-slate-500 font-medium">
          {type === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setView(type === 'login' ? 'register' : 'login')}
            className="ml-2 text-indigo-600 font-black hover:underline"
          >
            {type === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </Card>
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'aptitude' | 'interviews' | 'profile' | 'resume' | 'resources' | 'earnings' | 'reviews' | 'history'>('landing');
  const [loading, setLoading] = useState(false);

  // Auth State
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', role: 'student' as 'student' | 'expert', expertise: '' });

  // Data State
  const [scores, setScores] = useState<AptitudeScore[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [experts, setExperts] = useState<User[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('prep_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setView('dashboard');
      fetchUserData(u);
    }
  }, []);

  const fetchUserData = async (u: User) => {
    if (u.role === 'student') {
      const sRes = await fetch(`/api/aptitude/scores/${u.id}`);
      setScores(await sRes.json());
      const bRes = await fetch(`/api/bookings/student/${u.id}`);
      setBookings(await bRes.json());
    } else {
      const bRes = await fetch(`/api/bookings/expert/${u.id}`);
      setBookings(await bRes.json());
      const aRes = await fetch(`/api/availability/${u.id}`);
      setAvailability(await aRes.json());
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authForm.email, password: authForm.password })
    });
    if (res.ok) {
      const u = await res.json();
      setUser(u);
      localStorage.setItem('prep_user', JSON.stringify(u));
      setView('dashboard');
      fetchUserData(u);
    } else {
      alert('Invalid credentials');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    });
    if (res.ok) {
      const u = await res.json();
      setUser(u);
      localStorage.setItem('prep_user', JSON.stringify(u));
      setAuthForm({ email: '', password: '', name: '', role: 'student', expertise: '' });
      setView('dashboard');
      fetchUserData(u);
    } else {
      alert('Error registering or email already exists.');
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prep_user');
    setAuthForm({ email: '', password: '', name: '', role: 'student', expertise: '' });
    setView('landing');
  };

  // --- Views ---

  if (view === 'landing') return <LandingView setView={setView} />;
  if (view === 'login' || view === 'register') return (
    <AuthView 
      type={view} 
      authForm={authForm} 
      setAuthForm={setAuthForm} 
      handleLogin={handleLogin} 
      handleRegister={handleRegister} 
      loading={loading} 
      setView={setView} 
    />
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col overflow-y-auto overflow-x-hidden">
        <div className="p-8 flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Award className="w-6 h-6" /> PrepMaster
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'aptitude', icon: BrainCircuit, label: 'Aptitude', studentOnly: true },
            { id: 'interviews', icon: Video, label: 'Interviews' },
            { id: 'earnings', icon: DollarSign, label: 'Earnings', expertOnly: true },
            { id: 'reviews', icon: Star, label: 'Reviews', expertOnly: true },
            { id: 'history', icon: History, label: 'History', expertOnly: true },
            { id: 'resume', icon: FileText, label: 'Resume Analyzer', studentOnly: true },
            { id: 'resources', icon: Library, label: 'Resources', studentOnly: true },
            { id: 'profile', icon: UserIcon, label: 'Profile' },
          ].map(item => {
            if (item.studentOnly && user?.role !== 'student') return null;
            if (item.expertOnly && user?.role !== 'expert') return null;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                  view === item.id ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-white shadow-sm">
                {user.photo_url ? (
                  <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.name[0]
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'dashboard' && user && (
              <DashboardView 
                user={user} 
                scores={scores} 
                bookings={bookings} 
                setView={setView} 
                fetchUserData={fetchUserData} 
              />
            )}
            {view === 'aptitude' && user && (
              <AptitudeView 
                user={user} 
                fetchUserData={fetchUserData} 
              />
            )}
            {view === 'interviews' && user && (
              <InterviewsView 
                user={user} 
                bookings={bookings} 
                fetchUserData={fetchUserData} 
              />
            )}
            {view === 'profile' && user && (
              <ProfileView user={user} setUser={setUser} />
            )}
            {view === 'resume' && user && (
              <ResumeAnalyzerView />
            )}
            {view === 'resources' && user?.role === 'student' && (
              <ResourcesView setView={setView} />
            )}
            {view === 'earnings' && user?.role === 'expert' && (
              <EarningsView user={user} />
            )}
            {view === 'reviews' && user?.role === 'expert' && (
              <ReviewsView user={user} />
            )}
            {view === 'history' && user?.role === 'expert' && (
              <HistoryView user={user} bookings={bookings} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


