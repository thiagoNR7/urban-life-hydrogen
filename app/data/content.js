/**
 * Conteúdo editável da Urban Life.
 *
 * Atualizado a partir do site em produção (urban-life-9kcxhllo.myshopify.com).
 * Substitui a versão anterior, que vinha do zip antigo do tema.
 *
 * Mudança estrutural desta versão: cada zona de entrega agora tem um campo
 * `active`. Zona ativa mostra dia e raio; zona inativa mostra "Em breve" com
 * cadeado e a nota de atendimento futuro.
 */

export const header = {
  logoHeight: 42,
  menu: [
    {label: 'Início', href: '/'},
    {label: 'Produtos em destaque', href: '/collections/all'},
    {label: 'Produtores', href: '/pages/produtores'},
    {label: 'Como funciona', href: '/#como-funciona'},
  ],
  showAccount: true,
  producerCta: {label: 'Sou Produtor', href: 'https://wa.me/5511952353041?text=Ol%C3%A1%21%20Quero%20cadastrar%20minha%20horta%20como%20produtor%20parceiro%20da%20Urban%20Life.', icon: 'sprout'},
};

export const hero = {
  badgeText: 'Hortas urbanas de São Paulo',
  heading: 'Alimentos frescos, direto da horta para você.',
  headingHighlight: 'direto da horta',
  subheading:
    'Uma experiência premium de alimentação consciente. Seleção curada da semana, entregue com cuidado e rastreabilidade total.',
  buttonLabel: 'Comprar agora',
  buttonLink: '/collections/all',
  buttonLabel2: 'Como funciona',
  buttonLink2: '/#como-funciona',
  socialProofCount: '100+',
  socialProofText: 'clientes em São Paulo',
  mediaLabel: '',
  images: [
    {src: '/images/ul-hero-carousel-1.jpg', alt: 'Cesta Urban Life em horta urbana de São Paulo'},
    {src: '/images/ul-hero-carousel-2.jpg', alt: 'Horta urbana parceira em São Paulo'},
    {src: '/images/ul-hero-carousel-3.jpg', alt: 'Alimentos frescos colhidos na semana'},
  ],
  avatars: [
    {initial: 'A', color: '#6B8F4E'},
    {initial: 'M', color: '#4E6B3A'},
    {initial: 'C', color: '#3A5228'},
    {initial: 'R', color: '#5A7A40'},
  ],
};

export const statsBar = {
  metrics: [
    {icon: 'sprout', number: '3+', label: 'Produtores urbanos parceiros'},
    {icon: 'users', number: '100+', label: 'Clientes satisfeitos em SP'},
    {
      icon: 'truck',
      number: '2 Zonas',
      label: 'Entrega programada nas zonas Norte e Leste',
    },
  ],
};

export const howItWorks = {
  heading: 'Como funciona',
  subheading:
    'Do campo urbano à sua mesa, com uma experiência premium de conveniência e alimentos frescos.',
  steps: [
    {
      icon: 'sprout',
      title: 'Escolha sua cesta',
      description:
        'Selecione o tamanho ideal para o seu consumo semanal. Seleção curada de alimentos frescos de hortas urbanas.',
    },
    {
      icon: 'truck',
      title: 'Agendamos sua entrega',
      description:
        'Entrega programada por região. Sem surpresas: você sabe exatamente quando vai chegar.',
    },
    {
      icon: 'home',
      title: 'Receba em casa',
      description:
        'Embalagem kraft premium, organizada e minimalista. Fresco, rastreável e pronto para a semana.',
    },
  ],
};

export const deliveryRegions = {
  eyebrow: 'Logística Inteligente',
  heading: 'Entrega programada por região',
  subheading:
    'A horta mais próxima atende sua região. Menos deslocamento, mais frescor, com uma operação consciente e planejada.',
  contactLink: '/pages/contato',
  soonLabel: 'Em breve',
  soonNote: 'Ainda não atendemos esta região. Atendimento em breve.',
  clusters: [
    {
      zone: 'Zona Norte',
      horta: 'Horta Zona Norte',
      day: 'Terça-feira',
      radius: '10 km',
      active: true,
      neighborhoods:
        'Santana, Tucuruvi, Tremembé, Vila Maria, Casa Verde, Limão, Brasilândia',
    },
    {
      zone: 'Zona Leste',
      horta: 'Horta Zona Leste',
      day: 'Quinta-feira',
      radius: '11 km',
      active: true,
      neighborhoods:
        'Tatuapé, Vila Matilde, Penha, Itaquera, São Miguel Paulista, Vila Formosa, Aricanduva',
    },
    {
      zone: 'Centro Expandido',
      horta: 'Horta Centro SP',
      day: 'Quinta-feira',
      radius: '8 km',
      active: false,
      neighborhoods:
        'Pinheiros, Vila Madalena, Consolação, Santa Cecília, Bela Vista, Higienópolis, Perdizes',
    },
    {
      zone: 'Zona Oeste',
      horta: 'Horta Zona Oeste',
      day: 'Terça-feira',
      radius: '9 km',
      active: false,
      neighborhoods:
        'Butantã, Lapa, Jaguaré, Vila Leopoldina, Vila Romana, Alto da Lapa',
    },
    {
      zone: 'Zona Sul',
      horta: 'Horta Zona Sul',
      day: 'Sexta-feira',
      radius: '12 km',
      active: false,
      neighborhoods:
        'Vila Mariana, Saúde, Moema, Ibirapuera, Jabaquara, Santo André',
    },
  ],
};

export const footer = {
  logoHeight: 28,
  brandCopy:
    'Infraestrutura premium de alimentação consciente, conectando hortas urbanas de São Paulo a quem valoriza qualidade e rastreabilidade.',
  missionCopy:
    'Conectamos você ao produtor com transparência total: 77% do valor vai direto para quem cultiva. Rastreabilidade e alimentos frescos de hortas urbanas, com uma plataforma que cuida de tudo.',
  missionTags: [
    {icon: 'sprout', label: 'Colhido hoje'},
    {icon: 'package', label: 'Embalagem kraft premium'},
    {icon: 'qr-code', label: 'QR code da horta parceira'},
  ],
  nav: [
    {label: 'Cestas da semana', href: '/collections/all'},
    {label: 'Produtores parceiros', href: '/pages/produtores'},
    {label: 'Sobre a Urban Life', href: '/pages/sobre'},
    {label: 'Termos de Uso', href: '/policies/terms-of-service'},
    {label: 'Privacidade', href: '/policies/privacy-policy'},
  ],
  // Só as zonas ativas aparecem aqui, para não prometer entrega onde ainda
  // não há operação. Derivado de deliveryRegions para não duplicar a verdade.
  deliveryZones: deliveryRegions.clusters
    .filter((cluster) => cluster.active)
    .map((cluster) => ({zone: cluster.zone, day: cluster.day.toLowerCase()})),
  copyright: `© ${new Date().getFullYear()} Urban Life. Alimentação com propósito em São Paulo.`,
  tagline: 'Logística consciente · Rastreabilidade total · Impacto direto',
};
