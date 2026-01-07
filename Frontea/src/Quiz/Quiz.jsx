import React, { useState, useLayoutEffect } from 'react';
import './Quiz.css';

function QuizPage() {
  const [etape, setEtape] = useState('menu'); 
  const [loading, setLoading] = useState(false);
  const [domaine, setDomaine] = useState('Mathématiques');
  const [niveau, setNiveau] = useState('Débutant');
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0); 
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  useLayoutEffect(() => {
    document.body.classList.add("quize-page");
    return () => document.body.classList.remove("quize-page");
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5003/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domaine, niveau }),
      });
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        setEtape('jeu');
        setQuestionIndex(0);
        setScore(0);
        setSelectedOption(null);
      } else {
        alert(data.message || "Erreur lors de la génération du quiz");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion avec le serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleReponse = (choix) => {
    const isCorrect = choix === questions[questionIndex].reponse;
    setSelectedOption(choix);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Affiche le feedback pendant 1 seconde avant de passer à la suite
    setTimeout(() => {
      setSelectedOption(null);
      if (questionIndex + 1 < questions.length) {
        setQuestionIndex(questionIndex + 1);
      } else {
        setEtape('fin');
      }
    }, 1000);
  };

  const handleRestart = () => {
    setEtape('menu');
    setScore(0);
    setQuestionIndex(0);
    setQuestions([]);
    setSelectedOption(null);
  };

  const handleExit = () => {
    // Retour à la page précédente
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const getProgressPercentage = () => {
    if (questions.length === 0) return 0;
    return ((questionIndex + 1) / questions.length) * 100;
  };

  const getOptionClass = (option) => {
    if (selectedOption === null) return "btn-option";
    
    const isCorrectAnswer = option === questions[questionIndex].reponse;
    const isSelected = option === selectedOption;
    
    if (isCorrectAnswer) return "btn-option correct";
    if (isSelected && !isCorrectAnswer) return "btn-option incorrect";
    return "btn-option";
  };

  const domaines = [
    'Mathématiques',
    'Physique', 
    'Chimie',
    'Informatique',
    'Biologie',
    'Histoire',
    'Français',
    'Anglais',
    'Économie',
    'Philosophie'
  ];

  const niveaux = [
    'Débutant',
    'Intermédiaire',
    'Avancé',
    'Expert'
  ];

  return (
    <div className="app-layout">
      {/* BOUTON EXIT - Visible sur toutes les pages sauf fin */}
      {etape !== 'fin' && (
        <button 
          className="btn-exit" 
          onClick={handleExit} 
          title="Retour"
          aria-label="Retour à l'accueil"
        >
          ✕
        </button>
      )}

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-center-container">
          <div className="nav-brand">
            <i className="fas fa-graduation-cap" style={{ marginRight: '10px' }}></i>
            EduMeet
          </div>
          {etape === 'jeu' && (
            <div className="quiz-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {questionIndex + 1}/{questions.length}
              </span>
            </div>
          )}
        </div>
      </nav>

      <main className="main-content">
        <div className="quiz-card">
          {/* MENU */}
          {etape === 'menu' && (
            <>
              <div className="quiz-header">
                <h1>Quiz 🎯</h1>
                <p>Configurez votre session de quiz personnalisée</p>
              </div>
              
              <div className="quiz-config">
                <div className="form-group">
                  <label htmlFor="domaine-select">Domaine</label>
                  <div className="select-wrapper">
                    <select 
                      id="domaine-select"
                      className="custom-select" 
                      value={domaine} 
                      onChange={(e) => setDomaine(e.target.value)}
                      disabled={loading}
                    >
                      {domaines.map((dom, index) => (
                        <option key={index} value={dom}>{dom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="niveau-select">Niveau</label>
                  <div className="select-wrapper">
                    <select 
                      id="niveau-select"
                      className="custom-select" 
                      value={niveau} 
                      onChange={(e) => setNiveau(e.target.value)}
                      disabled={loading}
                    >
                      {niveaux.map((niv, index) => (
                        <option key={index} value={niv}>{niv}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={handleStart} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Chargement...
                    </>
                  ) : (
                    'Commencer le Quiz'
                  )}
                </button>
              </div>
            </>
          )}

          {/* JEU */}
          {etape === 'jeu' && questions.length > 0 && (
            <>
              <div className="quiz-header">
                <div className="question-counter">
                  Question {questionIndex + 1} sur {questions.length}
                </div>
                <h2 className="question-text">
                  {questions[questionIndex].question}
                </h2>
                {selectedOption && (
                  <div className="feedback-message">
                    {selectedOption === questions[questionIndex].reponse 
                      ? '✅ Correct !' 
                      : '❌ Incorrect'}
                  </div>
                )}
              </div>
              
              <div className="options-grid">
                {questions[questionIndex].options.map((option, index) => (
                  <button 
                    key={index} 
                    className={getOptionClass(option)}
                    onClick={() => handleReponse(option)}
                    disabled={selectedOption !== null}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>

              <div className="navigation-buttons">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    if (questionIndex > 0) {
                      setQuestionIndex(questionIndex - 1);
                      setSelectedOption(null);
                    }
                  }}
                  disabled={questionIndex === 0 || selectedOption !== null}
                >
                  ← Précédent
                </button>
                <div className="score-display">
                  Score: {score}
                </div>
              </div>
            </>
          )}

          {/* FIN */}
          {etape === 'fin' && (
            <div className="result-container">
              <div className="result-header">
                <h1>Quiz Terminé ! 🏆</h1>
             
              </div>
              
              <div className="score-card">
                <div className="score-main">
                  
                 
                
                </div>
                <div className="score-percentage">
                  {Math.round((score / questions.length) * 100)}%
                </div>
                <div className="score-message">
                  {score === questions.length ? 'Parfait ! 🎉' :
                   score / questions.length >= 0.7 ? 'Excellent travail !' :
                   score / questions.length >= 0.5 ? 'Bon effort !' :
                   'Continuez à pratiquer !'}
                </div>
              </div>

              <div className="result-actions">
                <button className="btn-primary" onClick={handleRestart}>
                  <i className="fas fa-redo" style={{ marginRight: '8px' }}></i>
                  Recommencer
                </button>
                <button 
                  className="btn-outline" 
                  onClick={handleExit}
                >
                  <i className="fas fa-home" style={{ marginRight: '8px' }}></i>
                  Retour à l'accueil
                </button>
              </div>

              <div className="quiz-summary">
                <h3>Récapitulatif</h3>
                <p><strong>Domaine:</strong> {domaine}</p>
                <p><strong>Niveau:</strong> {niveau}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default QuizPage;