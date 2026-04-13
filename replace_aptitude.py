import re

path = r'c:\Users\omzan\Desktop\Micro project\Placement-preparation-website\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. State
text = text.replace(
'''  const [section, setSection] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !quizFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswer(-1); // Auto-advance on timeout
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizFinished, currentQuestion]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && quizStarted && !quizFinished) {
        finishQuiz(answers);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [quizStarted, quizFinished, answers]);''',
'''  const [section, setSection] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);

  const answersRef = React.useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !quizFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            finishQuiz(answersRef.current);
            return 0;
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
  }, [quizStarted, quizFinished]);'''
)

# 2. startQuiz
text = text.replace(
'''  const startQuiz = (s: string) => {
    setSection(s);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizFinished(false);
    setTimeLeft(60);
  };''',
'''  const startInstructions = (s: string) => {
    setSection(s);
    setShowInstructions(true);
  };

  const startQuiz = () => {
    setShowInstructions(false);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizFinished(false);
    setTimeLeft(20 * 60);
  };'''
)

# 3. handleAnswer
text = text.replace(
'''  const handleAnswer = (idx: number) => {
    const questions = getQuestions();
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = idx;
    setAnswers(newAnswers);
    
    if (currentQuestion < (questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(60);
    } else {
      finishQuiz(newAnswers);
    }
  };''',
'''  const handleSelectOption = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = idx;
    setAnswers(newAnswers);
  };'''
)

# 4. onClick startInstructions
text = text.replace('onClick={() => startQuiz(s.name)}', 'onClick={() => startInstructions(s.name)}')

# 5. showInstructions Render
text = text.replace(
'''  if (!quizStarted) {
    return (
      <div className="space-y-10 pb-12">''',
'''  if (showInstructions && !quizStarted) {
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
              There is a global timer of 20 minutes for the entire section.
            </li>
            <li className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              You can navigate back and forth between questions before submitting.
            </li>
            <li className="flex items-start gap-3">
              <Target className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              The test automatically submits when the time is up or if you leave the page.
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
      <div className="space-y-10 pb-12">'''
)

# 6. Retake quiz parameter change
text = text.replace('onClick={() => startQuiz(section!)}', 'onClick={() => startInstructions(section!)}')


# 7. format time 
text = text.replace(
'''            <Clock className={cn("w-5 h-5", timeLeft <= 10 ? "text-rose-600" : "text-indigo-600")} />
            {timeLeft}s
          </div>''',
'''            <Clock className={cn("w-5 h-5", timeLeft <= 60 ? "text-rose-600" : "text-indigo-600")} />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>'''
)

# 8. time bar layout
text = text.replace(
'''              "h-full transition-all duration-1000 linear",
              timeLeft <= 10 ? "bg-rose-500" : "bg-indigo-500"
            )} 
            style={{ width: ${(timeLeft / 60) * 100}% }} 
          />''',
'''              "h-full transition-all duration-1000 linear",
              timeLeft <= 60 ? "bg-rose-500" : "bg-indigo-500"
            )} 
            style={{ width: ${(timeLeft / 1200) * 100}% }} 
          />'''
)

# 9. ui selection options and skip
text = text.replace(
'''          {q.options.map((opt: string, i: number) => (
            <button 
              key={i}
              className="group w-full p-6 text-left rounded-[1.5rem] border-2 border-slate-50 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-between"
              onClick={() => handleAnswer(i)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-black text-slate-400 transition-colors">
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-lg font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">{opt}</span>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-600 group-hover:bg-indigo-600 transition-all" />
            </button>
          ))}
        </div>
      </Card>
      
      <div className="mt-8 flex justify-between items-center px-4">
        <p className="text-slate-400 text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Auto-submits if you switch tabs
        </p>
        <button 
          onClick={() => handleAnswer(-1)}
          className="text-slate-400 hover:text-indigo-600 font-bold text-sm flex items-center gap-1 transition-colors"
        >
          Skip Question <ChevronRight className="w-4 h-4" />
        </button>
      </div>''',
'''          {q.options.map((opt: string, i: number) => {
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
      
      <div className="mt-8 flex justify-between items-center px-4">
        <Button 
          variant="outline" 
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
          className="rounded-xl px-6 font-bold"
        >
          Previous
        </Button>
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
      </div>'''
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Replacement complete.")
