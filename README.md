<div align="center">

# 🧬 RIPPLER

### *Spring Boot Architecture Visualizer*

[![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-00f2fe?style=for-the-badge)](LICENSE)

<br/>

> **Rippler** is an intelligent architecture visualization tool that statically analyzes your Spring Boot codebases and renders stunning, interactive dependency graphs — exposing services, classes, Kafka topics, databases, and inter-service connections in one glance.

<br/>

```
Upload  →  Parse  →  Visualize  →  Explore
```

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Static Code Analysis** | Powered by JavaParser — no runtime agents or bytecode needed |
| 🕸️ **Service Topology** | Visualize how microservices interconnect via Feign, REST, Kafka, and more |
| 🧩 **Class Code Map** | Drill down into a service's internal class structure and package hierarchy |
| ⚡ **Dual Layout Physics** | Switch between **Semantic Flow** (Dagre DAG) and **Force Orbit** (ELK) layouts |
| 🎛️ **Dependency Filters** | Toggle Feign, Kafka, REST, JPA, and Injection edge types independently |
| 📦 **Multi-Source Ingestion** | Analyze local folders, ZIP archives, or public GitHub repositories |
| 📷 **HD Graph Export** | Download the full architecture map as a high-resolution PNG |
| 🎨 **Cyber-Aesthetic UI** | Dark mode, neon glows, animated edges, and smooth micro-animations |

---

## 🛠️ Tech Stack

### Backend
- **Java 21** + **Spring Boot 3.2.5**
- **JavaParser 3.26.1** — AST-based static analysis engine
- **Lombok** — Boilerplate reduction
- **Maven** — Build & dependency management

### Frontend
- **React 19** + **Vite 6**
- **React Flow (@xyflow/react)** — Interactive graph canvas
- **ELK.js** — Force-directed layout engine
- **Dagre** — Hierarchical DAG layout
- **Framer Motion** — Smooth animations
- **Lucide React** — Icon library
- **Tailwind CSS** — Utility-first styling
- **html-to-image** — HD screenshot exports
- **tsparticles** — Ambient particle effects

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| JDK | 21+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ayush-sharma-22/Rippler.git
cd Rippler
```

### 2️⃣ Start the Backend

```bash
cd backend
mvn spring-boot:run
```

> The backend starts on **`http://localhost:8080`**

### 3️⃣ Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

> The frontend starts on **`http://localhost:5173`**

### 4️⃣ Open in Browser

```
http://localhost:5173
```

---

## 🗺️ How It Works

```
┌─────────────────────────────────────────────────────────┐
│                      RIPPLER ENGINE                     │
│                                                         │
│  Input Source         Backend Parser        Frontend    │
│  ─────────────        ──────────────        ────────    │
│                                                         │
│  📁 Local Folder  →   JavaParser AST   →   React Flow  │
│  📦 ZIP Archive   →   Service Mapper   →   Node Graph  │
│  🐙 GitHub URL    →   Edge Detector    →   Interactive  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### What Gets Detected

**Nodes**
- 🔵 `SERVICE` — Each microservice or module
- 🟢 `CLASS` — Java classes, interfaces, and components
- 🟣 `DATABASE` — Detected from datasource configuration
- 🟠 `KAFKA_TOPIC` — Message broker topics

**Edges**
- `FEIGN` — OpenFeign client calls between services
- `REST` — RestTemplate / WebClient HTTP calls
- `KAFKA_PUBLISH` — KafkaTemplate `.send()` calls
- `KAFKA_CONSUME` — `@KafkaListener` subscriptions
- `JPA_RELATION` — Entity inheritance and relationships
- `INJECTION` — Spring `@Autowired` / constructor injection

---

## 📂 Project Structure

```
Rippler/
├── backend/
│   └── src/main/java/com/ayush/rippler/
│       ├── config/
│       │   └── CorsConfig.java
│       │
│       ├── controller/
│       │   └── AnalysisController.java
│       │
│       ├── detector/
│       │   └── ProjectTypeDetector.java
│       │
│       ├── ingestion/
│       │   ├── GithubIngestor.java
│       │   ├── LocalFolderIngestor.java
│       │   ├── ProjectIngestor.java
│       │   └── ZipIngestor.java
│       │
│       ├── model/
│       │   ├── AnalysisResult.java
│       │   ├── DependencyEdge.java
│       │   ├── DependencyGraph.java
│       │   ├── EdgeType.java
│       │   ├── NodeType.java
│       │   └── ProjectNode.java
│       │
│       ├── parser/
│       │   ├── CodebaseParser.java
│       │   └── SourceParser.java
│       │
│       ├── service/
│       │   └── AnalysisService.java
│       │
│       └── RipplerApplication.java
│
└── frontend/
    └── src/
        ├── assets/
        │
        ├── components/
        │   ├── CanvasToolbar.jsx
        │   ├── EmptyState.jsx
        │   ├── LegendPanel.jsx
        │   ├── NodeDetailPanel.jsx
        │   └── Sidebar.jsx
        │
        ├── edges/
        │   └── CustomAnimatedEdge.jsx
        │
        ├── hooks/
        │   ├── useBlastRadius.js
        │   ├── useCircuitTracer.js
        │   └── useGraphProcessor.js
        │
        ├── nodes/
        │   └── CustomNode.jsx
        │
        ├── utils/
        │   └── layoutEngine.js
        │
        ├── App.jsx
        ├── App.css
        ├── index.css
        └── main.jsx
---

## 🎮 Usage Guide

### Ingesting a Project

**Option A — Local Path**
1. Click **Local / ZIP** tab
2. Enter the absolute path to your Spring Boot project root
3. Click **Ingest & Map**

**Option B — ZIP Upload**
1. Click **Local / ZIP** tab
2. Drag & drop a ZIP file of your project, or click **Select ZIP**
3. Click **Ingest & Map**

**Option C — GitHub**
1. Click the **GitHub** tab
2. Paste a public repository URL (e.g. `https://github.com/user/repo`)
3. Click **Ingest & Map**

### Exploring the Graph

| Action | How |
|---|---|
| **Switch View** | Toggle between *Service Topology* and *Class Code Map* |
| **Change Layout** | Switch between *Semantic Flow* and *Force Orbit* physics |
| **Filter Edges** | Use the *Dependency Filters* checkboxes in the sidebar |
| **Focus a Node** | Click any node to highlight its direct connections |
| **Show Isolates** | Enable *Show Unconnected Nodes* to reveal standalone classes |
| **Export PNG** | Click the 📷 button in the top-right toolbar |
| **Zoom Controls** | Use the `+`, `−`, and fit-to-screen buttons in the toolbar |

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze/path` | Analyze from an absolute local folder path |
| `POST` | `/api/analyze/zip` | Analyze from an uploaded ZIP file |
| `POST` | `/api/analyze/github` | Clone & analyze a public GitHub repository |

---

## 🔧 Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Server port
server.port=8080

# Maximum ZIP upload size (default: 1GB)
spring.servlet.multipart.max-file-size=1024MB
spring.servlet.multipart.max-request-size=1024MB
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Built with 🧬 by **Ayush Sharma**

*If Rippler helped you understand your codebase, give it a ⭐!*

</div>
