import { IReward } from "@spt/models/eft/common/tables/IReward";
import { RewardType } from "@spt/models/enums/RewardType";
import { generateMongoIdFromSeed } from "../Utils/utils";
import { IQuest, IQuestCondition } from "@spt/models/eft/common/tables/IQuest";

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

export const IterateOverArrayAddingQuestReqs = (
  quests: Record<string, IQuest>,
  questIdList: string[],
  quantity: number = 1
) => {
  const sets: string[][] = [];
  for (let index = 0; index < questIdList.length; index += quantity) {
    const currentIdsToAdd = questIdList.slice(index, index + quantity);
    sets.push(currentIdsToAdd);
  }

  for (let index = 1; index < sets.length; index++) {
    const prevSets = sets[index - 1];
    const currentSet = sets[index];

    currentSet.forEach((questId) => {
      const quest = quests[questId];
      if (quest) {
        prevSets.forEach((prevId: string) => {
          quest.conditions.AvailableForStart.push(
            AvailableForStartQuestRequirement(prevId, prevId + "prevQuest")
          );
        });
      } else {
        console.warn("Quest not found: ", questId);
      }
    });

    // console.log("adding ", prevSets, " to ", currentSet);
  }
  // console.log(sets);
  // prevQuestIds = currentIdsToAdd;

  // const prevQuestId = questIdList[index];
  // const nextQuestId = questIdList[index + 1];
  // const quest = quests[nextQuestId];
  // if (quest) {
  //   quest.conditions.AvailableForStart.push(
  //     AvailableForStartQuestRequirement(
  //       prevQuestId,
  //       prevQuestId + "prevQuest"
  //     )
  //   );
  // }
};
