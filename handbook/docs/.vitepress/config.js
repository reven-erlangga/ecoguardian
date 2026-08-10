import { withMermaid } from 'vitepress-plugin-mermaid'

const config = {
  title: 'Ecoguard',
  description: 'Ecoguard documentation — Microservice image classification system',
  lang: 'en-US',
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/reven-erlangga/ecoguardian' },
    ],
    footer: {
      message: 'Ecoguard — Environmental Monitoring System',
    },
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'Ecoguard',
      description: 'Ecoguard documentation — Microservice image classification system',

      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Services', link: '/services/overview' },
        ],
        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: 'What is Ecoguard?', link: '/' },
              { text: 'Architecture', link: '/guide/architecture' },
              { text: 'Tech Stack', link: '/guide/stack' },
            ],
          },
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: '/guide/getting-started' },
              { text: 'Development', link: '/guide/development' },
              { text: 'Docker Compose', link: '/guide/docker-compose' },
            ],
          },
          {
            text: 'Services',
            items: [
              { text: 'Overview', link: '/services/overview' },
              { text: 'Gateway', link: '/services/gateway' },
              { text: 'Twitter Service', link: '/services/twitter' },
              { text: 'Classification', link: '/services/classification' },
              { text: 'User & Auth', link: '/services/user-auth' },
              { text: 'Notification', link: '/services/notification' },
              { text: 'Asset', link: '/services/asset' },
              { text: 'Issue', link: '/services/issue' },
              { text: 'Blockchain', link: '/services/blockchain' },
              { text: 'NLP', link: '/services/nlp' },
            ],
          },
          {
            text: 'Research',
            items: [
              { text: 'Overview', link: '/research/overview' },
              { text: 'Training', link: '/research/training' },
              { text: 'Clustering', link: '/research/clustering' },
            ],
          },
          {
            text: 'Clustering',
            items: [
              { text: 'Overview', link: '/clustering/overview' },
              { text: 'Algorithm', link: '/clustering/algorithm' },
              { text: 'Implementation', link: '/clustering/implementation' },
              { text: 'Results', link: '/clustering/results' },
            ],
          },
          {
            text: 'Protobuf',
            items: [
              { text: 'Overview', link: '/proto/overview' },
              { text: 'Service Definitions', link: '/proto/services' },
              { text: 'Message Types', link: '/proto/messages' },
              { text: 'Code Generation', link: '/proto/generation' },
            ],
          },
          {
            text: 'Infrastructure',
            items: [
              { text: 'Overview', link: '/infrastructure/overview' },
              { text: 'PostgreSQL', link: '/infrastructure/postgresql' },
              { text: 'pgBouncer', link: '/infrastructure/pgbouncer' },
              { text: 'MongoDB', link: '/infrastructure/mongodb' },
              { text: 'RabbitMQ', link: '/infrastructure/rabbitmq' },
              { text: 'Redis', link: '/infrastructure/redis' },
              { text: 'Vault', link: '/infrastructure/vault' },
            ],
          },
          {
            text: 'Deployment',
            items: [
              { text: 'Docker', link: '/deployment/docker' },
              { text: 'Infrastructure', link: '/deployment/infrastructure' },
            ],
          },
        ],
      },
    },

    id: {
      label: 'Indonesia',
      lang: 'id-ID',
      title: 'Ecoguard',
      description: 'Dokumentasi Ecoguard — Sistem klasifikasi citra microservice',

      themeConfig: {
        nav: [
          { text: 'Beranda', link: '/id/' },
          { text: 'Panduan', link: '/id/guide/getting-started' },
          { text: 'Services', link: '/id/services/overview' },
        ],
        sidebar: [
          {
            text: 'Pendahuluan',
            items: [
              { text: 'Apa itu Ecoguard?', link: '/id/' },
              { text: 'Arsitektur', link: '/id/guide/architecture' },
              { text: 'Stack Teknologi', link: '/id/guide/stack' },
            ],
          },
          {
            text: 'Panduan',
            items: [
              { text: 'Getting Started', link: '/id/guide/getting-started' },
              { text: 'Development', link: '/id/guide/development' },
              { text: 'Docker Compose', link: '/id/guide/docker-compose' },
            ],
          },
          {
            text: 'Services',
            items: [
              { text: 'Overview', link: '/id/services/overview' },
              { text: 'Gateway', link: '/id/services/gateway' },
              { text: 'Twitter Service', link: '/id/services/twitter' },
              { text: 'Classification', link: '/id/services/classification' },
              { text: 'User & Auth', link: '/id/services/user-auth' },
              { text: 'Notification', link: '/id/services/notification' },
              { text: 'Asset', link: '/id/services/asset' },
              { text: 'Issue', link: '/id/services/issue' },
              { text: 'Blockchain', link: '/id/services/blockchain' },
              { text: 'NLP', link: '/id/services/nlp' },
            ],
          },
          {
            text: 'Research',
            items: [
              { text: 'Overview', link: '/id/research/overview' },
              { text: 'Training', link: '/id/research/training' },
              { text: 'Clustering', link: '/id/research/clustering' },
            ],
          },
          {
            text: 'Clustering',
            items: [
              { text: 'Overview', link: '/id/clustering/overview' },
              { text: 'Algorithm', link: '/id/clustering/algorithm' },
              { text: 'Implementation', link: '/id/clustering/implementation' },
              { text: 'Results', link: '/id/clustering/results' },
            ],
          },
          {
            text: 'Protobuf',
            items: [
              { text: 'Overview', link: '/id/proto/overview' },
              { text: 'Service Definitions', link: '/id/proto/services' },
              { text: 'Message Types', link: '/id/proto/messages' },
              { text: 'Code Generation', link: '/id/proto/generation' },
            ],
          },
          {
            text: 'Infrastructure',
            items: [
              { text: 'Overview', link: '/id/infrastructure/overview' },
              { text: 'PostgreSQL', link: '/id/infrastructure/postgresql' },
              { text: 'pgBouncer', link: '/id/infrastructure/pgbouncer' },
              { text: 'MongoDB', link: '/id/infrastructure/mongodb' },
              { text: 'RabbitMQ', link: '/id/infrastructure/rabbitmq' },
              { text: 'Redis', link: '/id/infrastructure/redis' },
              { text: 'Vault', link: '/id/infrastructure/vault' },
            ],
          },
          {
            text: 'Deployment',
            items: [
              { text: 'Docker', link: '/id/deployment/docker' },
              { text: 'Infrastructure', link: '/id/deployment/infrastructure' },
            ],
          },
        ],
      },
    },
  },
}

export default withMermaid(config)
