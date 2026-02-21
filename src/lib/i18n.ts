// ─── POSH Safety System — Internationalization ──────────────────────────────
// Multi-language support: English, Hindi, Tamil, Telugu, Kannada

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'kn';

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
    en: 'English',
    hi: 'हिन्दी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    kn: 'ಕನ್ನಡ',
};

// ─── Translation Keys ───────────────────────────────────────────────────────
type TranslationKeys = {
    // Common
    app_name: string;
    app_tagline: string;
    get_started: string;
    sign_in: string;
    sign_out: string;
    submit: string;
    cancel: string;
    save: string;
    delete: string;
    search: string;
    loading: string;
    back: string;
    next: string;
    previous: string;

    // Navigation
    nav_home: string;
    nav_complaints: string;
    nav_panic: string;
    nav_guardian: string;
    nav_evidence: string;
    nav_resources: string;
    nav_dashboard: string;
    nav_cases: string;
    nav_users: string;
    nav_icc: string;
    nav_analytics: string;
    nav_reports: string;
    nav_surveys: string;
    nav_training: string;
    nav_security_map: string;

    // Complaint
    file_complaint: string;
    bystander_report: string;
    anonymous_mode: string;
    case_details: string;
    severity: string;

    // Emergency
    panic_button: string;
    panic_hold: string;
    guardian_mode: string;
    shake_alert: string;
    fake_call: string;
    help_on_way: string;

    // Status
    status_pending: string;
    status_investigating: string;
    status_resolved: string;
    status_closed: string;
};

