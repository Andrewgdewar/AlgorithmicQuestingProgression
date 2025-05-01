import { DependencyContainer } from "tsyringe";
import config from "../../config/config.json";
import {
  deleteReqList,
  adjustReqsList,
  TraderUnlockQuests,
  TraderQuestProgressionQuantity,
} from "../../config/QuestConfigs/questAdjustments.json";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { Traders } from "@spt/models/enums/Traders";
import { fenceStartRequiredQuests, removeList } from "./Constants";
import {
  AvailableForStartLevelRequirement,
  AvailableForStartQuestRequirement,
  IterateOverArrayAddingQuestReqs,
  traderUnlockSuccessByID,
} from "./transformMethods";
import MainQuests from "../Data/MainQuests.json";
import { generateMongoIdFromSeed, saveToFile } from "../Utils/utils";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IConfig } from "@spt/models/eft/common/IGlobals";

export default function UpdateQuestOrder(
  container: DependencyContainer
): undefined {
  const configServer = container.resolve<ConfigServer>("ConfigServer");
  const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  const tables = databaseServer.getTables();
  const items = tables.templates.items;
  const quests = tables.templates.quests;
  const traders = tables.traders;
  const traderQuestList = [];

  const questconfig = configServer.getConfig<IQuestConfig>(ConfigTypes.QUEST);

  questconfig.bearOnlyQuests = [];
  questconfig.usecOnlyQuests = [];

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
  const seen = new Set();
  Object.keys(quests)
    .reverse()
    .forEach((questId) => {
      if (seen.has(questId)) {
        return;
      }
      seen.add(questMapper[quests[questId].QuestName]);
      questMapper[quests[questId].QuestName] = questId;
    });

  const usedQuestIds = traderQuestList.map(
    (questName) =>
      questMapper[questName] || console.log(`!!! ${questName} not found !!!`)
  );

  const usedQuestIdsSet = new Set(usedQuestIds);
  const deleteReqsSet = new Set(Object.keys(deleteReqList));
  const adjustReqsSet = new Set(Object.keys(adjustReqsList));

  Object.keys(quests).forEach((questId) => {
    const quest = quests[questId];
    // Set quests not in the list to be infinite level requirement
    if (!usedQuestIdsSet.has(questId)) {
      quest.conditions.AvailableForStart = [
        AvailableForStartLevelRequirement(99, questId + "remove"),
      ];
    } else {
      // Zero out available for start
      quest.conditions.AvailableForStart = [];

      // filter out cross-quest finish conditions
      quest.conditions.AvailableForFinish =
        quest.conditions.AvailableForFinish.filter((condition) => {
          if (condition.conditionType === "Quest") {
            return false;
          }
          return true;
        });

      // filter out quest fail conditions
      quest.conditions.Fail = quest.conditions.Fail.filter((condition) => {
        if (condition.conditionType === "Quest") {
          return false;
        }
        return true;
      });

      // Check if questname is in the remove list for AvailableForFinish
      if (deleteReqsSet.has(quest.QuestName)) {
        const key = Object.keys(deleteReqList[quest.QuestName])[0];
        const values = new Set(deleteReqList[quest.QuestName][key]);
        console.log(
          "\nBefore",
          quest.QuestName,
          quest.conditions.AvailableForFinish.length
        );
        quest.conditions.AvailableForFinish =
          quest.conditions.AvailableForFinish.filter(
            (req) => !values.has(req[key])
          );

        console.log("after", quest.conditions.AvailableForFinish.length);
      }

      if (adjustReqsSet.has(quest.QuestName)) {
        quest.conditions.AvailableForFinish.forEach(({ id }, index) => {
          if (adjustReqsList[quest.QuestName][id]) {
            quest.conditions.AvailableForFinish[index] = {
              ...quest.conditions.AvailableForFinish[index],
              ...adjustReqsList[quest.QuestName][id],
            };
          }
        });
      }
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

  // Add all quest unlock requirements
  Object.keys(MainQuests).forEach((trader) => {
    // console.log(trader);
    const chainList = [];
    const mainList = MainQuests[trader].map((quest) => {
      if (typeof quest === "object") {
        chainList.push(quest);
        return quest[0];
      } else if (typeof quest === "string") {
        return quest;
      }
    });

    IterateOverArrayAddingQuestReqs(
      quests,
      mainList.map((qName) => questMapper[qName]),
      TraderQuestProgressionQuantity[trader]
    );

    chainList.forEach((questList: string[]) => {
      IterateOverArrayAddingQuestReqs(
        quests,
        questList.map((qName: string) => questMapper[qName]),
        1
      );
    });
  });

  saveToFile(quests, "./quests.json");

  console.log("\n[QuestingReimagined] Changes Complete");
}
