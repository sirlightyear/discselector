export interface ThrowStyle {
  id: string;
  name: string;
  description: string;
}

export interface ThrowStyleCategory {
  id: string;
  name: string;
  styles: ThrowStyle[];
}

export const THROW_STYLE_CATEGORIES: ThrowStyleCategory[] = [
  {
    id: 'backhand',
    name: 'Baghånd',
    styles: [
      {
        id: 'backhand_standard',
        name: 'Backhand (standard)',
        description: 'Det mest brugte kast i disc golf med god power, kontrol og glide. Kroppen roteres gennem hoften, armen føres bagud og pisker frem. Velegnet til alt fra straight-kast til hyzer, anhyzer og hyzerflips.',
      },
      {
        id: 'backhand_hyzerflip',
        name: 'Backhand hyzerflip',
        description: 'Kastes med hyzervinkel og understabil disc, som rejser sig op. Bruges til lange, kontrollerede straight- eller lette turn-linjer. Utrolig stabil til tunnels og lange glidelinjer.',
      },
      {
        id: 'backhand_roller',
        name: 'Backhand roller',
        description: 'Kastes med stærk anhyzer og understabil disc, så den lander på kant og ruller. Bruges når fairway er lukket i højden, men åben på jorden. God til distance i åbne områder og til at omgå tætte skovsektioner.',
      },
      {
        id: 'backhand_cut_roller',
        name: 'Backhand cut-roller',
        description: 'Ruller i en bue mod kastesiden (LHBH → venstre, RHBH → højre). Mere kontrolleret, mindre distance end en lang roller. Bruges til at komme rundt om hjørner på jorden.',
      },
      {
        id: 'backhand_standup_roller',
        name: 'Backhand stand-up roller',
        description: 'Starter på en kraftig vinkel og rejser sig op under rullen. Mere forudsigelig og blød end en fuld turnover-roller. God i skovhuller, hvor man vil undgå høje hop.',
      },
    ],
  },
  {
    id: 'forehand',
    name: 'Forhånd',
    styles: [
      {
        id: 'forehand_standard',
        name: 'Forehand (standard)',
        description: 'Kastes med en "skipping stone"-bevægelse med håndledssnap. Giver skarpe linjer, god præcision og et naturligt fade til højre (RHFH). Meget stabil i sidevind og god til approach og drives.',
      },
      {
        id: 'forehand_flex',
        name: 'Forehand flex',
        description: 'Overstabil disc kastet på anhyzer, som vender tilbage. Giver stor kontrol i vind og længere distance på åbne linjer. Bruges når man skal shape et S-flight fra forehand-siden.',
      },
      {
        id: 'forehand_roller',
        name: 'Forehand roller',
        description: 'Kastes med stærk anhyzer, så discen lander på kant og ruller fremad. Bruges som alternativ til backhand roller fra en forehand-vinkel. Mere spontan turn og mindre stabil end backhand roller.',
      },
      {
        id: 'forehand_cut_roller',
        name: 'Forehand cut-roller',
        description: 'Roller der slår ind mod kastesiden (RHFH → højre). Bruges til at omgå hindringer på jorden i forehand-vinkel. Har en hurtigere og mere aggressiv rulbevægelse.',
      },
      {
        id: 'forehand_standup_roller',
        name: 'Forehand stand-up roller',
        description: 'Starter stejlt og rejser sig mod lodret under rullen. Giver en mere kontrolleret jordlinje end en fuld turnover-roller. God i smalle skovpassager.',
      },
    ],
  },
  {
    id: 'overhead',
    name: 'Overhead',
    styles: [
      {
        id: 'tomahawk',
        name: 'Tomahawk',
        description: 'Kastes som et overhoved-forehand med discen lodret. Flyver i en "corkscrew" og panner til den ene side og ned igen. Bruges til at komme over træer eller skabe præcise vertikale linjer.',
      },
      {
        id: 'thumber',
        name: 'Thumber',
        description: 'Spejlvendt version af tomahawk, grebet mellem tommel og rim. Panner den modsatte vej af tomahawk og har et mere stabilt fald. God i tæt skov, når man skal vælge en specifik pan-retning.',
      },
    ],
  },
  {
    id: 'vertical',
    name: 'Lodrette / Specialty',
    styles: [
      {
        id: 'grenade',
        name: 'Grenade',
        description: 'Disc holdes omvendt og kastes næsten lodret op. Dykker hårdt og hurtigt ned med minimal glid. Perfekt i close-range skovhuller med loft, men ingen horizontal plads.',
      },
      {
        id: 'vertical_backhand',
        name: 'Vertical backhand',
        description: 'En backhand kastet næsten lodret opad. Bruges ekstremt sjældent, men nyttig når man skal op og ned hurtigt. Mindre kraft, mere kontrol i trange vertikale åbninger.',
      },
    ],
  },
  {
    id: 'putt_approach',
    name: 'Putt & Approach',
    styles: [
      {
        id: 'push_putt',
        name: 'Push putt',
        description: 'Armen bevæges mere som et stempel end et kast. Meget lige flight og lav glide, men stabil i vind. God til korte putts, hvor man vil minimere chance for blow-by.',
      },
      {
        id: 'spin_putt',
        name: 'Spin putt',
        description: 'Højere fart og mere rotation fra håndled og underarm. Kan holde en bestemt linje længere og gennem vind. Kræver mere timing men giver mere range.',
      },
      {
        id: 'hybrid_putt',
        name: 'Hybrid putt',
        description: 'Blanding af push og spin. Giver lidt ekstra power uden at miste stabilitet. Bruges af mange moderne puttere som en fleksibel standard.',
      },
      {
        id: 'turbo_putt',
        name: 'Turbo putt',
        description: 'Disc holdes over hovedet og skydes frem som en dart. Går højt og nedad med god præcision på korte afstande. Bruges når man står bag buske eller høje forhindringer.',
      },
      {
        id: 'forehand_approach',
        name: 'Forehand approach',
        description: 'Kort forehand-kast med underskruet kraft. Meget stabil og præcis i vind. Brugt af næsten alle proer til 50–90 meters kontrollerede kast.',
      },
      {
        id: 'backhand_approach',
        name: 'Backhand approach',
        description: 'Kort backhand med moderat kraft og meget kontrol. Bruges til at lande blødt eller holde en bestemt release-vinkel. Bedst til hyzer og flade landing-shots.',
      },
      {
        id: 'float_shot',
        name: 'Float-shot (soft stall)',
        description: 'Let kast med høj release-vinkel og lav power. Glider højt og taber hastighed nær kurven. Sikkert valg når man vil undgå lange skips og overstød.',
      },
    ],
  },
  {
    id: 'utility',
    name: 'Utility / Trick',
    styles: [
      {
        id: 'scoober',
        name: 'Scoober',
        description: 'Lille overhead-approach hvor discen er vinklet på kryds. Flyver fladt, lavt og stabilt ind i små vinduer. Især brugt i tight skov og scramble-situationen.',
      },
      {
        id: 'pancake',
        name: 'Pancake',
        description: 'Thumber-lignende kast, der lander fladt for at stoppe øjeblikkeligt. Bruges når man vil undgå skip og rul. God i tætte områder, hvor kontrol > distance.',
      },
    ],
  },
];

export const RELEASE_ANGLES = [
  { id: 'anhyzer', name: 'Anhyzer' },
  { id: 'flat', name: 'Flat' },
  { id: 'hyzer', name: 'Hyzer' },
] as const;

export function getThrowStyleById(styleId: string): ThrowStyle | null {
  for (const category of THROW_STYLE_CATEGORIES) {
    const style = category.styles.find((s) => s.id === styleId);
    if (style) return style;
  }
  return null;
}

export function getThrowStyleCategoryById(categoryId: string): ThrowStyleCategory | null {
  return THROW_STYLE_CATEGORIES.find((c) => c.id === categoryId) || null;
}
