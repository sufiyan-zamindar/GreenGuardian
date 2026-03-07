const API_BASE_CANDIDATES = (() => {
    const host = window.location.hostname || "localhost";
    const values = [
        `${window.location.origin}/api`,
        `http://${host}:8000/api`,
        "http://localhost:8000/api"
    ];
    return [...new Set(values.map((v) => v.replace(/\/+$/, "")))];
})();

const ENDPOINTS = { diagnose: "/diagnose", history: "/history" };

const AppState = {
    currentScreen: "signup-screen",
    uploadedImage: null,
    diagnosisResult: null,
    diagnosisHistory: [],
    filteredHistory: [],
    theme: localStorage.getItem("greenguardian-theme") || "light",
    user: {
        email: localStorage.getItem("user-email") || "",
        name: localStorage.getItem("user-name") || "Plant User",
        plan: localStorage.getItem("user-plan") || "Free"
    },
    cameraStream: null,
    currentHistoryDetail: null,
    analyticsCharts: {}
};

AppState.accentColor = localStorage.getItem("greenguardian-accent") || "green";

const LOCAL_TIPS = [
    { title: "Water at the Base", content: "Avoid wet leaves to reduce fungal growth.", category: "prevention" },
    { title: "Remove Infected Leaves", content: "Prune infected parts early.", category: "treatment" },
    { title: "Rotate Crops", content: "Break disease cycles between seasons.", category: "seasonal" }
];

const LOCAL_DISEASE_LIBRARY = [
    { id: "tomato_blight", name: "Tomato Late Blight", category: "vegetables", symptoms: "Dark lesions, leaf yellowing" },
    { id: "apple_scab", name: "Apple Scab", category: "fruits", symptoms: "Olive spots on leaves and fruit" },
    { id: "powdery_mildew", name: "Powdery Mildew", category: "flowers", symptoms: "White powdery surface growth" }
];

const qs = (id) => document.getElementById(id);
function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function getAccountHistoryKey(email = AppState.user.email) {
    const key = normalizeEmail(email) || "guest";
    return `gg-history-${key}`;
}

