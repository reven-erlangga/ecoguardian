---
layout: home

hero:
  name: Ecoguard
  text: Dokumentasi Lengkap Project
  tagline: Sistem klasifikasi citra microservice untuk deteksi pohon tumbang, sampah liar, vandalisme, dan masalah lingkungan lainnya.
  image:
    src: /logo.svg
    alt: Ecoguard
  actions:
    - theme: brand
      text: Mulai
      link: /id/guide/getting-started
    - theme: alt
      text: Arsitektur
      link: /id/guide/architecture
    - theme: alt
      text: GitHub
      link: https://github.com/reven-erlangga/ecoguardian

features:
  - icon: 🏗️
    title: Microservice Architecture
    details: 9 backend services independen, tiap service punya database sendiri, komunikasi via gRPC + RabbitMQ.
  - icon: 🤖
    title: Image Classification
    details: Model EfficientNet-B0 training kustom, export ONNX, inference via ONNX Runtime.
  - icon: 📡
    title: GraphQL Gateway
    details: GraphQL Mesh (Node.js) sebagai unified API, translate GraphQL ke gRPC.
  - icon: 🐳
    title: Docker Compose
    details: Semua service di-containerize dan di-orchestrate via Docker Compose untuk dev.
  - icon: 📋
    title: Citizen Reporting
    details: Issue reporting, asset management, notifikasi email/Telegram, blockchain integration.
---
