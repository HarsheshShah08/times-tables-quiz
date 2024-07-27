import React, { useState, useEffect } from 'react';
import './App.css';

// Default settings
const defaultSettings = {
  timeLimit: 15,
  numberOfQuestions: 20,
  includedMultiplicands: Array.from({ length: 19 }, (_, i) => i + 1), // Multiplicands 1 to 19
  includedMultipliers: Array.from({ length: 19 }, (_, i) => i + 1)  // Multipliers 1 to 19
};

// Function to check if the question is excluded
const isExcludedQuestion = (a, b, excludedTables) => {
  return excludedTables.includes(a) || excludedTables.includes(b);
};

// Function to generate questions
const generateQuestions = (numberOfQuestions, includedMultiplicands, includedMultipliers) => {
  const questions = [];
  const excludedTables = [2, 3, 4, 5, 10, 11]; // Static exclusions as per your requirements
  while (questions.length < numberOfQuestions) {
    const a = includedMultiplicands[Math.floor(Math.random() * includedMultiplicands.length)];
    const b = includedMultipliers[Math.floor(Math.random() * includedMultipliers.length)];
    if (!isExcludedQuestion(a, b, excludedTables)) {
      questions.push({ a, b, startTime: 0, endTime: 0, answer: null, correct: null });
    }
  }
  return questions;
};

