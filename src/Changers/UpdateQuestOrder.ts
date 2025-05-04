import { DependencyContainer } from "tsyringe";
import config from "../../config/config.json";
import {
  deleteReqList,
  adjustReqsList,
  TraderUnlockQuests,
  TraderQuestProgressionQuantity,
  FenceStartRequiredQuests,
  refMoneyMultiplier,
  manualAssortReassignment,
} from "../../config/QuestConfigs/questAdjustments.json";
import ammoLevelUnlocks from "../../config/QuestConfigs/ammoLevelUnlocks.json";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import { Money } from "@spt/models/enums/Money";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { Traders } from "@spt/models/enums/Traders";
import { removeList } from "./Constants";
import {
  assignQuestNamesWithWeight,
  AvailableForStartLevelRequirement,
  AvailableForStartQuestRequirement,
  convertMoney,
  IterateOverArrayAddingQuestReqs,
  MoneyIDConverter,
  TraderCurrencies,
  traderUnlockSuccessByID,
} from "./transformMethods";
import MainQuests from "../../config/QuestConfigs/MainQuests.json";
import { cloneDeep, generateMongoIdFromSeed, saveToFile } from "../Utils/utils";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { RewardType } from "@spt/models/enums/RewardType";
import { IReward } from "@spt/models/eft/common/tables/IReward";

