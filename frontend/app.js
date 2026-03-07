// ==========================================
// GREENGUARDIAN PWA v2.0 - FRONTEND
// Plant Disease Detection & Treatment
// ==========================================

// ==========================================
// CONFIGURATION
// ==========================================

const API_BASE_URL = window.location.origin + "/api";
const ENDPOINTS = {
    diagnose: `${API_BASE_URL}/diagnose`,
    history: `${API_BASE_URL}/history`
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

const AppState = {
    currentScreen: 'home',
    uploadedImage: null,
    diagnosisResult: null,
    diagnosisHistory: [],
    isLoading: false,
    theme: localStorage.getItem('greenguardian-theme') || 'light'
};

// ==========================================
// API SERVICES
// ==========================================

class APIService {
    static async submitDiagnosis(imageFile) {
        try {
            const formData = new FormData();
            formData.append('file', imageFile);

            console.log(`📤 Submitting diagnosis to ${ENDPOINTS.diagnose}`);

            const response = await fetch(ENDPOINTS.diagnose, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log("✓ Diagnosis received:", data);

            return data;
        } catch (error) {
            console.error("✗ Diagnosis failed:", error);
            throw error;
        }
    }

    static async getHistory() {
        try {
            console.log(`📥 Fetching history from ${ENDPOINTS.history}`);

            const response = await fetch(ENDPOINTS.history);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log("✓ History received:", data);

            return data.diagnoses || [];
        } catch (error) {
            console.error("✗ Failed to fetch history:", error);
            return [];
        }
    }
}

// ==========================================
// UI RENDERING
// ==========================================

class UIRenderer {
    static showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });

        // Show requested screen
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.style.display = 'block';
            AppState.currentScreen = screenName;
            console.log(`📱 Switched to ${screenName} screen`);
        }
    }

    static renderDiagnosisResult(result) {
        const container = document.getElementById('diagnosis-result-container');
        if (!container) return;

        const severity = result.treatment?.severity || 'Unknown';
        const confidencePercentage = Math.round((result.confidence || 0) * 100);

        const html = `
            <div class="diagnosis-card">
                <div class="diagnosis-header">
                    <h2>🌿 Diagnosis Result</h2>
                </div>
                
                <div class="diagnosis-content">
                    <div class="disease-info">
                        <h3>${result.disease}</h3>
                        <p class="confidence">
                            <strong>Confidence:</strong> 
                            <span class="confidence-score">${confidencePercentage}%</span>
                        </p>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${confidencePercentage}%"></div>
                        </div>
                    </div>

                    ${result.treatment ? `
                        <div class="treatment-section">
                            <h4>🏥 Treatment Information</h4>
                            
                            <div class="treatment-item">
                                <strong>Symptoms:</strong>
                                <p>${result.treatment.symptoms || 'N/A'}</p>
                            </div>

                            <div class="treatment-item">
                                <strong>🌿 Organic Treatment:</strong>
                                <p>${result.treatment.organic_treatment || 'N/A'}</p>
                            </div>

                            <div class="treatment-item">
                                <strong>🧪 Chemical Treatment:</strong>
                                <p>${result.treatment.chemical_treatment || 'N/A'}</p>
                            </div>

                            <div class="treatment-item">
                                <strong>🛡️ Prevention:</strong>
                                <p>${result.treatment.prevention || 'N/A'}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="diagnosis-actions">
                    <button class="btn btn-primary" onclick="UIHandler.onNewDiagnosis()">
                        📸 New Diagnosis
                    </button>
                    <button class="btn btn-secondary" onclick="UIHandler.onViewHistory()">
                        📋 View History
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.showScreen('diagnosis-result');
    }

    static renderHistory(diagnoses) {
        const container = document.getElementById('history-list');
        if (!container) return;

        if (!diagnoses || diagnoses.length === 0) {
            container.innerHTML = '<p class="empty-state">No diagnosis history yet</p>';
            return;
        }

        const html = diagnoses.map(dx => {
            const date = new Date(dx.created_at);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString();
            const confidencePercentage = Math.round((dx.confidence || 0) * 100);

            return `
                <div class="history-item">
                    <div class="history-disease">
                        <h4>${dx.disease}</h4>
                        <span class="history-date">${dateStr} ${timeStr}</span>
                    </div>
                    <div class="history-confidence">
                        <span class="badge">${confidencePercentage}%</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    static showLoading() {
        const container = document.getElementById('diagnosis-result-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Analyzing image...</p>
                </div>
            `;
        }
    }

    static showError(message) {
        const container = document.getElementById('diagnosis-result-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <h3>⚠️ Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="UIHandler.onNewDiagnosis()">
                        Try Again
                    </button>
                </div>
            `;
        }
        this.showScreen('diagnosis-result');
    }
}

// ==========================================
// EVENT HANDLERS
// ==========================================

class UIHandler {
    static async onImageSelected(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log(`📁 Image selected: ${file.name}`);

        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('image-preview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);

        AppState.uploadedImage = file;

        // Show submit button
        const submitBtn = document.getElementById('submit-diagnosis-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }

    static async onSubmitDiagnosis() {
        if (!AppState.uploadedImage) {
            alert('Please select an image first');
            return;
        }

        AppState.isLoading = true;
        UIRenderer.showLoading();

        try {
            const result = await APIService.submitDiagnosis(AppState.uploadedImage);
            AppState.diagnosisResult = result;
            UIRenderer.renderDiagnosisResult(result);
        } catch (error) {
            UIRenderer.showError(error.message || 'Failed to analyze image. Please try again.');
        } finally {
            AppState.isLoading = false;
        }
    }

    static async onViewHistory() {
        UIRenderer.showScreen('history');

        try {
            const diagnoses = await APIService.getHistory();
            AppState.diagnosisHistory = diagnoses;
            UIRenderer.renderHistory(diagnoses);
        } catch (error) {
            console.error("Failed to load history:", error);
            document.getElementById('history-list').innerHTML =
                '<p class="error">Failed to load history</p>';
        }
    }

    static onNewDiagnosis() {
        AppState.diagnosisResult = null;
        AppState.uploadedImage = null;

        const fileInput = document.getElementById('image-input');
        if (fileInput) {
            fileInput.value = '';
        }

        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.style.display = 'none';
        }

        const submitBtn = document.getElementById('submit-diagnosis-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }

        UIRenderer.showScreen('home');
    }

    static onBackToHome() {
        UIRenderer.showScreen('home');
    }

    static toggleTheme() {
        const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
        AppState.theme = newTheme;
        localStorage.setItem('greenguardian-theme', newTheme);
        document.body.className = newTheme;
        console.log(`🎨 Theme changed to ${newTheme}`);
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeApp() {
    console.log("🌿 Initializing GreenGuardian App...");

    // Apply saved theme
    document.body.className = AppState.theme;

    // Register Service Worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log("✓ Service Worker registered:", registration);
        }).catch(error => {
            console.warn("⚠️ Service Worker registration failed:", error);
        });
    }

    // Initialize event listeners
    const fileInput = document.getElementById('image-input');
    if (fileInput) {
        fileInput.addEventListener('change', UIHandler.onImageSelected);
    }

    const submitBtn = document.getElementById('submit-diagnosis-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', UIHandler.onSubmitDiagnosis);
    }

    // Test API connection
    console.log(`🔗 API Base URL: ${API_BASE_URL}`);

    // Show home screen
    UIRenderer.showScreen('home');

    console.log("✓ App initialized successfully");
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for global access
window.UIHandler = UIHandler;
window.AppState = AppState;
window.APIService = APIService;
