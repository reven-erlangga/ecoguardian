---
layout: home

hero:
  name: Ecoguard
  text: Complete Project Documentation
  tagline: Microservice-based image classification system for detecting fallen trees, waste, vandalism, and other environmental issues.
  image:
    src: /logo.svg
    alt: Ecoguard
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Architecture
      link: /guide/architecture
    - theme: alt
      text: GitHub
      link: https://github.com/reven-erlangga/ecoguardian

features:
  - icon: 🏗️
    title: Microservice Architecture
    details: 9 independent backend services, each with its own database, communicating via gRPC + RabbitMQ.
  - icon: 🤖
    title: Image Classification
    details: Custom-trained EfficientNet-B0 model, exported to ONNX, inference via ONNX Runtime.
  - icon: 📡
    title: GraphQL Gateway
    details: GraphQL Mesh (Node.js) as unified API gateway, translating GraphQL to gRPC calls.
  - icon: 🐳
    title: Docker Compose
    details: All services containerized, orchestrated via Docker Compose for local development.
  - icon: 📋
    title: Citizen Reporting
    details: Issue reporting, asset management, email/Telegram notifications, blockchain integration.
---
