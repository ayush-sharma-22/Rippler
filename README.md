<div align="center">

<br/>
<pre>
██████╗ ██╗██████╗ ██████╗ ██╗     ███████╗██████╗
██╔══██╗██║██╔══██╗██╔══██╗██║     ██╔════╝██╔══██╗
██████╔╝██║██████╔╝██████╔╝██║     █████╗  ██████╔╝
██╔══██╗██║██╔═══╝ ██╔═══╝ ██║     ██╔══╝  ██╔══██╗
██║  ██║██║██║     ██║     ███████╗███████╗██║  ██║
╚═╝  ╚═╝╚═╝╚═╝     ╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝
</pre>

### *Your Spring Boot Architecture. Finally Visible.*

<br/>

[![Java](https://img.shields.io/badge/Java-21-FF6B35?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-00f2fe?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![JavaParser](https://img.shields.io/badge/JavaParser-3.26.1-00ff87?style=for-the-badge)](https://javaparser.org/)
[![License](https://img.shields.io/badge/License-MIT-e100ff?style=for-the-badge)](LICENSE)

<br/>

> **You built 10 microservices. They talk to each other through Feign clients, Kafka topics, and shared databases.**
> **But can you draw the full picture from memory?**
>
> **Rippler can. In seconds.**

<br/>
<pre>
┌─────────┐      ┌─────────┐      ┌──────────────────────────┐
│  Upload │ ───▶ │  Parse  │ ───▶ │  Interactive Architecture │
│ your    │      │  every  │      │  Graph — alive, glowing,  │
│ project │      │  .java  │      │  and ready to explore     │
└─────────┘      └─────────┘      └──────────────────────────┘
</pre>

<br/>

![Rippler Demo](https://github.com/ayush-sharma-22/Rippler/blob/main/frontend/src/assets/demo.png)

</div>

---

<br/>

## 🌌 What is Rippler?

Rippler is an **intelligent static analysis tool** that tears open your Spring Boot codebase and renders everything inside — every service, every class, every Kafka stream, every database — as a stunning, interactive, neon-lit architecture graph.

No runtime agents. No bytecode manipulation. No config changes to your project.

Just point Rippler at your code and watch your architecture come alive.

<br/>

**The problem it solves:**

> You join a new team. There are 12 microservices. The architecture diagram on Confluence is 2 years out of date. No one knows which service calls which, or what happens when `payment-service` goes down.
>
> **Rippler solves this in 30 seconds.**

<br/>

---

## ✨ Features

<br/>

### 🔬 Static Analysis Engine
Powered by **JavaParser AST** — Rippler reads your source code at the syntax tree level, detecting every annotation, injection, Feign client, Kafka listener, and JPA entity without ever running your application.

### 🗺️ Dual View Architecture Graph

| View | Description |
|---|---|
| **Service Topology** | High-level map of how your microservices interconnect — perfect for architecture reviews |
| **Class Code Map** | Drill into any service's internal structure — controllers, services, repositories, and their wiring |

### ⚡ Dual Layout Physics

| Layout | Best For |
|---|---|
| **Semantic Flow** (Dagre DAG) | Hierarchical codebases — see the layer structure clearly |
| **Force Orbit** (ELK.js) | Complex microservice meshes — let physics find the natural clusters |

### 💥 Blast Radius Simulation
Select any node and trigger a **failure simulation**. Watch as Rippler traces every downstream dependency in real time — pulsing Neon Crimson at the failure origin and cascading Warning Amber through every affected service, hop by hop. Know your blast radius before production does.

### 🎛️ Dependency Filters
Toggle edge types independently — show only Kafka flows, hide internal injections, focus on cross-service Feign calls. Cut through the noise.

### 📦 Multi-Source Ingestion
Analyze projects from anywhere — no setup required on the target codebase.

### 📷 HD Architecture Export
Download the full graph as a high-resolution PNG. Drop it straight into your architecture docs, Confluence page, or README.

<br/>

---

## 🧬 What Rippler Detects

<br/>

### Nodes

```
🔵  SERVICE      ──  Each microservice or application module
🟢  CLASS        ──  Java classes, interfaces, and Spring components  
🟣  DATABASE     ──  Detected from datasource config & @Entity mappings
🟠  KAFKA_TOPIC  ──  Message broker topics (producers & consumers)
⬜  PACKAGE      ──  Package hierarchy for structural context
```

### Edges

```
──────  FEIGN           OpenFeign client calls between services
──────  REST            RestTemplate / WebClient HTTP calls  
──────  KAFKA_PUBLISH   KafkaTemplate.send() — fire into the topic
──────  KAFKA_CONSUME   @KafkaListener — pull from the topic
──────  JPA_RELATION    Entity → Database table mappings
──────  INJECTION       Spring @Autowired / constructor injection
```

<br/>

---

## 🎨 The Visual Experience

Rippler runs on a **Cyberpunk Sci-Fi Neon Dark Mode** visual system — because your architecture deserves better than boxes and arrows.

```
Background    ──  Deep obsidian gradient (#0b0f19 → #070a13)
               +  Animated dotted radial grid overlay

Service Nodes ──  Cyber Cyan (#00f2fe → #4facfe)
               +  Breathing pulse animation
               +  Neon glow drop-shadow

Database Nodes ── Violet Nebula (#7f00ff → #e100ff)  
                + Cylinder shape
                + Purple glow

Kafka Topics  ──  Solar Amber (#ff0844 → #ffb199)
               +  Orange particle streams

Feign Edges   ──  Bright cyan dashed paths
               +  Animated dots flowing source → target

Kafka Edges   ──  Orange glowing lines
               +  Fast burst particles (publish)
               +  Slow steady stream (consume)

Blast Radius  ──  Neon Crimson (#ff0055) at origin
               +  Warning Amber (#ffb347) cascade
               +  Hop-by-hop ripple animation
```

<br/>

---

## 🛠️ Tech Stack

<br/>

### Backend
```
Java 21                ──  Core language
Spring Boot 3.2.5      ──  Application framework  
JavaParser 3.26.1      ──  AST-based static analysis engine
Lombok                 ──  Boilerplate reduction
Maven                  ──  Build & dependency management
```

### Frontend
```
React 19 + Vite 6      ──  UI framework & build tool
@xyflow/react          ──  Interactive graph canvas engine
ELK.js                 ──  Force-directed layout physics
Dagre                  ──  Hierarchical DAG layout
Framer Motion          ──  Smooth animations & transitions
Tailwind CSS           ──  Utility-first styling
Lucide React           ──  Icon library
html-to-image          ──  HD PNG export
tsparticles            ──  Ambient particle effects
```

<br/>

---

## 🚀 Getting Started

### Prerequisites

```
JDK      21+
Maven    3.8+
Node.js  18+
npm      9+
```

<br/>

### 1️⃣ Clone

```bash
git clone https://github.com/ayush-sharma-22/Rippler.git
cd Rippler
```

### 2️⃣ Start the Backend

```bash
cd backend
mvn spring-boot:run
```

```
✓ Backend running on http://localhost:8080
```

### 3️⃣ Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

```
✓ Frontend running on http://localhost:5173
```

### 4️⃣ Open Rippler

```
http://localhost:5173
```

Upload your project. Watch your architecture appear. 🧬

<br/>

---

## 🗺️ How It Works

```
                         ┌──────────────────────────────────────┐
                         │           RIPPLER ENGINE             │
                         │                                      │
  ┌──────────────┐       │  ┌─────────────┐   ┌─────────────┐  │
  │ 📁 Local     │──────▶│  │  JavaParser │   │  Service    │  │
  │    Folder    │       │  │  AST Engine │──▶│  Detector   │  │
  └──────────────┘       │  │             │   │             │  │
                         │  │  Reads all  │   │  MONOLITH   │  │
  ┌──────────────┐       │  │  .java files│   │     vs      │  │
  │ 📦 ZIP       │──────▶│  │  without   │   │  MICROSERVICE│  │
  │    Archive   │       │  │  running   │   └──────┬──────┘  │
  └──────────────┘       │  │  your app  │          │         │
                         │  └─────────────┘          ▼         │
  ┌──────────────┐       │           ┌───────────────────────┐  │
  │ 🐙 GitHub    │──────▶│           │     Graph Builder     │  │
  │    URL       │       │           │                       │  │
  └──────────────┘       │           │  Nodes: Services,     │  │
                         │           │  Classes, DBs, Kafka  │  │
                         │           │                       │  │
                         │           │  Edges: Feign, Kafka, │  │
                         │           │  JPA, Injection, REST │  │
                         │           └───────────┬───────────┘  │
                         │                       │              │
                         └───────────────────────┼──────────────┘
                                                 │
                                                 ▼
                         ┌──────────────────────────────────────┐
                         │         REACT FLOW CANVAS            │
                         │                                      │
                         │   Interactive  ·  Animated  ·  Live  │
                         └──────────────────────────────────────┘
```

<br/>

---

## 🎮 Usage Guide

<br/>

### Ingesting Your Project

**📁 Local Folder**
```
1. Click "Local / ZIP" tab
2. Enter the absolute path to your Spring Boot project root
3. Click "Ingest & Map"
```

**📦 ZIP Archive**
```
1. Click "Local / ZIP" tab
2. Drag & drop your project ZIP — or click "Select ZIP"
   ⚠️  Exclude target/ and node_modules/ to keep it small
3. Click "Ingest & Map"
```

**🐙 GitHub**
```
1. Click the "GitHub" tab
2. Paste a public repository URL
   e.g. https://github.com/user/my-spring-app
3. Click "Ingest & Map"
```

<br/>

### Exploring the Graph

| Action | How |
|---|---|
| **Switch View** | Toggle *Service Topology* ↔ *Class Code Map* in the top bar |
| **Change Layout** | Switch *Semantic Flow* ↔ *Force Orbit* in the toolbar |
| **Filter Edges** | Use *Dependency Filters* checkboxes in the sidebar |
| **Focus a Node** | Hover any node — unconnected nodes dim to reveal the chain |
| **Inspect a Node** | Click any node — detail panel slides in from the right |
| **Blast Radius** | Click *Simulate Failure* → select a node → watch it ripple |
| **Export PNG** | Click 📷 in the top-right toolbar |
| **Zoom Controls** | `+` `-` and fit-to-screen buttons in the toolbar |

<br/>

---

## 🌐 API Reference

<br/>

All endpoints return the same `AnalysisResult` graph structure.

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/analyze/path` | `{ "path": "/abs/path/to/project" }` | Analyze from local folder |
| `POST` | `/api/analyze/zip` | `multipart/form-data: file=*.zip` | Analyze from ZIP upload |
| `POST` | `/api/analyze/github` | `{ "repoUrl": "https://github.com/..." }` | Clone & analyze GitHub repo |

<br/>

### Response Schema

```json
{
  "projectId": "uuid",
  "projectName": "my-app",
  "projectType": "MICROSERVICE | MONOLITH",
  "graph": {
    "nodes": [
      {
        "id": "booking-service",
        "label": "booking-service",
        "type": "SERVICE | CLASS | DATABASE | KAFKA_TOPIC | PACKAGE",
        "metadata": {
          "scope": "service | class",
          "annotations": ["SpringBootApplication", "EnableFeignClients"],
          "packageName": "com.ayush.bookingservice",
          "serviceName": "booking-service",
          "isInterface": false
        }
      }
    ],
    "edges": [
      {
        "source": "booking-service",
        "target": "payment-service",
        "type": "FEIGN | KAFKA_PUBLISH | KAFKA_CONSUME | JPA_RELATION | SPRING_INJECTION",
        "label": "FeignClient: PaymentFeignClient",
        "metadata": { "scope": "service" }
      }
    ]
  },
  "stats": {
    "serviceCount": 10,
    "classCount": 154,
    "dependencyCount": 73,
    "packageCount": 82
  }
}
```

<br/>

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

<br/>

---

## ⚙️ Configuration

`backend/src/main/resources/application.properties`

```properties
# Server
server.port=8080

# File upload limits
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB

# Tomcat
server.tomcat.max-http-form-post-size=100MB
```

> 💡 **Tip:** Before uploading a ZIP, delete the `target/` folder first.
> A clean Spring Boot project ZIP should be **under 10MB**.

<br/>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

```bash
# Fork → Clone → Branch → Code → Push → PR

git checkout -b feat/your-feature
git commit -m "feat: add your feature"
git push origin feat/your-feature
```

<br/>

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

<br/>

---

<div align="center">

```
Built with obsession by Ayush Sharma
```

*If Rippler helped you understand your codebase — or impressed someone in a code review — give it a ⭐*

[![GitHub stars](https://img.shields.io/github/stars/ayush-sharma-22/Rippler?style=for-the-badge&color=00f2fe)](https://github.com/ayush-sharma-22/Rippler/stargazers)

</div>
