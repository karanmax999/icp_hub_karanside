# ICPHub 🔗

**A decentralized GitHub-style platform for secure, collaborative code storage and versioning — built on the Internet Computer (IC).**

---

## ✅ Features Completed

- 🌐 **Motoko backend**
  - Create, view, and delete repositories
  - Upload, download, and delete files
  - Commit system: Save repository state with commit messages
  - Get files, get commits, and authorization check per user

- 💻 **Frontend (Next.js + Tailwind CSS)**
  - Dashboard to show:
    - Owned repositories
    - Collaborator repositories
  - Upload files into repository
  - List and delete files
  - View single repository and its files
  - Backend communication via `@dfinity/agent`

---

## 🚧 In Progress / Coming Next

- 🔨 Commit History UI  
  → Show all commits for a repository with timestamp and commit message

- ✍️ Create Repository Form  
  → Allow users to create repositories directly from frontend

- 👥 Add Collaborators UI  
  → Add and view collaborators per repo

- 🔐 Authentication  
  → Integrate with Internet Identity / Stoic for login & identity

- 🌍 Deployment  
  → Host frontend on Vercel, backend on IC mainnet

---

## 📦 Tech Stack

| Layer       | Stack                         |
|-------------|-------------------------------|
| Frontend    | Next.js 15, React 19, Tailwind CSS |
| Backend     | Motoko (Internet Computer)    |
| Agent Comm  | `@dfinity/agent`, Candid      |
| Hosting     | Local IC replica (for now)    |

---

## 🧠 Folder Structure


---

## 🧠 Contribution Plan (Team Breakdown)

| Member     | Role         | Responsibility                                        |
|------------|--------------|--------------------------------------------------------|
| Karan      | Backend Lead | Motoko backend: repo, file, commit, collab logic      |
| Member 2   | Frontend Dev | Repository Dashboard, file manager UI                 |
| Member 3   | UI Designer  | Tailwind styling, responsive layout                   |
| Member 4   | Auth Lead    | Integration of Internet Identity / Stoic              |
| Member 5   | DevOps       | Local + Vercel deployment, test canister setup        |

---

## 🗓️ Milestone Timeline

| Date       | Milestone                        |
|------------|----------------------------------|
| ✅ Done     | Backend logic (repo, files, commits)  
| ✅ Done     | File management frontend  
| 🔜 Next     | Commit history UI + repo form  
| ⏳ Coming   | Collaborator management  
| ⏳ Coming   | Auth + Deployment

---

## 📬 Contact

Made with ❤️ by the ICPHub team  
Let's decentralize developer collaboration 🚀  
