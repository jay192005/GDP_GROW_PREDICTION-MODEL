# GDP Growth Prediction Model - Full Stack Application

Complete full-stack web application for predicting GDP growth rates using machine learning.

## 📁 Repository Structure

```
GDP_GROW_PREDICTION-MODEL/
├── backend/                          # Flask API Backend
│   ├── app.py                       # Main Flask application
│   ├── gdp_model.pkl                # Trained ML model (57MB)
│   ├── country_encoder.pkl          # Country label encoder
│   ├── requirements.txt             # Python dependencies
│   ├── Procfile                     # Railway/Heroku deployment
│   ├── runtime.txt                  # Python version
│   └── *.csv                        # Training data files
│
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── dashboard.tsx   # Main dashboard
│   │   │   │   ├── landing-page.tsx
│   │   │   │   └── ui/             # Shadcn UI components
│   │   │   └── App.tsx
│   │   ├── services/
│   │   │   └── api.ts              # API integration
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json                  # Vercel deployment config
│
├── notebooks/                        # Jupyter notebooks
│   ├── data_train.ipynb
│   ├── data_create.ipynb
│   └── random_forcasting.ipynb
│
└── docs/                            # Documentation
    ├── BACKEND_README.md
    ├── DEPLOYMENT_GUIDE.md
    ├── RAILWAY_DEPLOYMENT.md
    └── VERCEL_DEPLOYMENT.md
```

## 🚀 Features

### Backend (Flask API)
- ✅ GDP growth prediction using trained ML model
- ✅ Historical data API for 203 countries (1972-2021)
- ✅ Country list endpoint
- ✅ CORS enabled for frontend integration
- ✅ Fallback simulation when model unavailable

### Frontend (React + Vite)
- ✅ Interactive dashboard with country selection
- ✅ Historical GDP growth visualization (1972-2021)
- ✅ Real-time prediction with custom inputs
- ✅ Responsive design with Tailwind CSS
- ✅ Shadcn UI components
- ✅ Error handling and loading states

### Machine Learning Model
- ✅ Trained on global economic data (1972-2021)
- ✅ Features: Population, Exports, Imports, Investment, Consumption, Government Spending
- ✅ Model: Scikit-learn (Random Forest/Linear Regression)
- ✅ Performance: R² 0.8626 on test set

## 📊 Data Files

All CSV files included:
- `final_data_with_year.csv` - Main training data (203 countries, 1972-2021)
- `Final_Model_Data.csv` - Processed model data
- `complited_data_cleaning.csv` - Cleaned data
- `Global_Economy_MICE_Imputed_Growth.csv` - Imputed data
- And more...

## 🛠️ Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py
```

Backend runs on: http://localhost:5000

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on: http://localhost:5173

## 🌐 Deployment

### Backend Deployment (Railway - Recommended)

1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Railway auto-detects Python and deploys
6. Generate domain and copy URL

**Why Railway?**
- ✅ No file size limits (model is 57MB)
- ✅ Full Python support
- ✅ $5 free credit/month
- ✅ Auto-deploy on git push

**Alternative Platforms:**
- Render: [render.com](https://render.com)
- Heroku: [heroku.com](https://heroku.com)

**⚠️ Don't use Vercel for backend:**
- ❌ 50MB deployment limit (model is 57MB)
- ❌ Limited Python support

### Frontend Deployment (Vercel - Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import this repository
4. Set Root Directory: `frontend`
5. Add Environment Variable:
   - Key: `VITE_API_BASE_URL`
   - Value: Your Railway backend URL
6. Deploy

**Why Vercel?**
- ✅ Perfect for React/Vite
- ✅ Automatic HTTPS
- ✅ Free tier with 100GB bandwidth
- ✅ Auto-deploy on git push

### Update CORS After Deployment

After getting your Vercel URL, update `app.py`:

```python
CORS(app, origins=[
    "http://localhost:5173",
    "https://your-frontend.vercel.app"  # Add your Vercel URL
])
```

Commit and push - Railway will auto-redeploy.

## 📝 API Endpoints

### GET `/`
Health check and API info

### GET `/api/countries`
Get list of all 203 countries

### GET `/api/history?country=<name>`
Get historical GDP data for a country (1972-2021)

### POST `/predict`
Predict GDP growth rate

**Request Body:**
```json
{
  "Country": "United States",
  "Population": 1.1,
  "Exports": 5.2,
  "Imports": 4.8,
  "Investment": 3.5,
  "Consumption": 2.8,
  "Govt_Spend": 2.0
}
```

**Response:**
```json
{
  "growth": 3.45,
  "method": "AI Model"
}
```

## 🧪 Testing

### Test Backend Locally
```bash
python test_api.py
```

### Test Backend API
```bash
# Health check
curl http://localhost:5000/

# Get countries
curl http://localhost:5000/api/countries

# Get history
curl "http://localhost:5000/api/history?country=United%20States"

# Predict
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Country": "United States",
    "Population": 1.1,
    "Exports": 5.2,
    "Imports": 4.8,
    "Investment": 3.5,
    "Consumption": 2.8,
    "Govt_Spend": 2.0
  }'
```

## 📦 Dependencies

### Backend (Python)
- Flask 3.1.0
- Flask-CORS 5.0.0
- scikit-learn 1.8.0
- pandas 2.2.3
- numpy 2.2.3
- joblib 1.4.2

### Frontend (Node.js)
- React 18.3.1
- Vite 6.3.5
- TypeScript 5.7.3
- Tailwind CSS 4.0.0
- Recharts 2.15.0
- Shadcn UI components

## 🔧 Retrain Model

If you need to retrain the model:

```bash
python retrain_model.py
```

This will:
1. Load data from `final_data_with_year.csv`
2. Train a new model
3. Save to `gdp_model.pkl` and `country_encoder.pkl`
4. Display model performance metrics

## 📚 Documentation

- `BACKEND_README.md` - Backend API documentation
- `DEPLOYMENT_GUIDE.md` - General deployment guide
- `RAILWAY_DEPLOYMENT.md` - Railway-specific deployment
- `frontend/VERCEL_DEPLOYMENT.md` - Vercel-specific deployment
- `frontend/REQUIREMENTS.md` - Frontend requirements

## 🐛 Troubleshooting

### Backend Issues

**Model not loading:**
- Check if `gdp_model.pkl` exists
- Verify scikit-learn version matches
- Check logs for errors

**CORS errors:**
- Update CORS origins in `app.py`
- Include your frontend URL
- Redeploy backend

### Frontend Issues

**White screen:**
- Check browser console (F12)
- Verify `VITE_API_BASE_URL` is set
- Hard refresh: Ctrl+Shift+R

**API connection failed:**
- Verify backend is running
- Check environment variable
- Test backend URL directly

## 📊 Model Performance

- Training R²: 0.9771
- Test R²: 0.8626
- Features: 7 (Country, Population, Exports, Imports, Investment, Consumption, Govt_Spend)
- Countries: 203
- Years: 1972-2021
- Total samples: ~10,000+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Jay Gavali
- GitHub: [@jay192005](https://github.com/jay192005)

## 🔗 Repository Links

- **Full Stack**: https://github.com/jay192005/GDP_GROW_PREDICTION-MODEL.git
- **Backend Only**: https://github.com/jay192005/GDP_GROWTH_PREDICTION_MODEL-BACKEND-ML-MODEL-.git
- **Frontend Only**: https://github.com/jay192005/GDP_GROWTH_PREDICTION_MODEL-FRONTEND-.git

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review troubleshooting section
3. Open an issue on GitHub

---

**Last Updated**: February 2026

Built with ❤️ using Flask, React, and Machine Learning
