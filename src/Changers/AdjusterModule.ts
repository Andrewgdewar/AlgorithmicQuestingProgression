import { DependencyContainer } from "tsyringe";
import config from "../../config/config.json";
import localeConfig from "../../config/localeConfig.json";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import {
  generateMongoIdFromSeed,
  getKillQuestForGunsmith,
  getNumbersFromName,
  saveToFile,
} from "../Utils/utils";
import { IQuest } from "@spt/models/eft/common/tables/IQuest";
import { RewardType } from "@spt/models/enums/RewardType";
import { QuestTypeEnum } from "@spt/models/enums/QuestTypeEnum";

export default function AdjusterModule(
  container: DependencyContainer
): undefined {
  const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  const tables = databaseServer.getTables();
  const items = tables.templates.items;
  const quests = tables.templates.quests as unknown as Record<string, IQuest>;

  const { languages, global } = tables.locales;
  // const gunsmithQuests = [];
  // const gunsmithQuestsAfter = [];
  // let gunsmithCount = 0;
  Object.keys(quests).forEach((questId) => {
    const currentQuest = quests[questId];
    let currentQuestLevel = 1;

    if (currentQuest?.conditions?.AvailableForFinish?.length) {
      currentQuest.conditions.AvailableForStart.forEach((req, key) => {
        //Adjust level req
        if (req.conditionType === "Level") {
          currentQuestLevel = Number(req.value) || 1;

          currentQuest.conditions.AvailableForStart[key].value =
            Math.round(Number(req.value) * config.questLevelUnlockModifier) ||
            1;
        }
      });
    }

    if (currentQuest?.conditions?.AvailableForFinish?.length) {
      currentQuest.conditions.AvailableForFinish.forEach((condition, key) => {
        switch (condition.conditionType) {
          case "LeaveItemAtLocation":
          case "PlaceBeacon":
            if (config.plantTimeModifier === 1) break;
            currentQuest.conditions.AvailableForFinish[key].plantTime =
              Math.round(
                currentQuest.conditions.AvailableForFinish[key].plantTime *
                  config.plantTimeModifier
              ) || 1;
            break;
          case "CounterCreator":
            if (
              Number(condition.value) === 1 ||
              config.killQuestCountModifier === 1
            ) {
              break;
            }
            currentQuest.conditions.AvailableForFinish[key].value =
              Math.round(
                Number(currentQuest.conditions.AvailableForFinish[key].value) *
                  config.killQuestCountModifier
              ) || 1;
          case "HandoverItem":
          case "FindItem":
            if (config.findItemQuestModifier === 1) break;
            const target = (
              currentQuest.conditions.AvailableForFinish[key].target?.[0]
                ? currentQuest.conditions.AvailableForFinish[key].target[0]
                : currentQuest.conditions.AvailableForFinish[key].target
            ) as string;

            if (items[target]?._props?.QuestItem) break;

            currentQuest.conditions.AvailableForFinish[key].value =
              Math.round(
                Number(currentQuest.conditions.AvailableForFinish[key].value) *
                  config.findItemQuestModifier
              ) || 1;
            break;
          default:
            break;
        }
      });
    }
    if (
      config.replaceGunsmith &&
      currentQuest.type === QuestTypeEnum.WEAPON_ASSEMBLY
    ) {
      // gunsmithQuests.push(cloneDeep(currentQuest));
      // gunsmithCount++;
      const languageList = Object.keys(languages);
      currentQuest.type = QuestTypeEnum.ELIMINATION;

      const currentQuestNumber = getNumbersFromName(currentQuest.QuestName);

      const killQuest = getKillQuestForGunsmith(currentQuestNumber);

      const taskId = killQuest.id;
      const descriptionId = generateMongoIdFromSeed(taskId + "descriptionId");

      currentQuest.description = descriptionId;

      if (
        typeof currentQuest.conditions.AvailableForFinish[0].target === "string"
      ) {
        killQuest.counter.conditions[0].weapon = [
          currentQuest.conditions.AvailableForFinish[0].target,
        ];

        languageList.forEach((lang) => {
          const locale = (localeConfig?.[lang] || localeConfig.en) as {
            description: string;
            task: string;
          };
          global[lang][descriptionId] = locale.description.replace(
            "<weapon>",
            global[lang][
              currentQuest.conditions.AvailableForFinish[0].target as string
            ]
          );
          global[lang][taskId] = locale.task
            .replace(
              "<weapon>",
              global[lang][
                currentQuest.conditions.AvailableForFinish[0].target +
                  " ShortName"
              ]
            )
            .replace("<number>", killQuest.value + "");
          if (config.adjusterDebug && lang === "en") {
            console.log(global[lang][descriptionId]);
            console.log(global[lang][taskId]);
          }
        });
      } else {
        killQuest.counter.conditions[0].weapon =
          currentQuest.conditions.AvailableForFinish[0].target;
        languageList.forEach((lang) => {
          const locale = (localeConfig?.[lang] || localeConfig.en) as {
            description: string;
            task: string;
          };

          global[lang][descriptionId] = locale.description.replace(
            "<weapon>",
            global[lang][
              currentQuest.conditions.AvailableForFinish[0].target[0] + " Name"
            ]
          );
          global[lang][taskId] = locale.task
            .replace(
              "<weapon>",
              global[lang][
                currentQuest.conditions.AvailableForFinish[0].target[0] +
                  " ShortName"
              ]
            )
            .replace("<number>", killQuest.value + "");
          if (config.adjusterDebug && lang === "en") {
            console.log("Gunsmith number", currentQuestNumber);
            console.log(global[lang][descriptionId]);
            console.log(global[lang][taskId]);
          }
        });
      }

      currentQuest.conditions.AvailableForFinish = [killQuest];
      // gunsmithQuestsAfter.push(currentQuest);
    }

    if (currentQuest?.rewards?.Success?.length) {
      currentQuest.rewards.Success.forEach((item, key) => {
        switch (item.type) {
          case RewardType.EXPERIENCE:
            if (config.questExperienceModifier === 1) break;
            if (item?.value && Number(item.value) > 0)
              currentQuest.rewards.Success[key] = {
                ...item,
                value:
                  Math.round(
                    Number(item.value) * config.questExperienceModifier
                  ) || 1,
              };
            break;

          case RewardType.ITEM:
            if (config.itemRewardModifier === 1) break;

            switch (true) {
              case item.items?.length > 1 || !item.items?.[0]:
                break;
              case Number(item.value) === 1:
                break;
              default:
                item.value =
                  Math.round(Number(item.value) * config.itemRewardModifier) ||
                  1;

                item.items[0].upd.StackObjectsCount =
                  Math.round(
                    Number(item.items[0].upd.StackObjectsCount) *
                      config.itemRewardModifier
                  ) || 1;
                break;
            }
            break;
          case RewardType.TRADER_STANDING:
            if (config.traderStandingRewardModifier === 1) {
              break;
            }
            // console.log("\n" + item.value + " -");
            item.value =
              Math.round(
                (Number(item.value) / 0.05) *
                  config.traderStandingRewardModifier *
                  0.05 *
                  100
              ) / 100;
            // console.log(item.value);
            break;

          default:
            break;
        }
      });
    }
  }); //67a8d5cf7aa8a5f2769bf66f
  // saveToFile(quests, "refDBS/quests.json");
}
