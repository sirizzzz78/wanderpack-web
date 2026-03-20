const RESTRICTED_KEYWORDS: string[] = [
  'gun', 'firearm', 'pistol', 'rifle', 'shotgun', 'revolver',
  'bb gun', 'pellet gun', 'flare gun', 'airsoft', 'cap gun',
  'ammunition', 'ammo', 'bullet', 'cartridge',
  'gunpowder', 'gun powder', 'black powder',
  'knife', 'dagger', 'switchblade', 'gravity knife',
  'machete', 'sword', 'saber', 'sabre',
  'box cutter', 'razor blade',
  'ice pick', 'ice axe', 'ice ax', 'hand axe', 'hatchet',
  'throwing star', 'shuriken',
  'brass knuckle', 'billy club', 'blackjack',
  'nightstick', 'night stick', 'baton',
  'nunchuck', 'nunchaku', 'kubotan',
  'stun gun', 'taser', 'cattle prod',
  'pepper spray', 'bear spray', 'mace spray', 'tear gas',
  'explosive', 'dynamite', 'blasting cap',
  'grenade', 'firework', 'firecracker', 'bang snap',
  'flare',
  'gasoline', 'petrol', 'lighter fluid',
  'butane', 'propane',
  'chlorine', 'fertilizer',
  'fire extinguisher',
  'crowbar', 'hammer', 'sledgehammer', 'wrecking bar',
  'power drill', 'drill bit',
  'hacksaw', 'chain saw', 'chainsaw', 'circular saw', 'power saw',
  'baseball bat', 'cricket bat',
  'hockey stick',
  'golf club',
  'lacrosse stick',
  'pool cue', 'billiard cue',
  'bowling ball',
  'bow and arrow', 'archery bow',
  'ski pole', 'trekking pole', 'hiking pole',
  'fire starter', 'fuel canister',
  'biodegradable soap', 'insect repellent',
];

// Simple plural stripping (replaces NLTagger lemmatization)
const IRREGULAR_PLURALS: Record<string, string> = {
  knives: 'knife',
  axes: 'axe',
  grenades: 'grenade',
  matches: 'match',
  switches: 'switch',
};

function simpleLemmatize(text: string): string {
  return text
    .split(/\s+/)
    .map(word => {
      if (IRREGULAR_PLURALS[word]) return IRREGULAR_PLURALS[word];
      if (word.endsWith('ves')) return word.slice(0, -3) + 'fe';
      if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
      if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes') ||
          word.endsWith('ches') || word.endsWith('shes')) {
        return word.slice(0, -2);
      }
      if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
      return word;
    })
    .join(' ');
}

export function isRestricted(itemName: string): boolean {
  const name = itemName.toLowerCase();

  // Pass 1: direct substring
  if (RESTRICTED_KEYWORDS.some(kw => name.includes(kw))) return true;

  // Pass 2: lemmatize then re-check
  const lemma = simpleLemmatize(name);
  if (lemma !== name) {
    return RESTRICTED_KEYWORDS.some(kw => lemma.includes(kw));
  }

  return false;
}
