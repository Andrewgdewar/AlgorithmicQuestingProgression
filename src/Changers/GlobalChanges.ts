import { DependencyContainer } from "tsyringe";
import config from "../../config/config.json";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { Traders } from "@spt/models/enums/Traders";
import { saveToFile } from "../Utils/utils";
import traderQuests from "../refDBS/traderQuests.json";
import { IQuest } from "@spt/models/eft/common/tables/IQuest";
import { removeList } from "./Constants";

export default function GlobalChanges(
  container: DependencyContainer
): undefined {
  const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
  const tables = databaseServer.getTables();
  const items = tables.templates.items;
  const quests = tables.templates.quests;
  const traders = tables.traders;

  const { languages, global } = tables.locales;

  const invertedTraders = {};

  Object.keys(Traders).forEach((name) => {
    invertedTraders[Traders[name]] = name;
  });

  // const removeSet = new Set(removeList);

  // const newTraderQuests = { ...traderQuests };

  // for (const trader in newTraderQuests) {
  //   newTraderQuests[trader] = newTraderQuests[trader].filter((quest) => {
  //     if (removeSet.has(quest)) {
  //       console.log(`Removing ${quest} from ${trader}`);
  //       return false;
  //     }
  //     return true;
  //   });
  // }

  // saveToFile(newTraderQuests, "refDBS/traderQuestsAfterRemoval.json");

  // const traderQuestObject: Record<string, IQuest> = {};
  // //'Level', 'Quest', 'TraderLoyalty', 'TraderStanding'

  // const missedQuests = [];
  // const traderList = [];

  // for (const trader in traderQuests) {
  //   traderList.push(...traderQuests[trader]);
  // }

  // Object.keys(quests).forEach((questId) => {
  //   const quest = quests[questId];
  //   const trader = invertedTraders[quest.traderId];

  //   traderQuestObject[quest.QuestName] = quest;
  // });

  // // const broken = {};
  // Object.keys(traderQuestObject).forEach((quest) => {
  //   if (traderQuestObject[quest].gameModes) delete traderQuestObject[quest];
  // });

  // const keep = [
  //   "Compensation for Damage - Trust",
  //   "Compensation for Damage - Wager",
  //   "Compensation for Damage - Barkeep",
  //   "Compensation for Damage - Collection",
  //   "Easy Money - Part 2",
  //   "Balancing - Part 1",
  //   "Balancing - Part 2",
  //   "Surprise",
  //   "Create a Distraction - Part 1",
  //   "Create a Distraction - Part 2",
  // ];
  // console.log(Object.keys(traderQuestObject));

  // saveToFile(traderQuestObject, "refDBS/missed.json");
  // const adjusted = { ...traderQuests };

  // for (const trader in adjusted) {
  //   adjusted[trader] = adjusted[trader].filter((quest) => {
  //     if (!(traderQuestObject[trader].has(quest) && questNames.has(quest))) {
  //       console.log(quest);
  //       return false;
  //     }
  //     return true;
  //   });
  // }

  // for (const key in traders) {
  //   const trader = traders[key];
  //   trader.base.unlockedByDefault = true;
  //   // console.log(invertedTraders[key]);
  // }

  // saveToFile(traderQuestObject, "refDBS/questList.json");
  // QuestId > for onStartrewards > questassort.json > key:value assortId:questId

  config.debug && console.log("QuestingReimagined - Changes Complete");
}
