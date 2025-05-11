
# 📦 Pickasso HMI Dashboard

A Human-Machine Interface (HMI) for the Pickasso autonomous robot, featuring:
- 🎙️ Speech Command Input
- 📢 Real-Time Robot Status Updates
- 📖 Explainability of Robot Decisions
- 📜 Action History Log
- 🌐 Deployable via Vercel, Netlify, or GitHub Pages

---

## 🚀 Features
- Real-time dashboard for monitoring robot tasks.
- Dynamic Explainability Panel: Shows *why* the robot takes certain actions.
- Action History Log: Displays recent decisions with reasons.
- Voice Commands supported via Web Speech API.
- Fully integrated with Convex backend APIs.

---

## 📚 Project Structure
```
pickasso_hmi/
├── convex/              # Convex backend functions
├── src/                 # React Frontend (HMI)
├── .env.local           # API Environment Configurations
├── vercel.json          # Vercel Deployment Config
├── netlify.toml         # Netlify Deployment Config
└── README.md, LICENSE   # Documentation and Licensing
```

---

## 💻 Deployment Steps

### Vercel (Preferred)
```bash
npm install -g vercel
vercel login
vercel --prod
```
Set Environment Variable on Vercel:
```
VITE_CONVEX_URL=https://happy-panda-720.convex.cloud
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## 📡 Convex Backend API (https://happy-panda-720.convex.cloud)
- API Endpoints are secured with Convex Auth.
- Supports real-time WebSocket updates.
- Stores Robot Status, Explainability Data, and Action Logs.

---

## 📖 Explainable Decision Logic
| Situation       | Action           | Explanation          |
|-----------------|------------------|----------------------|
| Human Nearby    | Ask for Assistance | Awaiting human instruction. |
| Trash Detected  | Collect Trash    | Trash detected nearby. |
| Harmful Item    | Pick with Caution | Handling hazardous item. |
| Personal Item   | Ignore           | Detected personal item, respecting privacy. |
| Unknown Object  | No Action        | No predefined action. |

---

## 📜 License
This project is licensed under the MIT License.
