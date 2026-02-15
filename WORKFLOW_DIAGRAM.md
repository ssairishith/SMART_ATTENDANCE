# Attendance System Workflow Diagrams

## 🔄 Complete System Workflow

```mermaid
graph TB
    subgraph "User Interface"
        A[Teacher Login] --> B[Dashboard]
        B --> C{Choose Attendance Type}
        C --> D[Live Attendance]
        C --> E[Group Attendance]
        C --> F[View Reports]
    end

    subgraph "Authentication Layer"
        A --> G[JWT Token Generation]
        G --> H[Token Validation]
        H --> I[Protected API Access]
    end

    subgraph "Live Attendance Process"
        D --> J[Webcam Access]
        J --> K[Capture 3 Frames]
        K --> L[Send to Backend]
        L --> M[Face Recognition]
        M --> N[Present Students List]
        N --> O[Excel Generation]
        O --> P[GridFS Storage]
        P --> Q[Results Display]
    end

    subgraph "Group Attendance Process"
        E --> R[Photo Upload]
        R --> S[Batch Processing]
        S --> T[Face Recognition]
        T --> U[Attendance Calculation]
        U --> V[Excel Report]
        V --> W[GridFS Storage]
        W --> X[Results Display]
    end

    subgraph "Report Management"
        F --> Y[List Stored Files]
        Y --> Z[Download Excel]
    end

    subgraph "AI/ML Pipeline"
        M --> AA[InsightFace Model]
        T --> AA
        AA --> BB[Face Detection]
        BB --> CC[Feature Extraction]
        CC --> DD[512D Embedding]
        DD --> EE[Cosine Similarity]
        EE --> FF[Threshold: 0.38]
        FF --> GG[Identity Match]
    end

    subgraph "Database Layer"
        GG --> HH[(Student DB)]
        HH --> II[Face Encodings]
        II --> JJ[(Attendance Reports)]
        JJ --> KK[GridFS Storage]
    end
```

## 📊 Data Flow Architecture

```mermaid
flowchart TD
    A[Frontend React App] --> B[Axios HTTP Requests]
    B --> C[Flask API Server]
    C --> D{JWT Middleware}
    D --> E[Route Handlers]

    E --> F[Live Attendance]
    E --> G[Group Attendance]
    E --> H[File Downloads]

    F --> I[Webcam Images]
    G --> J[Uploaded Photos]

    I --> K[Face Recognition Engine]
    J --> K

    K --> L[InsightFace Model]
    L --> M[Face Detection]
    M --> N[Feature Extraction]
    N --> O[512D Embeddings]

    O --> P[MongoDB Query]
    P --> Q[(Student Database)]
    Q --> R[Stored Encodings]

    R --> S[Cosine Similarity]
    S --> T[Threshold Comparison]
    T --> U[Present Students List]

    U --> V[Excel Generation]
    V --> W[OpenPyXL]
    W --> X[Present/Absent Sheets]

    X --> Y[GridFS Storage]
    Y --> Z[(MongoDB GridFS)]

    Z --> AA[Response to Frontend]
    AA --> BB[UI Display]
    BB --> CC[Present Students Table]
```

## 🔐 Authentication & Security Flow

```mermaid
sequenceDiagram
    participant T as Teacher
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    T->>F: Login Request
    F->>B: POST /api/teacher/login
    B->>DB: Query Teacher Credentials
    DB-->>B: Teacher Data
    B->>B: Password Verification (bcrypt)
    B->>B: JWT Token Generation
    B-->>F: Token + Teacher Info
    F->>F: Store Token in localStorage

    T->>F: Access Protected Feature
    F->>B: API Request with Bearer Token
    B->>B: JWT Token Validation
    B-->>F: Protected Data / Success

    Note over B: All attendance endpoints<br/>require valid JWT token
```

## 🎯 Attendance Processing Flow

```mermaid
stateDiagram-v2
    [*] --> InputReceived
    InputReceived --> FaceDetection: Process Images
    FaceDetection --> FeatureExtraction: Faces Found
    FaceDetection --> Error: No Faces Detected

    FeatureExtraction --> EmbeddingGeneration: 512D Vector
    EmbeddingGeneration --> DatabaseQuery: Compare with Stored

    DatabaseQuery --> SimilarityCalculation: Cosine Similarity
    SimilarityCalculation --> ThresholdCheck: > 0.38

    ThresholdCheck --> PresentList: Match Found
    ThresholdCheck --> AbsentList: No Match

    PresentList --> ExcelGeneration
    AbsentList --> ExcelGeneration

    ExcelGeneration --> GridFS_Storage
    GridFS_Storage --> Response_JSON

    Response_JSON --> [*]
    Error --> [*]
```

## 🗂️ File Management Workflow

```mermaid
graph LR
    A[Attendance Processing] --> B[Excel File Creation]
    B --> C[File Metadata]
    C --> D[GridFS Upload]

    D --> E[(MongoDB GridFS)]
    E --> F[File ID Generation]
    F --> G[Response with File Info]

    G --> H[Frontend Display]
    H --> I[Download Request]
    I --> J[GridFS Retrieval]
    J --> K[File Download]

    E --> L[File Listing API]
    L --> M[Metadata Query]
    M --> N[File List Response]
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        A --> B[React SPA]
    end

    subgraph "Network Layer"
        B --> C[HTTP/HTTPS]
        C --> D[Flask Server :5050]
    end

    subgraph "Application Layer"
        D --> E[Flask Routes]
        E --> F[JWT Authentication]
        F --> G[Business Logic]
    end

    subgraph "Data Layer"
        G --> H[MongoDB Atlas]
        H --> I[(AttendanceDB)]
        H --> J[(TeacherAuthDB)]
        H --> K[GridFS Bucket]
    end

    subgraph "AI/ML Layer"
        G --> L[InsightFace Model]
        L --> M[CUDA GPU Processing]
        L --> N[CPU Fallback]
    end

    subgraph "External Services"
        H --> O[MongoDB Atlas Cloud]
        L --> P[Model Files Cache]
    end
```

## 📱 User Journey Map

```mermaid
journey
    title Teacher Attendance Workflow
    section Authentication
        Visit Login Page: 5: Teacher
        Enter Credentials: 5: Teacher
        JWT Token Received: 5: System
    section Dashboard
        Access Dashboard: 5: Teacher
        Choose Attendance Type: 5: Teacher
    section Live Attendance
        Grant Camera Permission: 5: Teacher
        Start Attendance: 5: Teacher
        System Processes Frames: 3: System
        View Present Students: 5: Teacher
        Download Excel Report: 4: Teacher
    section Group Attendance
        Upload Group Photos: 4: Teacher
        System Processes Images: 3: System
        Review Attendance Results: 5: Teacher
    section Report Management
        Browse Stored Reports: 4: Teacher
        Download Historical Data: 4: Teacher
```

This comprehensive workflow documentation provides a complete view of the attendance system's architecture, data flow, and user interactions.