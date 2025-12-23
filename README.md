
# SpendWise 🇩🇿

**Your Personal Financial OS, Built for Algeria.**

SpendWise is more than just an expense tracker; it's your intelligent financial companion designed specifically for the Algerian lifestyle. Built with a "Warm Earth" aesthetic, it feels natural, private, and smart.

At its core is **Scorpion**, a witty AI advisor powered by Google Gemini, who understands Algerian Derja, knows the value of a DZD, and helps you navigate everything from BaridiMob transfers to your monthly "Djam3ia".

## 🌟 Why SpendWise?

### 🧠 Smart AI "Scorpion"
- **Speaks Your Language**: Talk to Scorpion in Derja. "صرفت 500 دج قهوة" is all you need to say.
- **Visual Intelligence**: Snap a photo of a receipt, and the AI extracts the merchant, date, and total instantly.
- **Financial Wisdom**: Get daily briefings and strategic advice to stop the "burn rate" before the end of the month.

### 🇩🇿 100% Localized
- **Djam3ia Manager**: Manage your rotating savings circles (الدارت) seamlessly. Track who paid, who’s next, and when it’s your turn.
- **Zakat Calculator**: A dedicated tool to calculate Zakat on your savings and gold (Nisab) in real-time.
- **Algerian Banking Context**: Built-in support for CCP, BaridiMob, and cash wallets.

### 🎨 Premium Experience
- **Warm Earth Design**: A beautiful, calming interface that supports Dark Mode.
- **Gamified Growth**: Earn XP for good financial habits and unlock new themes in the Shop.
- **Simulator**: Project your wealth into the future based on your current saving habits.

---

## 🚀 Deployment on Vercel

To get SpendWise running live:

1.  **Push to GitHub**: Commit and push this code to your repository.
2.  **Import to Vercel**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **Add New...** > **Project**.
    *   Select the `spendwise` repository.
3.  **Project Configuration**:
    *   **Framework Preset**: Select `Vite` (if not auto-detected).
    *   **Root Directory**: Leave as `./`
4.  **Configure Environment Variables (Crucial)**:
    *   Open the **Environment Variables** section.
    *   **Key**: `API_KEY`
    *   **Value**: `AIzaSyBMKReHDJnf7Qk6_3Wvp2YWi2QWkEuu--M`
    *   Click **Add**.
5.  **Deploy**: Click **Deploy**. Vercel will handle the build process.

---

## ⚡ Quick Update (كيفاش دير ميزاجور)

لقد قمنا بإضافة أمر سريع لحفظ التغييرات ورفعها إلى GitHub أوتوماتيكياً:

1. افتح الـ Terminal.
2. اكتب الأمر التالي واضغط Enter:
   ```bash
   npm run push
   ```
3. هذا الأمر سيقوم بـ:
   - حفظ كل الملفات (`git add .`)
   - تسجيل التغييرات (`git commit`)
   - رفعها إلى GitHub (`git push`)
   - **ملاحظة:** بمجرد الرفع، سيقوم Vercel باكتشاف التحديث ونشره أوتوماتيكياً.

---

## 🛠️ Setup Locally

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    The project is pre-configured with your API Key in `.env` for local development.

3.  **Start the app**:
    ```bash
    npm run dev
    ```

## 🏗️ Tech Stack

-   **Frontend**: React 18, Vite, Tailwind CSS
-   **AI Engine**: Google GenAI SDK (Gemini 3 Flash & 2.5)
-   **Visualization**: Recharts
-   **Icons**: Lucide React (Custom implementation)
