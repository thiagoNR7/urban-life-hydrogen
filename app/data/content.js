/**
 * Conteúdo editável da Urban Life.
 *
 * No Shopify isto vivia em templates/index.json e nos `settings` de cada
 * section, editável pelo editor de temas. Aqui é um módulo JS.
 *
 * Quando quiser deixar isto editável pelo admin do Shopify de novo, cada
 * bloco abaixo vira um Metaobject e este arquivo passa a ser só o fallback.
 * Veja README.md → "Passo 5: Metaobjects".
 */

export const header = {
  logoHeight: 42,
  menu: [
    {label: 'Como funciona', href: '/#como-funciona'},
    {label: 'Produtores em Destaque', href: '/collections/all'},
    {label: 'Produtores', href: '/#produtores'},
  ],
  producerCta: {label: 'Sou Produtor', href: '/account/register', icon: 'sprout'},
};

export const hero = {
  badgeText: 'Hortas urbanas de São Paulo',
  heading: 'Alimentos frescos, direto da horta para você.',
  headingHighlight: 'direto da horta',
  subheading:
    'Uma experiência premium de alimentação consciente. Seleção curada da semana, entregue com cuidado e rastreabilidade total.',
  buttonLabel: 'Ver seleção da semana',
  buttonLink: '/collections/all',
  buttonLabel2: 'Como funciona',
  buttonLink2: '/#como-funciona',
  socialProofCount: '500+',
  socialProofText: 'clientes em São Paulo',
  mediaLabel: 'Seleção fresca da semana',
  images: [
    {src: '/images/ul-hero-carousel-1.jpg', alt: 'Cesta de alimentos frescos da Urban Life'},
    {src: '/images/ul-hero-carousel-2.jpg', alt: 'Horta urbana em São Paulo'},
    {src: '/images/ul-hero-carousel-3.jpg', alt: 'Entrega Urban Life'},
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
    {icon: 'sprout', number: '15+', label: 'Produtores urbanos parceiros'},
    {icon: 'users', number: '500+', label: 'Clientes satisfeitos em SP'},
    {icon: 'truck', number: '9 Zonas', label: 'Entrega programada em São Paulo'},
  ],
};

export const howItWorks = {
  heading: 'Como funciona',
  subheading:
    'Três passos simples entre a horta e a sua mesa.',
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
        'Entrega programada por região. Sem surpresas — você sabe exatamente quando vai chegar.',
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
    'A horta mais próxima atende sua região. Menos deslocamento, mais frescor — operação consciente e planejada.',
  contactLink: '/pages/contato',
  clusters: [
    {
      zone: 'Zona Norte',
      horta: 'Horta Zona Norte',
      day: 'Quarta-feira',
      radius: '10 km',
      neighborhoods:
        'Santana, Tucuruvi, Tremembé, Vila Maria, Casa Verde, Limão, Brasilândia',
    },
    {
      zone: 'Centro Expandido',
      horta: 'Horta Centro SP',
      day: 'Quinta-feira',
      radius: '8 km',
      neighborhoods:
        'Pinheiros, Vila Madalena, Consolação, Santa Cecília, Bela Vista, Higienópolis, Perdizes',
    },
    {
      zone: 'Zona Oeste',
      horta: 'Horta Zona Oeste',
      day: 'Terça-feira',
      radius: '9 km',
      neighborhoods:
        'Butantã, Lapa, Jaguaré, Vila Leopoldina, Vila Romana, Alto da Lapa',
    },
    {
      zone: 'Zona Sul',
      horta: 'Horta Zona Sul',
      day: 'Sexta-feira',
      radius: '12 km',
      neighborhoods:
        'Vila Mariana, Saúde, Moema, Ibirapuera, Jabaquara, Santo André',
    },
  ],
};

export const footer = {
  logoHeight: 28,
  brandCopy:
    'Alimentos frescos de hortas urbanas de São Paulo, entregues com rastreabilidade total.',
  missionCopy:
    'Encurtar a distância entre quem planta e quem come, fortalecendo a agricultura urbana na cidade.',
  missionTags: ['Agricultura urbana', 'Zero desperdício', 'Comércio justo'],
  nav: [
    {label: 'Cestas da semana', href: '/collections/all'},
    {label: 'Produtores parceiros', href: '/#produtores'},
    {label: 'Sobre a Urban Life', href: '/pages/sobre'},
    {label: 'Termos de Uso', href: '/policies/terms-of-service'},
    {label: 'Privacidade', href: '/policies/privacy-policy'},
  ],
  deliveryZones: [
    {zone: 'Zona Norte', day: 'Quarta-feira'},
    {zone: 'Centro Expandido', day: 'Quinta-feira'},
    {zone: 'Zona Oeste', day: 'Terça-feira'},
    {zone: 'Zona Sul', day: 'Sexta-feira'},
  ],
  copyright: `© ${new Date().getFullYear()} Urban Life. Todos os direitos reservados.`,
  tagline: 'Da horta urbana para a sua mesa.',
};
