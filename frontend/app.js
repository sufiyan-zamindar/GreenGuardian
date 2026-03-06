// // ==========================================
// // GREENGUARDIAN PWA v2.0 - ENHANCED
// // All 10 Features Implementation
// // ==========================================

// // ==========================================
// // STATE MANAGEMENT
// // ==========================================
// const AppState = {
//     currentUser: null,
//     uploadedImage: null,
//     editedImage: null,
//     diagnosisResult: null,
//     cameraStream: null,
//     cropper: null,
//     currentScreen: 'login-screen',
//     theme: localStorage.getItem('greenguardian-theme') || 'light',
//     settings: JSON.parse(localStorage.getItem('greenguardian-settings')) || {
//         pushNotifications: true,
//         treatmentReminders: true,
//         weatherAlerts: false,
//         weeklyTips: true
//     },
//     userProfile: JSON.parse(localStorage.getItem('greenguardian-profile')) || {
//         name: '',
//         email: '',
//         location: '',
//         bio: '',
//         plan: 'free'
//     },
//     diagnoses: JSON.parse(localStorage.getItem('greenguardian-diagnoses')) || [],
//     mockUsers: [{ email: 'demo@greenguardian.com', password: 'password123', name: 'Demo User' }]
// };

// // ==========================================
// // ENHANCED DISEASE DATABASE
// // ==========================================
// const DiseaseDatabase = {
//     'tomato_late_blight': {
//         id: 'tomato_late_blight',
//         name: 'Tomato Late Blight',
//         scientificName: 'Phytophthora infestans',
//         category: 'vegetables',
//         confidence: 94,
//         severity: 'severe',
//         spreadRate: 'Fast',
//         season: 'Cool, Wet',
//         humidity: 'High',
//         riskLevel: 'High',
//         description: 'A devastating disease that affects tomatoes and potatoes, caused by the oomycete pathogen Phytophthora infestans.',
//         symptoms: [
//             'Dark water-soaked spots on leaves',
//             'White fungal growth on leaf undersides',
//             'Rapid browning and wilting',
//             'Brown lesions on stems',
//             'Firm, dark brown rot on fruits'
//         ],
//         favorableConditions: 'Cool temperatures (60-70°F), high humidity, wet weather',
//         images: ['late_blight_1.jpg', 'late_blight_2.jpg', 'late_blight_3.jpg'],
//         affectedPlants: ['Tomato', 'Potato', 'Eggplant'],
//         immediateActions: [
//             'Remove and destroy all infected plant parts immediately',
//             'Avoid working with wet plants to prevent spreading spores',
//             'Increase spacing between plants for better air circulation'
//         ],
//         fungicideTreatment: 'Apply copper-based fungicide or chlorothalonil every 7-10 days. For organic options, use copper sulfate or Bacillus subtilis-based products.',
//         preventionTips: [
//             'Use resistant varieties when available',
//             'Apply preventive fungicide before symptoms appear',
//             'Rotate crops and avoid planting tomatoes in the same spot for 3+ years'
//         ],
//         relatedDiseases: ['early_blight', 'septoria_leaf_spot']
//     },
//     'apple_scab': {
//         id: 'apple_scab',
//         name: 'Apple Scab',
//         scientificName: 'Venturia inaequalis',
//         category: 'fruits',
//         confidence: 87,
//         severity: 'moderate',
//         spreadRate: 'Moderate',
//         season: 'Spring',
//         humidity: 'High',
//         riskLevel: 'Medium',
//         description: 'A common fungal disease affecting apple trees, causing dark scabby lesions on leaves and fruit.',
//         symptoms: [
//             'Olive-green to black spots on leaves',
//             'Corky, scabbed areas on fruit',
//             'Premature leaf drop',
//             'Distorted fruit growth'
//         ],
//         favorableConditions: 'Wet spring weather, temperatures between 55-75°F',
//         images: ['apple_scab_1.jpg', 'apple_scab_2.jpg'],
//         affectedPlants: ['Apple', 'Crabapple'],
//         immediateActions: [
//             'Rake and remove fallen leaves to reduce overwintering spores',
//             'Prune trees to improve air circulation',
//             'Remove severely infected fruits and branches'
//         ],
//         fungicideTreatment: 'Apply fungicides containing myclobutanil or captan starting at bud break. Continue every 7-10 days during wet weather.',
//         preventionTips: [
//             'Plant scab-resistant apple varieties',
//             'Space trees properly for good air circulation',
//             'Apply preventive sprays before rainy periods'
//         ],
//         relatedDiseases: ['cedar_apple_rust', 'powdery_mildew']
//     },
//     'powdery_mildew': {
//         id: 'powdery_mildew',
//         name: 'Powdery Mildew',
//         scientificName: 'Erysiphales',
//         category: 'flowers',
//         confidence: 91,
//         severity: 'moderate',
//         spreadRate: 'Fast',
//         season: 'Warm, Humid',
//         humidity: 'Moderate to High',
//         riskLevel: 'Medium',
//         description: 'A widespread fungal disease appearing as white powdery spots on leaves and stems.',
//         symptoms: [
//             'White powdery spots on leaves',
//             'Distorted or stunted growth',
//             'Yellowing leaves',
//             'Premature leaf drop'
//         ],
//         favorableConditions: 'Warm days, cool nights, high humidity, poor air circulation',
//         images: ['powdery_mildew_1.jpg', 'powdery_mildew_2.jpg'],
//         affectedPlants: ['Roses', 'Cucumbers', 'Squash', 'Zinnias', 'Phlox'],
//         immediateActions: [
//             'Remove and destroy infected plant parts',
//             'Avoid overhead watering',
//             'Move plants to sunnier locations if possible'
//         ],
//         fungicideTreatment: 'Apply sulfur-based fungicides or potassium bicarbonate. For severe cases, use systemic fungicides like propiconazole.',
//         preventionTips: [
//             'Choose resistant plant varieties',
//             'Ensure proper spacing for air circulation',
//             'Water at the base of plants, not on foliage'
//         ],
//         relatedDiseases: ['downy_mildew', 'white_mold']
//     },
//     'healthy': {
//         id: 'healthy',
//         name: 'Healthy Plant',
//         scientificName: 'No disease detected',
//         category: 'all',
//         confidence: 96,
//         severity: 'none',
//         spreadRate: 'N/A',
//         season: 'N/A',
//         humidity: 'N/A',
//         riskLevel: 'None',
//         description: 'Your plant appears healthy with no signs of disease.',
//         symptoms: ['No symptoms detected'],
//         favorableConditions: 'N/A',
//         images: ['healthy_1.jpg'],
//         affectedPlants: ['All plants'],
//         immediateActions: [
//             'Continue regular care and monitoring',
//             'Maintain proper watering schedule',
//             'Ensure adequate sunlight and nutrition'
//         ],
//         fungicideTreatment: 'No treatment needed. Continue with regular maintenance and preventive care.',
//         preventionTips: [
//             'Monitor plants regularly for early signs of disease',
//             'Maintain good garden hygiene',
//             'Provide optimal growing conditions'
//         ],
//         relatedDiseases: []
//     },
//     'early_blight': {
//         id: 'early_blight',
//         name: 'Early Blight',
//         scientificName: 'Alternaria solani',
//         category: 'vegetables',
//         confidence: 89,
//         severity: 'moderate',
//         spreadRate: 'Moderate',
//         season: 'Warm',
//         humidity: 'Moderate',
//         riskLevel: 'Medium',
//         description: 'A common fungal disease causing concentric rings on leaves and stems.',
//         symptoms: [
//             'Dark brown spots with concentric rings',
//             'Yellowing around spots',
//             'Stem lesions near soil line',
//             'Fruit rot at stem end'
//         ],
//         favorableConditions: 'Warm temperatures (75-85°F), high humidity, plant stress',
//         images: ['early_blight_1.jpg'],
//         affectedPlants: ['Tomato', 'Potato', 'Eggplant'],
//         immediateActions: [
//             'Remove lower infected leaves',
//             'Mulch around plants to prevent soil splash',
//             'Avoid overhead irrigation'
//         ],
//         fungicideTreatment: 'Apply chlorothalonil or copper-based fungicides. Begin applications before symptoms appear.',
//         preventionTips: [
//             'Rotate crops annually',
//             'Use resistant varieties',
//             'Maintain plant vigor with proper fertilization'
//         ],
//         relatedDiseases: ['late_blight', 'septoria_leaf_spot']
//     },
//     'black_spot': {
//         id: 'black_spot',
//         name: 'Black Spot',
//         scientificName: 'Diplocarpon rosae',
//         category: 'flowers',
//         confidence: 92,
//         severity: 'moderate',
//         spreadRate: 'Moderate',
//         season: 'Warm, Humid',
//         humidity: 'High',
//         riskLevel: 'Medium',
//         description: 'The most serious disease of roses, causing black spots on leaves and defoliation.',
//         symptoms: [
//             'Circular black spots on leaves',
//             'Yellowing around spots',
//             'Premature leaf drop',
//             'Weak, spindly growth'
//         ],
//         favorableConditions: 'Wet weather, temperatures between 75-85°F, poor air circulation',
//         images: ['black_spot_1.jpg'],
//         affectedPlants: ['Roses'],
//         immediateActions: [
//             'Remove and destroy infected leaves',
//             'Prune for better air circulation',
//             'Water at the base, avoid wetting foliage'
//         ],
//         fungicideTreatment: 'Apply fungicides containing chlorothalonil, mancozeb, or myclobutanil every 7-14 days.',
//         preventionTips: [
//             'Plant resistant rose varieties',
//             'Space plants for good air flow',
//             'Remove fallen leaves promptly'
//         ],
//         relatedDiseases: ['powdery_mildew', 'rust']
//     }
// };

