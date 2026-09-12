export interface HeroContent {
  role: string;
  bio: string[];
}

export interface Project {
  slug: string;
  num: string;
  name: string;
  full: string;
  tags: string[];
  desc: string;
  image: string;
  w: number;
  h: number;
  icon: string;
  documented: boolean;
  url?: string;
}

export interface CaseStudy {
  problem: string | null;
  constraints: string | null;
  discards: string | null;
  decision: string | null;
  result: string | null;
  different: string | null;
}

export interface Service {
  icon: string;
  title: string;
  desc: string;
  bullets: string[];
  image: string;
  alt: string;
}

export interface Reason {
  title: string;
  text: string;
}

export interface Testimonial {
  quote: string | null;
  name: string | null;
  role: string | null;
}

export interface ContactLink {
  label: string;
  url: string;
}

export interface Contact {
  whatsapp: string;
  links: ContactLink[];
}

export type CaseQuestionKey = keyof CaseStudy;
export type CaseQuestion = [CaseQuestionKey, string];

export interface DockSection {
  id: string;
  label: string;
  icon: string;
  idlePath: string;
  activePath: string;
}
