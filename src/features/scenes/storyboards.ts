/**
 * Storyboards: original multi-shot scenes users cast with their AI influencers and generate
 * through the self-hosted storyboard engine (see docs/scenes/storyboard-engine.md).
 * Source of truth for the copy: docs/scenes/selling-sunset-storyboards.md.
 */

export interface StoryboardShot {
  framing: string;
  action: string;
  seconds: number;
}

export interface StoryboardRole {
  id: string;
  label: string;
  /** Suggested influencer (CHARACTER_PRESETS id). */
  suggested: string;
}

export interface Storyboard {
  id: string;
  title: string;
  pack: StoryboardPack;
  category: 'Real Estate' | 'Legal Drama' | 'Pitch' | 'Lifestyle';
  hook: string;
  setting: string;
  mood: string;
  tags: string[];
  line?: string;
  roles: StoryboardRole[];
  shots: StoryboardShot[];
}

export const STORYBOARD_PACKS = ['The Office', 'The Listing', 'The Party', 'The Drama'] as const;
export type StoryboardPack = (typeof STORYBOARD_PACKS)[number];

const role = (id: string, label: string, suggested: string): StoryboardRole => ({ id, label, suggested });

export const STORYBOARDS: Storyboard[] = [
  /* ---------- The Office ---------- */
  {
    id: 'sb-the-entrance',
    title: 'The Entrance',
    pack: 'The Office',
    category: 'Real Estate',
    hook: 'Heels, glass doors, the whole office turns.',
    setting: 'glass-walled luxury brokerage office, white marble floors, gold accents, city view',
    mood: 'confident, glamorous',
    tags: ['office', 'heels', 'entrance'],
    line: 'Morning. Did I miss anything?',
    roles: [role('agent', 'Agent', 'amira-al-qasimi')],
    shots: [
      { framing: 'Low wide shot at floor level', action: 'stilettos step through sliding glass doors', seconds: 2.5 },
      { framing: 'Medium tracking shot', action: 'she walks the aisle holding a coffee, hair moving', seconds: 3 },
      { framing: 'Close-up', action: 'slowly takes her sunglasses off and gives a half-smile to camera', seconds: 2.5 },
    ],
  },
  {
    id: 'sb-whisper-at-the-desk',
    title: 'Whisper at the Desk',
    pack: 'The Office',
    category: 'Real Estate',
    hook: 'Two agents trade gossip over a laptop, then freeze.',
    setting: 'shared desk with ring lights and a skyline behind',
    mood: 'gossipy, tense, a little comedic',
    tags: ['office', 'whisper', 'reaction'],
    line: "Don't say anything. She's already here.",
    roles: [role('a', 'Agent A', 'valeria-mendoza'), role('b', 'Agent B', 'chloe-tan')],
    shots: [
      { framing: 'Over-the-shoulder', action: 'Agent A leans in toward Agent B’s laptop', seconds: 3 },
      { framing: 'Two-shot', action: 'they whisper; Agent B’s eyes widen', seconds: 4 },
      { framing: 'Two-shot', action: 'both look up together at someone off-camera', seconds: 3 },
    ],
  },
  {
    id: 'sb-the-listing-pitch',
    title: 'The Listing Pitch',
    pack: 'The Office',
    category: 'Real Estate',
    hook: 'An agent pitches the boss for the biggest listing of the year.',
    setting: 'corner office, large desk, floor-to-ceiling windows',
    mood: 'ambitious, sharp',
    tags: ['office', 'pitch', 'negotiation'],
    line: 'Forty-two million. I already have two buyers.',
    roles: [role('agent', 'Agent', 'yara-al-harbi'), role('boss', 'Boss', 'tara-singhania')],
    shots: [
      { framing: 'Wide', action: 'the agent places a glossy listing book on the desk', seconds: 3 },
      { framing: 'Close-up', action: 'she taps the price on the page', seconds: 2.5 },
      { framing: 'Reverse medium', action: 'the boss leans back, unconvinced', seconds: 3 },
      { framing: 'Close-up', action: 'the agent says “Give me thirty days.”', seconds: 3.5 },
    ],
  },

  /* ---------- The Listing ---------- */
  {
    id: 'sb-the-reveal',
    title: 'The Reveal',
    pack: 'The Listing',
    category: 'Real Estate',
    hook: 'Pocket doors slide open onto an infinity pool and the city.',
    setting: 'hillside modern villa with floor-to-ceiling pocket doors and an infinity pool',
    mood: 'aspirational, wow moment',
    tags: ['villa', 'pool', 'view', 'reveal'],
    line: 'And this is the backyard.',
    roles: [role('agent', 'Agent', 'rhea-malhotra'), role('client', 'Client', 'giulia-moretti')],
    shots: [
      { framing: 'Medium', action: 'the agent grips both door handles and looks back at the client', seconds: 3 },
      { framing: 'Wide', action: 'the doors slide apart, light floods in, infinity pool and skyline revealed', seconds: 4 },
      { framing: 'Close-up', action: 'the client is speechless', seconds: 3 },
    ],
  },
  {
    id: 'sb-walk-and-sell',
    title: 'Walk & Sell',
    pack: 'The Listing',
    category: 'Real Estate',
    hook: 'Walking the client through a marble great room, selling every detail.',
    setting: 'double-height marble great room with a statement chandelier',
    mood: 'polished, persuasive',
    tags: ['showing', 'walk-and-talk'],
    line: 'Italian marble, twenty-foot ceilings, and the primary suite has its own terrace.',
    roles: [role('agent', 'Agent', 'sofia-bellini'), role('client', 'Client', 'kyla-wijaya')],
    shots: [
      { framing: 'Steadicam walk', action: 'agent and client walk side by side', seconds: 3.5 },
      { framing: 'Insert', action: 'her hand glides over a waterfall marble island', seconds: 2.5 },
      { framing: 'Medium', action: 'she turns and points up at the chandelier', seconds: 3 },
      { framing: 'Close-up', action: 'the client nods, smiling', seconds: 3 },
    ],
  },
  {
    id: 'sb-brokers-open',
    title: "Broker's Open",
    pack: 'The Listing',
    category: 'Real Estate',
    hook: 'Champagne, agents, and a rival walks in uninvited.',
    setting: 'open-house living room with catering and a champagne tower',
    mood: 'social, frosty',
    tags: ['open house', 'champagne', 'rival'],
    line: 'Who invited her?',
    roles: [role('host', 'Host', 'samira-jaffer'), role('rival', 'Rival', 'monica-castellanos'), role('guest', 'Guest', 'noura-al-sayegh')],
    shots: [
      { framing: 'Wide', action: 'agents mingle, glasses clink', seconds: 3.5 },
      { framing: 'Doorway medium', action: 'the rival walks in and everyone turns', seconds: 3.5 },
      { framing: 'Close-up', action: 'the host’s smile tightens', seconds: 3 },
    ],
  },
  {
    id: 'sb-offer-accepted',
    title: 'Offer Accepted',
    pack: 'The Listing',
    category: 'Real Estate',
    hook: 'The call comes in on the terrace: full asking, cash.',
    setting: 'villa terrace at golden hour',
    mood: 'triumphant',
    tags: ['phone call', 'sunset', 'win'],
    line: 'Full asking? Cash? Send it over.',
    roles: [role('agent', 'Agent', 'tatiana-morales')],
    shots: [
      { framing: 'Medium', action: 'her phone rings; she answers and paces', seconds: 3 },
      { framing: 'Close-up', action: 'she stops, mouth opens in disbelief', seconds: 2.5 },
      { framing: 'Wide', action: 'a small jump and spin toward the view', seconds: 2.5 },
    ],
  },

  /* ---------- The Party ---------- */
  {
    id: 'sb-dinner-is-served',
    title: 'Dinner Is Served',
    pack: 'The Party',
    category: 'Lifestyle',
    hook: 'A polite toast at a candlelit table turns sharp.',
    setting: 'candlelit long table in a private dining room',
    mood: 'elegant, passive-aggressive',
    tags: ['dinner', 'toast', 'tension'],
    line: "To friendship. Real friendship, the kind that doesn't need a camera.",
    roles: [role('host', 'Toast', 'soraya-darwish'), role('g1', 'Guest 1', 'celine-choueiri'), role('g2', 'Guest 2', 'ananya-kapoor')],
    shots: [
      { framing: 'Wide', action: 'she stands with a glass raised', seconds: 3 },
      { framing: 'Medium', action: 'a warm toast; the others smile', seconds: 3 },
      { framing: 'Close-up', action: 'she adds one more line with a pointed look', seconds: 3 },
      { framing: 'Reaction two-shot', action: 'the smiles drop', seconds: 3 },
    ],
  },
  {
    id: 'sb-the-black-dress',
    title: 'The Black Dress',
    pack: 'The Party',
    category: 'Lifestyle',
    hook: 'Arriving at a white-dress event in head-to-toe black.',
    setting: 'garden event, every guest dressed in white',
    mood: 'bold, iconic',
    tags: ['arrival', 'fashion statement'],
    roles: [role('arrival', 'Arrival', 'katarina-volkov')],
    shots: [
      { framing: 'Wide', action: 'a sea of guests in white outfits', seconds: 2.5 },
      { framing: 'Medium', action: 'the gate opens; she arrives in a black gown and dramatic headpiece', seconds: 3 },
      { framing: 'Close-up', action: 'guests whisper; she smiles', seconds: 2.5 },
    ],
  },
  {
    id: 'sb-rooftop-cheers',
    title: 'Rooftop Cheers',
    pack: 'The Party',
    category: 'Lifestyle',
    hook: 'Closing celebration at sunset, glasses up.',
    setting: 'rooftop bar with a sunset skyline',
    mood: 'celebratory',
    tags: ['rooftop', 'sunset', 'toast'],
    line: 'To the biggest sale of the year.',
    roles: [role('a', 'Agent 1', 'noura-al-sayegh'), role('b', 'Agent 2', 'valentina-cruz'), role('c', 'Agent 3', 'elena-popescu')],
    shots: [
      { framing: 'Medium', action: 'three agents raise their glasses', seconds: 3 },
      { framing: 'Close-up, slow motion', action: 'glasses clink', seconds: 2.5 },
      { framing: 'Wide', action: 'laughter against the skyline glow', seconds: 2.5 },
    ],
  },

  /* ---------- The Drama ---------- */
  {
    id: 'sb-patio-showdown',
    title: 'Patio Showdown',
    pack: 'The Drama',
    category: 'Lifestyle',
    hook: '“Who told you that?” A confrontation by the pool.',
    setting: 'poolside patio with loungers, evening',
    mood: 'confrontational, cinematic',
    tags: ['argument', 'pool', 'night'],
    line: 'Who told you that? / Does it matter if it’s true?',
    roles: [role('a', 'Agent A', 'maya-hassan'), role('b', 'Agent B', 'zoe-mansour')],
    shots: [
      { framing: 'Two-shot', action: 'they stand too close, arms crossed', seconds: 3 },
      { framing: 'Close-up on A', action: '“Who told you that?”', seconds: 3 },
      { framing: 'Close-up on B', action: 'a long pause, then a smirk', seconds: 3 },
      { framing: 'Wide', action: 'A turns away toward the pool', seconds: 3 },
    ],
  },
  {
    id: 'sb-the-walk-off',
    title: 'The Walk-Off',
    pack: 'The Drama',
    category: 'Lifestyle',
    hook: 'She’s done talking. Sunglasses on, out the door.',
    setting: 'glass hallway leading to the street',
    mood: 'dramatic exit',
    tags: ['walk-off', 'sunglasses', 'doors'],
    line: "I'm done here.",
    roles: [role('lead', 'Lead', 'salma-benali')],
    shots: [
      { framing: 'Medium', action: 'she grabs her bag mid-sentence', seconds: 2.5 },
      { framing: 'Tracking', action: 'sunglasses on, a fast walk down the hallway', seconds: 3 },
      { framing: 'Exterior wide', action: 'the doors close behind her', seconds: 2.5 },
    ],
  },
];

export const storyboardSeconds = (s: Storyboard) => Math.round(s.shots.reduce((n, x) => n + x.seconds, 0));

/** Per-shot prompts with the cast written in, ready for the engine. */
export function compileShotPrompts(s: Storyboard, castNames: Record<string, string>): string[] {
  const cast = s.roles.map((r) => `${r.label} is ${castNames[r.id] || r.label}`).join('; ');
  return s.shots.map(
    (sh, i) =>
      `Shot ${i + 1}/${s.shots.length}, ${sh.seconds}s. ${sh.framing}: ${sh.action}. Setting: ${s.setting}. Mood: ${s.mood}. ` +
      `Cast: ${cast}. Keep every person identical to their reference sheet. Photorealistic, cinematic reality-TV look, no text or logos.`
  );
}