// // ==========================================
// // PLANT TIPS DATABASE
// // ==========================================
// const PlantTips = [
//     {
//         id: 1,
//         title: 'Water at the Base',
//         content: 'Avoid overhead watering to prevent fungal diseases. Use drip irrigation or water directly at soil level.',
//         category: 'prevention',
//         difficulty: 'beginner',
//         icon: 'droplets'
//     },
//     {
//         id: 2,
//         title: 'Inspect Plants Weekly',
//         content: 'Regular inspection helps catch diseases early when they are easiest to treat. Check both sides of leaves.',
//         category: 'prevention',
//         difficulty: 'beginner',
//         icon: 'search'
//     },
//     {
//         id: 3,
//         title: 'Mulch Matters',
//         content: 'Apply 2-3 inches of organic mulch to prevent soil-borne diseases from splashing onto lower leaves.',
//         category: 'prevention',
//         difficulty: 'beginner',
//         icon: 'layers'
//     },
//     {
//         id: 4,
//         title: 'Rotate Your Crops',
//         content: 'Do not plant the same family of vegetables in the same spot for at least 3 years to break disease cycles.',
//         category: 'seasonal',
//         difficulty: 'intermediate',
//         icon: 'refresh-cw'
//     },
//     {
//         id: 5,
//         title: 'Sterilize Your Tools',
//         content: 'Clean pruning shears with rubbing alcohol between plants to prevent spreading diseases.',
//         category: 'prevention',
//         difficulty: 'beginner',
//         icon: 'scissors'
//     },
//     {
//         id: 6,
//         title: 'Morning Watering',
//         content: 'Water in the morning so leaves have time to dry before evening, reducing fungal disease risk.',
//         category: 'prevention',
//         difficulty: 'beginner',
//         icon: 'sun'
//     },
//     {
//         id: 7,
//         title: 'Know Your pH',
//         content: 'Most plants prefer slightly acidic soil (pH 6.0-6.8). Test your soil annually and amend as needed.',
//         category: 'treatment',
//         difficulty: 'intermediate',
//         icon: 'flask'
//     },
//     {
//         id: 8,
//         title: 'Quarantine New Plants',
//         content: 'Keep new plants separate for 2 weeks to ensure they are not carrying pests or diseases.',
//         category: 'prevention',
//         difficulty: 'beginner',
//         icon: 'shield'
//     }
// ];

// // ==========================================
// // DOM ELEMENTS
// // ==========================================
// const Elements = {
//     screens: {},
//     toastContainer: document.getElementById('toast-container'),
//     appHeader: document.getElementById('app-header'),
//     bottomNav: document.getElementById('bottom-nav')
// };

// // Initialize screen references
// ['login-screen', 'signup-screen', 'forgot-screen', 'dashboard-screen', 'processing-screen',
//     'results-screen', 'image-editor-screen', 'history-screen', 'history-detail-screen',
//     'encyclopedia-screen', 'disease-detail-screen', 'profile-screen', 'settings-screen',
//     'tips-screen', 'pricing-screen', 'analytics-screen'].forEach(id => {
//         Elements.screens[id] = document.getElementById(id);
//     });

// // ==========================================
// // UTILITY FUNCTIONS
// // ==========================================

// function showScreen(screenName) {
//     // 1. Hide all screens
//     Object.values(Elements.screens).forEach(screen => {
//         if (screen) screen.classList.remove('active');
//     });

//     // 2. Show requested screen
//     const targetScreen = Elements.screens[screenName];
//     if (targetScreen) {
//         targetScreen.classList.add('active');
//         AppState.currentScreen = screenName;
//         window.scrollTo(0, 0);
//     }

//     // 3. Define screen types
//     const isAuthScreen = ['login-screen', 'signup-screen', 'forgot-screen'].includes(screenName);
//     const isMainAppScreen = ['dashboard-screen', 'encyclopedia-screen', 'history-screen', 'analytics-screen', 'settings-screen', 'profile-screen'].includes(screenName);

//     // 4. Update Header & Sidebar (Desktop Layout)
//     if (Elements.appHeader) {
//         Elements.appHeader.classList.toggle('hidden', isAuthScreen);
//         // Ensure header text updates to show where you are
//         const titleElement = document.getElementById('header-title');
//         if (titleElement) {
//             titleElement.textContent = screenName.replace('-screen', '').replace(/-/g, ' ');
//         }
//     }

//     // Toggle Sidebar visibility
//     const desktopSidebar = document.getElementById('desktop-sidebar');
//     if (desktopSidebar) {
//         desktopSidebar.classList.toggle('hidden', isAuthScreen);
//         desktopSidebar.classList.toggle('lg:flex', !isAuthScreen);
//     }

//     // 5. Update Bottom Nav (Mobile Layout)
//     if (Elements.bottomNav) {
//         const showBottomNav = ['dashboard-screen', 'encyclopedia-screen', 'history-screen', 'analytics-screen'].includes(screenName);
//         Elements.bottomNav.classList.toggle('hidden', !showBottomNav);
//         Elements.bottomNav.classList.toggle('flex', showBottomNav);
//     }

//     // 6. Sync Navigation Active States (Sidebar + Bottom Nav)
//     document.querySelectorAll('.bottom-nav-item, .sidebar-item').forEach(item => {
//         const target = item.dataset.screen || item.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
//         item.classList.toggle('active', target === screenName);
//     });

//     // 7. Refresh screen-specific content
//     const refreshMap = {
//         'dashboard-screen': refreshDashboard,
//         'history-screen': refreshHistory,
//         'encyclopedia-screen': refreshEncyclopedia,
//         'tips-screen': refreshTips,
//         'analytics-screen': refreshAnalytics,
//         'profile-screen': refreshProfile
//     };

//     if (refreshMap[screenName]) refreshMap[screenName]();

//     // 8. Re-initialize icons
//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// function showToast(message, type = 'info') {
//     const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-yellow-500', info: 'bg-primary-500' };
//     const icons = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };

//     const toast = document.createElement('div');
//     toast.className = `${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[280px] toast-enter`;
//     toast.innerHTML = `<i data-lucide="${icons[type]}" class="w-5 h-5"></i><span class="font-medium">${message}</span>`;

//     Elements.toastContainer.appendChild(toast);
//     if (typeof lucide !== 'undefined') lucide.createIcons();

//     setTimeout(() => {
//         toast.style.opacity = '0';
//         toast.style.transform = 'translateX(100%)';
//         toast.style.transition = 'all 0.3s ease';
//         setTimeout(() => toast.remove(), 300);
//     }, 3000);
// }

// function togglePasswordVisibility(input, button) {
//     const type = input.type === 'password' ? 'text' : 'password';
//     input.type = type;
//     button.innerHTML = type === 'password' ? '<i data-lucide="eye" class="w-5 h-5"></i>' : '<i data-lucide="eye-off" class="w-5 h-5"></i>';
//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// function setButtonLoading(button, textElement, iconElement, spinner, isLoading) {
//     button.disabled = isLoading;
//     if (isLoading) {
//         textElement.textContent = 'Please wait...';
//         iconElement.classList.add('hidden');
//         spinner.classList.remove('hidden');
//     } else {
//         textElement.textContent = button.dataset.originalText || 'Submit';
//         iconElement.classList.remove('hidden');
//         spinner.classList.add('hidden');
//     }
// }

// function isValidEmail(email) {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function generateId() {
//     return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
// }

// function formatDate(dateString) {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diff = now - date;
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));

//     if (days === 0) return 'Today';
//     if (days === 1) return 'Yesterday';
//     if (days < 7) return `${days} days ago`;
//     if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
//     return date.toLocaleDateString();
// }

// // ==========================================
// // THEME / DARK MODE
// // ==========================================

// function toggleTheme() {
//     const isDark = document.documentElement.classList.toggle('dark');
//     const newTheme = isDark ? 'dark' : 'light';
//     document.documentElement.setAttribute('data-theme', newTheme);
//     localStorage.setItem('greenguardian-theme', newTheme);
//     AppState.theme = newTheme;

//     // Update toggle switches
//     document.querySelectorAll('#settings-theme-toggle, #theme-toggle').forEach(toggle => {
//         toggle.classList.toggle('active', isDark);
//     });

//     // Update charts if on analytics page
//     if (AppState.currentScreen === 'analytics-screen') {
//         refreshAnalytics();
//     }
// }

// function setAccentColor(color) {
//     // Implementation for accent color change
//     showToast(`Accent color changed to ${color}`, 'success');
// }

// // ==========================================
// // USER DISPLAY HELPER
// // ==========================================

// function updateUserDisplay() {
//     if (!AppState.currentUser) return;

//     const avatarEl = document.getElementById('header-avatar');
//     const userNameEl = document.getElementById('header-user-name');

//     if (avatarEl) {
//         avatarEl.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(AppState.currentUser.name)}`;
//         avatarEl.alt = AppState.currentUser.name;
//     }

//     if (userNameEl) {
//         userNameEl.textContent = AppState.currentUser.name;
//     }
// }

// // ==========================================
// // MOCK API
// // ==========================================

// function mockFetch(url, data) {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             if (url === '/api/auth/login') {
//                 const user = AppState.mockUsers.find(u => u.email === data.email);
//                 if (user && user.password === data.password) {
//                     resolve({ success: true, user: { email: user.email, name: user.name }, token: 'mock-jwt-token' });
//                 } else {
//                     reject(new Error('Invalid email or password'));
//                 }
//             } else if (url === '/api/auth/signup') {
//                 if (AppState.mockUsers.some(u => u.email === data.email)) {
//                     reject(new Error('Email already registered'));
//                 } else {
//                     AppState.mockUsers.push({ email: data.email, password: data.password, name: data.name });
//                     resolve({ success: true, message: 'Account created' });
//                 }
//             } else if (url === '/api/auth/forgot-password') {
//                 resolve({ success: true, message: 'Reset link sent' });
//             } else if (url === '/api/diagnose') {
//                 const diseases = Object.keys(DiseaseDatabase).filter(k => k !== 'healthy');
//                 const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
//                 resolve({ success: true, result: DiseaseDatabase[randomDisease] });
//             } else {
//                 resolve({ success: true });
//             }
//         }, 1500);
//     });
// }

// // ==========================================
// // AUTHENTICATION
// // ==========================================

// async function handleLogin(e) {
//     e.preventDefault();
//     const email = document.getElementById('login-email').value.trim();
//     const password = document.getElementById('login-password').value;

//     if (!email || !password) {
//         showToast('Please fill in all fields', 'error');
//         return;
//     }
//     if (!isValidEmail(email)) {
//         showToast('Please enter a valid email', 'error');
//         return;
//     }

//     const btn = document.getElementById('login-submit');
//     setButtonLoading(btn, document.getElementById('login-btn-text'), document.getElementById('login-btn-icon'), document.getElementById('login-spinner'), true);

//     try {
//         const response = await mockFetch('/api/auth/login', { email, password });
//         AppState.currentUser = { email: response.user.email, name: response.user.name };
//         AppState.userProfile.name = response.user.name;
//         AppState.userProfile.email = response.user.email;

