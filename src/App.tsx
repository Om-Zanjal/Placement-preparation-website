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
  Edit3
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
  Cell 
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
  }, []);

  const aggregateScores = () => {
    const data: Record<string, { score: number, total: number }> = {};
    scores.forEach(s => {
      if (s.section === "Full Mock Test") return;
      if (!data[s.section]) data[s.section] = { score: 0, total: 0 };
      data[s.section].score += s.score;
      data[s.section].total += s.total;
    });
    return Object.entries(data).map(([name, val]) => ({
      name,
      accuracy: Math.round((val.score / val.total) * 100),
      score: val.score,
      total: val.total
    }));
  };

  const mockTests = scores.filter(s => s.section === "Full Mock Test").slice(0, 5);

  const chartData = aggregateScores();
  const bestSection = chartData.sort((a, b) => b.accuracy - a.accuracy)[0];
  const avgAccuracy = chartData.length ? Math.round(chartData.reduce((acc, curr) => acc + curr.accuracy, 0) / chartData.length) : 0;

  const getSuggestedRole = () => {
    if (!bestSection) return "Keep practicing!";
    if (bestSection.name === "Quantitative Aptitude") return "Data Analyst / Backend Dev";
    if (bestSection.name === "Logical Reasoning") return "Software Engineer / Architect";
    if (bestSection.name === "Verbal Ability") return "Product Manager / HR";
    return "Full Stack Developer";
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Welcome back, {user.name}!</h2>
          <p className="text-slate-500">Here's your preparation overview</p>
        </div>
        {user.role === 'student' && (
          <Button onClick={() => setView('aptitude')} className="flex gap-2 items-center">
            <BrainCircuit className="w-4 h-4" /> Start New Quiz
          </Button>
        )}
      </div>

      {user.role === 'student' ? (
        <>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-indigo-600 text-white">
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Avg Accuracy</p>
              <h3 className="text-4xl font-bold mt-2">{avgAccuracy}%</h3>
              <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${avgAccuracy}%` }} />
              </div>
            </Card>
            <Card>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Best Section</p>
              <h3 className="text-xl font-bold mt-2">{bestSection?.name || 'N/A'}</h3>
              <p className="text-emerald-600 font-medium text-sm mt-1">{bestSection ? `${bestSection.accuracy}% Accuracy` : 'No data yet'}</p>
            </Card>
            <Card>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Suggested Role</p>
              <h3 className="text-xl font-bold mt-2">{getSuggestedRole()}</h3>
              <p className="text-indigo-600 font-medium text-sm mt-1">Based on strengths</p>
            </Card>
            <Card>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Interviews</p>
              <h3 className="text-xl font-bold mt-2">{bookings.length} Scheduled</h3>
              <p className="text-slate-400 text-sm mt-1">Next: {bookings[0] ? format(parseISO(bookings[0].start_time), 'MMM d, h:mm a') : 'None'}</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" /> Section Performance
              </h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-600" /> Recent Mock Tests
              </h4>
              <div className="space-y-4">
                {mockTests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4 text-sm">No mock tests taken yet</p>
                    <Button variant="outline" size="sm" onClick={() => setView('aptitude')}>Take Test</Button>
                  </div>
                ) : (
                  mockTests.map(m => (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-sm">Full Mock Test</p>
                        <span className="text-xs font-bold text-indigo-600">{Math.round((m.score/m.total)*100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-slate-500">{format(parseISO(m.timestamp), 'MMM d, yyyy')}</p>
                        <p className="text-[10px] text-slate-400">{m.score}/{m.total} Correct</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" /> Upcoming Interviews
              </h4>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">No interviews scheduled</p>
                    <Button variant="outline" onClick={() => setView('interviews')}>Book Now</Button>
                  </div>
                ) : (
                  bookings.slice(0, 3).map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-sm">{b.expert_name}</p>
                        <p className="text-xs text-slate-500">{b.role}</p>
                        <p className="text-[10px] text-indigo-600 font-medium mt-1">{format(parseISO(b.start_time), 'MMM d, h:mm a')}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setView('interviews')}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Manage Availability (Next 3 Days)
            </h4>
            <ExpertAvailabilityManager expertId={user.id} onUpdate={() => fetchUserData(user)} />
          </Card>
          <Card>
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600" /> Today's Interviews
            </h4>
            <div className="space-y-4">
              {bookings.filter(b => isSameDay(parseISO(b.start_time), new Date())).length === 0 ? (
                <p className="text-center py-8 text-slate-400">No interviews today</p>
              ) : (
                bookings.filter(b => isSameDay(parseISO(b.start_time), new Date())).map(b => (
                  <div key={b.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{b.student_name}</p>
                        <p className="text-xs text-slate-500">{b.role}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                        {format(parseISO(b.start_time), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1 text-xs py-1" onClick={() => setView('interviews')}>Join & View Profile</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = (s: string) => {
    setSection(s);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizFinished(false);
  };

  const getQuestions = () => {
    if (section === "Full Mock Test") {
      return Object.entries(MOCK_QUESTIONS).flatMap(([secName, qs]) => 
        qs.map(q => ({ ...q, sectionName: secName }))
      );
    }
    return (MOCK_QUESTIONS[section!] || []).map(q => ({ ...q, sectionName: section }));
  };

  const handleAnswer = (idx: number) => {
    const questions = getQuestions();
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (currentQuestion < (questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    const questions = getQuestions();
    
    if (section === "Full Mock Test") {
      const sectionResults: Record<string, { correct: number, total: number }> = {};
      finalAnswers.forEach((ans, i) => {
        const q = questions[i];
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
            total: res.total
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
          total: totalQuestions
        })
      }));

      await Promise.all(promises);
    } else {
      let correct = 0;
      finalAnswers.forEach((ans, i) => {
        if (ans === questions[i].correct) correct++;
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

  if (!quizStarted) {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Aptitude Preparation</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {APTITUDE_SECTIONS.map(s => (
            <Card 
              key={s} 
              className={cn(
                "hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden",
                s === "Full Mock Test" ? "bg-indigo-600 text-white border-indigo-600" : ""
              )} 
              onClick={() => startQuiz(s)}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                s === "Full Mock Test" ? "bg-white/20" : "bg-indigo-50 group-hover:bg-indigo-600"
              )}>
                <BrainCircuit className={cn(
                  "w-6 h-6 transition-colors",
                  s === "Full Mock Test" ? "text-white" : "text-indigo-600 group-hover:text-white"
                )} />
              </div>
              <h3 className="font-bold text-lg mb-2">{s}</h3>
              <p className={cn(
                "text-sm",
                s === "Full Mock Test" ? "text-indigo-100" : "text-slate-500"
              )}>
                {s === "Full Mock Test" 
                  ? "A comprehensive test covering all aptitude sections to evaluate your overall readiness."
                  : `Practice questions to improve your ${s.toLowerCase()} skills.`}
              </p>
              <div className={cn(
                "mt-4 flex items-center font-medium text-sm",
                s === "Full Mock Test" ? "text-white" : "text-indigo-600"
              )}>
                Start {s === "Full Mock Test" ? "Mock Test" : "Practice"} <ChevronRight className="w-4 h-4 ml-1" />
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
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Card>
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 mb-8">You've successfully completed the {section}.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-slate-500 text-sm uppercase font-bold">Score</p>
              <p className="text-3xl font-bold">{correct} / {questions.length}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-slate-500 text-sm uppercase font-bold">Accuracy</p>
              <p className="text-3xl font-bold">{Math.round((correct/questions.length)*100)}%</p>
            </div>
          </div>

          <Button className="w-full" onClick={() => setQuizStarted(false)}>Back to Aptitude</Button>
        </Card>
      </div>
    );
  }

  const questions = getQuestions();
  const q = questions[currentQuestion];

  if (!q) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold">{section}</h3>
        <span className="text-slate-500 font-medium">Question {currentQuestion + 1} of {questions.length}</span>
      </div>
      <Card className="mb-6">
        <p className="text-xl font-medium leading-relaxed mb-8">{q.text}</p>
        <div className="space-y-3">
          {q.options.map((opt: string, i: number) => (
            <button 
              key={i}
              className="w-full p-4 text-left rounded-xl border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-between group"
              onClick={() => handleAnswer(i)}
            >
              <span className="font-medium">{opt}</span>
              <div className="w-6 h-6 rounded-full border border-gray-300 group-hover:border-indigo-600" />
            </button>
          ))}
        </div>
      </Card>
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

  const startBooking = () => setBookingStep('select_role');

  const handleRoleSelect = async (role: string) => {
    setSelectedRole(role);
    const res = await fetch(`/api/experts?role=${encodeURIComponent(role)}`);
    setAvailableExperts(await res.json());
    setBookingStep('select_expert');
  };

  const handleExpertSelect = async (expert: User) => {
    setSelectedExpert(expert);
    const res = await fetch(`/api/availability/${expert.id}`);
    setExpertSlots((await res.json()).filter((s: any) => s.status === 'available'));
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
      const res = await fetch(`/api/bookings/${booking.id}/join`, { method: 'POST', body: JSON.stringify({ role: 'student' }) });
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Mock Interviews</h2>
        {user?.role === 'student' && bookingStep === 'list' && (
          <Button onClick={startBooking} className="flex gap-2 items-center">
            <Video className="w-4 h-4" /> Book New Interview
          </Button>
        )}
      </div>

      {bookingStep === 'list' ? (
        <div className="grid gap-6">
          {bookings.length === 0 ? (
            <Card className="text-center py-20">
              <Video className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">No interviews scheduled yet</h3>
            </Card>
          ) : (
            bookings.map(b => (
              <Card key={b.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                    {(user?.role === 'student' ? b.expert_name : b.student_name)?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{user?.role === 'student' ? b.expert_name : b.student_name}</h4>
                    <p className="text-slate-500 text-sm">{b.role} Interview</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" /> {format(parseISO(b.start_time), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> {format(parseISO(b.start_time), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {user?.role === 'expert' && (
                    <Button variant="outline" onClick={() => setViewingStudentProfile(b)}>View Profile</Button>
                  )}
                  {user?.role === 'expert' && b.status === 'scheduled' && (
                    <Button variant="outline" onClick={() => {
                      const rating = prompt('Enter rating (1-5):');
                      const feedback = prompt('Enter feedback:');
                      if (rating && feedback) {
                        fetch(`/api/bookings/${b.id}/rate`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ rating: parseInt(rating), feedback })
                        }).then(() => fetchUserData(user!));
                      }
                    }}>Rate Student</Button>
                  )}
                  {b.status === 'scheduled' ? (
                    <Button onClick={() => joinMeeting(b)} className="flex gap-2 items-center">
                      <Video className="w-4 h-4" /> Join Meeting
                    </Button>
                  ) : (
                    <div className="text-right">
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-4 h-4", i < (b.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-slate-200")} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 italic">"{b.feedback}"</p>
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
    grad_year: user.grad_year || ''
  });

  const isProfileComplete = user.bio && user.college && user.github_url && user.linkedin_url && user.photo_url;

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
      grad_year: user.grad_year || ''
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
            <p className="text-slate-500">Add more details to help experts understand your background</p>
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
                <label className="block text-sm font-medium mb-1">Target Role / Expertise</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Frontend Developer"
                  value={formData.expertise}
                  onChange={e => setFormData({...formData, expertise: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Graduation Year</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 2025"
                  value={formData.grad_year}
                  onChange={e => setFormData({...formData, grad_year: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">College Name</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. IIT Bombay"
                  value={formData.college}
                  onChange={e => setFormData({...formData, college: e.target.value})}
                />
              </div>
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
              <div>
                <label className="block text-sm font-medium mb-1">GitHub Profile Link</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://github.com/username"
                  value={formData.github_url}
                  onChange={e => setFormData({...formData, github_url: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn Profile Link</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin_url}
                  onChange={e => setFormData({...formData, linkedin_url: e.target.value})}
                />
              </div>
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

  if (!isProfileComplete && user.role === 'student') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Your Profile</h2>
          <Button onClick={handleEdit} className="flex gap-2 items-center">
            <Edit3 className="w-4 h-4" /> Complete Profile
          </Button>
        </div>
        <Card>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold overflow-hidden border-4 border-white shadow-md">
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user.name[0]
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{user.name}</h3>
              <p className="text-slate-500">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-amber-800 text-sm font-medium">Your profile is incomplete. Complete it to stand out to experts!</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-indigo-100 border-4 border-white shadow-lg flex items-center justify-center">
            {user.photo_url ? (
              <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-indigo-600 text-5xl font-bold">
                {user.name[0]}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500 flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                {user.role}
              </span>
              {user.expertise && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  {user.expertise}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={handleEdit} className="flex gap-2 items-center">
          <Edit3 className="w-4 h-4" /> Edit Profile
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-600" /> Professional Bio
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {user.bio || 'No bio provided yet.'}
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.skills ? user.skills.split(',').map((s, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                  {s.trim()}
                </span>
              )) : <p className="text-slate-400 text-sm italic">No skills added yet.</p>}
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600" /> Education
              </h3>
              <div className="space-y-2">
                <p className="font-bold text-slate-800">{user.college || 'Not specified'}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="w-4 h-4" /> {user.city}, {user.state}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <GraduationCap className="w-4 h-4" /> Class of {user.grad_year || 'N/A'}
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Resume
              </h3>
              {user.resume_url ? (
                <a 
                  href={user.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-all"
                >
                  <span className="font-medium text-sm">View Resume</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p className="text-slate-400 text-sm italic">No resume uploaded.</p>
              )}
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card>
            <h3 className="text-lg font-bold mb-6">Connect</h3>
            <div className="space-y-4">
              {user.github_url && (
                <a 
                  href={user.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">GitHub</p>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">View Profile</p>
                  </div>
                </a>
              )}
              {user.linkedin_url && (
                <a 
                  href={user.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0077B5] flex items-center justify-center text-white">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">LinkedIn</p>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">View Profile</p>
                  </div>
                </a>
              )}
              {!user.github_url && !user.linkedin_url && (
                <p className="text-slate-400 text-sm italic">No social links added.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ResumeAnalyzerView = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data
              }
            },
            {
              text: `Analyze this resume for the role of ${targetRole}. 
              
              CRITICAL: Start your response with "Overall Score: [X]/100" where X is the numerical score.
              
              Provide a detailed breakdown including:
              1. Overall Score (out of 100)
              2. Key Strengths
              3. Areas for Improvement
              4. Actionable Suggestions
              
              Format the output using professional Markdown with clear headings and bullet points. Use bold text for emphasis.`
            }
          ]
        }
      });
      setAnalysis(response.text || "Failed to generate analysis.");
    } catch (error) {
      console.error(error);
      setAnalysis("Error analyzing resume. Please try again. Make sure the PDF is not password protected.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <FileText className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">AI Resume Analyzer</h2>
          <p className="text-slate-500">Upload your PDF resume for expert AI feedback</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Target Role</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
            >
              <option value="">Select a role...</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div className="relative group">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Upload PDF Resume</label>
            <div className={cn(
              "border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center",
              file ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-indigo-500 hover:bg-indigo-50"
            )}>
              <input 
                type="file" 
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                file ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
              )}>
                {file ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
              </div>
              <h4 className="font-bold text-slate-700">
                {file ? file.name : "Click or drag to upload"}
              </h4>
              <p className="text-slate-500 text-sm mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF files only, max 5MB"}
              </p>
            </div>
          </div>

          <Button 
            className="w-full py-4 text-lg flex items-center justify-center gap-2" 
            onClick={analyzeResume}
            disabled={loading || !file || !targetRole}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
            {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
          </Button>
        </Card>

        <Card className="bg-white border-2 border-slate-100 h-[600px] flex flex-col overflow-hidden">
          {analysis ? (
            <div className="flex flex-col h-full">
              {/* Score Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Analysis Result</h4>
                  <p className="text-xs text-slate-400 mt-1">Tailored for {targetRole}</p>
                </div>
                {(() => {
                  const scoreMatch = analysis.match(/Score:\s*(\d+)/i) || analysis.match(/(\d+)\/100/);
                  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
                  if (!score) return null;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-black text-indigo-600 leading-none">{score}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center relative overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-indigo-600 origin-bottom transition-all duration-1000" 
                          style={{ height: `${score}%` }}
                        />
                        <span className="relative z-10 text-[10px] font-bold text-slate-700 mix-blend-difference invert">
                          {score}%
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="prose prose-indigo prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-indigo-600 prose-li:text-slate-600">
                  <Markdown>{analysis}</Markdown>
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-4 border-t border-slate-100 bg-white flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => setAnalysis(null)} className="text-slate-400 hover:text-indigo-600">
                  Clear & Start Over
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Ready for Analysis</h4>
              <p className="text-slate-500 text-sm mt-2 max-w-[250px] mx-auto">
                Upload your PDF resume and select your target role to get a detailed AI breakdown.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const ResourcesView = ({ setView }: { setView: (v: any) => void }) => {
  const resources = [
    {
      title: "Common HR Interview Questions",
      items: [
        { q: "Tell me about yourself", a: "Focus on your professional journey, key achievements, and why you're a fit for this specific role." },
        { q: "What are your strengths and weaknesses?", a: "Be honest. For weaknesses, show how you're working to improve them." },
        { q: "Why should we hire you?", a: "Connect your skills directly to the company's needs and culture." }
      ]
    },
    {
      title: "Technical Preparation",
      items: [
        { q: "Data Structures", a: "Master Arrays, Linked Lists, Trees, and Graphs. Understand time complexities." },
        { q: "Algorithms", a: "Practice Sorting, Searching, Dynamic Programming, and Greedy algorithms." },
        { q: "System Design", a: "Learn about scalability, load balancing, and database sharding for senior roles." }
      ]
    }
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
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <Library className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Placement Resources</h2>
          <p className="text-slate-500">Curated guides and common questions to help you ace your interviews</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {resources.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.items.map((item, i) => (
                  <Card key={i} className="hover:border-indigo-200 transition-all">
                    <h4 className="font-bold text-indigo-600 mb-2">Q: {item.q}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <Card className="bg-slate-900 text-white">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Interview Checklist
            </h3>
            <ul className="space-y-4">
              {checklist.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-indigo-600 text-white p-6">
            <h3 className="text-lg font-bold mb-2">Need a Mock Interview?</h3>
            <p className="text-indigo-100 text-sm mb-6">Get feedback from real industry experts.</p>
            <Button 
              variant="secondary" 
              className="w-full bg-white text-indigo-600 hover:bg-indigo-50"
              onClick={() => setView('interviews')}
            >
              Book Now
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

const LandingView = ({ setView }: { setView: (v: any) => void }) => (
  <div className="min-h-screen bg-slate-50">
    <nav className="flex items-center justify-between px-8 py-6 bg-white border-bottom border-gray-100">
      <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
        <Award className="w-8 h-8" />
        PrepMaster
      </div>
      <div className="flex gap-4">
        <Button variant="ghost" onClick={() => setView('login')}>Login</Button>
        <Button onClick={() => setView('register')}>Get Started</Button>
      </div>
    </nav>
    
    <main className="max-w-7xl mx-auto px-8 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-6xl font-bold text-slate-900 leading-tight mb-6">
            Master Your <span className="text-indigo-600">Placement</span> Journey.
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            The all-in-one platform for mock interviews with industry experts, 
            aptitude mastery, and personalized career pathing.
          </p>
          <div className="flex gap-4">
            <Button className="px-8 py-4 text-lg" onClick={() => setView('register')}>Start Preparing</Button>
            <Button variant="outline" className="px-8 py-4 text-lg">View Experts</Button>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full" />
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000" 
            alt="Professional Interview" 
            className="relative rounded-3xl shadow-2xl border-8 border-white"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      <div className="mt-32 grid md:grid-cols-3 gap-8">
        {[
          { icon: BrainCircuit, title: "Aptitude Quizzes", desc: "Section-wise practice with real-time accuracy tracking." },
          { icon: Video, title: "Mock Interviews", desc: "1-on-1 sessions with experts from top tech companies." },
          { icon: BarChart3, title: "Career Insights", desc: "Data-driven role suggestions based on your strengths." }
        ].map((feature, i) => (
          <Card key={i} className="hover:border-indigo-200 transition-colors">
            <feature.icon className="w-12 h-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-slate-600">{feature.desc}</p>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

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
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <Award className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold">{type === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-slate-500 mt-2">
          {type === 'login' ? 'Continue your preparation journey' : 'Join thousands of successful students'}
        </p>
      </div>

      <form onSubmit={type === 'login' ? handleLogin : handleRegister} className="space-y-4">
        {type === 'register' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input 
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={authForm.name}
                onChange={e => setAuthForm({...authForm, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">I am a...</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  className={cn("flex-1 py-2 rounded-lg border", authForm.role === 'student' ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "border-gray-200")}
                  onClick={() => setAuthForm({...authForm, role: 'student'})}
                >Student</button>
                <button 
                  type="button"
                  className={cn("flex-1 py-2 rounded-lg border", authForm.role === 'expert' ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "border-gray-200")}
                  onClick={() => setAuthForm({...authForm, role: 'expert'})}
                >Expert</button>
              </div>
            </div>
            {authForm.role === 'expert' && (
              <div>
                <label className="block text-sm font-medium mb-1">Expertise Role</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none"
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
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input 
            type="email"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={authForm.email}
            onChange={e => setAuthForm({...authForm, email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={authForm.password}
            onChange={e => setAuthForm({...authForm, password: e.target.value})}
          />
        </div>
        <Button type="submit" className="w-full py-3 text-lg" disabled={loading}>
          {loading ? 'Processing...' : type === 'login' ? 'Sign In' : 'Register'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        {type === 'login' ? (
          <p>Don't have an account? <button onClick={() => setView('register')} className="text-indigo-600 font-medium">Register</button></p>
        ) : (
          <p>Already have an account? <button onClick={() => setView('login')} className="text-indigo-600 font-medium">Login</button></p>
        )}
      </div>
    </Card>
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'aptitude' | 'interviews' | 'profile' | 'resume' | 'resources'>('landing');
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
      setView('dashboard');
      fetchUserData(u);
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prep_user');
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
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8 flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Award className="w-6 h-6" /> PrepMaster
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'aptitude', icon: BrainCircuit, label: 'Aptitude', studentOnly: true },
            { id: 'interviews', icon: Video, label: 'Interviews' },
            { id: 'resume', icon: FileText, label: 'Resume Analyzer', studentOnly: true },
            { id: 'resources', icon: Library, label: 'Resources' },
            { id: 'profile', icon: UserIcon, label: 'Profile' },
          ].map(item => {
            if (item.studentOnly && user?.role !== 'student') return null;
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
            {view === 'resources' && user && (
              <ResourcesView setView={setView} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Helper Components ---

function ExpertAvailabilityManager({ expertId, onUpdate }: { expertId: number, onUpdate: () => void }) {
  const [slots, setSlots] = useState<{ start_time: string, end_time: string }[]>([]);
  const days = [0, 1, 2].map(d => addDays(startOfToday(), d));

  const toggleSlot = (day: Date, hour: number) => {
    const start = day;
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);
    
    const isoStart = start.toISOString();
    const exists = slots.find(s => s.start_time === isoStart);
    
    if (exists) {
      setSlots(slots.filter(s => s.start_time !== isoStart));
    } else {
      setSlots([...slots, { start_time: isoStart, end_time: end.toISOString() }]);
    }
  };

  const save = async () => {
    await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expert_id: expertId, slots })
    });
    alert('Availability updated!');
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {days.map(day => (
          <div key={day.toISOString()} className="space-y-2">
            <p className="text-center font-bold text-sm text-slate-500 mb-4">{format(day, 'EEE, MMM d')}</p>
            {[9, 10, 11, 14, 15, 16, 17].map(hour => {
              const d = new Date(day);
              d.setHours(hour, 0, 0, 0);
              const iso = d.toISOString();
              const isActive = slots.some(s => s.start_time === iso);
              return (
                <button
                  key={hour}
                  onClick={() => toggleSlot(day, hour)}
                  className={cn(
                    "w-full py-2 rounded-lg text-xs font-bold transition-all border",
                    isActive ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                  )}
                >
                  {hour > 12 ? `${hour-12} PM` : `${hour} AM`}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <Button className="w-full" onClick={save}>Save Availability</Button>
    </div>
  );
}
