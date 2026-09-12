import { z } from 'zod';
import type { Project } from '../../types/site';

const heroSchema = z.object({
  role: z.string().min(1),
  bio: z.array(z.string().min(1)).min(1)
});

const projectSchema = z.object({
  slug: z.string().min(1),
  num: z.string().min(1),
  name: z.string().min(1),
  full: z.string().min(1),
  tags: z.array(z.string().min(1)),
  desc: z.string().min(1),
  image: z.string().min(1),
  w: z.number().positive(),
  h: z.number().positive(),
  icon: z.string().min(1),
  documented: z.boolean(),
  url: z.string().url().optional()
});

const caseStudySchema = z.object({
  problem: z.string().nullable(),
  constraints: z.string().nullable(),
  discards: z.string().nullable(),
  decision: z.string().nullable(),
  result: z.string().nullable(),
  different: z.string().nullable()
});

const serviceSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1),
  desc: z.string().min(1),
  bullets: z.array(z.string().min(1)),
  image: z.string().min(1),
  alt: z.string().min(1)
});

const reasonSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1)
});

const testimonialSchema = z.object({
  quote: z.string().nullable(),
  name: z.string().nullable(),
  role: z.string().nullable()
});

const contactSchema = z.object({
  whatsapp: z.string().url(),
  links: z.array(z.object({ label: z.string().min(1), url: z.string().url() }))
});

const dockSectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  idlePath: z.string().min(1),
  activePath: z.string().min(1)
});

const siteContentSchema = z.object({
  hero: heroSchema,
  projects: z.array(projectSchema).min(1),
  cases: z.record(z.string(), caseStudySchema),
  services: z.array(serviceSchema).min(1),
  reasons: z.array(reasonSchema).min(1),
  testimonials: z.array(testimonialSchema),
  contact: contactSchema,
  caseQuestions: z.array(z.tuple([
    z.enum(['problem', 'constraints', 'discards', 'decision', 'result', 'different']),
    z.string().min(1)
  ])),
  navigation: z.array(dockSectionSchema).min(1)
});