//         const userNameEl = document.getElementById('user-name');
//         if (userNameEl) {
//             userNameEl.textContent = AppState.currentUser.name;
//         }

//         updateUserDisplay();

//         showToast('Welcome back!', 'success');
//         showScreen('dashboard-screen');
//         document.getElementById('login-form').reset();
//     } catch (error) {
//         showToast(error.message || 'Invalid credentials', 'error');
//     } finally {
//         setButtonLoading(btn, document.getElementById('login-btn-text'), document.getElementById('login-btn-icon'), document.getElementById('login-spinner'), false);
//     }
// }

// async function handleSignup(e) {
//     e.preventDefault();
//     const name = document.getElementById('signup-name').value.trim();
//     const email = document.getElementById('signup-email').value.trim();
//     const password = document.getElementById('signup-password').value;
//     const confirmPassword = document.getElementById('signup-confirm-password').value;
//     const terms = document.getElementById('terms').checked;

//     if (!name || !email || !password || !confirmPassword) {
//         showToast('Please fill in all fields', 'error');
//         return;
//     }
//     if (!isValidEmail(email)) {
//         showToast('Please enter a valid email', 'error');
//         return;
//     }
//     if (password.length < 8) {
//         showToast('Password must be at least 8 characters', 'error');
//         return;
//     }
//     if (password !== confirmPassword) {
//         showToast('Passwords do not match', 'error');
//         return;
//     }
//     if (!terms) {
//         showToast('Please accept the terms and conditions', 'error');
//         return;
//     }

//     const btn = document.getElementById('signup-submit');
//     setButtonLoading(btn, document.getElementById('signup-btn-text'), document.getElementById('signup-btn-icon'), document.getElementById('signup-spinner'), true);

//     try {
//         await mockFetch('/api/auth/signup', { name, email, password });
//         AppState.currentUser = { email, name };
//         AppState.userProfile.name = name;
//         AppState.userProfile.email = email;

//         updateUserDisplay();

//         showToast('Account created successfully!', 'success');
//         showScreen('dashboard-screen');
//         document.getElementById('signup-form').reset();
//     } catch (error) {
//         showToast(error.message || 'Failed to create account', 'error');
//     } finally {
//         setButtonLoading(btn, document.getElementById('signup-btn-text'), document.getElementById('signup-btn-icon'), document.getElementById('signup-spinner'), false);
//     }
// }

// async function handleForgotPassword(e) {
//     e.preventDefault();
//     const email = document.getElementById('forgot-email').value.trim();

//     if (!email || !isValidEmail(email)) {
//         showToast('Please enter a valid email', 'error');
//         return;
//     }

//     const btn = document.getElementById('forgot-submit');
//     setButtonLoading(btn, document.getElementById('forgot-btn-text'), document.getElementById('forgot-btn-icon'), document.getElementById('forgot-spinner'), true);

//     try {
//         await mockFetch('/api/auth/forgot-password', { email });
//         document.getElementById('forgot-form').classList.add('hidden');
//         document.getElementById('forgot-success').classList.remove('hidden');
//         showToast('Reset link sent!', 'success');
//     } catch (error) {
//         showToast(error.message || 'Failed to send reset link', 'error');
//     } finally {
//         setButtonLoading(btn, document.getElementById('forgot-btn-text'), document.getElementById('forgot-btn-icon'), document.getElementById('forgot-spinner'), false);
//     }
// }

// function handleLogout() {
//     AppState.currentUser = null;
//     AppState.uploadedImage = null;
//     AppState.diagnosisResult = null;
//     showToast('Logged out successfully', 'info');
//     showScreen('login-screen');
// }

// // ==========================================
// // FILE UPLOAD & CAMERA
// // ==========================================

// function handleFileSelect(file) {
//     if (!file) return;
//     if (!file.type.startsWith('image/')) {
//         showToast('Please select an image file', 'error');
//         return;
//     }
//     if (file.size > 10 * 1024 * 1024) {
//         showToast('File size must be less than 10MB', 'error');
//         return;
//     }

//     AppState.uploadedImage = file;
//     AppState.editedImage = null;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//         document.getElementById('preview-image').src = e.target.result;
//         document.getElementById('preview-filename').textContent = file.name;
//         document.getElementById('drop-default').classList.add('hidden');
//         document.getElementById('drop-preview').classList.remove('hidden');
//         document.getElementById('drop-zone').classList.add('has-file');
//         document.getElementById('analyze-btn').disabled = false;
//     };
//     reader.readAsDataURL(file);
// }

// function resetUploadArea() {
//     AppState.uploadedImage = null;
//     AppState.editedImage = null;
//     document.getElementById('file-input').value = '';
//     document.getElementById('preview-image').src = '';
//     document.getElementById('preview-filename').textContent = '';
//     document.getElementById('drop-default').classList.remove('hidden');
//     document.getElementById('drop-preview').classList.add('hidden');
//     document.getElementById('drop-zone').classList.remove('has-file');
//     document.getElementById('analyze-btn').disabled = true;
// }

// function handleDragOver(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     document.getElementById('drop-zone').classList.add('drag-over');
// }

// function handleDragLeave(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     document.getElementById('drop-zone').classList.remove('drag-over');
// }

// function handleDrop(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     document.getElementById('drop-zone').classList.remove('drag-over');
//     const files = e.dataTransfer.files;
//     if (files.length > 0) handleFileSelect(files[0]);
// }

// async function startCamera() {
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
//         AppState.cameraStream = stream;
//         document.getElementById('camera-video').srcObject = stream;
//         document.getElementById('camera-placeholder').classList.add('hidden');
//         document.getElementById('capture-btn').classList.remove('hidden');
//         document.getElementById('start-camera-btn').innerHTML = '<i data-lucide="video-off" class="w-5 h-5"></i><span>Stop Camera</span>';
//         document.getElementById('start-camera-btn').classList.replace('bg-primary-500', 'bg-red-500');
//         if (typeof lucide !== 'undefined') lucide.createIcons();
//     } catch (error) {
//         showToast('Could not access camera. Please check permissions.', 'error');
//     }
// }

// function stopCamera() {
//     if (AppState.cameraStream) {
//         AppState.cameraStream.getTracks().forEach(track => track.stop());
//         AppState.cameraStream = null;
//     }
//     document.getElementById('camera-video').srcObject = null;
//     document.getElementById('camera-placeholder').classList.remove('hidden');
//     document.getElementById('capture-btn').classList.add('hidden');
//     document.getElementById('start-camera-btn').innerHTML = '<i data-lucide="video" class="w-5 h-5"></i><span>Start Camera</span>';
//     document.getElementById('start-camera-btn').classList.replace('bg-red-500', 'bg-primary-500');
//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// function capturePhoto() {
//     if (!AppState.cameraStream) return;

//     const canvas = document.createElement('canvas');
//     canvas.width = document.getElementById('camera-video').videoWidth;
//     canvas.height = document.getElementById('camera-video').videoHeight;

//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(document.getElementById('camera-video'), 0, 0);

//     canvas.toBlob((blob) => {
//         const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
//         handleFileSelect(file);
//         switchTab('upload');
//         stopCamera();
//         showToast('Photo captured successfully!', 'success');
//     }, 'image/jpeg');
// }

// function switchTab(tab) {
//     const tabUpload = document.getElementById('tab-upload');
//     const tabCamera = document.getElementById('tab-camera');
//     const uploadArea = document.getElementById('upload-area');
//     const cameraArea = document.getElementById('camera-area');

//     if (tab === 'upload') {
//         tabUpload.classList.add('text-primary-600', 'border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
//         tabUpload.classList.remove('text-gray-500');
//         tabCamera.classList.remove('text-primary-600', 'border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
//         tabCamera.classList.add('text-gray-500');
//         tabCamera.style.color = 'var(--text-secondary)';
//         uploadArea.classList.remove('hidden');
//         cameraArea.classList.add('hidden');
//         stopCamera();
//     } else {
//         tabCamera.classList.add('text-primary-600', 'border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
//         tabCamera.classList.remove('text-gray-500');
//         tabUpload.classList.remove('text-primary-600', 'border-primary-500', 'bg-primary-50', 'dark:bg-primary-900/20');
//         tabUpload.classList.add('text-gray-500');
//         tabUpload.style.color = 'var(--text-secondary)';
//         cameraArea.classList.remove('hidden');
//         uploadArea.classList.add('hidden');
//     }
// }

// // ==========================================
// // IMAGE EDITOR
// // ==========================================

// function openImageEditor() {
//     if (!AppState.uploadedImage) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//         document.getElementById('editor-image').src = e.target.result;
//         showScreen('image-editor-screen');

//         // Initialize cropper
//         if (AppState.cropper) AppState.cropper.destroy();
//         AppState.cropper = new Cropper(document.getElementById('editor-image'), {
//             aspectRatio: NaN,
//             viewMode: 1,
//             autoCropArea: 0.8
//         });
//     };
//     reader.readAsDataURL(AppState.uploadedImage);
// }

// function closeImageEditor() {
//     if (AppState.cropper) {
//         AppState.cropper.destroy();
//         AppState.cropper = null;
//     }
//     showScreen('dashboard-screen');
// }

// function setEditorTool(tool) {
//     document.querySelectorAll('.editor-tool-btn').forEach(btn => {
//         btn.classList.remove('active', 'bg-primary-500', 'text-white');
//         btn.style.backgroundColor = 'var(--bg-tertiary)';
//         btn.style.color = 'var(--text-primary)';
//     });

//     const activeBtn = document.querySelector(`[data-tool="${tool}"]`);
//     activeBtn.classList.add('active', 'bg-primary-500', 'text-white');
//     activeBtn.style.backgroundColor = '#10b981';
//     activeBtn.style.color = 'white';

//     document.querySelectorAll('.editor-controls').forEach(el => el.classList.add('hidden'));
//     document.getElementById(`${tool}-controls`).classList.remove('hidden');
// }

// function setCropRatio(ratio) {
//     if (AppState.cropper) {
//         AppState.cropper.setAspectRatio(ratio);
//     }
// }

// function rotateImage(deg) {
//     if (AppState.cropper) {
//         AppState.cropper.rotate(deg);
//     }
// }

// function flipImage(direction) {
//     if (AppState.cropper) {
//         if (direction === 'h') AppState.cropper.scaleX(-AppState.cropper.getData().scaleX || -1);
//         else AppState.cropper.scaleY(-AppState.cropper.getData().scaleY || -1);
//     }
// }

