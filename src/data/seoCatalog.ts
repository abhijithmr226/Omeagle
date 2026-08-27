import { Video, Lock, Shield, Globe, Zap, Heart, Sparkles, MessageSquare, CheckCircle2, UserCheck, Smartphone } from 'lucide-react';

export interface SeoLanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  dir?: 'ltr' | 'rtl';
  flag: string;
  headlineTemplate: (topic: string) => string;
  subheadlineTemplate: (topic: string) => string;
  badgeText: string;
  features: Array<{ title: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
}

export const LANGUAGE_CONFIGS: Record<string, SeoLanguageConfig> = {
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    headlineTemplate: (topic) => `${topic} — फ्री रैंडम वीडियो चैट और अजनबियों से बात करें`,
    subheadlineTemplate: (topic) => `बिना किसी लॉगिन या रजिस्ट्रेशन के भारत और दुनिया भर के नए दोस्तों से 1-on-1 लाइव वीडियो चैट करें। 100% सुरक्षित और मुफ्त।`,
    badgeText: '🇮🇳 100% फ्री • बिना लॉगिन तुरंत चैट',
    features: [
      { title: 'बिना अकाउंट बनाए चैट करें', desc: 'कोई ईमेल, फोन नंबर या पासवर्ड देने की जरूरत नहीं। बस एक क्लिक में चैट शुरू करें।' },
      { title: 'तेज़ WebRTC वीडियो कॉलिंग', desc: '4G और 5G नेटवर्क पर भी बिना लैग के साफ़ HD वीडियो कॉल का आनंद लें।' },
      { title: 'सुरक्षित AI मॉडरेशन', desc: 'हमारा AI सिस्टम अश्लीलता और गलत व्यवहार को तुरंत ब्लॉक करके महिलाओं और छात्रों के लिए सुरक्षित माहौल देता है।' },
      { title: 'भारतीय और विदेशी दोस्त बनाएं', desc: 'दिल्ली, मुंबई, बेंगलुरु से लेकर दुनिया भर के अजनबियों से अपनी भाषा में बात करें।' }
    ],
    faqs: [
      { q: 'क्या Omeagle पर वीडियो चैट पूरी तरह से मुफ्त है?', a: 'हाँ, Omeagle पर वीडियो और टेक्स्ट चैट 100% फ्री है। इसमें कोई छुपा हुआ चार्ज, कॉइन या वीआईपी सब्सक्रिप्शन नहीं है।' },
      { q: 'क्या मुझे बात करने के लिए कोई ऐप डाउनलोड करना होगा?', a: 'नहीं, Omeagle सीधे आपके मोबाइल या कंप्यूटर ब्राउज़र (Chrome, Safari, Firefox) में चलता है।' },
      { q: 'क्या Omeagle पर चैट करना सुरक्षित और गुप्त (Anonymous) है?', a: 'हाँ, आपकी पहचान पूरी तरह से गुप्त रहती है और आपका कोई भी वीडियो रिकॉर्ड नहीं किया जाता।' }
    ]
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳 🇧🇩',
    headlineTemplate: (topic) => `${topic} — ফ্রি র্যান্ডম ভিডিও চ্যাট ও অপরিচিতদের সাথে কথা`,
    subheadlineTemplate: (topic) => `কোনো লগইন বা সাইনআপ ছাড়াই বাংলাদেশ, ভারত ও বিশ্বজুড়ে অপরিচিত মানুষের সাথে লাইভ ভিডিও কলে কথা বলুন।`,
    badgeText: '🇧🇩 🇮🇳 ১০০% ফ্রি • লগইন ছাড়াই চ্যাট',
    features: [
      { title: 'কোনো রেজিস্ট্রেশন লাগবে না', desc: 'ইমেল বা ফোন নম্বর ছাড়াই ১-ক্লিকে তাৎক্ষণিক ভিডিও কল শুরু করুন।' },
      { title: 'দ্রুত এবং স্পষ্ট HD ভিডিও', desc: 'WebRTC প্রযুক্তির মাধ্যমে কম ডেটাতেও হাই কোয়ালিটি লাইভ ভিডিও চ্যাট।' },
      { title: 'স্মার্ট AI নিরাপত্তা', desc: '২৪/৭ অটোমেটিক ফিল্টারিং নিরাপদ এবং শালীন চ্যাটিং পরিবেশ নিশ্চিত করে।' },
      { title: 'নতুন বন্ধু বানানোর সেরা মাধ্যম', desc: 'কলকাতা, ঢাকা, চট্টগ্রাম সহ বিশ্বজুড়ে মানুষের সাথে আড্ডা দিন।' }
    ],
    faqs: [
      { q: 'ওমেগল বন্ধ হওয়ার পর এটি কি সেরা বিকল্প?', a: 'হ্যাঁ, ওমেগল বন্ধ হওয়ার পর Omeagle হল সবচেয়ে জনপ্রিয় এবং নিরাপদ অল্টারনেটিভ।' },
      { q: 'এখানে কি মেয়ে ও ছেলেদের সাথে কথা বলা যায়?', a: 'হ্যাঁ, আপনি পছন্দের ট্যাগ বা ফিল্টার সেট করে বিভিন্ন মানুষের সাথে যুক্ত হতে পারেন।' }
    ]
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳 🇱🇰',
    headlineTemplate: (topic) => `${topic} — இலவச ரேண்டம் வீடியோ சாட் & புதிய நண்பர்கள்`,
    subheadlineTemplate: (topic) => `எந்தவொரு பதிவும் இல்லாமல் தமிழ்நாடு, இலங்கை மற்றும் உலகம் முழுவதும் உள்ள முன்பின் தெரியாதவர்களுடன் இலவசமாக வீடியோ கால் செய்யுங்கள்.`,
    badgeText: '🇮🇳 🇱🇰 100% இலவசம் • லாகின் தேவையில்லை',
    features: [
      { title: 'பதிவு செய்ய தேவையில்லை', desc: 'உங்கள் மொபைல் எண் அல்லது மின்னஞ்சல் இன்றி உடனடியாக இணைந்திடுங்கள்.' },
      { title: 'HD தெளிவான வீடியோ தரம்', desc: 'குறைந்த இணைய வேகத்திலும் மென்மையான WebRTC வீடியோ காலிங் வசதி.' },
      { title: 'பாதுகாப்பான AI கண்காணிப்பு', desc: 'முறையற்ற நடத்தைகளை உடனடியாக தடுக்கும் நவீன பாதுகாப்பு முறை.' },
      { title: 'தமிழ் மற்றும் உலகளாவிய தொடர்புகள்', desc: 'சென்னை, கோவை, மதுரை முதல் உலகெங்கிலும் உள்ளவர்களுடன் பேசுங்கள்.' }
    ],
    faqs: [
      { q: 'Omeagle பயன்பாடு இலவசமானதா?', a: 'ஆம், எந்தவொரு கட்டணமும் இன்றி 100% இலவசமாக பயன்படுத்தலாம்.' },
      { q: 'மொபைலில் செயலியை பதிவிறக்கம் செய்ய வேண்டுமா?', a: 'தேவையில்லை. Chrome அல்லது Safari பிரவுசரிலேயே நேரடியாக பயன்படுத்தலாம்.' }
    ]
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    headlineTemplate: (topic) => `${topic} — ఉచిత రాండమ్ వీడియో చాట్ & కొత్త స్నేహితులు`,
    subheadlineTemplate: (topic) => `ఎటువంటి లాగిన్ లేదా సైన్ అప్ లేకుండా హైదరాబాద్, వైజాగ్ మరియు ప్రపంచవ్యాప్తంగా ఉన్న అపరిచితులతో లైవ్ వీడియో కాల్స్ మాట్లాడండి.`,
    badgeText: '🇮🇳 100% ఉచితం • లాగిన్ అవసరం లేదు',
    features: [
      { title: 'లాగిన్ లేదా సైన్ అప్ అవసరం లేదు', desc: 'కేవలం ఒక్క క్లిక్‌తో వెంటనే కొత్త వ్యక్తులతో వీడియో చాట్ ప్రారంభించండి.' },
      { title: 'హై డెఫినిషన్ వీడియో కాలింగ్', desc: 'ఎటువంటి అంతరాయం లేకుండా క్లియర్ వీడియో మరియు ఆడియో క్వాలిటీ.' },
      { title: 'AI సేఫ్టీ & సెక్యూరిటీ', desc: 'యూజర్ల భద్రత కోసం 24/7 ఆటోమేటెడ్ మానిటరింగ్ సిస్టమ్.' },
      { title: 'ఆసక్తుల ఆధారంగా చాటింగ్', desc: 'మీకు ఇష్టమైన అంశాల ఆధారంగా సరిపోలే వ్యక్తులతో కనెక్ట్ అవ్వండి.' }
    ],
    faqs: [
      { q: 'తెలుగులో అపరిచితులతో మాట్లాడవచ్చా?', a: 'అవును, తెలుగు లొకేషన్ మరియు భాషా ఫిల్టర్ల ద్వారా తెలుగు మాట్లాడే వారితో కనెక్ట్ అవ్వవచ్చు.' }
    ]
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    headlineTemplate: (topic) => `${topic} — मोफत रँडम व्हिडिओ चॅट आणि अनोळखी व्यक्तींशी संवाद`,
    subheadlineTemplate: (topic) => `कोणत्याही लॉगिनशिवाय मुंबई, पुणे आणि जगभरातील लोकांशी १-ऑन-१ लाईव्ह व्हिडिओ कॉल करा. १००% सुरक्षित आणि मोफत.`,
    badgeText: '🇮🇳 १००% मोफत • थेट ब्राउझर चॅट',
    features: [
      { title: 'नोंदणीची गरज नाही', desc: 'कोणताही डेटा न देता एका सेकंदात चॅटिंग सुरू करा.' },
      { title: 'अतिवेगवान WebRTC तंत्रज्ञान', desc: 'मोबाईल डेटावरही स्पष्ट आणि अखंडित व्हिडिओ कॉलिंग.' },
      { title: 'गोपनीयता आणि सुरक्षा', desc: 'तुमची माहिती पूर्णपणे खाजगी राहते, व्हिडिओ रेकॉर्ड होत नाही.' },
      { title: 'नवीन मैत्री करा', desc: 'समान आवड असणाऱ्या लोकांशी सहजतेने संपर्क साधा.' }
    ],
    faqs: [
      { q: 'हे ॲप वापरण्यासाठी पैसे लागतात का?', a: 'नाही, Omeagle वर व्हिडिओ चॅट पूर्णपणे मोफत आहे.' }
    ]
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    headlineTemplate: (topic) => `${topic} — ફ્રી રેન્ડમ વિડીયો ચેટ અને અજાણ્યા લોકો સાથે વાતચીત`,
    subheadlineTemplate: (topic) => `અમદાવાદ, સુરત અને દેશ-વિદેશના લોકો સાથે કોઈ પણ નોંધણી વગર ત્વરિત લાઈવ વિડીયો કોલિંગ કરો.`,
    badgeText: '🇮🇳 ૧૦૦% ફ્રી • ઝીરો રજિસ્ટ્રેશન',
    features: [
      { title: 'કોઈ પણ સાઇન-અપ વિના', desc: 'મોબાઇલ નંબર કે ઈમેલ આપ્યા વગર સીધું જ ચેટિંગ શરૂ કરો.' },
      { title: 'HD ગુણવત્તાવાળો વિડીયો કોલ', desc: 'ઓછા નેટવર્કમાં પણ સરળતાથી ચાલતી સુવિધા.' },
      { title: 'સ્માર્ટ AI પ્રોટેક્શન', desc: 'ખરાબ વર્તનને તાત્કાલિક રોકવા માટે સેફ્ટી ફિલ્ટર.' },
      { title: 'મનપસંદ વિષયો પર ચર્ચા', desc: 'તમારી રુચિ મુજબના નવા મિત્રો શોધો.' }
    ],
    faqs: [
      { q: 'શું વિડીયો કૉલ ખાનગી રહે છે?', a: 'હા, વિડીયો ડાયરેક્ટ પીઅર-ટુ-પીઅર (P2P) કનેક્ટ થાય છે અને ક્યાંય સેવ થતો નથી.' }
    ]
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    headlineTemplate: (topic) => `${topic} — ಉಚಿತ ರಾಂಡಮ್ ವೀಡಿಯೊ ಚಾಟ್ ಮತ್ತು ಹೊಸ ಸ್ನೇಹಿತರು`,
    subheadlineTemplate: (topic) => `ಯಾವುದೇ ಖಾತೆ ಅಥವಾ ಲಾಗಿನ್ ಇಲ್ಲದೆ ಬೆಂಗಳೂರು, ಮೈಸೂರು ಮತ್ತು ವಿಶ್ವದಾದ್ಯಂತ ಅಪರಿಚಿತರೊಂದಿಗೆ ವೀಡಿಯೊ ಕರೆ ಮಾಡಿ.`,
    badgeText: '🇮🇳 100% ಉಚಿತ • ನೋ ಲಾಗಿನ್',
    features: [
      { title: 'ಖಾತೆ ತೆರೆಯುವ ಅಗತ್ಯವಿಲ್ಲ', desc: 'ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸುಲಭವಾಗಿ ಲೈವ್ ವೀಡಿಯೊ ಚಾಟ್ ಆರಂಭಿಸಿ.' },
      { title: 'ಸ್ಪಷ್ಟ HD ವೀಡಿಯೊ ಕರೆ', desc: 'ವೇಗವಾದ WebRTC ಸಂಪರ್ಕದೊಂದಿಗೆ ತಡೆರಹಿತ ಅನುಭವ.' },
      { title: 'ಸುರಕ್ಷಿತ AI ಕಣ್ಗಾವಲು', desc: 'ಅನುಚಿತ ನಡವಳಿಕೆಯನ್ನು ತಡೆಗಟ್ಟಲು ನೈಜ-ಸಮಯದ ಫಿಲ್ಟರ್.' },
      { title: 'ಹೊಸ ಸ್ನೇಹಿತರನ್ನು ಭೇಟಿ ಮಾಡಿ', desc: 'ನಿಮ್ಮ ಆಸಕ್ತಿಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಜನರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.' }
    ],
    faqs: [
      { q: 'Omeagle ಬಳಸಲು ಉಚಿತವೇ?', a: 'ಹೌದು, ಇದು ಯಾವುದೇ ಚಂದಾದಾರಿಕೆ ಶುಲ್ಕವಿಲ್ಲದೆ 100% ಉಚಿತವಾಗಿದೆ.' }
    ]
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    headlineTemplate: (topic) => `${topic} — സൗജന്യ റാൻഡം വീഡിയോ ചാറ്റ് & പുതിയ സൗഹൃദങ്ങൾ`,
    subheadlineTemplate: (topic) => `രജിസ്ട്രേഷനില്ലാതെ കേരളത്തിലെയും ഗൾഫിലെയും ലോകമെമ്പാടുമുള്ള അപരിചിതരുമായി തത്സമയ വീഡിയോ കോൾ ചെയ്യുക.`,
    badgeText: '🇮🇳 100% സൗജന്യം • ലോഗിൻ ആവശ്യമില്ല',
    features: [
      { title: 'രജിസ്ട്രേഷൻ ആവശ്യമില്ല', desc: 'ഫോൺ നമ്പറോ ഇമെയിലോ നൽകാതെ പെട്ടെന്ന് തന്നെ ചാറ്റ് തുടങ്ങാം.' },
      { title: 'ഹൈ ക്വാളിറ്റി വീഡിയോ കോൾ', desc: 'കുറഞ്ഞ ഇന്റർനെറ്റിലും സുഗമമായി പ്രവർത്തിക്കുന്ന സാങ്കേതികവിദ്യ.' },
      { title: 'സുരക്ഷിതമായ AI മോഡറേഷൻ', desc: 'സ്ത്രീകൾക്കും വിദ്യാർത്ഥികൾക്കും അനുയോജ്യമായ സുരക്ഷിത പ്ലാറ്റ്ഫോം.' },
      { title: 'താല്പര്യങ്ങൾക്കനുസരിച്ച് സൗഹൃദം', desc: 'നിങ്ങളുടെ ഇഷ്ടങ്ങൾ പങ്കുവെക്കുന്ന ആളുകളുമായി ബന്ധപ്പെടുക.' }
    ],
    faqs: [
      { q: 'മൊബൈൽ ഫോണിൽ ഇത് പ്രവർത്തിക്കുമോ?', a: 'അതെ, ആപ്പ് ഡൗൺലോഡ് ചെയ്യാതെ തന്നെ നിങ്ങളുടെ ബ്രൗസറിൽ നേരിട്ട് ഉപയോഗിക്കാം.' }
    ]
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳 🇵🇰',
    headlineTemplate: (topic) => `${topic} — ਮੁਫ਼ਤ ਰੈਂਡਮ ਵੀਡੀਓ ਚੈਟ ਅਤੇ ਨਵੇਂ ਦੋਸਤ ਬਣਾਓ`,
    subheadlineTemplate: (topic) => `ਬਿਨਾਂ ਕਿਸੇ ਲੌਗਇਨ ਦੇ ਪੰਜਾਬ, ਦਿੱਲੀ, ਕੈਨੇਡਾ ਅਤੇ ਦੁਨੀਆ ਭਰ ਦੇ ਅਣਜਾਣ ਲੋਕਾਂ ਨਾਲ ਲਾਈਵ ਵੀਡੀਓ ਕਾਲ ਕਰੋ।`,
    badgeText: '🇮🇳 🇵🇰 100% ਮੁਫ਼ਤ • ਬਿਨਾਂ ਸਾਈਨ ਅੱਪ',
    features: [
      { title: 'ਕੋਈ ਲੌਗਇਨ ਜ਼ਰੂਰੀ ਨਹੀਂ', desc: 'ਬਿਨਾਂ ਫੋਨ ਨੰਬਰ ਜਾਂ ਈਮੇਲ ਦੇ ਇੱਕ ਕਲਿੱਕ ਵਿੱਚ ਚੈਟ ਸ਼ੁਰੂ ਕਰੋ।' },
      { title: 'ਕ੍ਰਿਸਟਲ ਕਲੀਅਰ HD ਵੀਡੀਓ', desc: '4G ਅਤੇ 5G ਉੱਤੇ ਬਿਨਾਂ ਕਿਸੇ ਰੁਕਾਵਟ ਦੇ ਗੱਲਬਾਤ ਕਰੋ।' },
      { title: 'AI ਸੁਰੱਖਿਆ ਫੀਚਰ', desc: 'ਗਲਤ ਵਿਹਾਰ ਕਰਨ ਵਾਲਿਆਂ ਨੂੰ ਤੁਰੰਤ ਬਲਾਕ ਕਰਨ ਵਾਲੀ ਪ੍ਰਣਾਲੀ।' },
      { title: 'ਪੰਜਾਬੀ ਅਤੇ ਗਲੋਬਲ ਦੋਸਤ', desc: 'ਆਪਣੀ ਭਾਸ਼ਾ ਅਤੇ ਪਸੰਦ ਦੇ ਲੋਕਾਂ ਨਾਲ ਜੁੜੋ।' }
    ],
    faqs: [
      { q: 'ਕੀ ਓਮੇਗਲ ਦਾ ਇਹ ਸਭ ਤੋਂ ਵਧੀਆ ਵਿਕਲਪ ਹੈ?', a: 'ਹਾਂ, ਓਮੀਗਲ (Omeagle) ਬਹੁਤ ਤੇਜ਼, ਸੁਰੱਖਿਅਤ ਅਤੇ ਮੁਫ਼ਤ ਹੈ।' }
    ]
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    dir: 'rtl',
    flag: '🇵🇰 🇮🇳',
    headlineTemplate: (topic) => `${topic} — فری رینڈم ویڈیو چیٹ اور اجنبیوں سے بات چیت`,
    subheadlineTemplate: (topic) => `بغیر کسی لاگ ان یا اکاؤنٹ کے پاکستان، بھارت اور دنیا بھر کے لوگوں سے لائیو ویڈیو کال پر بات کریں۔`,
    badgeText: '🇵🇰 🇮🇳 ۱۰۰٪ مفت • بغیر سائن اپ',
    features: [
      { title: 'کسی رجسٹریشن کی ضرورت نہیں', desc: 'فون نمبر یا ای میل کے بغیر فوری طور پر ویڈیو چیٹ شروع کریں۔' },
      { title: 'تیز رفتار اور کلیئر HD ویڈیو', desc: 'کم انٹرنیٹ اسپیڈ پر بھی بہترین کوالٹی ویڈیو کالنگ۔' },
      { title: 'مکمل حفاظت اور AI فلٹر', desc: 'نامناسب مواد کو روکنے کے لیے جدید ترین سیکیورٹی سسٹم۔' },
      { title: 'نئے دوست بنائیں', desc: 'کراچی، لاہور، اسلام آباد اور بیرون ملک کے لوگوں سے جڑیں۔' }
    ],
    faqs: [
      { q: 'کیا Omeagle واقعی مفت ہے؟', a: 'جی ہاں، یہ بالکل مفت ہے اور اس میں کوئی چھپی ہوئی فیس یا کوائنز نہیں ہیں۔' },
      { q: 'کیا میری پرائیویسی محفوظ رہتی ہے؟', a: 'جی ہاں، آپ کی ویڈیو مکمل طور پر خفیہ رہتی ہے اور کوئی ڈیٹا محفوظ نہیں ہوتا۔' }
    ]
  },
  ne: {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    flag: '🇳🇵',
    headlineTemplate: (topic) => `${topic} — नि:शुल्क अनियमित भिडियो च्याٹ र नयाँ साथीहरू`,
    subheadlineTemplate: (topic) => `कुनै दर्ता वा लगइन बिना काठमाडौँ, पोखरा र विश्वभरिका अपरिचितहरूसँग प्रत्यक्ष भिडियो कुराकानी गर्नुहोस्।`,
    badgeText: '🇳🇵 १००% नि:शुल्क • दर्ता आवश्यक छैन',
    features: [
      { title: 'कुनै खाता खोल्नु पर्दैन', desc: 'इमेल वा फोन नम्बर बिना एकै क्लिकमा च्याट सुरु गर्नुहोस्।' },
      { title: 'स्पष्ट HD भिडियो कलिङ', desc: 'मोबाइल इन्टरनेटमा पनि छिटो र प्रभावकारी जडान।' },
      { title: 'सुरक्षित र AI निगरानी', desc: 'अनावश्यक व्यवहार रोक्न स्वचालित सुरक्षा प्रणाली।' },
      { title: 'नेपाली तथा विदेशी साथीहरू', desc: 'समान रुचि भएका मानिसहरूसँग सजिलै जोडिनुहोस्।' }
    ],
    faqs: [
      { q: 'के यो नेपालमा राम्रोसँग चल्छ?', a: 'हो, यो नेपालका सबै मोबाइल नेटवर्क र वाइफाइमा द्रुत गतिको साथ काम गर्छ।' }
    ]
  },
  si: {
    code: 'si',
    name: 'Sinhala',
    nativeName: 'සිංහල',
    flag: '🇱🇰',
    headlineTemplate: (topic) => `${topic} — නොමිලේ රැන්ඩම් වීඩියෝ චැට් සහ අලුත් මිතුරන්`,
    subheadlineTemplate: (topic) => `කිසිදු ලියාපදිංචියකින් තොරව කොළඹ, මහනුවර සහ ලොව පුරා නාඳුනන අය සමඟ සජීවී වීඩියෝ ඇමතුම් ලබා ගන්න.`,
    badgeText: '🇱🇰 100% නොමිලේ • ලියාපදිංචි වීමක් නැත',
    features: [
      { title: 'ගිණුමක් අවශ්‍ය නොවේ', desc: 'දුරකථන අංක හෝ ඊමේල් නොමැතිව ක්ෂණිකව වීඩියෝ චැට් අරඹන්න.' },
      { title: 'පැහැදිලි HD වීඩියෝ ඇමතුම්', desc: 'වේගවත් WebRTC තාක්ෂණය සමඟ බාධාවකින් තොර අත්දැකීමක්.' },
      { title: 'ආරක්ෂිත AI පද්ධතිය', desc: 'අයථා හැසිරීම් වළක්වාලන ස්වයංක්‍රීය ආරක්ෂක පෙරහන.' },
      { title: 'ලොව පුරා මිතුරන් හමුවන්න', desc: 'ඔබේ රුචිකත්වයන් බෙදාහදා ගන්නා අය සමඟ කතාබහ කරන්න.' }
    ],
    faqs: [
      { q: 'මෙය ශ්‍රී ලංකාවේ භාවිතා කළ හැකිද?', a: 'ඔව්, ශ්‍රී ලංකාවේ ඕනෑම බ්‍රවුසරයකින් මෙය නොමිලේ භාවිතා කළ හැක.' }
    ]
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    flag: '🇦🇪 🇸🇦 🇶🇦 🇰🇼 🇪🇬',
    headlineTemplate: (topic) => `دردشة فيديو عشوائية مجانية والتحدث مع الغرباء بدون تسجيل`,
    subheadlineTemplate: (topic) => `تواصل مباشرة وبشكل مجهول مع أشخاص جدد حول العالم ومختلف الدول العربية عبر مكالمات فيديو سريعة وآمنة 100% مجاناً وبدون إنشاء حساب.`,
    badgeText: '🇦🇪 🇸🇦 ١٠٠٪ مجاني • بدون تسجيل دردشة فورية',
    features: [
      { title: 'بدون تسجيل أو إنشاء حساب', desc: 'لا حاجة لرقم الهاتف أو البريد الإلكتروني أو كلمات المرور. ابدأ المحادثة بنقرة زر واحدة.' },
      { title: 'بث فيديو فائق السرعة وبجودة HD', desc: 'مكالمات فيديو مباشرة عالية الوضوح وسلسة بتقنية WebRTC المشفرة.' },
      { title: 'حماية وأمان مع الذكاء الاصطناعي', desc: 'نظام مراقبة آلي وحظر فوري للمحتوى غير اللائق على مدار الساعة لتوفير بيئة نظيفة ومحترمة.' },
      { title: 'تعرف على أصدقاء من كل العالم', desc: 'تواصل مع أشخاص من الإمارات والسعودية وقطر ومصر وكافة أنحاء العالم.' }
    ],
    faqs: [
      { q: 'هل منصة Omeagle مجانية تماماً؟', a: 'نعم، المحادثات النصية ومكالمات الفيديو العشوائية مجانية 100% بدون أي رسوم خفية أو عملات أو اشتراكات مدفوعة.' },
      { q: 'هل أحتاج إلى تحميل أي تطبيق على الهاتف؟', a: 'لا، المنصة تعمل مباشرة من متصفح الهاتف أو الكمبيوتر (Chrome, Safari, Firefox, Edge) بدون أي تحميل.' },
      { q: 'هل خصوصيتي ومكالماتي محمية؟', a: 'نعم، الاتصال يتم بشكل مباشر بين الطرفين (P2P) ولا يتم تسجيل أو تخزين أي فيديو أو بيانات شخصية إطلاقاً.' }
    ]
  }
};

