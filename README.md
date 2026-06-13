# Cross-Domain Recommendation System (Movies ➔ Books ➔ Courses)

An advanced, end-to-end recommendation engine that transfers user preferences from the entertainment domain (Movies) to target domains (Books and Courses) using semantic similarity, natural language processing, and deep learning.

---

## 🌌 Project Overview
Traditional recommendation systems operate in silos (e.g., Netflix recommends movies, Goodreads recommends books, Coursera recommends courses). However, user interests are interconnected. If a user enjoys science-fiction movies like *Interstellar* and *The Martian*, they likely have interests in astrophysics, space exploration, and cosmology. 

This system bridges those silos. It maps a user's movie viewing history and ratings into a **384-dimensional dense semantic embedding space** using **Sentence-BERT** (`all-MiniLM-L6-v2`). It then computes a user interest vector and matches it against book and course catalogs using **Cosine Similarity**, generating high-quality recommendations coupled with **Explainable AI (XAI)** justification statements.

---

## 📐 System Architecture

```mermaid
graph TD
    UserHistory[User Movie History & Ratings] -->|Weighted Average| ProfileGen[User Preference Vector]
    MovieDB[(MongoDB: Movies)] -->|S-BERT| MovieEmbeds[Movie Embeddings]
    BookDB[(MongoDB: Books)] -->|S-BERT| BookEmbeds[Book Embeddings]
    CourseDB[(MongoDB: Courses)] -->|S-BERT| CourseEmbeds[Course Embeddings]
    
    ProfileGen -->|User Profile| SimEngine[Similarity Engine: Cosine Similarity]
    BookEmbeds --> SimEngine
    CourseEmbeds --> SimEngine
    
    SimEngine -->|Ranked Matches| Explainer[Explainability Module]
    Explainer -->|Explanations| API[FastAPI Backend]
    API -->|JSON REST API| UI[React + Tailwind CSS v4 Frontend]

🛠️ Technology Stack
Machine Learning: Python, Pandas, NumPy, Scikit-learn, PyTorch, Sentence Transformers (all-MiniLM-L6-v2)
Backend: FastAPI, Uvicorn, Pydantic, PyMongo
Database: MongoDB (with fallback local CSV/NPY support)
Frontend: React (Vite), Tailwind CSS v4

📂 Project Structure
cross_domain_rec_system/
├── backend/                  # FastAPI web server
│   ├── app/
│   │   ├── models/           # Pydantic schema definitions
│   │   ├── routers/          # API endpoint routers
│   │   ├── services/         # Recommendation logic wrappers
│   │   ├── config.py         # Backend configuration settings
│   │   ├── database.py       # MongoDB Connection manager
│   │   └── main.py           # FastAPI entry point
│   ├── requirements.txt      # Python backend packages
│   └── test_api_offline.py   # Offline FastAPI endpoint validator
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.jsx            # Main React UI component
│   │   ├── index.css          # Tailwind CSS imports & custom styles
│   │   └── main.jsx           # App mounting
│   ├── package.json          # Node project config
│   └── vite.config.js         # Vite configuration (Tailwind v4 enabled)
├── ml_pipeline/              # Machine Learning pipeline
│   ├── data/                 # Raw and processed datasets
│   │   ├── raw/
│   │   └── processed/
│   ├── scripts/
│   │   ├── prepare_data.py   # Step 1: Dataset generator
│   │   ├── preprocess.py     # Step 2: NLP Text Preprocessing
│   │   ├── feature_eng.py    # Step 3: Combined document soup builder
│   │   ├── generate_embed.py # Step 4: S-BERT vector generator
│   │   └── seed_mongodb.py   # Step 8: Database ingestion seeder
│   └── src/
│       ├── preprocessing.py  # TextPreprocessor class utilities
│       ├── embedding.py      # ItemEmbedder S-BERT wrapper
│       ├── similarity.py     # Cosine Similarity ranking core
│       └── explainability.py # Concept-based Explanation generator
├── .gitignore                # System and package git exclusions
└── README.md                 # Project documentation

🚀 Getting Started
📋 Prerequisites
Python 3.10+
Node.js 18+
MongoDB (Optional, falls back to local files if offline)
1. Install ML & Backend Dependencies
Open your terminal and run:

bash

# Install packages
py -m pip install -r backend/requirements.txt
2. Run the ML Pipeline (Generate Data & Embeddings)
Generate the synthetic datasets, clean the text, build the feature soup, and compute the 384-dimensional Sentence-BERT embeddings:

bash

# 1. Generate Raw CSVs
py ml_pipeline/scripts/prepare_data.py
# 2. Preprocess text (Stopwords, HTML, lowercase, punctuation removal)
py ml_pipeline/scripts/preprocess.py
# 3. Combine fields for feature representation
py ml_pipeline/scripts/feature_eng.py
# 4. Generate S-BERT embeddings
py ml_pipeline/scripts/generate_embed.py
3. Seed MongoDB (Optional)
If you have MongoDB running locally on mongodb://localhost:27017/:

bash

py ml_pipeline/scripts/seed_mongodb.py
(Note: If MongoDB is offline, the backend automatically falls back to local CSV/NPY files).

4. Start the FastAPI Backend
Start the backend API server:

bash

py -m uvicorn backend.app.main:app --port 8000
Visit http://127.0.0.1:8000/docs to test endpoints via the interactive Swagger UI.

5. Launch the React Frontend
Open a new terminal window:

bash

cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser to view the application.

💡 Explainable AI (XAI) Example
Explanations are dynamically generated based on overlapping concepts between movie metadata and recommended items.

Input: Movies ["Interstellar", "The Martian"]
Output Recommendation: Book Cosmos by Carl Sagan
Explanation: "Recommended because Interstellar and The Martian are strongly related to astronomy."