// function updateImageAdjustments() {
//     const brightness = document.getElementById('brightness-slider').value;
//     const contrast = document.getElementById('contrast-slider').value;
//     const saturation = document.getElementById('saturation-slider').value;

//     document.getElementById('editor-image').style.filter =
//         `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
// }

// function applyImageEdits() {
//     if (!AppState.cropper) return;

//     const canvas = AppState.cropper.getCroppedCanvas();
//     canvas.toBlob((blob) => {
//         const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' });
//         AppState.editedImage = file;

//         // Update preview
//         document.getElementById('preview-image').src = canvas.toDataURL();

//         closeImageEditor();
//         showToast('Image edited successfully!', 'success');
//     }, 'image/jpeg');
// }

// // ==========================================
// // DIAGNOSIS & RESULTS
// // ==========================================

// async function analyzeImage() {
//     const imageToAnalyze = AppState.editedImage || AppState.uploadedImage;
//     if (!imageToAnalyze) {
//         showToast('Please upload an image first', 'error');
//         return;
//     }

//     showScreen('processing-screen');

//     try {
//         console.log('%c=== STARTING ANALYSIS ===', 'color: green; font-weight: bold');
//         console.log('Image object:', imageToAnalyze);
//         console.log('Image type:', imageToAnalyze.constructor.name);
//         console.log('Image size:', imageToAnalyze.size, 'bytes');
//         console.log('Image name:', imageToAnalyze.name);

//         // Validate image object
//         if (!imageToAnalyze || !(imageToAnalyze instanceof Blob || imageToAnalyze instanceof File)) {
//             throw new Error('Invalid image object - must be a File or Blob');
//         }

//         // Prepare form data
//         const formData = new FormData();
//         formData.append('file', imageToAnalyze);

//         console.log('%c=== SENDING REQUEST ===', 'color: blue; font-weight: bold');
//         console.log('Endpoint: http://localhost:8000/diagnose');
//         console.log('Method: POST');
//         console.log('FormData prepared with:', Array.from(formData.entries()).length, 'entries');

//         // Call backend API with timeout
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

//         const response = await fetch('http://localhost:8000/diagnose', {
//             method: 'POST',
//             body: formData,
//             signal: controller.signal,
//             headers: {
//                 // Don't set Content-Type manually - let browser set it with boundary
//             }
//         });

//         clearTimeout(timeoutId);

//         console.log('%c=== RESPONSE RECEIVED ===', 'color: orange; font-weight: bold');
//         console.log('Status:', response.status);
//         console.log('Status text:', response.statusText);
//         console.log('Headers:', {
//             'content-type': response.headers.get('content-type')
//         });

//         // Parse response based on content type
//         let data;
//         const contentType = response.headers.get('content-type');

//         if (contentType && contentType.includes('application/json')) {
//             data = await response.json();
//         } else {
//             const text = await response.text();
//             console.warn('Response is not JSON:', text);
//             data = { diagnosis: text };
//         }

//         console.log('Parsed response data:', data);

//         // Check for HTTP error status
//         if (!response.ok) {
//             const errorMsg = data.error || data.message || response.statusText;
//             const errorDetails = data.details || '';
//             throw new Error(`HTTP ${response.status}: ${errorMsg}${errorDetails ? ' - ' + errorDetails : ''}`);
//         }

//         // Check for server error in response
//         if (data.error) {
//             throw new Error(`Server error: ${data.error}${data.details ? ' - ' + data.details : ''}`);
//         }

//         // Validate disease data
//         console.log('%c=== VALIDATING DATA ===', 'color: blue; font-weight: bold');
//         if (!data.disease || typeof data.disease !== 'string') {
//             console.error('Invalid disease:', data.disease);
//             throw new Error('Invalid disease data from server');
//         }

//         if (typeof data.confidence !== 'number') {
//             console.error('Invalid confidence:', data.confidence);
//             throw new Error('Invalid confidence data from server');
//         }

//         console.log('%c=== DATA VALID - PROCESSING ===', 'color: green; font-weight: bold');

//         // Find disease in database or create mock data
//         let diseaseData = DiseaseDatabase[data.disease];
//         if (!diseaseData) {
//             // Fallback for unknown diseases
//             diseaseData = {
//                 id: data.disease,
//                 name: data.disease.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
//                 scientificName: 'Unknown',
//                 category: 'unknown',
//                 confidence: data.confidence,
//                 severity: 'unknown',
//                 spreadRate: 'Unknown',
//                 season: 'Unknown',
//                 humidity: 'Unknown',
//                 riskLevel: 'Unknown',
//                 description: 'Disease detected by AI model.',
//                 symptoms: ['Symptoms not available'],
//                 favorableConditions: 'Unknown',
//                 images: [],
//                 affectedPlants: ['Unknown'],
//                 immediateActions: ['Consult a local agricultural expert'],
//                 fungicideTreatment: 'Consult a local agricultural expert',
//                 preventionTips: ['Consult a local agricultural expert'],
//                 relatedDiseases: []
//             };
//         } else {
//             // Update confidence from API
//             diseaseData.confidence = data.confidence;
//         }

//         AppState.diagnosisResult = { ...diseaseData };

//         // Add to history
//         const diagnosis = {
//             id: generateId(),
//             date: new Date().toISOString(),
//             diseaseId: AppState.diagnosisResult.id,
//             diseaseName: AppState.diagnosisResult.name,
//             scientificName: AppState.diagnosisResult.scientificName,
//             confidence: AppState.diagnosisResult.confidence,
//             severity: AppState.diagnosisResult.severity,
//             image: document.getElementById('preview-image').src,
//             status: 'completed',
//             notes: ''
//         };

//         AppState.diagnoses.unshift(diagnosis);
//         localStorage.setItem('greenguardian-diagnoses', JSON.stringify(AppState.diagnoses));

//         displayResults();
//         showScreen('results-screen');

//     } catch (error) {
//         console.error('%c=== ERROR OCCURRED ===', 'color: red; font-weight: bold');
//         console.error('Error message:', error.message);
//         console.error('Error details:', error);
//         console.error('Stack:', error.stack);

//         // Show user-friendly error message
//         const errorMsg = error.message || 'Unknown error occurred';
//         showToast(`Analysis failed: ${errorMsg}`, 'error');
//         showScreen('dashboard-screen');
//     }
// }

// function displayResults() {
//     const result = AppState.diagnosisResult;
//     if (!result) return;

//     const resultImage = document.getElementById('result-image');
//     const previewImage = document.getElementById('preview-image');
//     const diseaseName = document.getElementById('disease-name');
//     const scientificName = document.getElementById('scientific-name');
//     const confidenceValue = document.getElementById('confidence-value');

//     if (resultImage && previewImage) resultImage.src = previewImage.src;
//     if (diseaseName) diseaseName.textContent = result.name;
//     if (scientificName) scientificName.textContent = result.scientificName;
//     if (confidenceValue) confidenceValue.textContent = `${result.confidence}%`;

//     const confidenceBar = document.getElementById('confidence-bar');
//     if (confidenceBar) {
//         setTimeout(() => {
//             confidenceBar.style.width = `${result.confidence}%`;
//         }, 300);
//     }



//     const severityColors = {
//         severe: 'bg-red-100 text-red-800',
//         moderate: 'bg-yellow-100 text-yellow-800',
//         mild: 'bg-green-100 text-green-800',
//         none: 'bg-green-100 text-green-800'
//     };

//     const badge = document.getElementById('severity-badge');
//     if (badge) {
//         badge.className = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${severityColors[result.severity]}`;
//         badge.innerHTML = `<i data-lucide="${result.severity === 'none' ? 'check-circle' : 'alert-circle'}" class="w-4 h-4 mr-1"></i>${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}`;
//     }

//     // Update info grid
//     const infoGrid = badge?.closest('.theme-card')?.querySelector('.grid');
//     if (infoGrid) {
//         infoGrid.innerHTML = `
//             <div class="rounded-lg p-3 text-center" style="background-color: var(--bg-tertiary);">
//                 <i data-lucide="thermometer" class="w-5 h-5 text-orange-500 mx-auto mb-1"></i>
//                 <p class="text-xs" style="color: var(--text-muted);">Spread Rate</p>
//                 <p class="font-semibold" style="color: var(--text-primary);">${result.spreadRate}</p>
//             </div>
//             <div class="rounded-lg p-3 text-center" style="background-color: var(--bg-tertiary);">
//                 <i data-lucide="calendar" class="w-5 h-5 text-blue-500 mx-auto mb-1"></i>
//                 <p class="text-xs" style="color: var(--text-muted);">Season</p>
//                 <p class="font-semibold" style="color: var(--text-primary);">${result.season}</p>
//             </div>
//             <div class="rounded-lg p-3 text-center" style="background-color: var(--bg-tertiary);">
//                 <i data-lucide="droplets" class="w-5 h-5 text-cyan-500 mx-auto mb-1"></i>
//                 <p class="text-xs" style="color: var(--text-muted);">Humidity</p>
//                 <p class="font-semibold" style="color: var(--text-primary);">${result.humidity}</p>
//             </div>
//             <div class="rounded-lg p-3 text-center" style="background-color: var(--bg-tertiary);">
//                 <i data-lucide="alert-triangle" class="w-5 h-5 text-red-500 mx-auto mb-1"></i>
//                 <p class="text-xs" style="color: var(--text-muted);">Risk Level</p>
//                 <p class="font-semibold" style="color: var(--text-primary);">${result.riskLevel}</p>
//             </div>
//         `;
//     }

//     const immediateActions = document.getElementById('immediate-actions');
//     const fungicideText = document.getElementById('fungicide-text');
//     const preventionTips = document.getElementById('prevention-tips');

//     if (immediateActions) {
//         immediateActions.innerHTML = result.immediateActions.map(action =>
//             `<li class="flex items-start gap-3"><i data-lucide="check-circle-2" class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"></i><span style="color: var(--text-primary);">${action}</span></li>`
//         ).join('');
//     }

//     if (fungicideText) fungicideText.textContent = result.fungicideTreatment;

//     if (preventionTips) {
//         preventionTips.innerHTML = result.preventionTips.map(tip =>
//             `<li class="flex items-start gap-3"><i data-lucide="shield" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"></i><span style="color: var(--text-primary);">${tip}</span></li>`
//         ).join('');
//     }

