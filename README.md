# **DewardianDev's QuestingReimagined**

=== INSTALL STEPS ===

1. Drag and drop this folder into the user/mods folder.
2. Update your mods/order.json so that this is last on the list.
3. Optionally change your configuration (see below configuration options).

4. ???????

5. Profit!!!!

Example order.json with recommended mods:
{
"order": [
"ServerValueModifier",
"zPOOP",
"Lua-CustomSpawnPoints",
"DewardianDev-XXXX-1.x.x",
"DewardianDev-QuestingReimagined-1.x.x"
]
}

==== Configuration Options ====

   // Turn off and on
   "enable": true,

  MODIFIERS MULTIPLY THE BASE VALUES
  1 = NO Change
  0.7 = LESS/LOWER 
  1.5 = MORE/HIGHER

  // How soon quests unlock
  "questLevelUnlockModifier": 0.7,

  // Home much experience quests give you
  "questExperienceModifier": 0.7,

  // How much trader rep you get for completing quests
  "traderStandingRewardModifier": 1,

  // How many items are received as reward (items/cash)
  "itemRewardModifier": 0.7,

  // Adjusts how many kills needed for elimination quests
  "killQuestCountModifier": 0.7,

  // Adjust how many items needed for fetch quests
  "findItemQuestModifier": 0.7,

  // Adjusts the the in-raid plant-time for placement quests
  "plantTimeModifier": 0.5,

  // Replaces gunsmith tasks with kill tasks (randomized by seed)
  "replaceGunsmith": true,
