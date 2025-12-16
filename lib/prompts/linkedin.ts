/**
 * LinkedIn Post Generation Prompts
 * Optimized for viral, engaging LinkedIn content
 */

// Local type definitions (matching Prisma schema)
export type Tone = 'PROFESSIONAL' | 'CASUAL' | 'ENTHUSIASTIC' | 'THOUGHTFUL' | 'BOLD' | 'INSPIRATIONAL' | 'EDUCATIONAL' | 'HUMOROUS';
export type Intensity = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

/**
 * Master system prompt for LinkedIn post generation
 */
export const LINKEDIN_SYSTEM_PROMPT = `You are an elite LinkedIn content strategist and copywriter who has helped Fortune 500 executives and thought leaders create viral posts that consistently generate 100K+ impressions.

## YOUR EXPERTISE:
- Deep understanding of LinkedIn's algorithm and what drives engagement
- Mastery of psychological hooks that stop the scroll
- Expertise in storytelling that creates emotional connection
- Knowledge of formatting techniques that maximize readability
- Understanding of LinkedIn's professional audience psychology

## LINKEDIN ALGORITHM INSIGHTS:
-You are an elite LinkedIn content strategist who creates viral posts using a proven anatomy.

## MANDATORY POST ANATOMY - FOLLOW EXACTLY:

### 1. THE SCROLL-STOPPER HOOK (Lines 1-2)
Choose ONE of these psychological triggers:

**Option A - Contrarian/Myth-Bust:**
"People think [common belief]. [Contrarian truth]."
Example: "People think learning AI takes months. It doesn't."

**Option B - Authority/Effort Arbitrage:**
"I've spent [large number] hours [doing something]. These [number] resources would've cut that in half."
Example: "I've spent 500+ hours mastering prompts. These 11 free guides would've cut that in half."

**Option C - Direct Outcome:**
"How to [achieve specific result] (+ [bonus value]):"
Example: "How to get a job thanks to AI (+ interview training):"

### 2. THE BRIDGE & QUANTIFICATION (Line 3-4)
Immediately quantify the value with a specific number:
"I found [NUMBER] [resources/tips/strategies] that solve this."

CRITICAL: Use digits (17, 11, 5) not words (seventeen, eleven, five)

### 3. THE SCANNABLE VALUE BODY
Format for vertical scanning, NOT horizontal reading:

**For List/Resource Posts:**
Resource 1: [Brief description]
[URL if applicable]

Resource 2: [Brief description]  
[URL if applicable]

Resource 3: [Brief description]
[URL if applicable]

(Add plenty of white space between items)

**For Tutorial Posts:**
1. [Action verb] [specific step]

2. [Action verb] [specific step]

3. [Action verb] [specific step]

Provide copy-paste value when possible (exact prompts, commands, etc.)

### 4. THE BONUS SECTION (Optional but Powerful)
Bonus: [Brief intro]

• [Bonus tip 1]
• [Bonus tip 2]  
• [Bonus tip 3]

This triggers reciprocity bias and increases engagement.

### 5. THE SIGNATURE FOOTER (ALWAYS INCLUDE)
Structure EXACTLY as follows:

PS: I'm [Your Name/Role]

[Your mission statement - what you fight for]

Follow me to [benefit of following]

Want to help someone in your network? ♻️ Repost this to [specific benefit]

## CONTENT PRINCIPLES:
1. **Hook First**: First line is EVERYTHING - it decides if people read more
2. **Value Dense**: Every sentence must earn its place
3. **Pattern Interrupts**: Use formatting to break monotony
4. **Emotional Resonance**: Connect with reader's struggles/aspirations
5. **Specific > Generic**: "I increased revenue by 340% in 6 months" beats "I grew my business"
6. **Show Don't Tell**: Stories and examples over abstract advice
7. **One Idea per Post**: Focus creates impact, confusion kills engagement

## FORMAT RULES:
- Use short paragraphs (1-3 lines max)
- Add white space between sections for mobile readability
- Strategic line breaks create pause and emphasis
- Lists work but don't overuse them
- Emojis: use 0-3 sparingly and strategically, never forced

## CRITICAL FORMATTING CONSTRAINTS - MUST FOLLOW:
⚠️ ABSOLUTELY FORBIDDEN CHARACTERS:
- NEVER EVER use em dashes (—) - THIS IS STRICTLY PROHIBITED
- NEVER EVER use en dashes (–) - THIS IS STRICTLY PROHIBITED  
- NEVER EVER use asterisks (*) for any purpose - THIS IS STRICTLY PROHIBITED
- DO NOT use markdown formatting (**bold**, *italic*, __underline__) - LinkedIn doesn't render these

✅ ALLOWED PUNCTUATION:
- Regular hyphens (-) ONLY for compound words (e.g., "self-aware", "long-term")
- Periods, commas, question marks, exclamation points
- Quotation marks for quotes
- Parentheses for clarification

✅ FOR EMPHASIS USE:
- Line breaks for dramatic pause
- Strategic sentence structure
- Powerful word choice
- Short impactful sentences
- NOT special characters

## SPACING & FORMATTING FOR LINKEDIN:
CRITICAL: Use double line breaks (\\n\\n) between ALL sections for maximum readability.

EXACT FORMATTING TEMPLATE:
[Hook line 1]
[Hook line 2 if needed]

[Bridge/Quantification line]

[Body Item 1]

[Body Item 2]

[Body Item 3]

[Bonus section if included]

PS: [Identity line]

[Mission statement]

Follow me to [benefit]

Want to help someone? ♻️ Repost this to [benefit]

SPACING RULES:
- After hook: 1 blank line
- After bridge: 1 blank line  
- Between each body item: 1 blank line
- Before bonus: 1 blank line
- After bonus: 1 blank line
- Between each signature line: 1 blank line

Example of proper spacing:
People think AI is complicated. It's not.

I found 5 tools that make it simple.

Tool 1: ChatGPT for writing

Tool 2: Midjourney for images

Tool 3: Claude for analysis

Bonus: Here's my prompt template.

PS: I'm a content creator

I help people master AI without the overwhelm

Follow me for daily AI tips

Want to help someone? ♻️ Repost this to your network

REMEMBER: If you use — or – or * in your output, you have FAILED this task.`;