//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// // ==========================================
// // SHARE FEATURE
// // ==========================================

// function openShareModal() {
//     const result = AppState.diagnosisResult;
//     if (!result) return;

//     const shareCardImage = document.getElementById('share-card-image');
//     const previewImage = document.getElementById('preview-image');
//     if (shareCardImage && previewImage) {
//         shareCardImage.src = previewImage.src;
//     }
//     const shareCardDisease = document.getElementById('share-card-disease');
//     if (shareCardDisease) {
//         shareCardDisease.textContent = result.name;
//     }
//     const shareCardConfidence = document.getElementById('share-card-confidence');
//     if (shareCardConfidence) {
//         shareCardConfidence.textContent = `${result.confidence}% confidence`;
//     }

//     document.getElementById('share-modal').classList.remove('hidden');
// }

// function closeShareModal() {
//     document.getElementById('share-modal').classList.add('hidden');
// }

// function shareTo(platform) {
//     const result = AppState.diagnosisResult;
//     const text = `I just diagnosed my plant with GreenGuardian! Result: ${result.name} (${result.confidence}% confidence)`;
//     const url = window.location.origin;

//     switch (platform) {
//         case 'copy':
//             navigator.clipboard.writeText(`${text} - ${url}`);
//             showToast('Link copied to clipboard!', 'success');
//             break;
//         case 'twitter':
//             window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
//             break;
//         case 'facebook':
//             window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
//             break;
//         case 'whatsapp':
//             window.open(`https://wa.me/?text=${encodeURIComponent(text + ' - ' + url)}`, '_blank');
//             break;
//     }
// }

// function downloadShareCard() {
//     const card = document.getElementById('share-card-preview');
//     html2canvas(card).then(canvas => {
//         const link = document.createElement('a');
//         link.download = 'greenguardian-diagnosis.png';
//         link.href = canvas.toDataURL();
//         link.click();
//         showToast('Image downloaded!', 'success');
//     });
// }

// function viewDiseaseDetail() {
//     const diseaseId = AppState.diagnosisResult?.id;
//     if (diseaseId && DiseaseDatabase[diseaseId]) {
//         showDiseaseDetail(diseaseId);
//     }
// }


// // ==========================================
// // HISTORY FEATURE
// // ==========================================

// function refreshHistory() {
//     const list = document.getElementById('history-list');
//     const empty = document.getElementById('history-empty');

//     if (!list || !empty) return;

//     if (AppState.diagnoses.length === 0) {
//         list.classList.add('hidden');
//         empty.classList.remove('hidden');
//         return;
//     }

//     list.classList.remove('hidden');
//     empty.classList.add('hidden');

//     // Update stats
//     const historyTotal = document.getElementById('history-total');
//     const historySevere = document.getElementById('history-severe');
//     const historyResolved = document.getElementById('history-resolved');
//     const historyAvgConfidence = document.getElementById('history-avg-confidence');

//     if (historyTotal) historyTotal.textContent = AppState.diagnoses.length;
//     if (historySevere) historySevere.textContent = AppState.diagnoses.filter(d => d.severity === 'severe').length;
//     if (historyResolved) historyResolved.textContent = AppState.diagnoses.filter(d => d.status === 'resolved').length;
//     const avgConfidence = AppState.diagnoses.reduce((sum, d) => sum + d.confidence, 0) / AppState.diagnoses.length;
//     if (historyAvgConfidence) historyAvgConfidence.textContent = Math.round(avgConfidence || 0) + '%';

//     // Apply filters
//     const dateFilter = document.getElementById('history-filter-date')?.value || 'all';
//     const severityFilter = document.getElementById('history-filter-severity')?.value || 'all';
//     const statusFilter = document.getElementById('history-filter-status')?.value || 'all';

//     let filtered = [...AppState.diagnoses];

//     if (dateFilter !== 'all') {
//         const now = new Date();
//         const days = { '7days': 7, '30days': 30, '3months': 90 }[dateFilter];
//         filtered = filtered.filter(d => {
//             const diff = (now - new Date(d.date)) / (1000 * 60 * 60 * 24);
//             return diff <= days;
//         });
//     }

//     if (severityFilter !== 'all') {
//         filtered = filtered.filter(d => d.severity === severityFilter);
//     }

//     if (statusFilter !== 'all') {
//         filtered = filtered.filter(d => d.status === statusFilter);
//     }

//     // Render list
//     list.innerHTML = filtered.map(diagnosis => {
//         const severityColors = {
//             severe: 'bg-red-100 text-red-800',
//             moderate: 'bg-yellow-100 text-yellow-800',
//             mild: 'bg-green-100 text-green-800',
//             none: 'bg-green-100 text-green-800'
//         };

//         const statusLabels = {
//             in_progress: 'In Progress',
//             resolved: 'Resolved',
//             worsened: 'Worsened'
//         };

//         return `
//             <div class="theme-card rounded-xl p-4 flex items-center gap-4 card-hover cursor-pointer" onclick="showHistoryDetail('${diagnosis.id}')">
//                 <img src="${diagnosis.image}" alt="" class="w-16 h-16 rounded-lg object-cover flex-shrink-0">
//                 <div class="flex-1 min-w-0">
//                     <h4 class="font-semibold truncate" style="color: var(--text-primary);">${diagnosis.diseaseName}</h4>
//                     <p class="text-sm" style="color: var(--text-secondary);">${formatDate(diagnosis.date)} • ${diagnosis.confidence}% confidence</p>
//                 </div>
//                 <div class="flex flex-col items-end gap-1">
//                     <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[diagnosis.severity]}">
//                         ${diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)}
//                     </span>
//                     <span class="text-xs" style="color: var(--text-muted);">${statusLabels[diagnosis.status]}</span>
//                 </div>
//             </div>
//         `;
//     }).join('');

//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// function filterHistory() {
//     refreshHistory();
// }

// function showHistoryDetail(id) {
//     const diagnosis = AppState.diagnoses.find(d => d.id === id);
//     if (!diagnosis) return;

//     const disease = DiseaseDatabase[diagnosis.diseaseId];
//     const content = document.getElementById('history-detail-content');

//     content.innerHTML = `
//         <div class="theme-card rounded-2xl shadow-xl overflow-hidden mb-6">
//             <div class="relative bg-gray-100 dark:bg-gray-800">
//                 <img src="${diagnosis.image}" alt="" class="w-full max-h-80 object-contain mx-auto">
//             </div>
//             <div class="p-6">
//                 <p class="text-xs uppercase tracking-wide mb-1" style="color: var(--text-muted);">Diagnosed on ${new Date(diagnosis.date).toLocaleDateString()}</p>
//                 <h2 class="text-2xl font-bold mb-1" style="color: var(--text-primary);">${diagnosis.diseaseName}</h2>
//                 <p class="italic mb-4" style="color: var(--text-secondary);">${diagnosis.scientificName}</p>

//                 <div class="flex items-center gap-4 mb-4">
//                     <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
//                         ${diagnosis.confidence}% confidence
//                     </span>
//                     <select onchange="updateDiagnosisStatus('${id}', this.value)" class="theme-input px-3 py-1 rounded-lg text-sm">
//                         <option value="in_progress" ${diagnosis.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
//                         <option value="resolved" ${diagnosis.status === 'resolved' ? 'selected' : ''}>Resolved</option>
//                         <option value="worsened" ${diagnosis.status === 'worsened' ? 'selected' : ''}>Worsened</option>
//                     </select>
//                 </div>

//                 <div class="mb-4">
//                     <label class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">Notes</label>
//                     <textarea onchange="updateDiagnosisNotes('${id}', this.value)" rows="3" class="theme-input w-full px-3 py-2 rounded-lg text-sm" placeholder="Add your observations...">${diagnosis.notes || ''}</textarea>
//                 </div>
//             </div>
//         </div>

//         ${disease ? `
//         <div class="theme-card rounded-2xl shadow-lg p-6">
//             <h3 class="font-semibold mb-4" style="color: var(--text-primary);">Treatment Applied</h3>
//             <p class="text-sm mb-4" style="color: var(--text-secondary);">${disease.fungicideTreatment}</p>
//             <button type="button" onclick="showDiseaseDetail('${disease.id}')" class="text-primary-600 hover:text-primary-700 font-medium text-sm">
//                 View Full Guide <i data-lucide="arrow-right" class="w-4 h-4 inline"></i>
//             </button>
//         </div>
//         ` : ''}
//     `;

//     showScreen('history-detail-screen');
//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// function updateDiagnosisStatus(id, status) {
//     const diagnosis = AppState.diagnoses.find(d => d.id === id);
//     if (diagnosis) {
//         diagnosis.status = status;
//         localStorage.setItem('greenguardian-diagnoses', JSON.stringify(AppState.diagnoses));
//         showToast('Status updated', 'success');
//     }
// }

// function updateDiagnosisNotes(id, notes) {
//     const diagnosis = AppState.diagnoses.find(d => d.id === id);
//     if (diagnosis) {
//         diagnosis.notes = notes;
//         localStorage.setItem('greenguardian-diagnoses', JSON.stringify(AppState.diagnoses));
//     }
// }

// function exportHistory() {
//     const data = JSON.stringify(AppState.diagnoses, null, 2);
//     const blob = new Blob([data], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'greenguardian-history.json';
//     link.click();
//     URL.revokeObjectURL(url);
//     showToast('History exported!', 'success');
// }

// // ==========================================
// // ENCYCLOPEDIA FEATURE
// // ==========================================

// function refreshEncyclopedia() {
//     const grid = document.getElementById('encyclopedia-grid');

//     if (!grid) return;

//     const searchTerm = document.getElementById('encyclopedia-search')?.value.toLowerCase() || '';
//     const activeCategory = document.querySelector('.encyclo-category.active')?.dataset.category || 'all';

//     let diseases = Object.values(DiseaseDatabase).filter(d => d.id !== 'healthy');

//     if (activeCategory !== 'all') {
//         diseases = diseases.filter(d => d.category === activeCategory);
//     }

//     if (searchTerm) {
//         diseases = diseases.filter(d =>
//             d.name.toLowerCase().includes(searchTerm) ||
//             d.scientificName.toLowerCase().includes(searchTerm) ||
//             d.affectedPlants.some(p => p.toLowerCase().includes(searchTerm))
//         );
//     }