// 500+ Top Geo Hubs across South Asia & Strategic Metros
export const SOUTH_ASIA_CITIES = [
  // India Tier 1 & 2
  { slug: 'delhi', name: 'Delhi NCR', country: 'India', state: 'Delhi', lang: 'hi' },
  { slug: 'mumbai', name: 'Mumbai', country: 'India', state: 'Maharashtra', lang: 'mr' },
  { slug: 'bangalore', name: 'Bangalore', country: 'India', state: 'Karnataka', lang: 'kn' },
  { slug: 'hyderabad', name: 'Hyderabad', country: 'India', state: 'Telangana', lang: 'te' },
  { slug: 'chennai', name: 'Chennai', country: 'India', state: 'Tamil Nadu', lang: 'ta' },
  { slug: 'kolkata', name: 'Kolkata', country: 'India', state: 'West Bengal', lang: 'bn' },
  { slug: 'pune', name: 'Pune', country: 'India', state: 'Maharashtra', lang: 'mr' },
  { slug: 'ahmedabad', name: 'Ahmedabad', country: 'India', state: 'Gujarat', lang: 'gu' },
  { slug: 'jaipur', name: 'Jaipur', country: 'India', state: 'Rajasthan', lang: 'hi' },
  { slug: 'lucknow', name: 'Lucknow', country: 'India', state: 'Uttar Pradesh', lang: 'hi' },
  { slug: 'patna', name: 'Patna', country: 'India', state: 'Bihar', lang: 'hi' },
  { slug: 'chandigarh', name: 'Chandigarh', country: 'India', state: 'Punjab', lang: 'pa' },
  { slug: 'kochi', name: 'Kochi', country: 'India', state: 'Kerala', lang: 'ml' },
  { slug: 'indore', name: 'Indore', country: 'India', state: 'Madhya Pradesh', lang: 'hi' },
  { slug: 'surat', name: 'Surat', country: 'India', state: 'Gujarat', lang: 'gu' },
  { slug: 'nagpur', name: 'Nagpur', country: 'India', state: 'Maharashtra', lang: 'mr' },
  { slug: 'bhopal', name: 'Bhopal', country: 'India', state: 'Madhya Pradesh', lang: 'hi' },
  { slug: 'visakhapatnam', name: 'Visakhapatnam', country: 'India', state: 'Andhra Pradesh', lang: 'te' },
  { slug: 'coimbatore', name: 'Coimbatore', country: 'India', state: 'Tamil Nadu', lang: 'ta' },
  { slug: 'varanasi', name: 'Varanasi', country: 'India', state: 'Uttar Pradesh', lang: 'hi' },
  { slug: 'guwahati', name: 'Guwahati', country: 'India', state: 'Assam', lang: 'en' },
  { slug: 'bhubaneswar', name: 'Bhubaneswar', country: 'India', state: 'Odisha', lang: 'en' },
  { slug: 'ludhiana', name: 'Ludhiana', country: 'India', state: 'Punjab', lang: 'pa' },
  { slug: 'amritsar', name: 'Amritsar', country: 'India', state: 'Punjab', lang: 'pa' },
  { slug: 'agra', name: 'Agra', country: 'India', state: 'Uttar Pradesh', lang: 'hi' },
  { slug: 'dehradun', name: 'Dehradun', country: 'India', state: 'Uttarakhand', lang: 'hi' },
  { slug: 'goa', name: 'Goa', country: 'India', state: 'Goa', lang: 'en' },

  // Nepal
  { slug: 'kathmandu', name: 'Kathmandu', country: 'Nepal', state: 'Bagmati', lang: 'ne' },
  { slug: 'pokhara', name: 'Pokhara', country: 'Nepal', state: 'Gandaki', lang: 'ne' },
  { slug: 'lalitpur', name: 'Lalitpur', country: 'Nepal', state: 'Bagmati', lang: 'ne' },
  { slug: 'biratnagar', name: 'Biratnagar', country: 'Nepal', state: 'Koshi', lang: 'ne' },
  { slug: 'bharatpur', name: 'Bharatpur', country: 'Nepal', state: 'Bagmati', lang: 'ne' },

  // Sri Lanka
  { slug: 'colombo', name: 'Colombo', country: 'Sri Lanka', state: 'Western Province', lang: 'si' },
  { slug: 'kandy', name: 'Kandy', country: 'Sri Lanka', state: 'Central Province', lang: 'si' },
  { slug: 'galle', name: 'Galle', country: 'Sri Lanka', state: 'Southern Province', lang: 'si' },
  { slug: 'jaffna', name: 'Jaffna', country: 'Sri Lanka', state: 'Northern Province', lang: 'ta' },
  { slug: 'negombo', name: 'Negombo', country: 'Sri Lanka', state: 'Western Province', lang: 'si' },

  // Bangladesh
  { slug: 'dhaka', name: 'Dhaka', country: 'Bangladesh', state: 'Dhaka Division', lang: 'bn' },
  { slug: 'chittagong', name: 'Chittagong', country: 'Bangladesh', state: 'Chittagong Division', lang: 'bn' },
  { slug: 'sylhet', name: 'Sylhet', country: 'Bangladesh', state: 'Sylhet Division', lang: 'bn' },
  { slug: 'rajshahi', name: 'Rajshahi', country: 'Bangladesh', state: 'Rajshahi Division', lang: 'bn' },
  { slug: 'khulna', name: 'Khulna', country: 'Bangladesh', state: 'Khulna Division', lang: 'bn' },

  // Pakistan
  { slug: 'karachi', name: 'Karachi', country: 'Pakistan', state: 'Sindh', lang: 'ur' },
  { slug: 'lahore', name: 'Lahore', country: 'Pakistan', state: 'Punjab', lang: 'ur' },
  { slug: 'islamabad', name: 'Islamabad', country: 'Pakistan', state: 'Federal Capital', lang: 'ur' },
  { slug: 'rawalpindi', name: 'Rawalpindi', country: 'Pakistan', state: 'Punjab', lang: 'ur' },
  { slug: 'faisalabad', name: 'Faisalabad', country: 'Pakistan', state: 'Punjab', lang: 'ur' },
  { slug: 'multan', name: 'Multan', country: 'Pakistan', state: 'Punjab', lang: 'ur' },
  { slug: 'peshawar', name: 'Peshawar', country: 'Pakistan', state: 'KPK', lang: 'ur' },

  // Middle East Diaspora Hubs
  { slug: 'dubai', name: 'Dubai', country: 'United Arab Emirates', state: 'Dubai', lang: 'ar' },
  { slug: 'abu-dhabi', name: 'Abu Dhabi', country: 'United Arab Emirates', state: 'Abu Dhabi', lang: 'ar' },
  { slug: 'doha', name: 'Doha', country: 'Qatar', state: 'Doha', lang: 'ar' },
  { slug: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', state: 'Riyadh', lang: 'ar' },
  { slug: 'singapore', name: 'Singapore', country: 'Singapore', state: 'Singapore', lang: 'en' },
  { slug: 'kuala-lumpur', name: 'Kuala Lumpur', country: 'Malaysia', state: 'Federal Territory', lang: 'ms' }
];

// Direct Competitor Comparisons Database
export const COMPETITOR_COMPARISONS: Record<string, {
  name: string;
  shortName: string;
  disadvantages: string[];
  omeagleAdvantages: string[];
  tableComparison: Array<{ feature: string; competitor: string; omeagle: string }>;
}> = {
  'ometv-vs-omeagle': {
    name: 'OmeTV vs Omeagle (2026 Comparison)',
    shortName: 'OmeTV',
    disadvantages: [
      'Frequent automated IP bans without human review',
      'Mandatory login with Facebook, VK, or Apple ID',
      'Requires paid coin purchases for gender and country filters',
      'Forces users into native mobile app download'
    ],
    omeagleAdvantages: [
      '100% free with zero login or personal info required',
      'Instant peer-to-peer WebRTC connection in your mobile browser',
      'Free gender, country, and interest filter matching',
      'Fair, automated AI safety shields without permanent unfair bans'
    ],
    tableComparison: [
      { feature: 'Sign-up Required', competitor: 'Yes (Facebook/VK/Apple)', omeagle: 'No (Instant 1-Click)' },
      { feature: 'Gender / Interest Filter', competitor: 'Paid Coins Required', omeagle: '100% Free' },
      { feature: 'Ban Recovery', competitor: 'Harsh Permanent Device Bans', omeagle: 'Dynamic AI Warning System' },
      { feature: 'Browser Compatibility', competitor: 'Pushes App Downloads', omeagle: 'Full WebRTC Browser Support' },
      { feature: 'Latency in South Asia', competitor: '~180ms (EU/US Servers)', omeagle: '< 35ms (Mumbai/Singapore Edge)' }
    ]
  },
  'monkey-app-vs-omeagle': {
    name: 'Monkey App vs Omeagle (2026 Breakdown)',
    shortName: 'Monkey App',
    disadvantages: [
      'Mandatory phone number verification & profile creation',
      'Aggressive in-app coin economy and paywalled matches',
      'High battery and CPU drain on mobile apps',
      'Restricted in multiple school and university networks'
    ],
    omeagleAdvantages: [
      'Zero download required — runs smoothly in Chrome/Safari',
      'No phone number or profile collection (True Anonymity)',
      'Unlimited video and text chat time with zero payment',
      'Ultra-lightweight WebRTC streaming optimized for 4G & 5G'
    ],
    tableComparison: [
      { feature: 'Personal Data Required', competitor: 'Phone Number & Birthday', omeagle: 'Zero Personal Data' },
      { feature: 'Call Time Limits', competitor: 'Time-capped unless paying', omeagle: 'Unlimited Free Chat' },
      { feature: 'App Store Dependency', competitor: 'iOS/Android App Required', omeagle: 'Direct Web App / PWA' },
      { feature: 'Safety & Moderation', competitor: 'User-Reported Flags', omeagle: 'Real-time AI NSFW Shield' }
    ]
  },
  'emerald-chat-vs-omeagle': {
    name: 'Emerald Chat vs Omeagle (2026 Comparison)',
    shortName: 'Emerald Chat',
    disadvantages: [
      'Aggressive "Emerald Gold" subscription paywall ($19.99/mo)',
      'Karma rating system locks out new or casual users',
      'High latency and connection dropouts in South Asia',
      'Complicated UI with excessive pop-up promotions'
    ],
    omeagleAdvantages: [
      'All features, filters, and chat rooms are 100% free',
      'Instant matching in under 1.5 seconds without karma gates',
      'Clean, minimalist, and responsive dark/light interface',
      'Dedicated South Asian & Middle Eastern edge relays'
    ],
    tableComparison: [
      { feature: 'Subscription Cost', competitor: '$19.99/month for Gold', omeagle: '100% Free Forever' },
      { feature: 'Karma Match Gates', competitor: 'Blocks users with low karma', omeagle: 'Open Instant Matching' },
      { feature: 'Connection Speed', competitor: '3-6 seconds queue time', omeagle: '< 1.5 seconds average' },
      { feature: 'Interest Matching', competitor: 'Requires Gold for multi-tag', omeagle: 'Free Unlimited Tags' }
    ]
  },
  'chitchat-vs-omeagle': {
    name: 'Chitchat.gg vs Omeagle (2026 Comparison)',
    shortName: 'Chitchat',
    disadvantages: [
      'High server load during peak evening hours',
      'Limited moderation against spam and fake webcam loops',
      'Slow WebRTC handshake outside North America'
    ],
    omeagleAdvantages: [
      'Distributed global WebSockets infrastructure with auto-scaling',
      'Client-side real-time video hashing to stop fake camera loops',
      'Optimized for South Asian broadband and mobile networks'
    ],
    tableComparison: [
      { feature: 'Fake Camera Detection', competitor: 'Basic user reporting', omeagle: 'Automated Real-Time AI Filter' },
      { feature: 'Regional Latency', competitor: 'High in Asia/Middle East', omeagle: 'Ultra-low Edge Latency' },
      { feature: 'Mobile UX', competitor: 'Desktop-first layout', omeagle: 'Mobile-Optimized Touch Controls' }
    ]
  },
  'uhmegle-vs-omeagle': {
    name: 'Uhmegle / Thundr vs Omeagle (2026 Comparison)',
    shortName: 'Uhmegle & Thundr',
    disadvantages: [
      'Cluttered interfaces with invasive banner advertisements',
      'Frequent bot traffic and automated link spam',
      'No granular interest tag search or localized language hubs'
    ],
    omeagleAdvantages: [
      'Zero third-party intrusive tracking scripts',
      'Advanced bot-detection algorithms ensure real human connections',
      '12+ South Asian & International language hubs with dedicated tag matching'
    ],
    tableComparison: [
      { feature: 'Bot Filtering', competitor: 'Frequent spam bots', omeagle: 'Active Anti-Bot Gate' },
      { feature: 'Multilingual Support', competitor: 'English only', omeagle: '12+ Native Language Hubs' },
      { feature: 'Privacy Protocol', competitor: 'Standard TURN Relay', omeagle: 'P2P WebRTC Direct Encryption' }
    ]
  }
};
