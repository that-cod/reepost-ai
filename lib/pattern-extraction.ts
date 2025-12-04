import { ViralPostResult } from './vector-search';

/**
 * Extracted patterns from viral posts
 */
export interface PostPatterns {
  // Writing style
  avgLength: number;
  avgParagraphs: number;
  avgSentenceLength: number;

  // Hook patterns
  commonHooks: string[];
  hookStyles: Record<string, number>;

  // Structure patterns
  openingPatterns: string[];
  closingPatterns: string[];
  usesEmojis: boolean;
  usesQuestions: boolean;
  usesLists: boolean;

  // Tone & category distribution
  tones: Record<string, number>;
  categories: Record<string, number>;

  // Engagement patterns
  avgViralScore: number;
  topPerformers: Array<{ text: string; score: number }>;

  // CTA patterns
  ctaPatterns: string[];
  hasCTA: number; // percentage
}

/**
 * Extract patterns from viral posts
 */
export function extractPostPatterns(posts: ViralPostResult[]): PostPatterns {
  if (posts.length === 0) {
    throw new Error('Cannot extract patterns from empty array');
  }

  // Initialize pattern collectors
  const lengths: number[] = [];
  const paragraphCounts: number[] = [];
  const sentenceLengths: number[] = [];
  const hookStyles: Record<string, number> = {};
  const tones: Record<string, number> = {};
  const categories: Record<string, number> = {};
  const openings: string[] = [];
  const closings: string[] = [];
  const ctaPatterns: string[] = [];

  let usesEmojis = 0;
  let usesQuestions = 0;
  let usesLists = 0;
  let hasCTA = 0;

  // Analyze each post
  for (const post of posts) {
    const text = post.text;
    const lines = text.split('\n').filter(l => l.trim());
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    // Length metrics
    lengths.push(text.length);
    paragraphCounts.push(lines.length);
    sentenceLengths.push(
      sentences.length > 0 ? text.length / sentences.length : 0
    );

    // Hook styles
    hookStyles[post.hookStyle] = (hookStyles[post.hookStyle] || 0) + 1;

    // Tones & categories
    tones[post.tone] = (tones[post.tone] || 0) + 1;
    categories[post.category] = (categories[post.category] || 0) + 1;

    // Opening pattern (first line)
    if (lines[0]) {
      openings.push(lines[0].substring(0, 50));
    }

    // Closing pattern (last line)
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1];
      closings.push(lastLine.substring(0, 50));
    }

    // Check for emojis
    if (/[\u{1F300}-\u{1F9FF}]/u.test(text)) {
      usesEmojis++;
    }

    // Check for questions
    if (text.includes('?')) {
      usesQuestions++;
    }

    // Check for lists (numbered or bulleted)
    if (/^[•\-\d][\.\)]/m.test(text)) {
      usesLists++;
    }

    // Check for CTAs (common patterns)
    const ctaKeywords = [
      'comment below',
      'share your',
      'let me know',
      'drop a',
      'follow for',
      'link in',
      'dm me',
      'check out',
      'click the',
      'tag someone',
    ];

    const lowerText = text.toLowerCase();
    for (const keyword of ctaKeywords) {
      if (lowerText.includes(keyword)) {
        hasCTA++;
        ctaPatterns.push(keyword);
        break;
      }
    }
  }

  // Calculate averages
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  // Identify common hooks (top 3)
  const commonHooks = Object.entries(hookStyles)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hook]) => hook);

  // Opening/closing patterns (most common start/end phrases)
  const uniqueOpenings = [...new Set(openings)].slice(0, 5);
  const uniqueClosings = [...new Set(closings)].slice(0, 5);

  // Top performers
  const topPerformers = posts
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, 3)
    .map(p => ({
      text: p.text.substring(0, 100) + '...',
      score: p.viralScore,
    }));

  return {
    avgLength: Math.round(avg(lengths)),
    avgParagraphs: Math.round(avg(paragraphCounts)),
    avgSentenceLength: Math.round(avg(sentenceLengths)),
    commonHooks,
    hookStyles,
    openingPatterns: uniqueOpenings,
    closingPatterns: uniqueClosings,
    usesEmojis: usesEmojis > 0,
    usesQuestions: usesQuestions > posts.length * 0.3,
    usesLists: usesLists > posts.length * 0.2,
    tones,
    categories,
    avgViralScore: avg(posts.map(p => p.viralScore)),
    topPerformers,
    ctaPatterns: [...new Set(ctaPatterns)].slice(0, 5),
    hasCTA: Math.round((hasCTA / posts.length) * 100),
  };
}

/**
 * Generate a style guide from patterns
 */
export function generateStyleGuide(patterns: PostPatterns): string {
  const guide: string[] = [];

  guide.push('## Writing Style Guide (Based on Viral Posts)');
  guide.push('');
  guide.push(`**Length:** ~${patterns.avgLength} characters, ${patterns.avgParagraphs} paragraphs`);
  guide.push(`**Sentence Length:** ~${patterns.avgSentenceLength} characters per sentence`);
  guide.push('');

  guide.push('**Hook Styles:**');
  patterns.commonHooks.forEach(hook => {
    guide.push(`- ${hook}`);
  });
  guide.push('');

  guide.push('**Opening Patterns:**');
  patterns.openingPatterns.slice(0, 3).forEach(opening => {
    guide.push(`- "${opening}..."`);
  });
  guide.push('');

  if (patterns.ctaPatterns.length > 0) {
    guide.push('**Call-to-Action Patterns:**');
    patterns.ctaPatterns.forEach(cta => {
      guide.push(`- "${cta}"`);
    });
    guide.push('');
  }

  guide.push('**Structural Elements:**');
  if (patterns.usesEmojis) guide.push('- Use emojis strategically');
  if (patterns.usesQuestions) guide.push('- Include rhetorical questions');
  if (patterns.usesLists) guide.push('- Use bullet points or numbered lists');
  guide.push(`- ${patterns.hasCTA}% include clear CTAs`);

  return guide.join('\n');
}
