
This repository contains dengue case prediction models and tools for analyzing barangay-level dengue risk.  

## 📌 Features
- Machine learning models (XGBoost,Regressor & Classification)
- Batch prediction for all barangays
- Risk classification (Low, Medium, High)
- CSV output reports  

## 🚀 Usage
1. Clone the repo  
   \`\`\`bash
   git clone https://github.com/KzKen20/DASMAp_revived.git
   cd DASMAp_revived
   \`\`\`

2. Install dependencies  
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. Run batch prediction  
   \`\`\`bash
   python dengue_Regressor_Classification/src/batch_predict_dengue.py
   \`\`\`

## 🗂 Project Structure

- `dengue_Regressor_Classification/data/` → historical datasets (`historical_data.csv`, `merged.csv`)  
- `dengue_Regressor_Classification/models/` → trained models + JSON config (`dengue_xgb_model.pkl`, `dengue_config.json`)  
- `dengue_Regressor_Classification/output/` → forecast results in CSV format  
- `dengue_Regressor_Classification/src/` → Python scripts  
- `batch_predict_dengue.py` → Main script for batch prediction across all barangays  
- `feature_utils.py` → Utility functions for computing lagged and rolling features  
- `predict_dengue.py` → Script for making a prediction for a single barangay  
- `dengue_Regressor_Classification/Prototype_Model.ipynb` → Jupyter Notebook for experimentation and model prototyping  
- `requirements.txt` → Python dependencies for the project  
- `.gitignore` → Files and folders ignored by Git (e.g., `__pycache__`, `.ipynb_checkpoints/`)  



