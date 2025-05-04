/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { enable, questOrderDebug } from "../config/config.json";
import UpdateQuestOrder from "./Changers/UpdateQuestOrder";
import { getNewMongoId, saveToFile } from "./Utils/utils";
import GlobalChanges from "./Changers/GlobalChanges";

class QuestingReimagined implements IPostSptLoadMod {
  postSptLoad(container: DependencyContainer): void {
    if (enable) {
      try {
        questOrderDebug && console.log("\n[QuestingReimagined] Starting up");

        if (enable) UpdateQuestOrder(container);
        if (enable) GlobalChanges(container);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

module.exports = { mod: new QuestingReimagined() };