const App = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [answer, setAnswer] = useState('');
  const [quizEnded, setQuizEnded] = useState(false);
  const [quizTerminated, setQuizTerminated] = useState(false);
  const [error, setError] = useState(null);
  const [inSettingsMode, setInSettingsMode] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (timeLeft > 0 && !quizEnded && !quizTerminated) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      submitAnswer();
    }
  }, [timeLeft, quizEnded, quizTerminated]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex].startTime = Date.now();
      setQuestions(updatedQuestions);
    }
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];

  const submitAnswer = () => {
    try {
      const parsedAnswer = parseInt(answer);
      if (isNaN(parsedAnswer)) {
        throw new Error('Answer must be a number');
      }
      const updatedQuestions = [...questions];
      const question = updatedQuestions[currentQuestionIndex];
      question.endTime = Date.now();
      question.answer = parsedAnswer;
      question.correct = question.answer === question.a * question.b;
      setQuestions(updatedQuestions);

      setFeedback(question.correct ? 'Correct!' : `Wrong! The correct answer was ${question.a * question.b}`);
      setTimeout(() => {
        setFeedback(null);
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setAnswer('');
          setTimeLeft(settings.timeLimit);
        } else {
          setQuizEnded(true);
        }
      }, 2000); // Wait for 2 seconds before moving to the next question
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = () => {
    setError(null);
    submitAnswer();
  };

  const handleInputChange = (e) => {
    setError(null);
    setAnswer(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'timeLimit') {
      setSettings(prevSettings => ({ ...prevSettings, [name]: parseInt(value) }));
    } else if (name === 'numberOfQuestions') {
      setSettings(prevSettings => ({ ...prevSettings, [name]: parseInt(value) }));
    } else if (name === 'includedMultiplicands' || name === 'includedMultipliers') {
      setSettings(prevSettings => {
        const newValues = type === 'checkbox'
          ? checked
            ? [...prevSettings[name], parseInt(value)]
            : prevSettings[name].filter(item => item !== parseInt(value))
          : prevSettings[name];
        return { ...prevSettings, [name]: newValues };
      });
    }
  };

  const handleStartQuiz = () => {
    const newQuestions = generateQuestions(settings.numberOfQuestions, settings.includedMultiplicands, settings.includedMultipliers);
    newQuestions[0].startTime = Date.now(); // Initialize start time for the first question
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setTimeLeft(settings.timeLimit);
    setAnswer('');
    setQuizEnded(false);
    setQuizTerminated(false);
    setInSettingsMode(false);
    setError(null);
    setFeedback(null);
  };  

  const handleRestartQuiz = () => {
    handleStartQuiz();
  };

  const handleGoToSettings = () => {
    setInSettingsMode(true);
  };

  const handleTerminateQuiz = () => {
    setQuizTerminated(true); // Set termination state to true
    setQuizEnded(true); // End the quiz
  };

  const renderSettings = () => (
    <div>
      <h2>Settings</h2>
      <label>
        Time Limit (seconds):
        <input 
          type="number" 
          name="timeLimit" 
          value={settings.timeLimit} 
          onChange={handleSettingsChange} 
          min="5" 
          max="60" 
        />
      </label>
      <br />
      <label>
        Number of Questions:
        <input 
          type="number" 
          name="numberOfQuestions" 
          value={settings.numberOfQuestions} 
          onChange={handleSettingsChange} 
          min="5" 
          max="50" 
        />
      </label>
      <br />
      <fieldset>
        <legend>Include Multiplicands:</legend>
        {Array.from({ length: 19 }, (_, i) => i + 1).map(num => (
          <label key={num}>
            <input 
              type="checkbox" 
              name="includedMultiplicands" 
              value={num} 
              checked={settings.includedMultiplicands.includes(num)} 
              onChange={handleSettingsChange} 
            />
            {num}
          </label>
        ))}
      </fieldset>
      <br />
      <fieldset>
        <legend>Include Multipliers:</legend>
        {Array.from({ length: 19 }, (_, i) => i + 1).map(num => (
          <label key={num}>
            <input 
              type="checkbox" 
              name="includedMultipliers" 
              value={num} 
              checked={settings.includedMultipliers.includes(num)} 
              onChange={handleSettingsChange} 
            />
            {num}
          </label>
        ))}
      </fieldset>
      <br />
      <button onClick={handleStartQuiz}>Start Quiz</button>
    </div>
  );

  const renderQuestion = () => (
    <div>
      <h2>What is {currentQuestion.a} x {currentQuestion.b}?</h2>
      <div id="timer">Time Left: {timeLeft}s</div>
      <input 
        type="number" 
        value={answer} 
        onChange={handleInputChange} 
        onKeyPress={handleKeyPress} 
        placeholder="Your answer" 
        aria-label="Answer"
      />
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={handleTerminateQuiz}>Terminate Quiz</button>
      {error && <p className="error">{error}</p>}
    </div>
  );

  const renderFeedback = () => (
    <div className="feedback">
      <h2>{feedback}</h2>
    </div>
  );

  const renderSummary = () => {
    const answeredQuestions = questions.filter(q => q.answer !== null);
    const totalCorrect = answeredQuestions.filter(q => q.correct).length;
    const totalTime = answeredQuestions.reduce((sum, q) => sum + (q.endTime - q.startTime) / 1000, 0);
    const averageTime = answeredQuestions.length ? totalTime / answeredQuestions.length : 0;

    return (
      <div>
        <h2>Quiz Summary</h2>
        <ul>
          {answeredQuestions.map((q, index) => (
            <li key={index}>
              Q{index + 1}: {q.a} x {q.b} = {q.a * q.b}, Your Answer: {q.answer}, 
              {q.correct ? 'Correct' : 'Wrong'}, Time Taken: {((q.endTime - q.startTime) / 1000).toFixed(2)}s
            </li>
          ))}
        </ul>
        <p>Total Correct: {totalCorrect} / {answeredQuestions.length}</p>
        <p>Average Time per Answered Question: {averageTime.toFixed(2)}s</p>
        <button onClick={handleRestartQuiz}>Start Again</button>
        <button onClick={handleGoToSettings}>Go to Settings</button>
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Time Tables Quiz</h1>
      {inSettingsMode ? renderSettings() : (quizEnded ? renderSummary() : (feedback ? renderFeedback() : (questions.length ? renderQuestion() : renderSettings())))}
    </div>
  );
};

export default App;