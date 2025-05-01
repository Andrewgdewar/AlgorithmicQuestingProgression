// Determines which quests unlock fences first quest
export const fenceStartRequiredQuests = [
  "Shortage",
  // "The Punisher - Part 6",
  // "Painkiller",
  // "Chemical - Part 4",
  // "Eagle Eye",
  // "Farming - Part 4",
  // "The Key to Success",
  // "Nostalgia",
];

// Key value pair of quest names and availableForFinishIds to loop over in order to delete a set number of tasks
export const ReduceReqList = {
  "Is This a Reference": [2, 8],
  "Small Business - Part 1": [2],
  Collector: [2, 15],
  Escort: [2, 2],
  "Beneath The Streets": [2],
  "Pyramid Scheme": [2, 5],
};

// TODO: run test to see if the trader unlocks are correct
// This is a list of quests that unlock traders, if empty, the trader is unlocked by default.
export const TraderUnlockQuests = {
  PRAPOR: "",
  THERAPIST: "",
  SKIER: "Shortage",
  PEACEKEEPER: "Background Check",
  MECHANIC: "Make ULTRA Great Again",
  RAGMAN: "Debut",
  JAEGER: "Shootout Picnic",
  // FENCE: "Acquaintance", // fence is always unlocked, but the his first quest is set via above fenceStartRequiredQuests
  // LIGHTHOUSEKEEPER: "", // This trader is unlocked by finishing Network Provider - Part 2
  REF: "Tigr Safari",
  // BTR: "", // This trader is unlocked by finishing "Shipping Delay - Part 1"
};

export const TraderQuestProgressionQuantity = {
  PRAPOR: 2,
  THERAPIST: 2,
  SKIER: 2,
  PEACEKEEPER: 2,
  MECHANIC: 2,
  RAGMAN: 2,
  JAEGER: 2,
  FENCE: 1,
  LIGHTHOUSEKEEPER: 1,
  REF: 1,
  BTR: 1, // This trader is unlocked by finishing "Shipping Delay - Part 1"
};

// These are deprecated quests, or problematic
export const removeList = [
  "This Is My Party",
  "A Healthy Alternative",
  "Kind of Sabotage",
  "The Stylish One",
  "Important Patient",
  "Bloodhounds",
  "Hint",
  "Failed Setup",
  "Hustle",
  "Tourists",
  "Cocktail Tasting",
  "Overseas Trust - Part 1",
  "Overseas Trust - Part 2",
  "The Punisher Harvest",
  "The Tarkov Mystery",
  "To Great Heights - Part 1",
  "To Great Heights - Part 2",
  "To Great Heights - Part 3",
  "A Key to Salvation",
  "Import ontrol",
  "Whats Your Evidence",
  "Caught Red-Handed",
  "Gunsmith - Special Order",
  "Gun Connoisseur",
  "Customer Communication",
  "Supply and Demand",
  "Into the Inferno",
  "In and Out",
  "Ours by Right",
  "Provide Cover",
  "Cream of the Crop",
  "Before the Rain",
  "Night of The Cult",
  "The Graven Image",
  "Dont Believe Your Eyes",
  "Dirty Blood",
  "Burn It Down",
  "The Root Cause",
  "Matter of Technique",
  "Find the Source",
  "Gloves Off",
  "Sample IV - A New Hope",
  "Darkest Hour Is Just Before Dawn",
  "Radical Treatment",
  "Forgotten Oaths",
  "Global Threat",
  "Watch the Watcher",
  "Not a Step Back",
  "Pressured by Circumstances",
  "Conservation Area",
  "Contagious Beast",
];