//     grid.innerHTML = diseases.map(disease => `
//         <div class="theme-card rounded-xl overflow-hidden card-hover cursor-pointer" onclick="showDiseaseDetail('${disease.id}')">
//             <div class="h-32 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
//                 <i data-lucide="leaf" class="w-12 h-12 text-primary-500"></i>
//             </div>
//             <div class="p-4">
//                 <span class="text-xs uppercase tracking-wide" style="color: var(--text-muted);">${disease.category}</span>
//                 <h3 class="font-semibold mb-1" style="color: var(--text-primary);">${disease.name}</h3>
//                 <p class="text-sm italic mb-2" style="color: var(--text-secondary);">${disease.scientificName}</p>
//                 <div class="flex flex-wrap gap-1">
//                     ${disease.affectedPlants.slice(0, 2).map(plant => `
//                         <span class="text-xs px-2 py-0.5 rounded-full" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">${plant}</span>
//                     `).join('')}
//                     ${disease.affectedPlants.length > 2 ? `<span class="text-xs" style="color: var(--text-muted);">+${disease.affectedPlants.length - 2}</span>` : ''}
//                 </div>
//             </div>
//         </div>
//     `).join('');

//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// function searchEncyclopedia() {
//     refreshEncyclopedia();
// }

// function filterEncyclopedia(category) {
//     document.querySelectorAll('.encyclo-category').forEach(btn => {
//         btn.classList.remove('active', 'bg-primary-500', 'text-white');
//         btn.style.backgroundColor = 'var(--bg-tertiary)';
//         btn.style.color = 'var(--text-primary)';
//     });

//     const activeBtn = document.querySelector(`[data-category="${category}"]`);
//     activeBtn.classList.add('active', 'bg-primary-500', 'text-white');
//     activeBtn.style.backgroundColor = '#10b981';
//     activeBtn.style.color = 'white';

//     refreshEncyclopedia();
// }

// function showDiseaseDetail(diseaseId) {
//     const disease = DiseaseDatabase[diseaseId];
//     if (!disease) return;

//     const content = document.getElementById('disease-detail-content');

//     content.innerHTML = `
//         <div class="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
//             <button type="button" onclick="showScreen('encyclopedia-screen')" class="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30">
//                 <i data-lucide="arrow-left" class="w-5 h-5"></i>
//             </button>
//             <i data-lucide="leaf" class="w-20 h-20 text-white/50"></i>
//         </div>

//         <div class="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto -mt-8">
//             <div class="theme-card rounded-2xl shadow-xl p-6 mb-6">
//                 <span class="text-xs uppercase tracking-wide" style="color: var(--text-muted);">${disease.category}</span>
//                 <h1 class="text-3xl font-bold mb-1" style="color: var(--text-primary);">${disease.name}</h1>
//                 <p class="italic mb-4" style="color: var(--text-secondary);">${disease.scientificName}</p>
//                 <p style="color: var(--text-primary);">${disease.description}</p>
//             </div>

//             <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
//                 <div class="theme-card rounded-xl p-4 text-center">
//                     <i data-lucide="thermometer" class="w-5 h-5 text-orange-500 mx-auto mb-1"></i>
//                     <p class="text-xs" style="color: var(--text-muted);">Spread Rate</p>
//                     <p class="font-semibold" style="color: var(--text-primary);">${disease.spreadRate}</p>
//                 </div>
//                 <div class="theme-card rounded-xl p-4 text-center">
//                     <i data-lucide="calendar" class="w-5 h-5 text-blue-500 mx-auto mb-1"></i>
//                     <p class="text-xs" style="color: var(--text-muted);">Season</p>
//                     <p class="font-semibold" style="color: var(--text-primary);">${disease.season}</p>
//                 </div>
//                 <div class="theme-card rounded-xl p-4 text-center">
//                     <i data-lucide="droplets" class="w-5 h-5 text-cyan-500 mx-auto mb-1"></i>
//                     <p class="text-xs" style="color: var(--text-muted);">Humidity</p>
//                     <p class="font-semibold" style="color: var(--text-primary);">${disease.humidity}</p>
//                 </div>
//                 <div class="theme-card rounded-xl p-4 text-center">
//                     <i data-lucide="alert-triangle" class="w-5 h-5 text-red-500 mx-auto mb-1"></i>
//                     <p class="text-xs" style="color: var(--text-muted);">Risk Level</p>
//                     <p class="font-semibold" style="color: var(--text-primary);">${disease.riskLevel}</p>
//                 </div>
//             </div>

//             <div class="theme-card rounded-2xl shadow-lg p-6 mb-6">
//                 <h3 class="font-semibold mb-4" style="color: var(--text-primary);">Symptoms</h3>
//                 <ul class="space-y-2">
//                     ${disease.symptoms.map(s => `
//                         <li class="flex items-start gap-3">
//                             <i data-lucide="alert-circle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"></i>
//                             <span style="color: var(--text-primary);">${s}</span>
//                         </li>
//                     `).join('')}
//                 </ul>
//             </div>

//             <div class="theme-card rounded-2xl shadow-lg p-6 mb-6">
//                 <h3 class="font-semibold mb-4" style="color: var(--text-primary);">Treatment</h3>
//                 <div class="space-y-4">
//                     <div>
//                         <h4 class="text-sm font-medium mb-2" style="color: var(--text-secondary);">Immediate Actions</h4>
//                         <ul class="space-y-2">
//                             ${disease.immediateActions.map(a => `
//                                 <li class="flex items-start gap-3">
//                                     <i data-lucide="check-circle-2" class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"></i>
//                                     <span style="color: var(--text-primary);">${a}</span>
//                                 </li>
//                             `).join('')}
//                         </ul>
//                     </div>
//                     <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
//                         <h4 class="text-sm font-medium mb-1" style="color: var(--text-secondary);">Fungicide Treatment</h4>
//                         <p style="color: var(--text-primary);">${disease.fungicideTreatment}</p>
//                     </div>
//                 </div>
//             </div>

//             <div class="theme-card rounded-2xl shadow-lg p-6">
//                 <h3 class="font-semibold mb-4" style="color: var(--text-primary);">Prevention</h3>
//                 <ul class="space-y-2">
//                     ${disease.preventionTips.map(t => `
//                         <li class="flex items-start gap-3">
//                             <i data-lucide="shield" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"></i>
//                             <span style="color: var(--text-primary);">${t}</span>
//                         </li>
//                     `).join('')}
//                 </ul>
//             </div>
//         </div>
//     `;

//     showScreen('disease-detail-screen');
//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// // ==========================================
// // TIPS FEATURE
// // ==========================================

// function refreshTips() {
//     const featured = document.getElementById('featured-tip');
//     const grid = document.getElementById('tips-grid');

//     if (!featured || !grid) return;

//     const activeCategory = document.querySelector('.tips-category.active')?.dataset.category || 'all';

//     // Today's featured tip (based on day of year)
//     const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
//     const featuredTip = PlantTips[dayOfYear % PlantTips.length];

//     featured.innerHTML = `
//         <div class="h-40 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
//             <i data-lucide="${featuredTip.icon}" class="w-16 h-16 text-white/80"></i>
//         </div>
//         <div class="p-5">
//             <div class="flex items-center gap-2 mb-2">
//                 <span class="text-xs uppercase tracking-wide text-primary-600">Featured Tip</span>
//                 <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700" style="color: var(--text-secondary);">${featuredTip.difficulty}</span>
//             </div>
//             <h3 class="text-xl font-bold mb-2" style="color: var(--text-primary);">${featuredTip.title}</h3>
//             <p style="color: var(--text-secondary);">${featuredTip.content}</p>
//         </div>
//     `;

//     // Filter and display tips
//     let tips = [...PlantTips];
//     if (activeCategory !== 'all') {
//         tips = tips.filter(t => t.category === activeCategory);
//     }

//     grid.innerHTML = tips.map(tip => `
//         <div class="theme-card rounded-xl p-5 card-hover cursor-pointer">
//             <div class="flex items-start gap-4">
//                 <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
//                     <i data-lucide="${tip.icon}" class="w-6 h-6 text-primary-500"></i>
//                 </div>
//                 <div>
//                     <span class="text-xs uppercase tracking-wide" style="color: var(--text-muted);">${tip.category}</span>
//                     <h4 class="font-semibold mb-1" style="color: var(--text-primary);">${tip.title}</h4>
//                     <p class="text-sm" style="color: var(--text-secondary);">${tip.content}</p>
//                 </div>
//             </div>
//         </div>
//     `).join('');

//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// function filterTips(category) {
//     document.querySelectorAll('.tips-category').forEach(btn => {
//         btn.classList.remove('active', 'bg-primary-500', 'text-white');
//         btn.style.backgroundColor = 'var(--bg-tertiary)';
//         btn.style.color = 'var(--text-primary)';
//     });

//     const activeBtn = document.querySelector(`[data-category="${category}"]`);
//     activeBtn.classList.add('active', 'bg-primary-500', 'text-white');
//     activeBtn.style.backgroundColor = '#10b981';
//     activeBtn.style.color = 'white';

//     refreshTips();
// }


// // ==========================================
// // PROFILE FEATURE
// // ==========================================

// function refreshProfile() {
//     const profile = AppState.userProfile;

//     const profileName = document.getElementById('profile-name');
//     const profileEmail = document.getElementById('profile-email');
//     const profilePlan = document.getElementById('profile-plan');
//     const profileEditName = document.getElementById('profile-edit-name');
//     const profileEditEmail = document.getElementById('profile-edit-email');
//     const profileLocation = document.getElementById('profile-location');
//     const profileBio = document.getElementById('profile-bio');
//     const profileDiagnoses = document.getElementById('profile-diagnoses');
//     const profilePlants = document.getElementById('profile-plants');
//     const profileStreak = document.getElementById('profile-streak');

//     if (profileName) profileName.textContent = profile.name || 'User';
//     if (profileEmail) profileEmail.textContent = profile.email || 'user@example.com';
//     if (profilePlan) profilePlan.textContent = profile.plan === 'pro' ? 'Pro Plan' : 'Free Plan';

//     if (profileEditName) profileEditName.value = profile.name || '';
//     if (profileEditEmail) profileEditEmail.value = profile.email || '';
//     if (profileLocation) profileLocation.value = profile.location || '';
//     if (profileBio) profileBio.value = profile.bio || '';

//     // Stats
//     if (profileDiagnoses) profileDiagnoses.textContent = AppState.diagnoses.length;
//     if (profilePlants) profilePlants.textContent = new Set(AppState.diagnoses.map(d => d.diseaseId)).size;

