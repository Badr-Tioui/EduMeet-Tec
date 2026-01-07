import React, { useState } from 'react';
import './App.css';

function App() {
  const [etape, setEtape] = useState('menu'); 
  const [loading, setLoading] = useState(false);
  const [domaine, setDomaine] = useState('Mathématiques');
  const [niveau, setNiveau] = useState('Débutant');
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0); 
  const [score, setScore] = useState(0);

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
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
      }
    } catch (error) {
      console.error(error);
      alert("Erreur connexion serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleReponse = (choix) => {
    if (choix === questions[questionIndex].reponse) setScore(score + 1);
    if (questionIndex + 1 < questions.length) setQuestionIndex(questionIndex + 1);
    else setEtape('fin');
  };

  const handleRestart = () => {
    setEtape('menu');
    setScore(0);
    setQuestionIndex(0);
    setQuestions([]);
  };

  // Fonction pour le bouton Exit (ici ça reset le menu, tu peux changer pour fermer l'onglet si besoin)
  const handleExit = () => {
    alert("Vous avez cliqué sur Exit !");
    // window.close(); // Fonctionne rarement sur les navigateurs modernes pour des raisons de sécurité
  };

  return (
    <div className="app-layout">
      
      {/* === BOUTON EXIT (En bas à gauche) === */}
      {/* S'affiche UNIQUEMENT sur la page MENU */}
      {etape === 'menu' && (
        <button 
          className="btn-exit" 
          onClick={handleExit} 
          title="Quitter"
        >
          ✕
        </button>
      )}

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-center-container">
          <div className="nav-brand">EduMeet</div>
        </div>
      </nav>

      <main className="main-content">
        <div className="quiz-card">

          {/* MENU */}
          {etape === 'menu' && (
            <>
              <div className="quiz-header">
                <h1>Quiz  🎯</h1>
                <p>Configurez votre session</p>
              </div>
              
              <div className="form-group">
                <label>Domaine</label>
                <div className="select-wrapper">
                  <select className="custom-select" value={domaine} onChange={(e) => setDomaine(e.target.value)}>
                    <option>Mathématiques</option>
                    <option>Physique</option>
                    <option>Informatique</option>
                    <option>Économie</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Niveau</label>
                <div className="select-wrapper">
                  <select className="custom-select" value={niveau} onChange={(e) => setNiveau(e.target.value)}>
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Expert</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary" onClick={handleStart} disabled={loading}>
                {loading ? 'Chargement...' : 'Commencer le Quiz'}
              </button>
            </>
          )}

          {/* JEU (Le bouton Exit disparaît ici) */}
          {etape === 'jeu' && (
            <>
              <div className="quiz-header">
                <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>
                  Question {questionIndex + 1} / {questions.length}
                </span>
                <h2 style={{marginTop: '10px'}}>{questions[questionIndex].question}</h2>
              </div>
              <div className="options-grid">
                {questions[questionIndex].options.map((option, index) => (
                  <button key={index} className="btn-option" onClick={() => handleReponse(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* FIN */}
          {etape === 'fin' && (
            <div className="result-container" style={{textAlign: 'center'}}>
              <h1>Terminé ! 🏆</h1>
              <p style={{fontSize: '1.2rem', margin: '20px 0'}}>
                Score : <strong>{score} / {questions.length}</strong>
              </p>
              <button className="btn-primary" onClick={handleRestart}>Recommencer</button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;