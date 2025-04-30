import { DependencyContainer } from "tsyringe";
import config from "../../config/config.json";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { Traders } from "@spt/models/enums/Traders";
import {
  fenceStartRequiredQuests,
  removeList,
  TraderUnlockQuests,
} from "./Constants";
import {
  AvailableForStartLevelRequirement,
  AvailableForStartQuestRequirement,
  traderUnlockSuccessByID,
} from "./transformMethods";
import MainQuests from "../Data/MainQuests.json";
import { saveToFile } from "../Utils/utils";

export default function UpdateQuestOrder(
  container: DependencyContainer
): undefined {
  const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  const tables = databaseServer.getTables();
  const items = tables.templates.items;
  const quests = tables.templates.quests;
  const traders = tables.traders;
  const traderQuestList = [];
  const removeListSet = new Set(removeList);

  // Check and remove quests from the trader quest list if they are in the remove list
  Object.keys(MainQuests).forEach((trader) => {
    MainQuests[trader].forEach((questName) => {
      if (typeof questName === "object") {
        questName.forEach((questNameInArray) => {
          if (removeListSet.has(questNameInArray)) {
            console.log(`!!! Removing ${questNameInArray} from ${trader} !!!`);
            delete quests[questNameInArray];
          } else {
            traderQuestList.push(questNameInArray);
          }
        });
      } else if (typeof questName === "string") {
        if (removeListSet.has(questName)) {
          console.log(`!!! Removing ${questName} from ${trader} !!!`);
          delete quests[questName];
        } else {
          traderQuestList.push(questName);
        }
      }
    });
  });

  //Create a set of quests that are usable
  const usableQuestList = new Set(traderQuestList);

  // saveToFile(traderQuestList, "./traderQuestList.json");
  // Create a reverse mapping of traders to their names
  const traderMapper = {};
  Object.keys(Traders).forEach((name) => {
    traderMapper[Traders[name]] = name;
  });

  // Create a mapping of the questnames to their IDs
  const questMapper = {};
  Object.keys(quests).forEach((questId) => {
    questMapper[quests[questId].QuestName] = questId;
  });

  Object.keys(quests).forEach((questId) => {
    const quest = quests[questId];
    // Set quests not in the list to be infinite level requirement
    if (!usableQuestList.has(quest.QuestName)) {
      quest.conditions.AvailableForStart = [
        AvailableForStartLevelRequirement(99, questId + "remove"),
      ];
    } else {
      // Zero out available for start
      quest.conditions.AvailableForStart = [];

      // filter out other quest requirements for finishing
      quest.conditions.AvailableForFinish =
        quest.conditions.AvailableForFinish.filter((condition) => {
          if (condition.conditionType === "Quest") {
            return false;
          }
          return true;
        });

      // filter out other quest requirements for failing
      quest.conditions.Fail = quest.conditions.Fail.filter((condition) => {
        if (condition.conditionType === "Quest") {
          return false;
        }
        return true;
      });
    }
  });

  if (config.questOrderDebug) {
    console.log("\nTrader unlock quests: ");
  }
  // Setup initial traders for unlock
  Object.keys(TraderUnlockQuests).forEach((traderName) => {
    const questNameForUnlock = TraderUnlockQuests[traderName];
    const traderId = Traders[traderName];

    if (questNameForUnlock) {
      traders[traderId].base.unlockedByDefault = false;
      const questId = questMapper[questNameForUnlock];

      if (config.questOrderDebug) {
        console.log(
          `${traderName} is unlocked by completing: ${questNameForUnlock}`
        );
      }

      quests[questId].rewards.Success.push(traderUnlockSuccessByID(traderId));
    } else {
      if (config.questOrderDebug) {
        console.log(`${traderName} is unlocked by default`);
      }
      traders[traderId].base.unlockedByDefault = true;
    }
  });

  const fencesFirstQuestName =
    typeof MainQuests.FENCE[0] === "string"
      ? MainQuests.FENCE[0]
      : MainQuests.FENCE[0][0];

  const fenceFirstQuestId = questMapper[fencesFirstQuestName];
  const fenceFirstQuest = quests[fenceFirstQuestId];

  if (!fenceFirstQuest) {
    console.log(
      `!!! fences first quest ${quests[fenceFirstQuestId]} not found !!!`
    );
  }

  config.questOrderDebug &&
    console.log("\nQuests required for fence/kappa unlock: ");

  // Add required quests for unlocking fence
  fenceStartRequiredQuests.forEach((questName) => {
    config.questOrderDebug && console.log(questName);
    const questId = questMapper[questName];
    if (!questId) {
      console.log(`!!! fence required quest ${questName} not found !!!`);
      return;
    }
    if (removeListSet.has(questName)) {
      console.log(`!!! fence required quest ${questName} removed !!!`);
      return;
    }
    fenceFirstQuest.conditions.AvailableForStart.push(
      AvailableForStartQuestRequirement(questId, questId + "fence")
    );
  });

  console.log("\n[QuestingReimagined] Changes Complete");
}
