import { useEffect, useState } from "react";

const STORAGE_KEY = "lang";
const DEFAULT_LANG = "en";

// Simple dictionary-based translations
const dict = {
  en: {
    nav: {
      dashboard: "Dashboard",
      intake: "Intake",
      assignment: "Assignment",
      logoutAdmin: "Logout (Admin)",
      language: "Language",
      selectLanguage: "Select language",
    },
    home: {
      title: "Welcome to Gurukul",
      subtitle: "Your AI-Powered Learning Journey",
      description:
        "Unlock your potential through AI-powered assessments tailored to your unique learning style. Master coding, logic, mathematics, language arts, cultural studies, and Vedic wisdom through our comprehensive evaluation system.",
      journeyTitle: "Your Learning Journey",
      seed: "Seed",
      tree: "Tree",
      sky: "Sky",
      journeyCaption: "Foundation → Growth → Mastery",
      features: {
        smartTitle: "Smart Assessment",
        smartTag: "Tailored evaluation",
        smartDesc:
          "AI analyzes your responses to create personalized learning paths",
        progressTitle: "Progress Insights",
        progressTag: "Detailed feedback",
        progressDesc:
          "Comprehensive analytics track your growth across all domains",
        dynamicTitle: "Dynamic Learning",
        dynamicTag: "Evolving content",
        dynamicDesc:
          "Content adapts and evolves based on your learning preferences",
      },
      ctaLead:
        "Ready to discover your strengths and unlock new possibilities?",
      ctaStart: "🚀 Start Learning",
    },
  },
  hi: {
    nav: {
      dashboard: "डैशबोर्ड",
      intake: "प्रवेश",
      assignment: "असाइनमेंट",
      logoutAdmin: "लॉगआउट (एडमिन)",
      language: "भाषा",
      selectLanguage: "भाषा चुनें",
    },
    home: {
      title: "गुरुकुल में आपका स्वागत है",
      subtitle: "आपकी एआई-संचालित सीखने की ���ात्रा",
      description:
        "अपनी सीखने की शैली के अनुसार तैयार की गई एआई-आधारित आकलन के माध्यम से अपनी क्षमता को अनलॉक करें। कोडिंग, लॉजिक, गणित, भाषा, संस्कृति और वैदिक ज्ञान में महारत हासिल करें हमारे व्यापक मूल्यांकन प्रणाली के साथ।",
      journeyTitle: "आपकी सीखने की यात्रा",
      seed: "बीज",
      tree: "वृक्ष",
      sky: "आकाश",
      journeyCaption: "आधार → विकास → प्रावीण्य",
      features: {
        smartTitle: "स्मार्ट आकलन",
        smartTag: "अनुकूलित मूल्यांकन",
        smartDesc:
          "एआई आपके उत्तरों का विश्लेषण कर व्यक्तिगत सीखने का मार्ग बनाता है",
        progressTitle: "प्रगति अंतर्दृष्टि",
        progressTag: "विस्तृत प्रतिक्रि���ा",
        progressDesc:
          "समग्र विश्लेषण आपकी सभी क्षेत्रों में वृद्धि को ट्रैक करता है",
        dynamicTitle: "गतिशील सीखना",
        dynamicTag: "विकसित होती सामग्री",
        dynamicDesc:
          "सामग्री आपकी सीखने की प्राथमिकताओं के आधार पर अनुकूलित और विकसित होती है",
      },
      ctaLead:
        "क्या आप अपनी क्षमताओं की खोज करने और नए अवसरों को अनलॉक करने के लिए तैयार हैं?",
      ctaStart: "🚀 सीखना शुरू करें",
    },
  },
  mr: {
    nav: {
      dashboard: "डॅशबोर्ड",
      intake: "इंटेक",
      assignment: "असाइनमेंट",
      logoutAdmin: "लॉगआउट (अ‍ॅडमिन)",
      language: "भाषा",
      selectLanguage: "भाषा निवडा",
    },
    home: {
      title: "गुरुकुलमध्ये आपले स्वागत आहे",
      subtitle: "तुमची एआय-संचालित शिकण्याची यात्रा",
      description:
        "तुमच्या शिकण्याच्या शैलीनुसार तयार केलेल्या एआय-आधारित मूल्यांकनाद्वारे तुमची क्षमता उघडा. कोडिंग, लॉजिक, गणित, भाषा, संस्कृती आणि वैदिक ज्ञान यात प्राविण्य मिळवा आमच्या सर्वसमावेशक मूल्यमापन प्रणालीद्वारे.",
      journeyTitle: "तुमची शिकण्याची यात्रा",
      seed: "बीज",
      tree: "वृक्ष",
      sky: "आकाश",
      journeyCaption: "पायाभूत → वाढ → प्राविण्य",
      features: {
        smartTitle: "स्मार्ट मूल्यमापन",
        smartTag: "अनुरूप मूल्यांकन",
        smartDesc:
          "एआय तुमच्या उत्तरांचे विश्लेषण करून वैयक्तिक शिकण्याचे मार्ग तयार करते",
        progressTitle: "प्रगती अंतर्दृष्टी",
        progressTag: "तपशीलवार अभिप्राय",
        progressDesc:
          "सर्व क्षेत्रांमधील तुमची वाढ सर्वसमावेशक विश्लेषणाद्वारे ट्रॅक केली जाते",
        dynamicTitle: "गतिमान शिक्षण",
        dynamicTag: "बदलणारी सामग्री",
        dynamicDesc:
          "सामग्री तुमच्या शिकण्याच्या पसंतीनुसार जुळवून घेत आणि विकसित होत राहते",
      },
      ctaLead:
        "तुमच्या सामर्थ्यांचा शोध घेऊन नवे संधी उघडण्यासाठी तयार आहात का?",
      ctaStart: "🚀 शिकायला सुरुवात करा",
    },
  },
};

const getFromPath = (obj, path) => {
  if (!path) return undefined;
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
};

export const i18n = {
  getLang() {
    if (typeof window === "undefined") return DEFAULT_LANG;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  },
  setLang(code) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, code);
    if (typeof document !== "undefined") document.documentElement.lang = code;
    window.dispatchEvent(new CustomEvent("languagechange", { detail: { lang: code } }));
  },
  t(key) {
    const lang = this.getLang();
    const byLang = dict[lang] || dict[DEFAULT_LANG];
    return getFromPath(byLang, key) || getFromPath(dict[DEFAULT_LANG], key) || key;
  },
  has(key) {
    const lang = this.getLang();
    const byLang = dict[lang] || dict[DEFAULT_LANG];
    return getFromPath(byLang, key) != null;
  },
};

export function useI18n() {
  const [lang, setLang] = useState(i18n.getLang());

  useEffect(() => {
    const onChange = (e) => {
      setLang((e && e.detail && e.detail.lang) || i18n.getLang());
    };
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setLang(e.newValue || DEFAULT_LANG);
    };
    window.addEventListener("languagechange", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("languagechange", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const t = (key) => {
    const byLang = dict[lang] || dict[DEFAULT_LANG];
    return getFromPath(byLang, key) || getFromPath(dict[DEFAULT_LANG], key) || key;
  };

  return { t, lang };
}
