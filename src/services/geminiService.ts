import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateIdeas = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "اقترح 4 أفكار جديدة ومبتكرة لقناة يوتيوب متخصصة في 'كيف تصنع الأطعمة في المصانع' و 'أسرار خطوط الإنتاج'. ركز على أطعمة يحبها الناس أو عمليات صناعية مذهلة. اجعل العناوين جذابة (Clickbait أخلاقي). لكل فكرة، قدم وصفاً قصيراً ومقترحاً لوصف صورة مصغرة (Thumbnail Prompt) باللغة الإنجليزية لوصف المشهد بشكل بصري قوي. صنف كل فكرة تحت فئة معينة مثل 'Factory Tours', 'Recipe Development', أو 'Food Science Explained'.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            imagePrompt: { type: Type.STRING, description: "Detailed English prompt for generating a YouTube thumbnail image" },
            category: { type: Type.STRING, description: "Category of the idea, e.g., 'Factory Tours', 'Recipe Development', 'Food Science Explained'" }
          },
          required: ["title", "description", "imagePrompt", "category"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateImage = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A high-quality, professional YouTube thumbnail for a factory production video. The scene should be: ${prompt}. Cinematic lighting, vibrant colors, 4k resolution, industrial aesthetic.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      },
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,\${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateScript = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `اكتب سكريبت فيديو يوتيوب طويل، مفصل، وبأسلوب "السيناريو الشرحي" (Documentary-style narrative) عن موضوع: "\${topic}".
    
    الهدف: جعل المشاهد في حالة فضول وغموض مستمر يدفعه للمشاهدة حتى النهاية.
    
    متطلبات السكريبت:
    1. مقدمة غامضة: ابدأ بسؤال مثير أو حقيقة صادمة أو مشهد غير متوقع يتعلق بالمنتج، لا تكشف كل شيء فوراً.
    2. سرد تفصيلي مشوق: اشرح خطوات التصنيع كأنها قصة أو رحلة استكشافية. استخدم أسلوب "ماذا يحدث لو؟" أو "هل كنت تعلم أن هذه الآلة تفعل كذا؟".
    3. خلق الفضول: في كل مرحلة من التصنيع، أضف تساؤلاً أو غموضاً حول الجودة، أو السرعة، أو المكونات السرية، ثم قم بحله تدريجياً.
    4. حقائق مذهلة: أضف أرقاماً وحقائق تجعل المشاهد يشعر بضخامة العملية الإنتاجية.
    5. خاتمة قوية: لخص الرحلة وأضف لمسة فلسفية أو تساؤلاً أخيراً يترك المشاهد يفكر.
    
    الأسلوب: مشوق، غامض، تعليمي، وسردي. استخدم لغة عربية فصحى بسيطة أو لهجة بيضاء مفهومة. اجعل السكريبت طويلاً ومفصلاً بما يكفي لفيديو مدته 15-20 دقيقة.`,
  });
  return response.text;
};

export const getResources = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `ابحث عن روابط لفيديوهات (YouTube, Pexels, Pixabay) وصور ومصادر مونتاج لموضوع: "\${topic}". 
    أريد قائمة بروابط حقيقية أو كلمات بحث دقيقة للحصول على أفضل لقطات B-roll للمصانع والآلات المتعلقة بهذا المنتج.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text;
};

export const generateThumbnailIdeas = async (title: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `اقترح 3 أفكار لتصميم صورة مصغرة (Thumbnail) جذابة لفيديو بعنوان: "\${title}". 
    صف العناصر التي يجب أن تظهر في الصورة، الألوان، والنصوص المحفزة. 
    أيضاً، ابحث عن أمثلة لصور مصغرة ناجحة لنفس الموضوع على يوتيوب لوصفها كمصدر إلهام.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text;
};

export const textToSpeech = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `اقرأ النص التالي بأسلوب مشوق وجذاب لمقدم برامج يوتيوب: \${text.substring(0, 1000)}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};
