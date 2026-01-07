require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. CONFIGURATION GROQ ---
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, 
});

// --- 2. ROUTE DE GÉNÉRATION ---
app.post('/api/generate-quiz', async (req, res) => {
  const { domaine, niveau } = req.body;

  console.log(`⚡ Groq génère le quiz : ${domaine} (${niveau})...`);

  try {
    const prompt = `
      Génère un quiz de 15 questions QCM sur le thème "${domaine}" (Niveau: ${niveau}).
      Langue : Français.
      
      Le format de sortie DOIT être un JSON valide respectant exactement cette structure :
      {
        "questions": [
          {
            "question": "La question ici ?",
            "options": ["Choix 1", "Choix 2", "Choix 3", "Choix 4"],
            "reponse": "Choix 1"
          }
        ]
      }
      
      Important : La "reponse" doit être une copie exacte de l'une des chaînes dans "options".
    `;

    // B. Appel à l'API Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Tu es un générateur de quiz API qui répond uniquement en JSON valide." 
        },
        {
          role: "user",
          content: prompt
        }
      ],
      // --- C'EST ICI QU'ON A CHANGÉ LE MODÈLE ---
      model: "llama-3.3-70b-versatile", 
      // ------------------------------------------

      response_format: { type: "json_object" }, 
      temperature: 0.5, 
    });

    const jsonResponse = JSON.parse(completion.choices[0].message.content);
    
    res.json({
      success: true,
      questions: jsonResponse.questions
    });

  } catch (error) {
    console.error("❌ Erreur Groq :", error);
    
    res.json({
      success: true,
      questions: [
        {
          question: `(Erreur API) Quelle est la capitale de la France ?`,
          options: ["Lyon", "Paris", "Marseille", "Lille"],
          reponse: "Paris"
        },
        {
          question: "Combien font 5 x 5 ?",
          options: ["10", "20", "25", "30"],
          reponse: "25"
        }
      ]
    });
  }
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`🚀 Serveur (Groq) lancé sur le port ${PORT}`);
});