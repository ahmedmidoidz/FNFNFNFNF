
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ReceiptData, Account, FullContext, AiInsight, Debt, Subscription, Djam3ia, Budget, Transaction } from "../types";

// UPDATED: Fixed 404 Error. Using 'gemini-3-flash-preview' as the standard efficient Flash model.
const GLOBAL_MODEL = "gemini-3-flash-preview";
// Keep the specialized model for native audio handling
const AUDIO_MODEL = "gemini-2.5-flash-native-audio-preview-09-2025";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateSpeech = async (text: string): Promise<string | undefined> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts", // Keep TTS specific
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
        console.error("Speech Generation Error:", error);
        return undefined;
    }
};

export const parseTransactionString = async (
    text: string, 
    availableAccounts: Account[] = [],
    availableCategories: string[] = []
): Promise<any[]> => {
    try {
        const ai = getAI();
        const categories = availableCategories.join(", ");
        const accounts = availableAccounts.map(a => `${a.name} (ID: ${a.id})`).join(", ");
        
        const response = await ai.models.generateContent({
            model: GLOBAL_MODEL,
            contents: `You are an Algerian Financial Expert (Scorpion). Parse this input: "${text}".
            
            ALGERIAN DERJA RULES:
            - "مليون" = 10000 DZD.
            - "مية" or "ميا" = 1000 DZD.
            - "عشرين الف" = 200 DZD.
            - "سلفلي" / "سلفني" / "كريدي" = Debt (Borrowed).
            - "سلفت" / "يسالني" / "نال" = Debt (Lent).
            
            CONTEXT:
            - Categories: [${categories}].
            - Accounts: [${accounts}].
            
            LOGIC RULES:
            1. Detect if it's 'expense', 'income', 'transfer', or 'debt'.
            2. If 'debt', specify if it's 'lent' or 'borrowed'.
            3. Extract amount in DZD strictly.
            4. Auto-select the most logical account if not specified (e.g., 'Cach' for small amounts, 'CCP' for salary).
            5. Return valid JSON array.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            amount: { type: Type.NUMBER },
                            merchant: { type: Type.STRING },
                            category: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ["expense", "income", "transfer", "debt"] },
                            debtType: { type: Type.STRING, enum: ["lent", "borrowed"] },
                            personName: { type: Type.STRING },
                            accountId: { type: Type.STRING }
                        },
                        required: ["amount", "type", "category", "merchant"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) { 
        console.error("Gemini Parsing Error:", error);
        return []; 
    }
};

export const parseVoiceTransaction = async (
    base64Audio: string,
    availableAccounts: Account[] = [],
    availableCategories: string[] = []
): Promise<any[]> => {
    try {
        const ai = getAI();
        const categories = availableCategories.join(", ");
        const accounts = availableAccounts.map(a => `${a.name} (ID: ${a.id})`).join(", ");

        const response = await ai.models.generateContent({
            model: AUDIO_MODEL,
            contents: {
                parts: [
                    { 
                        inlineData: { 
                            mimeType: "audio/wav", 
                            data: base64Audio 
                        } 
                    },
                    { 
                        text: `Listen to this Algerian Derja audio. Extract transaction details.
                        Context: Categories=[${categories}], Accounts=[${accounts}].
                        Rules:
                        1. 'million' = 10000 DA. 'myat alef' = 1000 DA.
                        2. Identify Merchant/Person, Amount, Category.
                        3. Return JSON array.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            amount: { type: Type.NUMBER },
                            merchant: { type: Type.STRING },
                            category: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ["expense", "income", "transfer", "debt"] },
                            debtType: { type: Type.STRING, enum: ["lent", "borrowed"] },
                            personName: { type: Type.STRING },
                            accountId: { type: Type.STRING }
                        },
                        required: ["amount", "type", "category", "merchant"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Voice Parsing Error:", error);
        return [];
    }
};

export const generateDailyBriefing = async (
    userName: string,
    context: {
        balance: number;
        subscriptions: Subscription[];
        djam3ias: Djam3ia[];
        recentTransactions: any[];
        debts: Debt[];
        budgets: Budget[];
    }
): Promise<{ text: string; mood: 'happy' | 'neutral' | 'concerned' } | null> => {
    try {
        const ai = getAI();
        
        // INTERCONNECTIVITY LOGIC:
        // Calculate "Disposable Liquidity" = Cash - (Bills due in 7 days + Debts I owe)
        const upcomingBillsAmount = context.subscriptions
            .filter(s => {
                const days = Math.ceil((new Date(s.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return days >= 0 && days <= 7;
            })
            .reduce((sum, s) => sum + s.amount, 0);

        const urgentDebtsAmount = context.debts
            .filter(d => d.type === 'borrowed' && !d.isPaid)
            .reduce((sum, d) => sum + d.remainingAmount, 0); // Simplified urgency

        const disposableLiquidity = context.balance - (upcomingBillsAmount); // Don't subtract debt yet unless due

        const contextSummary = JSON.stringify({
            user: userName,
            total_cash: context.balance,
            obligations_next_7_days: upcomingBillsAmount,
            real_disposable_cash: disposableLiquidity,
            active_debts: urgentDebtsAmount,
            recent_spending_category: context.recentTransactions[0]?.category || 'None',
        });

        const response = await ai.models.generateContent({
            model: GLOBAL_MODEL,
            contents: `You are 'Scorpion', a wise and funny Algerian financial companion.
            
            ANALYSIS PROTOCOL:
            1. Check "real_disposable_cash". If low (< 2000 DA), WARN the user.
            2. Check correlations: If "recent_spending_category" matches a Budget that is almost full, WARN.
            3. If "obligations_next_7_days" > 0, remind them.
            
            CONTEXT: ${contextSummary}
            
            TASK:
            Write a very short, punchy briefing in Algerian Derja (2 sentences max).
            Use logic: Don't just say "You have money" if bills are coming. Say "You have X, but hide Y for bills."
            
            Examples:
            - "صباح الخير! راهي كاينة 5000 دج، بصح 2000 دج تاع النتفليكس، مالا بقاتلك 3000 دج برك. استحفظ!"
            - "راك فور! السيولة مليحة وما كاين حتى فاتورة قريبة. بصحتك القهوة."
            
            Return JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        mood: { type: Type.STRING, enum: ["happy", "neutral", "concerned"] }
                    }
                }
            }
        });
        return JSON.parse(response.text || "null");
    } catch (error) {
        console.error("Briefing Error:", error);
        return null;
    }
};

// NEW: Smart Budget Suggestion
export const suggestCategoryBudget = async (
    category: string,
    history: Transaction[]
): Promise<{ suggestedLimit: number; reason: string } | null> => {
    try {
        const ai = getAI();
        const categoryTxns = history
            .filter(t => t.category === category && t.type === 'expense')
            .map(t => ({ date: t.date, amount: t.amount, merchant: t.merchant }));

        const context = JSON.stringify({ category, history: categoryTxns });

        const response = await ai.models.generateContent({
            model: GLOBAL_MODEL,
            contents: `As an Algerian financial advisor, analyze this spending history for category '${category}'.
            Context: ${context}
            Task: Suggest a realistic monthly budget limit (DZD).
            Logic: Average monthly spending + 10% buffer for inflation. If history is empty, suggest a standard Algerian amount (e.g., Food = 20000, Transport = 5000).
            Output: JSON with 'suggestedLimit' (number) and 'reason' (short sentence in Derja).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedLimit: { type: Type.NUMBER },
                        reason: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "null");
    } catch (error) {
        console.error("Budget AI Error:", error);
        return null;
    }
};

// NEW: Comprehensive Financial Health Check
export const generateFinancialReport = async (data: any): Promise<{ score: number; advice: string; status: string } | null> => {
    try {
        const ai = getAI();
        const summary = JSON.stringify({
            balance: data.stats.balance,
            income: data.stats.income,
            expense: data.stats.expense,
            debts: data.debts.length,
            subscriptions: data.subscriptions.length,
            top_expense_category: "Food" // Simplified for context
        });

        const response = await ai.models.generateContent({
            model: GLOBAL_MODEL,
            contents: `Analyze this financial profile (Algerian context).
            Data: ${summary}
            Task:
            1. Calculate a health score (0-100).
            2. Write a 1-paragraph strategic advice in Algerian Derja. Be direct (e.g., "Stop eating out", "Pay debt X first").
            3. Give a status (Excellent, Good, Warning, Critical).
            Output JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        advice: { type: Type.STRING },
                        status: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text || "null");
    } catch (error) {
        return null;
    }
};

export const chatWithAssistantStream = async function* (message: string, context: any) {
    const ai = getAI();
    
    // Deep Context Construction for better Logic
    const contextStr = JSON.stringify({
        financial_snapshot: {
            total_balance: context.stats?.totalBalance,
            monthly_income: context.stats?.totalIncome,
            monthly_expense: context.stats?.totalExpense,
        },
        risks: {
            debts_owed: context.debts?.filter((d: Debt) => !d.isPaid && d.type === 'borrowed'),
            subscriptions: context.subscriptions,
        },
        recent_activity: context.transactions?.slice(0, 5)
    });

    const responseStream = await ai.models.generateContentStream({
      model: GLOBAL_MODEL,
      contents: `Context: ${contextStr}. User Question: ${message}`,
      config: { 
        systemInstruction: `أنت هو "سكوربيون" المساعد المالي.
        تستخدم نموذج Gemini 3 Flash (قيمة عالية).
        تكلم بالدارجة الجزائرية.
        كن ذكياً في الربط: إذا طلب شراء شيء، انظر إلى ديونه وفواتيره أولاً ثم انصحه.
        ` 
      }
    });
    for await (const chunk of responseStream) { 
        if (chunk.text) yield chunk.text; 
    }
};

export const analyzeReceipt = async (base64: string): Promise<ReceiptData> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: GLOBAL_MODEL,
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64 } },
                    { text: "Extract total amount (DZD), merchant name, and date. Return JSON." }
                ]
            },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) { return {}; }
};