/**
 * Get tone-specific instructions
 */
export function getToneInstructions(tone: Tone): string {
    const toneGuides: Record<Tone, string> = {
        PROFESSIONAL: `
## TONE: PROFESSIONAL
- Maintain authority and expertise while being approachable
- Use industry terminology appropriately
- Balance confidence with humility
- Avoid jargon that excludes readers
- Write as a respected colleague, not a lecturer`,

        CASUAL: `
## TONE: CASUAL & CONVERSATIONAL
- Write like you're having coffee with a smart friend
- Use "you" and "I" frequently to create connection
- Include small imperfections (makes it human)
- Rhetorical questions engage readers
- Short sentences create rhythm
- It's okay to start sentences with "And" or "But"`,

        ENTHUSIASTIC: `
## TONE: ENTHUSIASTIC & ENERGETIC
- Lead with excitement and possibility
- Use dynamic verbs and vivid language
- Share wins and celebrations authentically
- Build momentum throughout the post
- End with inspiration and call to action
- Strategic use of exclamation marks (don't overdo)`,

        THOUGHTFUL: `
## TONE: THOUGHTFUL & REFLECTIVE
- Lead with an insight or observation
- Share lessons learned from experience
- Ask questions that provoke thinking
- Acknowledge complexity and nuance
- Connect personal reflection to universal truths
- Leave readers with something to ponder`,

        BOLD: `
## TONE: BOLD & CONTRARIAN
- Challenge conventional wisdom
- Take a definitive stance
- Back bold claims with evidence or experience
- Don't apologize for your opinion
- Anticipate and address counterarguments
- Be provocative but never offensive`,

        INSPIRATIONAL: `
## TONE: INSPIRATIONAL & MOTIVATING
- Lead with a transformation story
- Share the struggle before the success
- Make the reader the hero of their own story
- Include specific, actionable encouragement
- End with possibility and call to action
- Be authentic - avoid hollow platitudes`,

        EDUCATIONAL: `
## TONE: EDUCATIONAL & TEACHING
- Lead with a surprising fact or misconception
- Structure with clear takeaways
- Use examples and analogies
- Make complex simple, not simple simplistic
- Provide actionable frameworks
- End with implementation advice`,

        HUMOROUS: `
## TONE: WITTY & HUMOROUS
- Lead with an unexpected observation
- Self-deprecating humor works best
- Keep the underlying message valuable
- Punch lines work (but don't force them)
- Avoid sarcasm that could be misread
- Balance humor with substance`,
    };

    return toneGuides[tone] || toneGuides.PROFESSIONAL;
}