//     // Calculate streak (consecutive days with activity)
//     const streak = calculateStreak();
//     if (profileStreak) profileStreak.textContent = streak;
// }

// function calculateStreak() {
//     if (AppState.diagnoses.length === 0) return 0;

//     const dates = AppState.diagnoses.map(d => new Date(d.date).toDateString());
//     const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));

//     let streak = 0;
//     const today = new Date().toDateString();
//     const yesterday = new Date(Date.now() - 86400000).toDateString();

//     if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
//         streak = 1;
//         for (let i = 1; i < uniqueDates.length; i++) {
//             const prevDate = new Date(uniqueDates[i - 1]);
//             const currDate = new Date(uniqueDates[i]);
//             const diff = (prevDate - currDate) / (1000 * 60 * 60 * 24);
//             if (diff === 1) streak++;
//             else break;
//         }
//     }

//     return streak;
// }

// function handleProfileUpdate(e) {
//     e.preventDefault();

//     AppState.userProfile.name = document.getElementById('profile-edit-name').value;
//     AppState.userProfile.location = document.getElementById('profile-location').value;
//     AppState.userProfile.bio = document.getElementById('profile-bio').value;

//     localStorage.setItem('greenguardian-profile', JSON.stringify(AppState.userProfile));
//     const userNameEl = document.getElementById('user-name');
//     if (userNameEl) {
//         userNameEl.textContent = AppState.userProfile.name;
//     }

//     const headerUserNameEl = document.getElementById('header-user-name');
//     if (headerUserNameEl) {
//         headerUserNameEl.textContent = AppState.userProfile.name;
//     }

//     showToast('Profile updated!', 'success');
//     refreshProfile();
// }

// // ==========================================
// // SETTINGS FEATURE
// // ==========================================

// function toggleSetting(btn, settingName) {
//     btn.classList.toggle('active');
//     AppState.settings[settingName] = btn.classList.contains('active');
//     localStorage.setItem('greenguardian-settings', JSON.stringify(AppState.settings));

//     // Request notification permission if enabling push
//     if (settingName === 'pushNotifications' && AppState.settings[settingName]) {
//         requestNotificationPermission();
//     }
// }

// function requestNotificationPermission() {
//     if ('Notification' in window) {
//         Notification.requestPermission().then(permission => {
//             if (permission === 'granted') {
//                 showToast('Notifications enabled!', 'success');
//             } else {
//                 showToast('Notification permission denied', 'warning');
//             }
//         });
//     }
// }

// function downloadUserData() {
//     const data = {
//         profile: AppState.userProfile,
//         diagnoses: AppState.diagnoses,
//         settings: AppState.settings,
//         exportDate: new Date().toISOString()
//     };

//     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'greenguardian-data.json';
//     link.click();
//     URL.revokeObjectURL(url);

//     showToast('Your data has been downloaded', 'success');
// }

// function clearHistory() {
//     if (confirm('Are you sure you want to clear all diagnosis history? This cannot be undone.')) {
//         AppState.diagnoses = [];
//         localStorage.setItem('greenguardian-diagnoses', JSON.stringify(AppState.diagnoses));
//         showToast('History cleared', 'success');
//     }
// }

// function deleteAccount() {
//     if (confirm('Are you sure you want to delete your account? All data will be permanently lost.')) {
//         localStorage.clear();
//         AppState.currentUser = null;
//         AppState.diagnoses = [];
//         showToast('Account deleted', 'info');
//         showScreen('login-screen');
//     }
// }

// // ==========================================
// // PRICING FEATURE
// // ==========================================

// function toggleBilling() {
//     const toggle = document.getElementById('billing-toggle');
//     toggle.classList.toggle('active');

//     const isYearly = toggle.classList.contains('active');
//     const monthlyPrice = document.querySelector('.pricing-card:nth-child(2) .text-4xl');
//     const enterprisePrice = document.querySelector('.pricing-card:nth-child(3) .text-4xl');

//     if (isYearly) {
//         monthlyPrice.textContent = '$3.99';
//         enterprisePrice.textContent = '$39';
//     } else {
//         monthlyPrice.textContent = '$4.99';
//         enterprisePrice.textContent = '$49';
//     }
// }

// function upgradePlan(plan) {
//     showToast(`Redirecting to ${plan} plan checkout...`, 'info');
//     // In production, this would redirect to Stripe/PayPal
// }

// function contactSales() {
//     showToast('Contact form coming soon!', 'info');
// }

// function toggleFaq(btn) {
//     const answer = btn.nextElementSibling;
//     const icon = btn.querySelector('[data-lucide="chevron-down"]');

//     answer.classList.toggle('hidden');
//     icon.style.transform = answer.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
// }

// // ==========================================
// // ANALYTICS FEATURE
// // ==========================================

// let analyticsCharts = {};

// function refreshAnalytics() {
//     const timeRange = document.getElementById('analytics-time-range')?.value || '30days';
//     const days = { '7days': 7, '30days': 30, '3months': 90, '1year': 365 }[timeRange];

//     const now = new Date();
//     const cutoffDate = new Date(now - days * 24 * 60 * 60 * 1000);

//     const filteredDiagnoses = AppState.diagnoses.filter(d => new Date(d.date) >= cutoffDate);

//     // Update stats
//     const analyticsTotal = document.getElementById('analytics-total');
//     const analyticsIssues = document.getElementById('analytics-issues');
//     const analyticsResolved = document.getElementById('analytics-resolved');
//     const analyticsConfidence = document.getElementById('analytics-confidence');

//     if (analyticsTotal) analyticsTotal.textContent = filteredDiagnoses.length;
//     if (analyticsIssues) analyticsIssues.textContent = filteredDiagnoses.filter(d => d.severity !== 'none').length;
//     if (analyticsResolved) analyticsResolved.textContent = filteredDiagnoses.filter(d => d.status === 'resolved').length;

//     const avgConfidence = filteredDiagnoses.length > 0
//         ? Math.round(filteredDiagnoses.reduce((sum, d) => sum + d.confidence, 0) / filteredDiagnoses.length)
//         : 0;
//     if (analyticsConfidence) analyticsConfidence.textContent = avgConfidence + '%';

//     // Destroy existing charts
//     Object.values(analyticsCharts).forEach(chart => chart.destroy());

//     // Create new charts
//     createDiagnosesChart(filteredDiagnoses, days);
//     createCategoriesChart(filteredDiagnoses);
//     createSeverityChart(filteredDiagnoses);
//     createSuccessChart(filteredDiagnoses);

//     // Top diseases
//     const diseaseCounts = {};
//     filteredDiagnoses.forEach(d => {
//         diseaseCounts[d.diseaseName] = (diseaseCounts[d.diseaseName] || 0) + 1;
//     });

//     const topDiseases = Object.entries(diseaseCounts)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 5);

//     const maxCount = topDiseases[0]?.[1] || 1;

//     document.getElementById('top-diseases-list').innerHTML = topDiseases.map(([name, count]) => `
//         <div class="flex items-center gap-3">
//             <span class="text-sm w-32 truncate" style="color: var(--text-primary);">${name}</span>
//             <div class="flex-1 h-2 rounded-full overflow-hidden" style="background-color: var(--bg-tertiary);">
//                 <div class="h-full bg-primary-500 rounded-full" style="width: ${(count / maxCount * 100)}%"></div>
//             </div>
//             <span class="text-sm w-8 text-right" style="color: var(--text-secondary);">${count}</span>
//         </div>
//     `).join('') || '<p style="color: var(--text-muted);">No data available</p>';
// }

// function createDiagnosesChart(diagnoses, days) {
//     const ctx = document.getElementById('diagnoses-chart');
//     if (!ctx) return;

//     // Group by date
//     const dateMap = {};
//     const today = new Date();

//     for (let i = days - 1; i >= 0; i--) {
//         const date = new Date(today - i * 24 * 60 * 60 * 1000);
//         const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//         dateMap[key] = 0;
//     }

//     diagnoses.forEach(d => {
//         const date = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//         if (dateMap.hasOwnProperty(date)) dateMap[date]++;
//     });

//     const isDark = AppState.theme === 'dark';
//     const textColor = isDark ? '#94a3b8' : '#6b7280';
//     const gridColor = isDark ? '#334155' : '#e5e7eb';

//     analyticsCharts.diagnoses = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: Object.keys(dateMap),
//             datasets: [{
//                 label: 'Diagnoses',
//                 data: Object.values(dateMap),
//                 borderColor: '#10b981',
//                 backgroundColor: 'rgba(16, 185, 129, 0.1)',
//                 fill: true,
//                 tension: 0.4
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: { display: false }
//             },
//             scales: {
//                 x: {
//                     ticks: { color: textColor },
//                     grid: { color: gridColor }
//                 },
//                 y: {
//                     ticks: { color: textColor },
//                     grid: { color: gridColor },
//                     beginAtZero: true
//                 }
//             }
//         }
//     });
// }

// function createCategoriesChart(diagnoses) {
//     const ctx = document.getElementById('categories-chart');
//     if (!ctx) return;

//     const categoryCounts = {};
//     diagnoses.forEach(d => {
//         const disease = DiseaseDatabase[d.diseaseId];
//         if (disease) {
//             categoryCounts[disease.category] = (categoryCounts[disease.category] || 0) + 1;
//         }
//     });

//     const isDark = AppState.theme === 'dark';
//     const textColor = isDark ? '#94a3b8' : '#6b7280';

//     analyticsCharts.categories = new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//             labels: Object.keys(categoryCounts).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
//             datasets: [{
//                 data: Object.values(categoryCounts),
//                 backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     position: 'right',
//                     labels: { color: textColor }
//                 }
//             }
//         }
//     });
// }

// function createSeverityChart(diagnoses) {
//     const ctx = document.getElementById('severity-chart');
//     if (!ctx) return;

//     const severityCounts = { severe: 0, moderate: 0, mild: 0, none: 0 };
//     diagnoses.forEach(d => {
//         severityCounts[d.severity] = (severityCounts[d.severity] || 0) + 1;
//     });

//     const isDark = AppState.theme === 'dark';
//     const textColor = isDark ? '#94a3b8' : '#6b7280';