const rawSiteContent = {
  hero: {
    role: 'Ingeniero de Producto',
    bio: [
      'Hola, soy Héctor. Desarrollador full-stack con una trayectoria extensa en diseño de interfaces. Construyo productos web completos: del primer wireframe al lanzamiento.',
      'Me importan el detalle y el rendimiento. Que una interfaz se sienta bien al usarla, no solo al mirarla. Mi trabajo pasa por e-commerce, aplicaciones web y sistemas de diseño.',
      'Este sitio es mi portafolio y mi carta de servicios. Cada caso muestra qué decidí, qué descarté y qué haría distinto. Si tienes una idea a medias o un producto que no termina de funcionar, hablemos.'
    ]
  },
  projects: [
    {
      slug: 'ikni',
      num: '01',
      name: 'Ikni',
      full: 'Ikni — Collaborative Shopping App',
      tags: ['Front-End', 'Diseño'],
      desc: 'Aplicación de listas de compras colaborativas, conectada con e-commerce retailers.',
      image: 'assets/projects/ikni-project.webp',
      w: 1025, h: 494,
      icon: 'i-cart',
      documented: true
    },
    {
      slug: 'acabados-integrales',
      num: '02',
      name: 'Acabados Integrales',
      full: 'Acabados Integrales',
      tags: ['Front-End', 'Diseño'],
      desc: 'Sitio web para un negocio de acabados de muebles e interiores.',
      image: 'assets/projects/acabados-integrales-project.webp',
      w: 1024, h: 494,
      icon: 'i-sofa',
      documented: false,
      url: 'https://hectorcreative.dev/projects/acabados-integrales'
    },
    {
      slug: 'blog',
      num: '03',
      name: 'Backend con NestJS',
      full: 'Backend con NestJS: Blog',
      tags: ['Back-End', 'Diseño'],
      desc: 'Backend con NestJS y MongoDB para la funcionalidad de un blog personal.',
      image: 'assets/projects/blog-backend-image.webp',
      w: 1024, h: 494,
      icon: 'i-pen',
      documented: false,
      url: 'https://hectorcreative.dev/projects/blog'
    },
    {
      slug: 'food-mood',
      num: '04',
      name: 'Food Mood',
      full: 'Food Mood UI Kit',
      tags: ['Front-End', 'Diseño'],
      desc: 'Aplicación móvil de recetas de cocina y electrodomésticos.',
      image: 'assets/projects/food-mood-project.webp',
      w: 1024, h: 494,
      icon: 'i-food',
      documented: true
    },
    {
      slug: 'ofera',
      num: '05',
      name: 'Ofera E-Commerce',
      full: 'Ofera E-Commerce',
      tags: ['Front-End', 'Diseño'],
      desc: 'Challenge de diseño de landing page para e-commerce, sin fines de lucro y con propósito de aprendizaje.',
      image: 'assets/projects/landing-ofera/ofera-1.webp',
      w: 1024, h: 494,
      icon: 'i-bag',
      documented: false,
      url: 'https://hectorcreative.dev/projects/ofera-landing'
    },
    {
      slug: 'pin-estelar',
      num: '06',
      name: 'Pin Estelar',
      full: 'Pin Estelar',
      tags: ['Diseño'],
      desc: 'Pines de esmalte suave para una campaña de crowdfunding en Kickstarter.',
      image: 'assets/projects/pin-estelar-project.webp',
      w: 1024, h: 493,
      icon: 'i-star',
      documented: false,
      url: 'https://hectorcreative.dev/projects/pin-estelar'
    },
    {
      slug: 'terapify',
      num: '07',
      name: 'Terapify',
      full: 'Terapify — Dashboard',
      tags: ['Diseño'],
      desc: 'Diseño de dashboard para visualización de citas, realizado para Terapify.',
      image: 'assets/projects/terapify-project.webp',
      w: 1024, h: 494,
      icon: 'i-chart',
      documented: true
    }
  ],
  cases: {
    ikni: {
      problem: 'Aplicación de listas de compras colaborativas, conectada con e-commerce retailers.',
      constraints: null,
      discards: null,
      decision: null,
      result: null,
      different: null
    },
    'food-mood': {
      problem: 'Aplicación móvil de recetas de cocina y electrodomésticos.',
      constraints: null,
      discards: null,
      decision: null,
      result: null,
      different: null
    },
    terapify: {
      problem: 'Diseño de dashboard para visualización de citas, realizado para Terapify.',
      constraints: null,
      discards: null,
      decision: null,
      result: null,
      different: null
    }
  },
  services: [
    {
      icon: 'i-pen',
      title: 'Diseño de interfaz, UI kits y sistemas de diseño',
      desc: 'Desde la creación de componentes atómicos hasta la implementación final. UI kits y sistemas que mantienen la coherencia visual de tus productos digitales.',
      bullets: ['Diseño UI para e-commerce', 'Prototipos con Figma'],
      image: 'assets/projects/food-mood-project.webp',
      alt: 'Food Mood, UI kit de aplicación móvil'
    },
    {
      icon: 'i-code',
      title: 'Desarrollo de aplicaciones web',
      desc: 'Aplicaciones web que se adaptan a las necesidades de tus usuarios: diseño atractivo, optimizadas y fáciles de usar.',
      bullets: ['Auditoría de performance web', 'Instrumentación de métricas'],
      image: 'assets/projects/ikni-project.webp',
      alt: 'Ikni, aplicación de listas de compras colaborativas'
    },
    {
      icon: 'i-globe',
      title: 'Sitios web de principio a fin',
      desc: 'Desde la planificación y el diseño hasta la programación, construcción y lanzamiento de tu sitio.',
      bullets: ['Auditoría de accesibilidad web', 'Optimización para motores de búsqueda'],
      image: 'assets/projects/acabados-integrales-project.webp',
      alt: 'Acabados Integrales, sitio web de muebles e interiores'
    }
  ],
  reasons: [
    {
      title: 'Criterio documentado',
      text: 'Cada caso de este sitio muestra el problema, las restricciones y las decisiones. Puedes auditar cómo pienso antes de contratarme.'
    },
    {
      title: 'Craft verificable',
      text: 'La calidad de una interfaz no se lee en un párrafo: se comprueba interactuando con ella. Este sitio es la prueba.'
    },
    {
      title: 'Diseño y código en una persona',
      text: 'Full-stack con base de diseño. Eso reduce traspasos, malentendidos y semanas perdidas entre Figma y producción.'
    },
    {
      title: 'Terminar antes que acumular',
      text: 'Prefiero lanzar cuatro cosas en vivo que doce a medias. Un proyecto terminado vale más que un portafolio lleno de bocetos.'
    }
  ],
  testimonials: [
    { quote: null, name: null, role: null },
    { quote: null, name: null, role: null }
  ],
  contact: {
    whatsapp: 'https://wa.me/525575232654?text=Hola.%20Estoy%20interesado%20en%20trabajar%20contigo%20esta%20es%20mi%20idea:',
    links: [
      { label: 'GitHub', url: 'https://github.com/hector-reyes-dev' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/hectorreyesdev/' },
      { label: 'Twitter / X', url: 'https://twitter.com/hector_reyes_' },
      { label: 'Behance', url: 'https://www.behance.net/hector-reyes' },
      { label: 'Figma', url: 'https://www.figma.com/@hectordex' },
      { label: 'CV', url: 'https://drive.google.com/file/d/1AWAcMYN_aGmLEJawxdAMC93twmH3bJ9Q/view?usp=sharing' }
    ]
  },
  caseQuestions: [
    ['problem', 'Problema'],
    ['constraints', 'Restricciones'],
    ['discards', 'Descartes'],
    ['decision', 'Decisión'],
    ['result', 'Resultado'],
    ['different', 'Qué haría distinto']
  ],
  navigation: [
    {
      id: 'trabajo',
      label: 'Trabajo',
      icon: 'i-trabajo',
      idlePath: 'M 3.5 9.8 Q 3.5 8 5.3 8 L 18.7 8 Q 20.5 8 20.5 9.8 L 20.5 16.7 Q 20.5 18.5 18.7 18.5 L 5.3 18.5 Q 3.5 18.5 3.5 16.7 Z M 9 8 L 9 6.2 Q 9 4.4 10.8 4.4 L 13.2 4.4 Q 15 4.4 15 6.2 L 15 8 M 3.5 13.2 L 20.5 13.2',
      activePath: 'M 3.5 11.8 Q 3.5 10 5.3 10 L 18.7 10 Q 20.5 10 20.5 11.8 L 20.5 16.7 Q 20.5 18.5 18.7 18.5 L 5.3 18.5 Q 3.5 18.5 3.5 16.7 Z M 9 10 L 9 4.8 Q 9 3 10.8 3 L 13.2 3 Q 15 3 15 4.8 L 15 10 M 12 13.2 L 12 13.2'
    },
    {
      id: 'proyectos',
      label: 'Proyectos',
      icon: 'i-proyectos',
      idlePath: 'M 5.5 4 L 9 4 Q 10.5 4 10.5 5.5 L 10.5 9 Q 10.5 10.5 9 10.5 L 5.5 10.5 Q 4 10.5 4 9 L 4 5.5 Q 4 4 5.5 4 Z M 15 4 L 18.5 4 Q 20 4 20 5.5 L 20 9 Q 20 10.5 18.5 10.5 L 15 10.5 Q 13.5 10.5 13.5 9 L 13.5 5.5 Q 13.5 4 15 4 Z M 5.5 13.5 L 9 13.5 Q 10.5 13.5 10.5 15 L 10.5 18.5 Q 10.5 20 9 20 L 5.5 20 Q 4 20 4 18.5 L 4 15 Q 4 13.5 5.5 13.5 Z M 15 13.5 L 18.5 13.5 Q 20 13.5 20 15 L 20 18.5 Q 20 20 18.5 20 L 15 20 Q 13.5 20 13.5 18.5 L 13.5 15 Q 13.5 13.5 15 13.5 Z',
      activePath: 'M 4 6 L 20 6 Q 20 6 20 6 L 20 6 Q 20 6 20 6 L 4 6 Q 4 6 4 6 L 4 6 Q 4 6 4 6 Z M 4 10 L 20 10 Q 20 10 20 10 L 20 10 Q 20 10 20 10 L 4 10 Q 4 10 4 10 L 4 10 Q 4 10 4 10 Z M 4 14 L 20 14 Q 20 14 20 14 L 20 14 Q 20 14 20 14 L 4 14 Q 4 14 4 14 L 4 14 Q 4 14 4 14 Z M 4 18 L 20 18 Q 20 18 20 18 L 20 18 Q 20 18 20 18 L 4 18 Q 4 18 4 18 L 4 18 Q 4 18 4 18 Z'
    },
    {
      id: 'servicios',
      label: 'Servicios',
      icon: 'i-servicios',
      idlePath: 'M 11 5.5 L 12.45 9.55 L 16.5 11 L 12.45 12.45 L 11 16.5 L 9.55 12.45 L 5.5 11 L 9.55 9.55 Z M 18 4 L 18.7 5.9 L 20.6 6.6 L 18.7 7.3 L 18 9.2 L 17.3 7.3 L 15.4 6.6 L 17.3 5.9 Z',
      activePath: 'M 11 3.5 L 12.6 9.4 L 18.5 11 L 12.6 12.6 L 11 18.5 L 9.4 12.6 L 3.5 11 L 9.4 9.4 Z M 18.5 2.5 L 19.3 5.1 L 21.9 5.9 L 19.3 6.7 L 18.5 9.3 L 17.7 6.7 L 15.1 5.9 L 17.7 5.1 Z'
    },
    {
      id: 'experimentos',
      label: 'Experimentos',
      icon: 'i-experimentos',
      idlePath: 'M 9.5 3.5 L 14.5 3.5 M 7.6 15 L 16.4 15 M 10.3 3.5 L 10.3 8.8 L 6.4 16.9 Q 5.6 18.5 7.3 19 L 8.8 19.4 Q 12 20.4 15.2 19.4 L 16.7 19 Q 18.4 18.5 17.6 16.9 L 13.7 8.8 L 13.7 3.5',
      activePath: 'M 8.8 3.5 L 15.2 3.5 M 6.5 10.9 L 17.5 10.9 M 10.3 3.5 L 10.3 8.8 L 6.4 16.9 Q 5.6 18.5 7.3 19 L 8.8 19.4 Q 12 20.4 15.2 19.4 L 16.7 19 Q 18.4 18.5 17.6 16.9 L 13.7 8.8 L 13.7 3.5'
    },
    {
      id: 'contacto',
      label: 'Contacto',
      icon: 'i-whatsapp',
      idlePath: 'M 4 6.4 Q 4 5.5 4.9 5.5 L 19.1 5.5 Q 20 5.5 20 6.4 L 20 17.6 Q 20 18.5 19.1 18.5 L 4.9 18.5 Q 4 18.5 4 17.6 Z M 4.7 6.7 L 12 12.4 L 19.3 6.7',
      activePath: 'M 20.2 4.1 Q 20.8 3.9 20.4 4.5 L 4.2 11.2 Q 3.7 11.4 4.1 11.7 L 10.3 13.4 Q 10.7 13.55 10.8 13.95 L 12.9 20.2 Q 13 20.6 13.35 20.25 Z M 10.4 13.5 L 20.2 4.1 L 20.2 4.1'
    }
  ]
};

export const siteContent = siteContentSchema.parse(rawSiteContent);

export function findProjectBySlug(slug: string): Project | undefined {
  return siteContent.projects.find((project) => project.slug === slug);
}

export function documentedProjects(): Project[] {
  return siteContent.projects.filter((project) => project.documented);
}