// ─── Translations ───────────────────────────────────────────────────────────
const translations: Record<SupportedLanguage, TranslationKeys> = {
    en: {
        app_name: 'HearHer',
        app_tagline: 'AI-Powered Workplace Safety',
        get_started: 'Get Started',
        sign_in: 'Sign In',
        sign_out: 'Sign Out',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        search: 'Search',
        loading: 'Loading...',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        nav_home: 'Home',
        nav_complaints: 'Complaints',
        nav_panic: 'Panic Button',
        nav_guardian: 'Guardian Mode',
        nav_evidence: 'Evidence Vault',
        nav_resources: 'Resources',
        nav_dashboard: 'Dashboard',
        nav_cases: 'Case Management',
        nav_users: 'Users',
        nav_icc: 'ICC Management',
        nav_analytics: 'Analytics',
        nav_reports: 'Reports',
        nav_surveys: 'Pulse Surveys',
        nav_training: 'Training',
        nav_security_map: 'Security Map',
        file_complaint: 'File a Complaint',
        bystander_report: 'Bystander Report',
        anonymous_mode: 'Anonymous Mode',
        case_details: 'Case Details',
        severity: 'Severity',
        panic_button: 'PANIC',
        panic_hold: 'Hold for 3 seconds to send alert',
        guardian_mode: 'Guardian Mode',
        shake_alert: 'Shake Alert',
        fake_call: 'Fake Call',
        help_on_way: 'Help is on the way!',
        status_pending: 'Pending',
        status_investigating: 'Investigating',
        status_resolved: 'Resolved',
        status_closed: 'Closed',
    },
    hi: {
        app_name: 'HearHer',
        app_tagline: 'AI-संचालित कार्यस्थल सुरक्षा',
        get_started: 'शुरू करें',
        sign_in: 'साइन इन करें',
        sign_out: 'साइन आउट',
        submit: 'जमा करें',
        cancel: 'रद्द करें',
        save: 'सहेजें',
        delete: 'हटाएं',
        search: 'खोजें',
        loading: 'लोड हो रहा है...',
        back: 'वापस',
        next: 'अगला',
        previous: 'पिछला',
        nav_home: 'होम',
        nav_complaints: 'शिकायतें',
        nav_panic: 'पैनिक बटन',
        nav_guardian: 'गार्डियन मोड',
        nav_evidence: 'सबूत वॉल्ट',
        nav_resources: 'संसाधन',
        nav_dashboard: 'डैशबोर्ड',
        nav_cases: 'केस प्रबंधन',
        nav_users: 'उपयोगकर्ता',
        nav_icc: 'ICC प्रबंधन',
        nav_analytics: 'विश्लेषण',
        nav_reports: 'रिपोर्ट',
        nav_surveys: 'पल्स सर्वे',
        nav_training: 'प्रशिक्षण',
        nav_security_map: 'सुरक्षा मैप',
        file_complaint: 'शिकायत दर्ज करें',
        bystander_report: 'दर्शक रिपोर्ट',
        anonymous_mode: 'गुमनाम मोड',
        case_details: 'केस विवरण',
        severity: 'गंभीरता',
        panic_button: 'पैनिक',
        panic_hold: 'अलर्ट भेजने के लिए 3 सेकंड दबाएं',
        guardian_mode: 'गार्डियन मोड',
        shake_alert: 'शेक अलर्ट',
        fake_call: 'फेक कॉल',
        help_on_way: 'मदद आ रही है!',
        status_pending: 'लंबित',
        status_investigating: 'जांच जारी',
        status_resolved: 'हल किया गया',
        status_closed: 'बंद',
    },
    ta: {
        app_name: 'HearHer',
        app_tagline: 'AI-இயங்கும் பணியிட பாதுகாப்பு',
        get_started: 'தொடங்குங்கள்',
        sign_in: 'உள்நுழையவும்',
        sign_out: 'வெளியேறு',
        submit: 'சமர்ப்பிக்கவும்',
        cancel: 'ரத்துசெய்',
        save: 'சேமி',
        delete: 'நீக்கு',
        search: 'தேடு',
        loading: 'ஏற்றுகிறது...',
        back: 'பின்',
        next: 'அடுத்து',
        previous: 'முந்தைய',
        nav_home: 'முகப்பு',
        nav_complaints: 'புகார்கள்',
        nav_panic: 'பேனிக் பொத்தான்',
        nav_guardian: 'காவலர் பயன்முறை',
        nav_evidence: 'ஆதார பெட்டகம்',
        nav_resources: 'வளங்கள்',
        nav_dashboard: 'டாஷ்போர்டு',
        nav_cases: 'வழக்கு மேலாண்மை',
        nav_users: 'பயனர்கள்',
        nav_icc: 'ICC மேலாண்மை',
        nav_analytics: 'பகுப்பாய்வு',
        nav_reports: 'அறிக்கைகள்',
        nav_surveys: 'பல்ஸ் கணக்கெடுப்பு',
        nav_training: 'பயிற்சி',
        nav_security_map: 'பாதுகாப்பு வரைபடம்',
        file_complaint: 'புகார் பதிவு செய்',
        bystander_report: 'சாட்சி அறிக்கை',
        anonymous_mode: 'அநாமதேய பயன்முறை',
        case_details: 'வழக்கு விவரங்கள்',
        severity: 'தீவிரம்',
        panic_button: 'பேனிக்',
        panic_hold: 'எச்சரிக்கை அனுப்ப 3 வினாடிகள் அழுத்தவும்',
        guardian_mode: 'காவலர் பயன்முறை',
        shake_alert: 'ஷேக் எச்சரிக்கை',
        fake_call: 'போலி அழைப்பு',
        help_on_way: 'உதவி வருகிறது!',
        status_pending: 'நிலுவையில்',
        status_investigating: 'விசாரணையில்',
        status_resolved: 'தீர்க்கப்பட்டது',
        status_closed: 'மூடப்பட்டது',
    },
    te: {
        app_name: 'HearHer',
        app_tagline: 'AI-ఆధారిత కార్యాలయ భద్రత',
        get_started: 'ప్రారంభించండి',
        sign_in: 'సైన్ ఇన్',
        sign_out: 'సైన్ అవుట్',
        submit: 'సమర్పించు',
        cancel: 'రద్దు చేయి',
        save: 'సేవ్',
        delete: 'తొలగించు',
        search: 'వెతకండి',
        loading: 'లోడ్ అవుతోంది...',
        back: 'వెనుకకు',
        next: 'తదుపరి',
        previous: 'మునుపటి',
        nav_home: 'హోమ్',
        nav_complaints: 'ఫిర్యాదులు',
        nav_panic: 'పానిక్ బటన్',
        nav_guardian: 'గార్డియన్ మోడ్',
        nav_evidence: 'ఆధారాల వాల్ట్',
        nav_resources: 'వనరులు',
        nav_dashboard: 'డాష్‌బోర్డ్',
        nav_cases: 'కేసు నిర్వహణ',
        nav_users: 'వినియోగదారులు',
        nav_icc: 'ICC నిర్వహణ',
        nav_analytics: 'విశ్లేషణలు',
        nav_reports: 'నివేదికలు',
        nav_surveys: 'పల్స్ సర్వేలు',
        nav_training: 'శిక్షణ',
        nav_security_map: 'భద్రత మ్యాప్',
        file_complaint: 'ఫిర్యాదు చేయండి',
        bystander_report: 'ప్రత్యక్ష సాక్షి నివేదిక',
        anonymous_mode: 'అనామక మోడ్',
        case_details: 'కేసు వివరాలు',
        severity: 'తీవ్రత',
        panic_button: 'పానిక్',
        panic_hold: 'హెచ్చరిక పంపడానికి 3 సెకన్లు నొక్కండి',
        guardian_mode: 'గార్డియన్ మోడ్',
        shake_alert: 'షేక్ హెచ్చరిక',
        fake_call: 'నకిలీ కాల్',
        help_on_way: 'సహాయం వస్తోంది!',
        status_pending: 'పెండింగ్',
        status_investigating: 'దర్యాప్తులో',
        status_resolved: 'పరిష్కరించబడింది',
        status_closed: 'మూసివేయబడింది',
    },
    kn: {
        app_name: 'HearHer',
        app_tagline: 'AI-ಚಾಲಿತ ಕೆಲಸದ ಸ್ಥಳ ಸುರಕ್ಷತೆ',
        get_started: 'ಪ್ರಾರಂಭಿಸಿ',
        sign_in: 'ಸೈನ್ ಇನ್',
        sign_out: 'ಸೈನ್ ಔಟ್',
        submit: 'ಸಲ್ಲಿಸಿ',
        cancel: 'ರದ್ದುಮಾಡಿ',
        save: 'ಉಳಿಸಿ',
        delete: 'ಅಳಿಸಿ',
        search: 'ಹುಡುಕಿ',
        loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
        back: 'ಹಿಂದೆ',
        next: 'ಮುಂದೆ',
        previous: 'ಹಿಂದಿನ',
        nav_home: 'ಮುಖಪುಟ',
        nav_complaints: 'ದೂರುಗಳು',
        nav_panic: 'ಪ್ಯಾನಿಕ್ ಬಟನ್',
        nav_guardian: 'ಗಾರ್ಡಿಯನ್ ಮೋಡ್',
        nav_evidence: 'ಸಾಕ್ಷ್ಯ ಭಂಡಾರ',
        nav_resources: 'ಸಂಪನ್ಮೂಲಗಳು',
        nav_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        nav_cases: 'ಪ್ರಕರಣ ನಿರ್ವಹಣೆ',
        nav_users: 'ಬಳಕೆದಾರರು',
        nav_icc: 'ICC ನಿರ್ವಹಣೆ',
        nav_analytics: 'ವಿಶ್ಲೇಷಣೆ',
        nav_reports: 'ವರದಿಗಳು',
        nav_surveys: 'ಪಲ್ಸ್ ಸಮೀಕ್ಷೆಗಳು',
        nav_training: 'ತರಬೇತಿ',
        nav_security_map: 'ಭದ್ರತಾ ನಕ್ಷೆ',
        file_complaint: 'ದೂರು ದಾಖಲಿಸಿ',
        bystander_report: 'ಪ್ರತ್ಯಕ್ಷ ಸಾಕ್ಷಿ ವರದಿ',
        anonymous_mode: 'ಅನಾಮಧೇಯ ಮೋಡ್',
        case_details: 'ಪ್ರಕರಣ ವಿವರಗಳು',
        severity: 'ತೀವ್ರತೆ',
        panic_button: 'ಪ್ಯಾನಿಕ್',
        panic_hold: 'ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲು 3 ಸೆಕೆಂಡುಗಳ ಕಾಲ ಒತ್ತಿ',
        guardian_mode: 'ಗಾರ್ಡಿಯನ್ ಮೋಡ್',
        shake_alert: 'ಶೇಕ್ ಎಚ್ಚರಿಕೆ',
        fake_call: 'ನಕಲಿ ಕರೆ',
        help_on_way: 'ಸಹಾಯ ಬರುತ್ತಿದೆ!',
        status_pending: 'ಬಾಕಿ',
        status_investigating: 'ತನಿಖೆಯಲ್ಲಿ',
        status_resolved: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
        status_closed: 'ಮುಚ್ಚಲಾಗಿದೆ',
    },
};

// ─── Translation Helper ─────────────────────────────────────────────────────

let currentLanguage: SupportedLanguage = 'en';

export function setLanguage(lang: SupportedLanguage) {
    currentLanguage = lang;
    if (typeof window !== 'undefined') {
        localStorage.setItem('posh_language', lang);
    }
}

export function getLanguage(): SupportedLanguage {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('posh_language') as SupportedLanguage | null;
        if (saved && translations[saved]) {
            currentLanguage = saved;
        }
    }
    return currentLanguage;
}

export function t(key: keyof TranslationKeys): string {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

export function tIn(lang: SupportedLanguage, key: keyof TranslationKeys): string {
    return translations[lang]?.[key] || translations.en[key] || key;
}

export { translations };
export default translations;