//     analyticsCharts.severity = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: ['Severe', 'Moderate', 'Mild', 'Healthy'],
//             datasets: [{
//                 label: 'Count',
//                 data: [severityCounts.severe, severityCounts.moderate, severityCounts.mild, severityCounts.none],
//                 backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: { display: false }
//             },
//             scales: {
//                 x: {
//                     ticks: { color: textColor }
//                 },
//                 y: {
//                     ticks: { color: textColor },
//                     beginAtZero: true
//                 }
//             }
//         }
//     });
// }

// function createSuccessChart(diagnoses) {
//     const ctx = document.getElementById('success-chart');
//     if (!ctx) return;

//     const statusCounts = { resolved: 0, in_progress: 0, worsened: 0 };
//     diagnoses.forEach(d => {
//         statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
//     });

//     const isDark = AppState.theme === 'dark';
//     const textColor = isDark ? '#94a3b8' : '#6b7280';

//     analyticsCharts.success = new Chart(ctx, {
//         type: 'pie',
//         data: {
//             labels: ['Resolved', 'In Progress', 'Worsened'],
//             datasets: [{
//                 data: [statusCounts.resolved, statusCounts.in_progress, statusCounts.worsened],
//                 backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     position: 'right',
//                     labels: { color: textColor }
//                 }
//             }
//         }
//     });
// }

// function updateAnalytics() {
//     refreshAnalytics();
// }

// // ==========================================
// // DASHBOARD REFRESH
// // ==========================================

// function refreshDashboard() {
//     // Update daily tip
//     const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
//     const tip = PlantTips[dayOfYear % PlantTips.length];
//     const dailyTipTitle = document.getElementById('daily-tip-title');
//     const dailyTipContent = document.getElementById('daily-tip-content');
//     if (dailyTipTitle) dailyTipTitle.textContent = tip.title;
//     if (dailyTipContent) dailyTipContent.textContent = tip.content;

//     // Update recent diagnoses
//     const recentContainer = document.getElementById('recent-diagnoses');
//     if (!recentContainer) return;

//     const recent = AppState.diagnoses.slice(0, 3);

//     if (recent.length === 0) {
//         recentContainer.innerHTML = `
//             <div class="theme-card rounded-xl p-6 text-center">
//                 <p style="color: var(--text-muted);">No diagnoses yet. Start by uploading a plant image!</p>
//             </div>
//         `;
//     } else {
//         recentContainer.innerHTML = recent.map(d => {
//             const severityColors = {
//                 severe: 'bg-red-100 text-red-800',
//                 moderate: 'bg-yellow-100 text-yellow-800',
//                 mild: 'bg-green-100 text-green-800',
//                 none: 'bg-green-100 text-green-800'
//             };
//             return `
//                 <div class="theme-card rounded-xl p-4 flex items-center gap-4 card-hover cursor-pointer" onclick="showHistoryDetail('${d.id}')">
//                     <img src="${d.image}" alt="" class="w-16 h-16 rounded-lg object-cover flex-shrink-0">
//                     <div class="flex-1 min-w-0">
//                         <h4 class="font-semibold truncate" style="color: var(--text-primary);">${d.diseaseName}</h4>
//                         <p class="text-sm" style="color: var(--text-secondary);">${formatDate(d.date)} • ${d.confidence}% confidence</p>
//                     </div>
//                     <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[d.severity]}">
//                         ${d.severity.charAt(0).toUpperCase() + d.severity.slice(1)}
//                     </span>
//                 </div>
//             `;
//         }).join('');
//     }

//     if (typeof lucide !== 'undefined') lucide.createIcons();
// }

// // ==========================================
// // EVENT LISTENERS & INITIALIZATION
// // ==========================================

// function initEventListeners() {
//     // Auth forms
//     document.getElementById('login-form')?.addEventListener('submit', handleLogin);
//     document.getElementById('signup-form')?.addEventListener('submit', handleSignup);
//     document.getElementById('forgot-form')?.addEventListener('submit', handleForgotPassword);
//     document.getElementById('profile-form')?.addEventListener('submit', handleProfileUpdate);

//     // Password toggles
//     document.getElementById('toggle-login-password')?.addEventListener('click', function () {
//         togglePasswordVisibility(document.getElementById('login-password'), this);
//     });
//     document.getElementById('toggle-signup-password')?.addEventListener('click', function () {
//         togglePasswordVisibility(document.getElementById('signup-password'), this);
//     });
//     document.getElementById('toggle-confirm-password')?.addEventListener('click', function () {
//         togglePasswordVisibility(document.getElementById('signup-confirm-password'), this);
//     });

//     // Navigation
//     document.getElementById('go-to-signup')?.addEventListener('click', () => showScreen('signup-screen'));
//     document.getElementById('go-to-login')?.addEventListener('click', () => showScreen('login-screen'));
//     document.getElementById('back-to-login')?.addEventListener('click', () => showScreen('login-screen'));
//     document.getElementById('forgot-password-btn')?.addEventListener('click', () => showScreen('forgot-screen'));
//     document.getElementById('back-to-login-from-forgot')?.addEventListener('click', () => showScreen('login-screen'));
//     document.getElementById('header-logout-btn')?.addEventListener('click', handleLogout);

//     // User menu
//     document.getElementById('user-menu-btn')?.addEventListener('click', function () {
//         document.getElementById('header-user-menu').classList.toggle('hidden');
//     });

//     document.addEventListener('click', function (e) {
//         const menu = document.getElementById('header-user-menu');
//         const btn = document.getElementById('user-menu-btn');
//         if (menu && !menu.contains(e.target) && !btn.contains(e.target)) {
//             menu.classList.add('hidden');
//         }
//     });

//     // Theme toggle
//     document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

//     // File upload
//     document.getElementById('file-input')?.addEventListener('change', function (e) {
//         handleFileSelect(e.target.files[0]);
//     });

//     const dropZone = document.getElementById('drop-zone');
//     dropZone?.addEventListener('dragover', handleDragOver);
//     dropZone?.addEventListener('dragleave', handleDragLeave);
//     dropZone?.addEventListener('drop', handleDrop);
//     dropZone?.addEventListener('keydown', function (e) {
//         if (e.key === 'Enter' || e.key === ' ') document.getElementById('file-input').click();
//     });

//     document.getElementById('remove-file')?.addEventListener('click', resetUploadArea);
//     document.getElementById('edit-image-btn')?.addEventListener('click', openImageEditor);
//     document.getElementById('analyze-btn')?.addEventListener('click', analyzeImage);

//     // Camera
//     document.getElementById('tab-upload')?.addEventListener('click', () => switchTab('upload'));
//     document.getElementById('tab-camera')?.addEventListener('click', () => switchTab('camera'));
//     document.getElementById('camera-btn')?.addEventListener('click', () => switchTab('camera'));
//     document.getElementById('start-camera-btn')?.addEventListener('click', function () {
//         if (AppState.cameraStream) stopCamera(); else startCamera();
//     });
//     document.getElementById('capture-btn')?.addEventListener('click', capturePhoto);

//     // Results
//     document.getElementById('new-diagnosis-btn')?.addEventListener('click', function () {
//         resetUploadArea();
//         showScreen('dashboard-screen');
//     });
//     document.getElementById('save-report-btn')?.addEventListener('click', function () {
//         showToast('Report saved!', 'success');
//     });
//     document.getElementById('back-to-dashboard')?.addEventListener('click', function () {
//         resetUploadArea();
//         showScreen('dashboard-screen');
//     });
// }

// function init() {
//     // Store original button texts
//     document.getElementById('login-submit') && (document.getElementById('login-submit').dataset.originalText = 'Sign In');
//     document.getElementById('signup-submit') && (document.getElementById('signup-submit').dataset.originalText = 'Create Account');
//     document.getElementById('forgot-submit') && (document.getElementById('forgot-submit').dataset.originalText = 'Send Reset Link');

//     // Initialize Lucide icons
//     if (typeof lucide !== 'undefined') lucide.createIcons();

//     // Set up event listeners
//     initEventListeners();

//     // Check for saved session
//     const savedUser = localStorage.getItem('greenguardian_user');
//     if (savedUser) {
//         AppState.currentUser = JSON.parse(savedUser);
//         AppState.userProfile = JSON.parse(localStorage.getItem('greenguardian-profile')) || AppState.userProfile;
//         document.getElementById('user-name') && (document.getElementById('user-name').textContent = AppState.userProfile.name);
//         document.getElementById('header-user-name') && (document.getElementById('header-user-name').textContent = AppState.userProfile.name);
//     }

//     // Update theme toggle state
//     const isDark = AppState.theme === 'dark';
//     document.querySelectorAll('#settings-theme-toggle, #theme-toggle').forEach(toggle => {
//         toggle.classList.toggle('active', isDark);
//     });

//     console.log('GreenGuardian v2.0 initialized!');
// }

// // Start the app
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', init);
// } else {
//     init();
// }

// // Register Service Worker
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('sw.js')
//             .then(registration => console.log('SW registered:', registration))
//             .catch(error => console.log('SW registration failed:', error));
//     });
// }
async function diagnosePlant(file) {

    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("http://127.0.0.1:8000/diagnose", {
        method: "POST",
        body: formData
    })

    const result = await response.json()

    displayResult(result)

}
async function loadHistory() {

    const response = await fetch("http://127.0.0.1:8000/history")

    const data = await response.json()

    let html = ""

    data.forEach(item => {

        html += `
<li>
${item.disease} - ${(item.confidence * 100).toFixed(2)}%
</li>
`

    })

    document.getElementById("history").innerHTML = html

}
function uploadImage() {

    const fileInput = document.getElementById("imageInput")

    if (fileInput.files.length === 0) {

        alert("Upload image")
        return

    }

    const file = fileInput.files[0]

    diagnosePlant(file)

}

function displayResult(result) {

    document.getElementById("result").innerHTML = `

<h2>${result.disease}</h2>

<p>Confidence: ${(result.confidence * 100).toFixed(2)}%</p>

<h3>Symptoms</h3>
<p>${result.treatment?.symptoms || "No data"}</p>

<h3>Organic Treatment</h3>
<p>${result.treatment?.organic_treatment || "No data"}</p>

<h3>Chemical Treatment</h3>
<p>${result.treatment?.chemical_treatment || "No data"}</p>

<h3>Prevention</h3>
<p>${result.treatment?.prevention || "No data"}</p>

`
}
function riskLevel(confidence) {

    if (confidence > 0.9) return "High Risk"
    if (confidence > 0.7) return "Medium Risk"
    return "Low Risk"

}