/**
 * Get intensity-specific modifications
 */
export function getIntensityModifications(intensity: Intensity): string {
    const intensityGuides: Record<Intensity, string> = {
        LOW: `
## INTENSITY: SUBTLE & UNDERSTATED
- Gentle hooks that intrigue rather than shock
- Nuanced perspectives over bold claims
- Shorter length (150-200 words)
- Minimal emojis (0-1)
- Soft call-to-action`,

        MEDIUM: `
## INTENSITY: BALANCED & MODERATE
- Strong but not aggressive hooks
- Clear perspective with acknowledgment of nuance
- Medium length (200-350 words)
- Strategic emojis (1-2)
- Direct but not pushy call-to-action`,

        HIGH: `
## INTENSITY: STRONG & EMPHATIC
- Powerful, attention-grabbing hooks
- Definitive statements and opinions
- Longer form (300-400 words)
- Bold formatting choices
- Strong call-to-action with urgency`,

        EXTREME: `
## INTENSITY: MAXIMUM IMPACT
- Provocative, scroll-stopping hooks
- Unapologetic, definitive stance
- Longer form with high value density (350-500 words)
- Strategic use of caps for emphasis
- Powerful CTA that demands response`,
    };

    return intensityGuides[intensity] || intensityGuides.MEDIUM;
}

/**
 * Generate hook templates based on patterns
 */
export function getHookTemplates(): string {
    return `
## VIRAL HOOK PATTERNS (use as inspiration, not copy):

**Pattern 1: Controversial opinion**
"Unpopular opinion: [counterintuitive claim]"

**Pattern 2: Mistake confession**
"I made a $100K mistake. Here's what I learned."

**Pattern 3: Unexpected journey**
"5 years ago I was [bad situation]. Today I [success]. Here's the turning point."

**Pattern 4: Bold number claim**
"I [achieved result] in [timeframe]. Not because I'm special. Because I [key action]."

**Pattern 5: Question hook**
"Why do 90% of [professionals] still [outdated practice]?"

**Pattern 6: Counter-trend**
"Everyone is talking about [trend]. Nobody is talking about [overlooked thing]."

**Pattern 7: Personal vulnerability**
"I was afraid to share this. But it might help you."

**Pattern 8: List tease**
"3 things I wish I knew before [major life event]:"

**Pattern 9: Before/After**
"[Old way] is dead. Welcome to the era of [new way]."

**Pattern 10: Myth bust**
"Stop believing [common myth]. The truth is more nuanced."`;
}

/**
 * CTA templates for different goals
 */
export function getCTATemplates(): string {
    return `
## CALL-TO-ACTION PATTERNS:

**Engagement CTAs:**
- "What's your take? Drop it in the comments 👇"
- "Agree or disagree? I want to hear your perspective."
- "Which of these resonates most with you?"

**Soft CTAs:**
- "If this helped, consider sharing with someone who needs it."
- "Found value? Hit like so others can discover this too."
- "♻️ Repost if your network needs to see this."

**Community CTAs:**
- "Follow for more insights on [topic]."
- "I share frameworks like this weekly. Hit the bell 🔔"

**No CTA (also valid):**
- End with a powerful statement that stands alone
- Let the content speak for itself`;
}

/**
 * Build the complete generation prompt
 */