export default function UpdateQuestOrder(
  container: DependencyContainer
): undefined {
  const configServer = container.resolve<ConfigServer>("ConfigServer");
  const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  const tables = databaseServer.getTables();
  const items = tables.templates.items;
  const quests = tables.templates.quests;
  const traders = tables.traders;

  const questconfig = configServer.getConfig<IQuestConfig>(ConfigTypes.QUEST);

  questconfig.bearOnlyQuests = [];
  questconfig.usecOnlyQuests = [];

  if (config.disableDailies) {
    questconfig.repeatableQuests.forEach((_, index) => {
      questconfig.repeatableQuests[index].numQuests = 0;
      questconfig.repeatableQuests[index].traderWhitelist = [];
    });
  }

  const usedAssortQuestnames = new Set(
    manualAssortReassignment.map(({ QuestName }) => QuestName)
  );
  const usedAssortKeys = new Set(
    manualAssortReassignment.map(({ key }) => key)
  );

  const removeListSet = new Set(removeList);

  const traderQuestList = [];
  const flattenedTraderList = {};
  // Check and remove quests from the trader quest list if they are in the remove list
  Object.keys(MainQuests).forEach((trader) => {
    flattenedTraderList[trader] = [];
    MainQuests[trader].forEach((questName) => {
      if (typeof questName === "object") {
        questName.forEach((questNameInArray) => {
          if (removeListSet.has(questNameInArray)) {
            console.log(`!!! Removing ${questNameInArray} from ${trader} !!!`);
            delete quests[questNameInArray];
          } else {
            flattenedTraderList[trader].push(questNameInArray);
            traderQuestList.push(questNameInArray);
          }
        });
      } else if (typeof questName === "string") {
        if (removeListSet.has(questName)) {
          console.log(`!!! Removing ${questName} from ${trader} !!!`);
          delete quests[questName];
        } else {
          flattenedTraderList[trader].push(questName);
          traderQuestList.push(questName);
        }
      }
    });
  });

  //Create a set of quests that are usable

  // Create a reverse mapping of traders to their names
  const traderMapper = {};
  Object.keys(Traders).forEach((name) => {
    traderMapper[Traders[name]] = name;
  });

  // Create a mapping of the questnames to their IDs
  const questMapper = {};
  // const assortMapper = {};
  const seen = new Set();
  Object.keys(quests)
    .reverse()
    .forEach((questId) => {
      // const assorts = quests[questId].rewards.Success.filter(
      //   (req) => req.type === RewardType.ASSORTMENT_UNLOCK
      // );
      // if (assorts.length) {
      //   assortMapper[questId] = assorts;
      // }

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

      // Remove quest failures
      quest.rewards.Fail = [];
      quest.restartable = true;

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
        // console.log(
        //   "\nBefore",
        //   quest.QuestName,
        //   quest.conditions.AvailableForFinish.length
        // );
        quest.conditions.AvailableForFinish =
          quest.conditions.AvailableForFinish.filter(
            (req) => !values.has(req[key])
          );

        // console.log("after", quest.conditions.AvailableForFinish.length);
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
  FenceStartRequiredQuests.forEach((questName) => {
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

  const reward = {};
  Object.keys(MainQuests).forEach((trader) => {
    reward[trader] = { experience: [], money: [], standing: [] };

    flattenedTraderList[trader].forEach((questName) => {
      const questId = questMapper[questName];
      const quest = quests[questId];

      if (!quest) return questName;

      let experience: Partial<IReward> = {
          availableInGameEditions: [],
          id: generateMongoIdFromSeed(questName + "experience"),
          index: 0,
          type: RewardType.EXPERIENCE,
          unknown: false,
          value: 1200,
        },
        standing: Partial<IReward> = {
          availableInGameEditions: [],
          id: generateMongoIdFromSeed(questName + "standing"),
          index: 0,
          target: quest.traderId,
          type: RewardType.TRADER_STANDING,
          unknown: false,
          value: 0.01,
        };

      const traderCurrency = TraderCurrencies[quest.traderId];
      quest.rewards.Success = quest.rewards.Success.filter((rew) => {
        switch (true) {
          case (Object.values(Money) as string[]).includes(
            rew?.items?.[0]?._tpl
          ):
            const moneyType = rew?.items?.[0]?._tpl as Money;
            if (moneyType !== traderCurrency) {
              const newValue = convertMoney(
                Number(rew.value),
                moneyType,
                traderCurrency
              );

              // console.log(
              //   Number(rew.value),
              //   newValue,
              //   MoneyIDConverter[moneyType],
              //   ">",
              //   MoneyIDConverter[traderCurrency],
              //   trader,
              //   questName
              // );
              rew.items[0].upd.StackObjectsCount = newValue;
              rew.items[0]._tpl = traderCurrency;
              rew.value = newValue;
            }
            reward[trader].money.push(rew);
            return false;
          case rew.type === RewardType.EXPERIENCE:
            experience = rew;
            return false;
          case rew.type === RewardType.TRADER_STANDING &&
            quest.traderId === rew.target:
            standing = rew;
            return false;
          case rew.type === RewardType.TRADER_STANDING && Number(rew.value) < 0:
            // remove negative rep
            return false;
          default:
            return true;
        }
      });

      reward[trader].experience.push(experience);

      reward[trader].standing.push(standing);
    });

    reward[trader].experience = reward[trader].experience.sort(
      (a, b) => Number(a.value) - Number(b.value)
    );
    reward[trader].money = reward[trader].money.sort(
      (a, b) => Number(a.value) - Number(b.value)
    );
    reward[trader].standing = reward[trader].standing.sort(
      (a, b) => Number(a.value) - Number(b.value)
    );

    // Adjust Refs rewards as he has few quests
    if (trader === "REF") {
      reward[trader].standing = reward[trader].standing.map(
        (rew: IReward, index) => {
          // 1.20 is max this makes for 1.5 with last quest getting level
          rew.value = (index + 1) / 10;
          return rew;
        }
      );

      reward[trader].money = reward[trader].money.map((rew: IReward, index) => {
        rew.value = Number(rew.value) + index * refMoneyMultiplier;
        rew.items[0].upd.StackObjectsCount =
          Number(rew.items[0].upd.StackObjectsCount) +
          index * refMoneyMultiplier;
        return rew;
      });
    }

    // Set the rewards
    flattenedTraderList[trader].forEach((questName, index) => {
      const questId = questMapper[questName];
      const quest = quests[questId];
      if (!questId || !questId) return;

      if (reward[trader].experience[index]?.value)
        quest.rewards.Success.push(reward[trader].experience[index]);
      if (reward[trader].money[index]?.value)
        quest.rewards.Success.push(reward[trader].money[index]);
      if (reward[trader].standing[index]?.value)
        quest.rewards.Success.push(reward[trader].standing[index]);
    });

    const { assort, questassort } = traders[Traders[trader]];
    if (questassort?.success) {
      const assortDataCopy = cloneDeep(questassort.success);
      Object.keys(assortDataCopy).forEach((key) => {
        const output = {};
        const oldQuestId = assortDataCopy[key];
        output["oldQuestId"] = oldQuestId;
        output["assort"] = quests[oldQuestId].rewards.Success.find(
          (req) => req.type === RewardType.ASSORTMENT_UNLOCK
        );

        if (!output["assort"]) {
          // console.log("didn't find an assort", quests[oldQuestId].QuestName);
          return;
        }

        quests[oldQuestId].rewards.Success = quests[
          oldQuestId
        ].rewards.Success.filter((req) => req.id !== output["assort"].id);

        assortDataCopy[key] = output;
      });

      let assortData = Object.keys(assortDataCopy)
        .map((key) => {
          const tpl = assort.items.find((item) => item._id === key)?._tpl;

          // AMMO LEVEL ADJUSTMENT
          if (items[tpl]?._props?.Caliber) {
            const calibre = items[tpl]._props.Caliber;
            if (ammoLevelUnlocks[calibre]) {
              const { level, name } = ammoLevelUnlocks[calibre].find(
                ({ tpl: aTpl }) => aTpl === tpl
              );
              if (assort.loyal_level_items[key] !== level) {
                //   console.log(
                //     "reassigning",
                //     name,
                //     "from",
                //     assort.loyal_level_items[key],
                //     "to",
                //     level
                //   );
                assort.loyal_level_items[key] = level;
              }
            }
          }

          const output = {
            ...assortDataCopy[key],
            key,
            name: items[tpl]?._name,
            tpl,
            level: assort.loyal_level_items[key],
          };
          return output;
        })
        .sort((a, b) => Number(a.level) - Number(b.level));

      const manualDataToAdd = assortData
        .filter((data) => usedAssortKeys.has(data.key))
        .map((data) => {
          const { QuestName, level } = manualAssortReassignment.find(
            (item) => item.key === data.key
          );
          data["QuestName"] = QuestName;
          data.level = level;
          return data;
        });

      reward[trader]["assortData"] = assignQuestNamesWithWeight(
        flattenedTraderList[trader].filter(
          (name: string) => !usedAssortQuestnames.has(name)
        ), // Remove already assigned assorted quests
        assortData.filter(({ key }) => !usedAssortKeys.has(key))
      );

      // Add all of the manual assort items to reward[trader]["assortData"]
      reward[trader]["assortData"].push(...manualDataToAdd);

      // This reassigns all the assorts for all quests.
      reward[trader]["assortData"].forEach(({ key, QuestName }) => {
        const questId = questMapper[QuestName];
        const quest = quests[questId];
        if (!questId || !quest)
          return console.log("Problem assigning assort for ", QuestName, key);
        questassort.success[key] = questId;
      });

      reward[trader]["assortData"].forEach(({ QuestName, assort }) => {
        if (assort) {
          quests[questMapper[QuestName]].rewards.Success.push(assort);
        }
      });
    }
  });

  Object.keys(reward).forEach((trader) => {
    reward[trader] = reward[trader].assortData?.map(
      ({ key, name, tpl, level, QuestName }) => ({
        key,
        name,
        tpl,
        level,
        QuestName,
        Cost: items[
          traders[Traders[trader]].assort.barter_scheme[key][0][0]._tpl
        ]._name,
      })
    );
  });

  // Object.keys(ammo).forEach((calibre) => {
  //   ammo[calibre] = ammo[calibre].map(
  //     ({ key, name, tpl, level, QuestName, assort }) => ({
  //       key,
  //       name,
  //       tpl,
  //       level,
  //       damage: items[tpl]._props.Damage,
  //       pen: items[tpl]._props.PenetrationPower,
  //       QuestName,
  //       trader: traderMapper[assort.traderId],
  //     })
  //   );
  // });

  saveToFile(
    traders[Traders.PRAPOR].assort.loyal_level_items,
    "refDBS/loyal_level_items.json"
  );
  // saveToFile(traderQuestList, "refDBS/traderQuestList.json");
  saveToFile(reward, "refDBS/reward.json");
  // saveToFile(flattenedTraderList, "refDBS/flattenedTraderList.json");
  saveToFile(quests, "refDBS/quests.json");

  console.log("\n[QuestingReimagined] Changes Complete");
}
