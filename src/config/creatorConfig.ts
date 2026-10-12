/**
 * LifeDesk AI — Central Creator Configuration
 *
 * All information regarding the creator of LifeDesk AI is centralized here
 * for easy modification, maintenance, and display in the AI Assistant chatbot.
 *
 * STRICT GUIDELINE: No invented creator information.
 */

export interface CreatorSocialLink {
  platform: 'github' | 'linkedin' | 'portfolio' | 'email';
  label: string;
  url: string;
  displayHandle?: string;
}

export interface CreatorConfig {
  name: string;
  role: string;
  education: string;
  project: string;
  description: string;
  /**
   * Creator's photo URL or path.
   * Defaults to '/creator-photo.png' (or .jpg in /public).
   * Also supports actual user-uploaded photos via localStorage or profile sync.
   */
  photoUrl: string;
  email?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  skills: string[];
  tags?: string[];
  bio?: string;
  social?: {
    github?: string;
    twitter?: string;
    website?: string;
    email?: string;
    linkedin?: string;
  };
}

export const CREATOR_CONFIG: CreatorConfig = {
  name: 'Vasu Desalla',
  role: 'Founder & Developer',
  education: 'B.Tech — Computer Science Engineering',
  project: 'LifeDesk AI',
  description:
    'LifeDesk AI was created by Vasu Desalla as an AI-powered personal productivity platform combining cloud data, intelligent automation and conversational AI.',
  bio: 'B.Tech in Computer Science Engineering. Full-Stack developer specializing in React, TypeScript, Supabase PostgreSQL, and Grounded AI LLM Engineering.',
  photoUrl: '/creator-photo.png',
  email: 'vasudesalla777@gmail.com',
  github: 'https://github.com/vasudesalla',
  linkedin: 'https://linkedin.com/in/vasudesalla',
  portfolio: 'https://vasudesalla.com',
  social: {
    github: 'https://github.com/vasudesalla',
    twitter: 'https://twitter.com/vasudesalla',
    website: 'https://vasudesalla.com',
    email: 'vasudesalla777@gmail.com',
    linkedin: 'https://linkedin.com/in/vasudesalla',
  },
  skills: [
    'Computer Science Engineering',
    'Full-Stack Architecture',
    'React & TypeScript',
    'Cloud Systems & Databases',
    'Intelligent Automation & AI',
  ],
  tags: [
    'Full-Stack Developer',
    'React & TypeScript',
    'Supabase & RLS',
    'Grounded AI Copilot',
    'Computer Science',
  ],
};

/**
 * Common phrase patterns for identifying Creator questions
 */
export const CREATOR_TRIGGER_PHRASES = [
  'who created this website',
  'who developed lifedesk ai',
  'who developed lifedesk',
  'who is the developer',
  'who built this application',
  'who built this app',
  'who built this website',
  'who built lifedesk',
  'tell me about the creator',
  'who made this website',
  'who made this app',
  'who made lifedesk ai',
  'who made lifedesk',
  'who is the creator',
  'who created this app',
  'who created lifedesk',
  'who is vasu desalla',
  'who is vasu',
  'tell me about vasu',
  'about vasu',
  'vasu details',
  'vasu profile',
  'vasu desalla',
  'about the creator',
  'about the developer',
  'creator of lifedesk',
  'creator profile',
];

/**
 * Checks whether a message is asking about the creator
 */
export function isCreatorQuery(text: string): boolean {
  if (!text) return false;
  const q = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (CREATOR_TRIGGER_PHRASES.some((phrase) => q.includes(phrase))) return true;

  const asksAboutSelf =
    /\b(about me|about myself|tell me about me|tell me about myself|who am i|what is my name|what are my details|my (name|details|bio|profile|photo|picture|education|skills))\b/.test(q) ||
    /\b(na|naa|nannu)\s+(gurinchi|details|peru|photo|profile)\b/.test(q);
  if (asksAboutSelf) return true;

  const mentionsCreator = /\b(creat(?:or|er)|founder|developer|owner|builder)\b/.test(q);
  const asksWho = /\b(who|about|tell me)\b/.test(q);
  const mentionsWebsite = /\b(website|web site|lifedesk)\b/.test(q);
  // Extra question signals: English detail words + Telugu question words
  // (e.g. "developer evaru", "na developer gurinchi").
  const asksPersonDetails =
    /\b(who|whos|whose|what|which|when|where|describe|tell|info|information|details|profile|bio|introduction|intro)\b/.test(q);
  const regionalQuestionWords = /\b(evaru|evadu|enti|emiti|ekkada|enduku|ela|entha|gurinchi|peru)\b/.test(q);
  const asksVasuDetails =
    /\bvasu\b/.test(q) &&
    /\b(who|about|tell|details|profile|education|skills|photo|picture|name|creator|founder|developer)\b/.test(q);
  return (
    asksVasuDetails ||
    (/\bvasu\b/.test(q) && regionalQuestionWords) ||
    (mentionsCreator && (asksWho || mentionsWebsite || asksPersonDetails || regionalQuestionWords)) ||
    (asksWho && mentionsWebsite)
  );
}

/**
 * Helper to retrieve creator photo, checking in order:
 * 1. User-uploaded photo in localStorage ('lifedesk_creator_photo')
 * 2. Logged in profile avatar (if user is creator / avatar_url set)
 * 3. Central CREATOR_CONFIG.photoUrl
 */
export function getCreatorPhoto(userAvatarUrl?: string | null): string {
  try {
    const uploaded = localStorage.getItem('lifedesk_creator_photo');
    if (uploaded && uploaded.length > 20) {
      return uploaded;
    }
  } catch {
    // ignore
  }

  if (userAvatarUrl && userAvatarUrl.trim().length > 0) {
    return userAvatarUrl;
  }

  return CREATOR_CONFIG.photoUrl;
}