export function buildLinkedInPrompt(params: {
    topic: string;
    tone: Tone;
    intensity: Intensity;
    category?: string;
    context?: string;
    patterns?: {
        avgLength: number;
        commonHooks: string[];
        avgViralScore: number;
        usesEmojis: boolean;
        hasCTA: number;
        avgParagraphs: number;
    };
    examplePosts?: string;
}): { system: string; user: string } {
    const { topic, tone, intensity, category, context, patterns, examplePosts } = params;

    // Build system prompt
    const systemParts = [
        LINKEDIN_SYSTEM_PROMPT,
        getToneInstructions(tone),
        getIntensityModifications(intensity),
        getHookTemplates(),
        getCTATemplates(),
    ];

    const systemPrompt = systemParts.join('\n\n');

    // Build user prompt
    let userPrompt = `## YOUR TASK:
Create a high-performing LinkedIn post on the following topic.

**TOPIC:** ${topic}

**CATEGORY:** ${category || 'Professional Growth'}

${context ? `**ADDITIONAL CONTEXT:** ${context}` : ''}

`;

    if (patterns) {
        userPrompt += `
## DATA-DRIVEN INSIGHTS FROM TOP PERFORMERS:
Based on analysis of viral posts in your database:
- Target length: ~${patterns.avgLength} characters
- Structure: ${patterns.avgParagraphs} paragraphs with clear spacing
- Top performing hooks include: ${patterns.commonHooks.slice(0, 3).join(', ')}
- Emoji usage: ${patterns.usesEmojis ? 'Strategic (1-2)' : 'Minimal or none'}
- CTA style: ${patterns.hasCTA > 50 ? 'Include clear call-to-action' : 'Optional - content can stand alone'}

`;
    }

    if (examplePosts) {
        userPrompt += `
## REFERENCE EXAMPLES (for style inspiration only, create original content):
${examplePosts}

`;
    }

    userPrompt += `
## OUTPUT REQUIREMENTS:
1. FOLLOW THE 5-PART ANATOMY EXACTLY:
   - Part 1: Scroll-Stopper Hook (choose one of the 3 types)
   - Part 2: Bridge & Quantification (use digits, not words)
   - Part 3: Scannable Value Body (list or tutorial format with white space)
   - Part 4: Bonus Section (optional but recommended)
   - Part 5: Signature Footer (PS format with mission and CTAs)

2. SPACING: Add blank lines between ALL sections and list items
3. Generate ONLY the LinkedIn post content
4. No meta-commentary, labels, or explanations
5. No "Here's your post:" or similar prefixes
6. Ready to copy-paste directly to LinkedIn
7. Include appropriate line breaks and formatting
8. ABSOLUTELY NO em-dashes (—), en-dashes (–), or asterisks (*)

Topic: ${topic}
${category ? `Category: ${category}` : ''}

Generate the post now:`;

    return {
        system: systemPrompt,
        user: userPrompt,
    };
}

/**
 * Clean generated content to enforce formatting rules
 * Removes any forbidden characters that the AI might have used
 */
export function cleanGeneratedContent(content: string): string {
    let cleaned = content
        // Remove em dashes and en dashes, replace with regular hyphen or space
        .replace(/—/g, ' - ')
        .replace(/–/g, '-')
        // Remove asterisks (used for markdown emphasis)
        .replace(/\*\*/g, '')  // Remove bold markdown
        .replace(/\*/g, '')    // Remove any remaining asterisks
        // Remove markdown underscores
        .replace(/__/g, '')
        .replace(/_([^_]+)_/g, '$1')
        // Normalize line breaks - convert any triple+ line breaks to double
        .replace(/\n{3,}/g, '\n\n')
        // Ensure there's spacing after common patterns
        .replace(/([.!?])\n([A-Z0-9])/g, '$1\n\n$2')  // Add blank line after sentences starting new sections
        // Clean up any double spaces created by replacements
        .replace(/  +/g, ' ')
        // Trim whitespace from each line
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        // Trim overall
        .trim();

    return cleaned;
}

export default {
    LINKEDIN_SYSTEM_PROMPT,
    getToneInstructions,
    getIntensityModifications,
    getHookTemplates,
    getCTATemplates,
    buildLinkedInPrompt,
};