function readAccountHistory(email = AppState.user.email) {
    try {
        const raw = localStorage.getItem(getAccountHistoryKey(email));
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveAccountHistory(list, email = AppState.user.email) {
    try {
        localStorage.setItem(getAccountHistoryKey(email), JSON.stringify(Array.isArray(list) ? list : []));
    } catch {}
}

function safeText(v, fallback = "N/A") {
    if (v === null || v === undefined) return fallback;
    const t = String(v).trim();
    return t.length ? t : fallback;
}

function normalizeSeverity(v) {
    const s = String(v || "").toLowerCase();
    if (s.includes("severe") || s.includes("high")) return "severe";
    if (s.includes("moderate") || s.includes("medium")) return "moderate";
    if (s.includes("mild") || s.includes("low")) return "mild";
    if (s.includes("none") || s.includes("healthy")) return "none";
    return "unknown";
}

function formatDate(v) {
    const d = new Date(v || 0);
    return Number.isNaN(d.getTime()) ? "Unknown date" : d.toLocaleString();
}

function severityClass(s) {
    const map = {
        severe: "bg-red-100 text-red-700",
        moderate: "bg-amber-100 text-amber-700",
        mild: "bg-blue-100 text-blue-700",
        none: "bg-green-100 text-green-700",
        unknown: "bg-gray-100 text-gray-700"
    };
    return map[s] || map.unknown;
}

function placeDiagnosisAboveRecent() {
    const diagnosis = qs("diagnosis-result-container");
    const recent = qs("recent-diagnoses");
    if (!diagnosis || !recent) return;

    const recentBlock = recent.closest("div.mt-8") || recent.parentElement;
    if (!recentBlock || !recentBlock.parentElement) return;

    if (diagnosis.nextElementSibling === recentBlock) return;
    recentBlock.parentElement.insertBefore(diagnosis, recentBlock);
}


class APIService {
    static async fetchWithFallback(endpoint, options = {}) {
        let lastErr = null;
        for (const base of API_BASE_CANDIDATES) {
            try {
                const res = await fetch(`${base}${endpoint}`, options);
                const isJson = (res.headers.get("content-type") || "").includes("application/json");
                const data = isJson ? await res.json() : {};
                if (!res.ok) {
                    const msg = data?.detail?.error || data?.detail || data?.error || `Server error ${res.status}`;
                    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
                }
                return data;
            } catch (e) {
                lastErr = e;
            }
        }
        throw lastErr || new Error("Unable to connect to backend API");
    }

    static async diagnose(file) {
        const fd = new FormData();
        fd.append("file", file);
        const d = await this.fetchWithFallback(ENDPOINTS.diagnose, { method: "POST", body: fd });
        return {
            disease: safeText(d.disease),
            disease_id: safeText(d.disease_id, "unknown"),
            confidence: Number(d.confidence || 0),
            confidence_percentage: Number(d.confidence_percentage || Math.round((d.confidence || 0) * 100)),
            treatment: {
                symptoms: safeText(d.treatment?.symptoms),
                organic_treatment: safeText(d.treatment?.organic_treatment),
                chemical_treatment: safeText(d.treatment?.chemical_treatment),
                prevention: safeText(d.treatment?.prevention),
                severity: normalizeSeverity(d.treatment?.severity)
            }
        };
    }

    static async history() {
        const d = await this.fetchWithFallback(`${ENDPOINTS.history}?limit=100`);
        return (d.diagnoses || []).map((x) => ({
            id: x.id,
            disease: safeText(x.disease),
            confidence: Number(x.confidence || 0),
            created_at: x.created_at,
            severity: normalizeSeverity(x.severity),
            status: x.status || "in_progress"
        }));
    }

    static async clearHistory() {
        return this.fetchWithFallback(ENDPOINTS.history, { method: "DELETE" });
    }
}

class UIRenderer {
    static showScreen(target) {
        const id = target.endsWith("-screen") ? target : `${target}-screen`;
        const screen = qs(id);
        if (!screen) return;

        document.querySelectorAll(".screen").forEach((s) => {
            s.classList.remove("active");
            s.style.display = "none";
        });

        screen.style.display = "flex";
        screen.classList.add("active");
        AppState.currentScreen = id;

        const header = qs("app-header");
        const authScreens = new Set(["login-screen", "signup-screen", "forgot-screen"]);
        if (header) {
            header.classList.toggle("hidden", authScreens.has(id));
        }

        const headerTitle = qs("header-title");
        if (headerTitle) {
            const title = id.replace("-screen", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            headerTitle.textContent = title || "Dashboard";
        }


        document.querySelectorAll(".sidebar-item").forEach((b) => {
            const onclick = b.getAttribute("onclick") || "";
            b.classList.toggle("active", onclick.includes(id));
        });

        if (id === "dashboard-screen") renderRecent();
        if (id === "history-screen") renderHistory();
        if (id === "analytics-screen") updateAnalytics();
        if (window.lucide?.createIcons) window.lucide.createIcons();
    }

    static showProcessing() {
        this.showScreen("processing-screen");
    }

    static showError(message) {
        const c = qs("diagnosis-result-container");
        if (c) {
            c.innerHTML = `<div class="theme-card rounded-2xl p-6 border border-red-200 bg-red-50"><h3 class="font-semibold text-red-700 mb-1">Diagnosis failed</h3><p class="text-sm text-red-600">${safeText(message, "Unknown error")}</p></div>`;
        }
        this.showScreen("dashboard-screen");
        placeDiagnosisAboveRecent();
    }

    static renderDiagnosis(result) {
        const c = qs("diagnosis-result-container");
        if (!c) return;
        const sev = normalizeSeverity(result.treatment?.severity);
        c.innerHTML = `
            <div class="theme-card rounded-2xl shadow-lg p-6 animate-fade-in">
                <div class="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <p class="text-xs uppercase tracking-wide text-primary-600 font-semibold">Diagnosis Result</p>
                        <h3 class="text-2xl font-bold" style="color: var(--text-primary);">${safeText(result.disease)}</h3>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${severityClass(sev)}">${sev}</span>
                </div>
                <div class="mb-5">
                    <div class="flex items-center justify-between mb-1"><span style="color: var(--text-secondary);">Confidence</span><span class="font-semibold" style="color: var(--text-primary);">${result.confidence_percentage}%</span></div>
                    <div class="w-full h-2 rounded-full bg-gray-200"><div class="h-2 rounded-full bg-primary-500" style="width:${result.confidence_percentage}%"></div></div>
                </div>
                <div class="grid gap-3">
                    <div class="theme-card rounded-xl p-3"><p class="text-xs font-semibold uppercase tracking-wide mb-1 text-primary-600">Symptoms</p><p class="text-sm" style="color: var(--text-primary);">${safeText(result.treatment?.symptoms)}</p></div>
                    <div class="theme-card rounded-xl p-3"><p class="text-xs font-semibold uppercase tracking-wide mb-1 text-primary-600">Organic Treatment</p><p class="text-sm" style="color: var(--text-primary);">${safeText(result.treatment?.organic_treatment)}</p></div>
                    <div class="theme-card rounded-xl p-3"><p class="text-xs font-semibold uppercase tracking-wide mb-1 text-primary-600">Chemical Treatment</p><p class="text-sm" style="color: var(--text-primary);">${safeText(result.treatment?.chemical_treatment)}</p></div>
                    <div class="theme-card rounded-xl p-3"><p class="text-xs font-semibold uppercase tracking-wide mb-1 text-primary-600">Prevention</p><p class="text-sm" style="color: var(--text-primary);">${safeText(result.treatment?.prevention)}</p></div>
                </div>
            </div>`;

        this.showScreen("dashboard-screen");
        placeDiagnosisAboveRecent();
        c.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}
function applyTheme() {
    const dark = AppState.theme === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.setAttribute("data-theme", AppState.theme);
    localStorage.setItem("greenguardian-theme", AppState.theme);
    qs("settings-theme-toggle")?.classList.toggle("active", dark);
}

function applyAccentPalette(color) {
    const palettes = {
        green: { p500: "#10b981", p600: "#059669", p100: "#d1fae5" },
        blue: { p500: "#3b82f6", p600: "#2563eb", p100: "#dbeafe" },
        purple: { p500: "#8b5cf6", p600: "#7c3aed", p100: "#ede9fe" },
        orange: { p500: "#f97316", p600: "#ea580c", p100: "#ffedd5" }
    };

    const p = palettes[color] || palettes.green;
    const styleId = "dynamic-accent-style";
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }

    styleTag.textContent =
        ".text-primary-500, .text-primary-600, .text-primary-700 { color: " + p.p500 + " !important; }" +
        ".bg-primary-500 { background-color: " + p.p500 + " !important; }" +
        ".bg-primary-600 { background-color: " + p.p600 + " !important; }" +
        ".bg-primary-100, .bg-primary-50 { background-color: " + p.p100 + " !important; }" +
        ".border-primary-500 { border-color: " + p.p500 + " !important; }" +
        ".ring-primary-500, .focus\\:ring-primary-500:focus { --tw-ring-color: " + p.p500 + " !important; }" +
        ".hover\\:bg-primary-600:hover { background-color: " + p.p600 + " !important; }" +
        ".hover\\:text-primary-700:hover { color: " + p.p600 + " !important; }";

    document.querySelectorAll('[onclick^="setAccentColor("]').forEach((btn) => {
        btn.classList.remove("ring-2", "ring-offset-2");
    });
    const selected = document.querySelector('[onclick="setAccentColor(' + "'" + color + "'" + ')"]');
    selected?.classList.add("ring-2", "ring-offset-2");
}
function setUserUI() {
    const email = AppState.user.email || "user@example.com";
    const name = AppState.user.name || email.split("@")[0];
    if (qs("header-user-name")) qs("header-user-name").textContent = name;
    if (qs("profile-name")) qs("profile-name").textContent = name;
    if (qs("profile-email")) qs("profile-email").textContent = email;
    if (qs("profile-edit-name")) qs("profile-edit-name").value = name;
    if (qs("profile-edit-email")) qs("profile-edit-email").value = email;
    if (qs("profile-plan")) qs("profile-plan").textContent = `${AppState.user.plan} Plan`;
    const avatar = qs("header-avatar");
    if (avatar) {
        const initials = (name || "U")
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("") || "U";
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' rx='32' fill='%2310b981'/><text x='50%' y='54%' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif' font-size='24' font-weight='700' fill='white'>${initials}</text></svg>`;
        avatar.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        avatar.alt = `${name} avatar`;
        avatar.style.cursor = "pointer";
        avatar.title = "Go to Plant Tag";
        if (!avatar.dataset.plantTagBound) {
            avatar.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.goToPlantTag === "function") {
                    window.goToPlantTag();
                    showToast("Moved to Plant Tag", "info");
                }
            });
            avatar.dataset.plantTagBound = "1";
        }
    }
}
function showToast(message, type = "info") {
    const c = qs("toast-container");
    if (!c) return;
    const cls = { success: "bg-green-600", error: "bg-red-600", warning: "bg-amber-600", info: "bg-slate-700" }[type] || "bg-slate-700";
    const el = document.createElement("div");
    el.className = `toast-enter text-white text-sm px-4 py-3 rounded-lg shadow-lg ${cls}`;
    el.textContent = message;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

function clearUploadPreview() {
    AppState.uploadedImage = null;
    if (qs("file-input")) qs("file-input").value = "";
    if (qs("preview-image")) qs("preview-image").src = "";
    if (qs("preview-filename")) qs("preview-filename").textContent = "";
    qs("drop-default")?.classList.remove("hidden");
    qs("drop-preview")?.classList.add("hidden");
    qs("drop-zone")?.classList.remove("has-file", "drag-over");
    if (qs("analyze-btn")) qs("analyze-btn").disabled = true;
}

function showPreview(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => { if (qs("preview-image")) qs("preview-image").src = e.target?.result || ""; };
    r.readAsDataURL(file);
    if (qs("preview-filename")) qs("preview-filename").textContent = file.name;
    qs("drop-default")?.classList.add("hidden");
    qs("drop-preview")?.classList.remove("hidden");
    qs("drop-zone")?.classList.add("has-file");
    if (qs("analyze-btn")) qs("analyze-btn").disabled = false;
}

function renderRecent() {
    const c = qs("recent-diagnoses");
    if (!c) return;
    const list = AppState.diagnosisHistory.slice(0, 3);
    if (!list.length) {
        c.innerHTML = `<div class="theme-card rounded-xl p-4 text-sm" style="color: var(--text-secondary);">No diagnoses yet. Upload a plant image to get started.</div>`;
        return;
    }

    c.innerHTML = list.map((d) => `
        <button type="button" onclick="viewHistoryDetail(${d.id})" class="theme-card w-full rounded-xl p-4 text-left card-hover">
            <div class="flex items-center justify-between gap-3">
                <div><p class="font-semibold" style="color: var(--text-primary);">${safeText(d.disease)}</p><p class="text-xs" style="color: var(--text-muted);">${formatDate(d.created_at)}</p></div>
                <span class="text-sm font-semibold text-primary-600">${Math.round(d.confidence * 100)}%</span>
            </div>
        </button>`).join("");
}

function updateHistoryStats(list) {
    const total = list.length;
    const severe = list.filter((d) => normalizeSeverity(d.severity) === "severe").length;
    const resolved = list.filter((d) => (d.status || "") === "resolved").length;
    const avg = total ? Math.round(list.reduce((a, b) => a + Number(b.confidence || 0), 0) / total * 100) : 0;
    if (qs("history-total")) qs("history-total").textContent = String(total);
    if (qs("history-severe")) qs("history-severe").textContent = String(severe);
    if (qs("history-resolved")) qs("history-resolved").textContent = String(resolved);
    if (qs("history-avg-confidence")) qs("history-avg-confidence").textContent = `${avg}%`;
}

function renderHistory() {
    const list = AppState.filteredHistory;
    const listEl = qs("history-list");
    const emptyEl = qs("history-empty");
    if (!listEl) return;

    if (!list.length) {
        listEl.innerHTML = "";
        emptyEl?.classList.remove("hidden");
        updateHistoryStats([]);
        return;
    }

    emptyEl?.classList.add("hidden");
    listEl.innerHTML = list.map((d) => {
        const sev = normalizeSeverity(d.severity);
        return `
            <div class="theme-card rounded-xl p-4 card-hover">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div><p class="font-semibold" style="color: var(--text-primary);">${safeText(d.disease)}</p><p class="text-xs" style="color: var(--text-muted);">${formatDate(d.created_at)}</p></div>
                    <div class="flex items-center gap-2"><span class="px-2 py-1 rounded-full text-xs font-semibold ${severityClass(sev)}">${sev}</span><span class="text-sm font-semibold text-primary-600">${Math.round((d.confidence || 0) * 100)}%</span><button type="button" onclick="viewHistoryDetail(${d.id})" class="text-sm text-primary-600 hover:text-primary-700">Details</button></div>
                </div>
            </div>`;
    }).join("");

    updateHistoryStats(list);
}

function byDate(list, mode) {
    if (mode === "all") return list;
    const now = Date.now();
    const map = { "7days": 7, "30days": 30, "3months": 90, "1year": 365 };
    const days = map[mode] || 0;
    if (!days) return list;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return list.filter((d) => new Date(d.created_at).getTime() >= cutoff);
}

function filterHistory() {
    const date = qs("history-filter-date")?.value || "all";
    const sev = qs("history-filter-severity")?.value || "all";
    const status = qs("history-filter-status")?.value || "all";

    let list = byDate([...AppState.diagnosisHistory], date);
    if (sev !== "all") list = list.filter((d) => normalizeSeverity(d.severity) === sev);
    if (status !== "all") list = list.filter((d) => (d.status || "in_progress") === status);
    AppState.filteredHistory = list;
    renderHistory();
}

function viewHistoryDetail(id) {
    const item = AppState.diagnosisHistory.find((d) => Number(d.id) === Number(id));
    if (!item) return;
    AppState.currentHistoryDetail = item;
    const root = qs("history-detail-content");
    if (!root) return;

    const sev = normalizeSeverity(item.severity);
    root.innerHTML = `
        <div class="theme-card rounded-2xl p-6 shadow-lg">
            <div class="flex items-center justify-between mb-3"><h3 class="text-xl font-bold" style="color: var(--text-primary);">${safeText(item.disease)}</h3><span class="px-3 py-1 rounded-full text-xs font-semibold ${severityClass(sev)}">${sev}</span></div>
            <p class="text-sm mb-4" style="color: var(--text-muted);">${formatDate(item.created_at)}</p>
            <div class="space-y-3">
                <div><p class="text-xs uppercase tracking-wide text-primary-600 font-semibold">Confidence</p><p class="font-semibold" style="color: var(--text-primary);">${Math.round(item.confidence * 100)}%</p></div>
                <div>
                    <p class="text-xs uppercase tracking-wide text-primary-600 font-semibold">Status</p>
                    <select id="history-status-select" class="theme-input mt-1 px-3 py-2 rounded-lg text-sm">
                        <option value="in_progress" ${item.status === "in_progress" ? "selected" : ""}>In Progress</option>
                        <option value="resolved" ${item.status === "resolved" ? "selected" : ""}>Resolved</option>
                        <option value="worsened" ${item.status === "worsened" ? "selected" : ""}>Worsened</option>
                    </select>
                </div>
                <button type="button" onclick="saveHistoryStatus(${item.id})" class="bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600">Save Status</button>
            </div>
        </div>`;

    UIRenderer.showScreen("history-detail-screen");
}

function saveHistoryStatus(id) {
    const s = qs("history-status-select")?.value || "in_progress";
    const item = AppState.diagnosisHistory.find((d) => Number(d.id) === Number(id));
    if (!item) return;
    item.status = s;
    saveAccountHistory(AppState.diagnosisHistory);
    filterHistory();
    showToast("History status updated", "success");
}

async function loadHistory() {
    const localHistory = readAccountHistory();

    // Prefer per-account local history. If empty, attempt one-time backend bootstrap.
    if (localHistory.length) {
        AppState.diagnosisHistory = localHistory;
        AppState.filteredHistory = [...AppState.diagnosisHistory];
        renderRecent();
        renderHistory();
        updateProfileStats();
        return;
    }

    try {
        const remoteHistory = await APIService.history();
        AppState.diagnosisHistory = remoteHistory;
        AppState.filteredHistory = [...AppState.diagnosisHistory];
        saveAccountHistory(AppState.diagnosisHistory);
        renderRecent();
        renderHistory();
        updateProfileStats();
    } catch (e) {
        console.error(e);
        AppState.diagnosisHistory = [];
        AppState.filteredHistory = [];
        renderRecent();
        renderHistory();
        updateProfileStats();
    }
}
function renderEncyclopedia(category = "all", query = "") {
    const grid = qs("encyclopedia-grid");
    if (!grid) return;
    const q = query.toLowerCase().trim();
    const list = LOCAL_DISEASE_LIBRARY.filter((d) => {
        const catOk = category === "all" || d.category === category;
        const txt = `${d.name} ${d.symptoms} ${d.category}`.toLowerCase();
        return catOk && (!q || txt.includes(q));
    });

    if (!list.length) {
        grid.innerHTML = `<div class="theme-card rounded-xl p-4 text-sm" style="color: var(--text-secondary);">No results found.</div>`;
        return;
    }

    grid.innerHTML = list.map((d) => `
        <button type="button" onclick="viewDiseaseDetail('${d.id}')" class="theme-card rounded-xl p-4 text-left card-hover">
            <p class="font-semibold mb-1" style="color: var(--text-primary);">${d.name}</p>
            <p class="text-xs mb-2 capitalize text-primary-600">${d.category}</p>
            <p class="text-sm" style="color: var(--text-secondary);">${d.symptoms}</p>
        </button>`).join("");
}

function filterEncyclopedia(category) {
    document.querySelectorAll(".encyclo-category").forEach((b) => b.classList.toggle("active", b.dataset.category === category));
    renderEncyclopedia(category, qs("encyclopedia-search")?.value || "");
}

function searchEncyclopedia() {
    const category = document.querySelector(".encyclo-category.active")?.dataset.category || "all";
    renderEncyclopedia(category, qs("encyclopedia-search")?.value || "");
}

function viewDiseaseDetail(id) {
    const d = LOCAL_DISEASE_LIBRARY.find((x) => x.id === id);
    if (!d) return;
    const root = qs("disease-detail-content");
    if (!root) return;

    root.innerHTML = `
        <div class="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
            <button type="button" onclick="showScreen('encyclopedia-screen')" class="mb-4 text-sm text-primary-600">Back</button>
            <div class="theme-card rounded-2xl p-6 shadow-lg">
                <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">${d.name}</h2>
                <p class="text-sm capitalize mb-4 text-primary-600">${d.category}</p>
                <p style="color: var(--text-secondary);">${d.symptoms}</p>
            </div>
        </div>`;

    UIRenderer.showScreen("disease-detail-screen");
}

function renderTips(category = "all") {
    const feature = qs("featured-tip");
    const grid = qs("tips-grid");
    if (!feature || !grid) return;

    const ft = LOCAL_TIPS[0];
    feature.innerHTML = `<div class="p-6"><p class="text-xs uppercase tracking-wide text-primary-600 font-semibold mb-1">Featured Tip</p><h3 class="text-xl font-bold mb-2" style="color: var(--text-primary);">${ft.title}</h3><p style="color: var(--text-secondary);">${ft.content}</p></div>`;

    const list = category === "all" ? LOCAL_TIPS : LOCAL_TIPS.filter((t) => t.category === category);
    grid.innerHTML = list.map((t) => `<div class="theme-card rounded-xl p-4 card-hover"><p class="font-semibold mb-1" style="color: var(--text-primary);">${t.title}</p><p class="text-xs uppercase mb-2 text-primary-600">${t.category}</p><p class="text-sm" style="color: var(--text-secondary);">${t.content}</p></div>`).join("");
}

function filterTips(category) {
    document.querySelectorAll(".tips-category").forEach((b) => b.classList.toggle("active", b.dataset.category === category));
    renderTips(category);
}

function updateProfileStats() {
    const total = AppState.diagnosisHistory.length;
    const plants = new Set(AppState.diagnosisHistory.map((d) => d.disease)).size;
    const streak = total ? Math.min(total, 30) : 0;
    if (qs("profile-diagnoses")) qs("profile-diagnoses").textContent = String(total);
    if (qs("profile-plants")) qs("profile-plants").textContent = String(plants);
    if (qs("profile-streak")) qs("profile-streak").textContent = String(streak);
}

function makeChart(id, cfg) {
    if (!window.Chart) return;
    if (AppState.analyticsCharts[id]) AppState.analyticsCharts[id].destroy();
    const canvas = qs(id);
    if (!canvas) return;
    AppState.analyticsCharts[id] = new Chart(canvas, cfg);
}

function updateAnalytics() {
    const range = qs("analytics-time-range")?.value || "30days";
    const data = byDate(AppState.diagnosisHistory, range);

    const total = data.length;
    const issues = data.filter((d) => normalizeSeverity(d.severity) !== "none").length;
    const resolved = data.filter((d) => d.status === "resolved").length;
    const avg = total ? Math.round(data.reduce((a, b) => a + b.confidence, 0) / total * 100) : 0;

    if (qs("analytics-total")) qs("analytics-total").textContent = String(total);
    if (qs("analytics-issues")) qs("analytics-issues").textContent = String(issues);
    if (qs("analytics-resolved")) qs("analytics-resolved").textContent = String(resolved);
    if (qs("analytics-confidence")) qs("analytics-confidence").textContent = `${avg}%`;
    if (qs("analytics-total-change")) qs("analytics-total-change").textContent = total ? "+active" : "No data";
    if (qs("analytics-issues-change")) qs("analytics-issues-change").textContent = issues ? "Needs attention" : "No issues";
    if (qs("analytics-resolved-change")) qs("analytics-resolved-change").textContent = resolved ? "Good progress" : "No resolved items";

    const labels = data.slice(0, 7).map((d) => new Date(d.created_at).toLocaleDateString());
    const values = data.slice(0, 7).map((d) => Math.round(d.confidence * 100));

    makeChart("diagnoses-chart", {
        type: "line",
        data: { labels, datasets: [{ label: "Confidence %", data: values, borderColor: "#10b981", tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const sevCounts = ["severe", "moderate", "mild", "none"].map((s) => data.filter((d) => normalizeSeverity(d.severity) === s).length);
    makeChart("severity-chart", {
        type: "doughnut",
        data: { labels: ["Severe", "Moderate", "Mild", "Healthy"], datasets: [{ data: sevCounts, backgroundColor: ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const diseaseCounts = {};
    data.forEach((d) => { diseaseCounts[d.disease] = (diseaseCounts[d.disease] || 0) + 1; });
    const top = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    makeChart("categories-chart", {
        type: "bar",
        data: { labels: top.map((x) => x[0]), datasets: [{ label: "Count", data: top.map((x) => x[1]), backgroundColor: "#059669" }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    makeChart("success-chart", {
        type: "pie",
        data: { labels: ["Resolved", "In Progress", "Worsened"], datasets: [{ data: [data.filter((d) => d.status === "resolved").length, data.filter((d) => d.status === "in_progress").length, data.filter((d) => d.status === "worsened").length], backgroundColor: ["#10b981", "#f59e0b", "#ef4444"] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const topList = qs("top-diseases-list");
    if (topList) {
        topList.innerHTML = top.length
            ? top.map(([n, c]) => `<div class="flex items-center justify-between p-3 rounded-lg" style="background-color: var(--bg-tertiary);"><span style="color: var(--text-primary);">${n}</span><span class="text-sm font-semibold text-primary-600">${c}</span></div>`).join("")
            : `<p class="text-sm" style="color: var(--text-secondary);">No analytics data yet.</p>`;
    }
}

function upsertLocalDiagnosis(result) {
    const now = new Date();
    const confidence = Number(result?.confidence || (Number(result?.confidence_percentage || 0) / 100) || 0);
    const candidate = {
        id: -1 * Date.now(),
        disease: safeText(result?.disease, "Unknown"),
        confidence,
        created_at: now.toISOString(),
        severity: normalizeSeverity(result?.treatment?.severity),
        status: "in_progress"
    };

    AppState.diagnosisHistory = [candidate, ...AppState.diagnosisHistory];
    if (AppState.diagnosisHistory.length > 200) {
        AppState.diagnosisHistory = AppState.diagnosisHistory.slice(0, 200);
    }

    AppState.filteredHistory = [...AppState.diagnosisHistory];
}
async function doAnalyze() {
    if (!AppState.uploadedImage) {
        showToast("Please upload an image first", "warning");
        return;
    }

    UIRenderer.showProcessing();
    try {
        const result = await APIService.diagnose(AppState.uploadedImage);
        AppState.diagnosisResult = result;
        await loadHistory();
        upsertLocalDiagnosis(result);
        saveAccountHistory(AppState.diagnosisHistory);
        renderRecent();
        renderHistory();
        updateAnalytics();
        updateProfileStats();
        UIRenderer.renderDiagnosis(result);
        showToast("Diagnosis completed", "success");
    } catch (e) {
        console.error(e);
        UIRenderer.showError(e.message || "Failed to analyze image");
        showToast("Diagnosis failed. Check backend connection.", "error");
    }
}
function showUploadTab(upload) {
    const up = qs("tab-upload");
    const cam = qs("tab-camera");
    const upA = qs("upload-area");
    const camA = qs("camera-area");

    if (upload) {
        up?.classList.add("text-primary-600", "border-b-2", "border-primary-500", "bg-primary-50");
        cam?.classList.remove("text-primary-600", "border-b-2", "border-primary-500", "bg-primary-50");
        upA?.classList.remove("hidden");
        camA?.classList.add("hidden");
    } else {
        cam?.classList.add("text-primary-600", "border-b-2", "border-primary-500", "bg-primary-50");
        up?.classList.remove("text-primary-600", "border-b-2", "border-primary-500", "bg-primary-50");
        camA?.classList.remove("hidden");
        upA?.classList.add("hidden");
    }
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        AppState.cameraStream = stream;
        const video = qs("camera-video");
        if (video) {
            video.srcObject = stream;
            await video.play();
        }
        qs("camera-placeholder")?.classList.add("hidden");
        qs("capture-btn")?.classList.remove("hidden");
    } catch (e) {
        console.error(e);
        showToast("Unable to access camera", "error");
    }
}

function stopCamera() {
    if (!AppState.cameraStream) return;
    AppState.cameraStream.getTracks().forEach((t) => t.stop());
    AppState.cameraStream = null;
    qs("capture-btn")?.classList.add("hidden");
    qs("camera-placeholder")?.classList.remove("hidden");
}

function captureCamera() {
    const video = qs("camera-video");
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        AppState.uploadedImage = file;
        showPreview(file);
        showUploadTab(true);
        stopCamera();
    }, "image/jpeg", 0.95);
}
function wireEvents() {
    qs("theme-toggle")?.addEventListener("click", toggleTheme);

    qs("file-input")?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        AppState.uploadedImage = file;
        showPreview(file);
    });

    const dz = qs("drop-zone");
    if (dz) {
        dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("drag-over"); });
        dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
        dz.addEventListener("drop", (e) => {
            e.preventDefault();
            dz.classList.remove("drag-over");
            const file = e.dataTransfer?.files?.[0];
            if (!file || !qs("file-input")) return;
            const dt = new DataTransfer();
            dt.items.add(file);
            qs("file-input").files = dt.files;
            AppState.uploadedImage = file;
            showPreview(file);
        });
    }

    qs("remove-file")?.addEventListener("click", clearUploadPreview);
    qs("analyze-btn")?.addEventListener("click", doAnalyze);

    qs("tab-upload")?.addEventListener("click", () => showUploadTab(true));
    qs("tab-camera")?.addEventListener("click", () => showUploadTab(false));
    qs("camera-btn")?.addEventListener("click", () => { showUploadTab(false); startCamera(); });
    qs("start-camera-btn")?.addEventListener("click", startCamera);
    qs("capture-btn")?.addEventListener("click", captureCamera);

    qs("login-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = qs("login-email")?.value?.trim();
        const password = qs("login-password")?.value?.trim();
        if (!email || !password) {
            showToast("Please fill all required fields", "warning");
            return;
        }

        AppState.user.email = email;
        AppState.user.name = email.split("@")[0];
        localStorage.setItem("user-email", AppState.user.email);
        localStorage.setItem("user-name", AppState.user.name);
        localStorage.setItem("user-logged-in", "true");
        setUserUI();
        await loadHistory();
        showScreen("dashboard-screen");
    });

    qs("signup-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = qs("signup-email")?.value?.trim();
        const password = qs("signup-password")?.value?.trim();
        const confirm = qs("signup-confirm-password")?.value?.trim();
        if (!email || !password) return;
        if (password !== confirm) {
            showToast("Passwords do not match", "warning");
            return;
        }
        AppState.user.email = email;
        AppState.user.name = email.split("@")[0];
        localStorage.setItem("user-email", AppState.user.email);
        localStorage.setItem("user-name", AppState.user.name);
        localStorage.setItem("user-logged-in", "false");
        const loginEmail = qs("login-email");
        if (loginEmail) loginEmail.value = email;
        showToast("Account created. Please sign in.", "success");
        showScreen("login-screen");
    });

    qs("forgot-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("Password reset instructions sent", "info");
        showScreen("login-screen");
    });

    qs("go-to-signup")?.addEventListener("click", () => showScreen("signup-screen"));
    qs("go-to-login")?.addEventListener("click", () => showScreen("login-screen"));
    qs("back-to-login")?.addEventListener("click", () => showScreen("login-screen"));
    qs("forgot-password-btn")?.addEventListener("click", () => showScreen("forgot-screen"));
    qs("back-to-login-from-forgot")?.addEventListener("click", () => showScreen("login-screen"));
    const goToSignupBtn = qs("go-to-signup");
    if (goToSignupBtn) goToSignupBtn.onclick = () => showScreen("signup-screen");

    const goToLoginBtn = qs("go-to-login");
    if (goToLoginBtn) goToLoginBtn.onclick = () => showScreen("login-screen");

    qs("profile-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = qs("profile-edit-name")?.value?.trim();
        if (name) {
            AppState.user.name = name;
            localStorage.setItem("user-name", name);
            setUserUI();
        }
        showToast("Profile updated", "success");
    });
}

function wirePWA() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("sw.js").catch(() => {});
}

function exportHistory() {
    const rows = AppState.filteredHistory.length ? AppState.filteredHistory : AppState.diagnosisHistory;
    if (!rows.length) {
        showToast("No history to export", "warning");
        return;
    }
    const csv = ["id,disease,confidence,severity,status,created_at"]
        .concat(rows.map((r) => [r.id, r.disease, r.confidence, r.severity, r.status || "in_progress", r.created_at].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `greenguardian-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("History exported", "success");
}

async function clearHistory() {
    if (!confirm("Clear all diagnosis history?")) return;

    AppState.diagnosisHistory = [];
    AppState.filteredHistory = [];
    saveAccountHistory([]);
    renderHistory();
    renderRecent();
    updateAnalytics();
    updateProfileStats();

    try {
        await APIService.clearHistory();
        showToast("History cleared", "success");
    } catch (e) {
        console.error(e);
        showToast("Local history cleared (backend clear failed)", "warning");
    }
}

function downloadUserData() {
    const blob = new Blob([JSON.stringify({ user: AppState.user, diagnoses: AppState.diagnosisHistory, exported_at: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `greenguardian-user-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("User data exported", "success");
}

function deleteAccount() {
    if (!confirm("Delete local account data on this device?")) return;
    localStorage.removeItem("user-email");
    localStorage.removeItem("user-name");
    localStorage.removeItem("user-logged-in");
    localStorage.removeItem(getAccountHistoryKey());
    AppState.user = { email: "", name: "Plant User", plan: "Free" };
    showToast("Local account data removed", "success");
    showScreen("signup-screen");
}

function setAccentColor(color) {
    AppState.accentColor = color;
    localStorage.setItem("greenguardian-accent", color);
    applyAccentPalette(color);
    showToast(`Accent color set to ${color}`, "info");
}
function toggleTheme() { AppState.theme = AppState.theme === "light" ? "dark" : "light"; applyTheme(); }
function toggleSetting(button, key) { button?.classList.toggle("active"); localStorage.setItem(`setting-${key}`, button?.classList.contains("active") ? "1" : "0"); }
function toggleFaq(button) { const p = button?.parentElement?.querySelector("p"); const i = button?.querySelector("i"); if (p) p.classList.toggle("hidden"); i?.classList.toggle("rotate-180"); }
function toggleBilling() { qs("billing-toggle")?.classList.toggle("active"); }
function upgradePlan(plan) { AppState.user.plan = plan === "pro" ? "Pro" : "Enterprise"; localStorage.setItem("user-plan", AppState.user.plan); setUserUI(); showToast(`Plan changed to ${AppState.user.plan}`, "success"); }
function contactSales() { showToast("Sales contact flow coming soon", "info"); }
function openShareModal() { showToast("Share card modal coming soon", "info"); }
function closeShareModal() {}
function shareTo(platform) { showToast(`Share to ${platform} coming soon`, "info"); }
function downloadShareCard() { showToast("Share card download coming soon", "info"); }
function setEditorTool() { showToast("Editor tools ready", "info"); }
function setCropRatio() { showToast("Crop ratio set", "info"); }
function rotateImage() { showToast("Image rotated", "success"); }
function flipImage() { showToast("Image flipped", "success"); }
function updateImageAdjustments() {}
function applyImageEdits() { showToast("Applied image edits", "success"); showScreen("dashboard-screen"); }
function closeImageEditor() { showScreen("dashboard-screen"); }
function showScreen(target) { UIRenderer.showScreen(target); }

function init() {
    applyTheme();
    applyAccentPalette(AppState.accentColor);
    setUserUI();
    wirePWA();
    wireEvents();
    renderTips();
    renderEncyclopedia();
    const loggedIn = localStorage.getItem("user-logged-in") === "true";
    showScreen("signup-screen");
    if (loggedIn) loadHistory().then(() => updateAnalytics());
    if (window.lucide?.createIcons) window.lucide.createIcons();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

window.showScreen = showScreen;
window.showToast = showToast;
window.filterHistory = filterHistory;
window.viewHistoryDetail = viewHistoryDetail;
window.saveHistoryStatus = saveHistoryStatus;
window.exportHistory = exportHistory;
window.clearHistory = clearHistory;
window.downloadUserData = downloadUserData;
window.deleteAccount = deleteAccount;
window.filterEncyclopedia = filterEncyclopedia;
window.searchEncyclopedia = searchEncyclopedia;
window.viewDiseaseDetail = viewDiseaseDetail;
window.filterTips = filterTips;
window.toggleTheme = toggleTheme;
window.setAccentColor = setAccentColor;
window.toggleSetting = toggleSetting;
window.toggleFaq = toggleFaq;
window.toggleBilling = toggleBilling;
window.updateAnalytics = updateAnalytics;
window.upgradePlan = upgradePlan;
window.contactSales = contactSales;
window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.shareTo = shareTo;
window.downloadShareCard = downloadShareCard;
window.setEditorTool = setEditorTool;
window.setCropRatio = setCropRatio;
window.rotateImage = rotateImage;
window.flipImage = flipImage;
window.updateImageAdjustments = updateImageAdjustments;
window.applyImageEdits = applyImageEdits;
window.closeImageEditor = closeImageEditor;




// Enhanced Plant / History / Analytics layer (keeps existing UI structure)
(function () {
    const DEMO_DATA_IMAGES = [
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'><defs><linearGradient id='g' x1='0' x2='1'><stop stop-color='%2310b981'/><stop offset='1' stop-color='%23059669'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><circle cx='200' cy='180' r='110' fill='rgba(255,255,255,0.18)'/><text x='58' y='340' font-size='64' fill='white' font-family='Arial'>Tomato Demo Leaf</text><text x='58' y='410' font-size='32' fill='white' font-family='Arial'>Close-up sample image</text></svg>",
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'><defs><linearGradient id='g' x1='0' x2='1'><stop stop-color='%233b82f6'/><stop offset='1' stop-color='%231d4ed8'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><circle cx='640' cy='180' r='120' fill='rgba(255,255,255,0.16)'/><text x='58' y='340' font-size='64' fill='white' font-family='Arial'>Apple Demo Leaf</text><text x='58' y='410' font-size='32' fill='white' font-family='Arial'>Healthy foliage sample</text></svg>",
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600'><defs><linearGradient id='g' x1='0' x2='1'><stop stop-color='%23f97316'/><stop offset='1' stop-color='%23ea580c'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><circle cx='250' cy='420' r='100' fill='rgba(255,255,255,0.15)'/><text x='58' y='320' font-size='64' fill='white' font-family='Arial'>Grape Demo Leaf</text><text x='58' y='390' font-size='32' fill='white' font-family='Arial'>Disease spotting sample</text></svg>"
    ];

    function focusPlantTag() {
        showScreen("dashboard-screen");
        showUploadTab(true);
        const zone = document.getElementById("drop-zone");
        if (zone) {
            zone.scrollIntoView({ behavior: "smooth", block: "center" });
            zone.classList.add("ring-2", "ring-primary-500");
            setTimeout(() => zone.classList.remove("ring-2", "ring-primary-500"), 1200);
        }
    }

    window.goToPlantTag = focusPlantTag;

    function injectPlantLibraryDemo() {
        const screen = document.getElementById('encyclopedia-screen');
        if (!screen) return;

        const oldDashStrip = document.getElementById('demo-image-strip');
        if (oldDashStrip) oldDashStrip.remove();
        if (document.getElementById('plant-library-demo-strip')) return;

        const searchInput = document.getElementById('encyclopedia-search');
        const anchor = searchInput ? searchInput.closest('.relative') : null;
        if (!anchor || !anchor.parentElement) return;

        const card = document.createElement('div');
        card.id = 'plant-library-demo-strip';
        card.className = 'theme-card rounded-xl p-4 mb-6';
        card.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold" style="color: var(--text-primary);">Plant Library Demos</p>
                <button type="button" onclick="goToPlantTag()" class="text-xs px-2 py-1 rounded bg-primary-100 text-primary-700">Plant Tag</button>
            </div>
            <p class="text-xs mb-3" style="color: var(--text-secondary);">Use a demo sample, then jump to Plant Tag for instant analysis.</p>
            <div class="grid grid-cols-3 gap-2">
                ${DEMO_DATA_IMAGES.map((src, idx) => `
                    <button type="button" class="relative rounded-lg overflow-hidden border" style="border-color: var(--border-color);" onclick="loadDemoImage(${idx})">
                        <img src="${src}" class="w-full h-20 object-cover" alt="Demo ${idx + 1}">
                        <span class="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white">Demo ${idx + 1}</span>
                    </button>
                `).join('')}
            </div>
        `;

        anchor.parentElement.insertBefore(card, anchor);
    }
    window.loadDemoImage = async function (idx) {
        const src = DEMO_DATA_IMAGES[idx];
        if (!src) return;
        try {
            const res = await fetch(src);
            const blob = await res.blob();
            const file = new File([blob], `demo-leaf-${idx + 1}.png`, { type: 'image/png' });
            AppState.uploadedImage = file;
            focusPlantTag();
            showPreview(file);
            showToast('Demo image loaded. Ready to analyze.', 'success');
        } catch (e) {
            console.error(e);
            showToast('Failed to load demo image', 'error');
        }
    };

    renderRecent = function () {
        const c = qs('recent-diagnoses');
        if (!c) return;
        const list = AppState.diagnosisHistory.slice(0, 4);
        if (!list.length) {
            c.innerHTML = '<div class="theme-card rounded-xl p-4 text-sm" style="color: var(--text-secondary);">No diagnoses yet. Upload a plant image to get started.</div>';
            return;
        }

        c.innerHTML = list.map((d, i) => {
            const sev = normalizeSeverity(d.severity);
            const pct = Math.round((d.confidence || 0) * 100);
            return `
                <button type="button" onclick="viewHistoryDetail(${d.id})" class="theme-card w-full rounded-xl p-4 text-left card-hover">
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <div>
                            <p class="font-semibold" style="color: var(--text-primary);">${safeText(d.disease)}</p>
                            <p class="text-xs" style="color: var(--text-muted);">${formatDate(d.created_at)}</p>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full ${severityClass(sev)}">${sev}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="h-1.5 flex-1 rounded bg-gray-200"><div class="h-1.5 rounded bg-primary-500" style="width:${pct}%"></div></div>
                        <span class="text-sm font-semibold text-primary-600">${pct}%</span>
                        <span class="text-[11px]" style="color: var(--text-muted);">#${i + 1}</span>
                    </div>
                </button>
            `;
        }).join('');
    };

    renderHistory = function () {
        const date = qs('history-filter-date')?.value || 'all';
        const sev = qs('history-filter-severity')?.value || 'all';
        const status = qs('history-filter-status')?.value || 'all';
        const hasFilters = date !== 'all' || sev !== 'all' || status !== 'all';

        const list = hasFilters ? (AppState.filteredHistory || []) : (AppState.diagnosisHistory || []);
        const listEl = qs('history-list');
        const emptyEl = qs('history-empty');
        if (!listEl) return;

        if (!list.length) {
            listEl.innerHTML = '';
            emptyEl?.classList.remove('hidden');
            updateHistoryStats([]);
            return;
        }

        emptyEl?.classList.add('hidden');
        const trend = list.length > 1 ? Math.round(((list[0].confidence || 0) - (list[1].confidence || 0)) * 100) : 0;
        const trendClass = trend >= 0 ? 'text-green-500' : 'text-red-500';
        const trendPrefix = trend >= 0 ? '+' : '';

        listEl.innerHTML = `
            <div class="theme-card rounded-xl p-4 mb-4">
                <p class="text-xs uppercase tracking-wide text-primary-600 font-semibold">History Insight</p>
                <p class="text-sm mt-1" style="color: var(--text-primary);">Latest confidence change: <span class="${trendClass} font-semibold">${trendPrefix}${trend}%</span></p>
            </div>
        ` + list.map((d) => {
            const sevN = normalizeSeverity(d.severity);
            return `
                <div class="theme-card rounded-xl p-4 card-hover">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p class="font-semibold" style="color: var(--text-primary);">${safeText(d.disease)}</p>
                            <p class="text-xs" style="color: var(--text-muted);">${formatDate(d.created_at)}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${severityClass(sevN)}">${sevN}</span>
                            <span class="text-sm font-semibold text-primary-600">${Math.round((d.confidence || 0) * 100)}%</span>
                            <button type="button" onclick="viewHistoryDetail(${d.id})" class="text-sm text-primary-600 hover:text-primary-700">Details</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        updateHistoryStats(list);
    };
    updateAnalytics = function () {
        const range = qs('analytics-time-range')?.value || '30days';
        const data = byDate(AppState.diagnosisHistory, range);

        const total = data.length;
        const issues = data.filter((d) => normalizeSeverity(d.severity) !== 'none').length;
        const resolved = data.filter((d) => d.status === 'resolved').length;
        const avg = total ? Math.round(data.reduce((a, b) => a + (b.confidence || 0), 0) / total * 100) : 0;
        const success = total ? Math.round((resolved / total) * 100) : 0;

        if (qs('analytics-total')) qs('analytics-total').textContent = String(total);
        if (qs('analytics-issues')) qs('analytics-issues').textContent = String(issues);
        if (qs('analytics-resolved')) qs('analytics-resolved').textContent = String(resolved);
        if (qs('analytics-confidence')) qs('analytics-confidence').textContent = `${avg}%`;
        if (qs('analytics-total-change')) qs('analytics-total-change').textContent = total ? `${total} records in range` : 'No data';
        if (qs('analytics-issues-change')) qs('analytics-issues-change').textContent = issues ? `${issues} active issue(s)` : 'No issues';
        if (qs('analytics-resolved-change')) qs('analytics-resolved-change').textContent = total ? `${success}% resolution rate` : 'No resolved items';

        const chron = [...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const labels = chron.slice(-10).map((d) => new Date(d.created_at).toLocaleDateString());
        const values = chron.slice(-10).map((d) => Math.round((d.confidence || 0) * 100));

        makeChart('diagnoses-chart', {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Confidence %',
                    data: values,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.16)',
                    fill: true,
                    tension: 0.35
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const sevCounts = ['severe', 'moderate', 'mild', 'none'].map((s) => data.filter((d) => normalizeSeverity(d.severity) === s).length);
        makeChart('severity-chart', {
            type: 'doughnut',
            data: { labels: ['Severe', 'Moderate', 'Mild', 'Healthy'], datasets: [{ data: sevCounts, backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const diseaseCounts = {};
        data.forEach((d) => { diseaseCounts[d.disease] = (diseaseCounts[d.disease] || 0) + 1; });
        const top = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        makeChart('categories-chart', {
            type: 'bar',
            data: { labels: top.map((x) => x[0]), datasets: [{ label: 'Count', data: top.map((x) => x[1]), backgroundColor: '#059669' }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        makeChart('success-chart', {
            type: 'pie',
            data: { labels: ['Resolved', 'In Progress', 'Worsened'], datasets: [{ data: [data.filter((d) => d.status === 'resolved').length, data.filter((d) => d.status === 'in_progress').length, data.filter((d) => d.status === 'worsened').length], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const topList = qs('top-diseases-list');
        if (topList) {
            topList.innerHTML = top.length
                ? top.map(([name, count], idx) => `
                    <div class="flex items-center justify-between p-3 rounded-lg" style="background-color: var(--bg-tertiary);">
                        <div class="flex items-center gap-2">
                            <span class="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-700">#${idx + 1}</span>
                            <span style="color: var(--text-primary);">${name}</span>
                        </div>
                        <span class="text-sm font-semibold text-primary-600">${count}</span>
                    </div>
                `).join('')
                : '<p class="text-sm" style="color: var(--text-secondary);">No analytics data yet.</p>';
        }
    };

    const oldLoadHistory = loadHistory;
    loadHistory = async function () {
        await oldLoadHistory();
        injectPlantLibraryDemo();
        renderRecent();
        renderHistory();
        updateAnalytics();
        updateProfileStats();
    };
    function bootEnhancements() {
        injectPlantLibraryDemo();
        if (AppState.currentScreen === 'dashboard-screen') renderRecent();
        if (AppState.currentScreen === 'history-screen') renderHistory();
        if (AppState.currentScreen === 'analytics-screen') updateAnalytics();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootEnhancements);
    } else {
        bootEnhancements();
    }
})();





