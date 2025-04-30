import { IReward } from "@spt/models/eft/common/tables/IReward";
import { RewardType } from "@spt/models/enums/RewardType";
import { generateMongoIdFromSeed } from "../Utils/utils";
import { IQuestCondition } from "@spt/models/eft/common/tables/IQuest";

export const traderUnlockSuccessByID = (traderID: string): IReward => ({
  availableInGameEditions: [],
  id: generateMongoIdFromSeed(traderID), // Needs custom id
  index: 0,
  target: traderID, // Set the trader ID here
  type: RewardType.TRADER_UNLOCK,
  unknown: false,
});

export const AvailableForStartLevelRequirement = (
  level: number,
  seed: string
) => ({
  compareMethod: ">=",
  conditionType: "Level",
  dynamicLocale: false,
  globalQuestCounterId: "",
  id: generateMongoIdFromSeed(seed),
  index: 1,
  parentId: "",
  value: level,
  visibilityConditions: [],
});

export const AvailableForStartQuestRequirement = (
  questId: string,
  seed: string
): IQuestCondition => ({
  availableAfter: 0,
  conditionType: "Quest",
  dispersion: 0,
  dynamicLocale: false,
  globalQuestCounterId: "",
  id: generateMongoIdFromSeed(questId + seed),
  index: 0,
  parentId: "",
  status: [4],
  target: questId,
  visibilityConditions: [],
});
