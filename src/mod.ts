/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import {
  enableAdjusterModule,
  enableOverhaulModule,
  overHaulDebug,
  adjusterDebug,
} from "../config/config.json";
import OverHaulModule from "./Changers/OverHaulModule";
import AdjusterModule from "./Changers/AdjusterModule";

class AlgorithmicQuestingProgression implements IPostSptLoadMod {
  postSptLoad(container: DependencyContainer): void {
    if (enableOverhaulModule || enableAdjusterModule) {
      try {
        if (overHaulDebug || adjusterDebug)
          console.log("\n[AlgorithmicQuestingProgression] Starting up");

        if (enableOverhaulModule) OverHaulModule(container);
        if (enableAdjusterModule) AdjusterModule(container);
      } catch (error) {
        console.error(error);
      }

      console.log("[AlgorithmicQuestingProgression] Changes Complete");
    }
  }
}

module.exports = { mod: new AlgorithmicQuestingProgression() };
