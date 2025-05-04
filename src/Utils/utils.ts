import { IQuestCondition } from "@spt/models/eft/common/tables/IQuest";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import config from "../../config/config.json";
import { createHash } from "crypto";

export const saveToFile = (data, filePath) => {
  var fs = require("fs");
  let dir = __dirname;
  let dirArray = dir.split("\\");
  const directory = `${dirArray[dirArray.length - 5]}/${
    dirArray[dirArray.length - 4]
  }/${dirArray[dirArray.length - 3]}/${dirArray[dirArray.length - 2]}/`;
  fs.writeFile(
    directory + filePath,
    JSON.stringify(data, null, 4),
    function (err) {
      if (err) throw err;
    }
  );
};

export const generateMongoIdFromSeed = (seed: string): string => {
  if (!seed) {
    throw new Error("Seed is required to generate a MongoID.");
  }

  // Create a hash from the seed
  const hash = createHash("md5").update(seed).digest("hex");

  // MongoDB mongoID is 24 characters long, so truncate or pad with zeros
  const mongoID = hash.slice(0, 24).padEnd(24, "0");

  return mongoID;
};

const defaultKillQuest = (index: number): IQuestCondition => ({
  completeInSeconds: 0,
  conditionType: "CounterCreator",
  counter: {
    conditions: [
      {
        bodyPart: [],
        compareMethod: ">=",
        conditionType: "Kills",
        daytime: {
          from: 0,
          to: 0,
        },
        distance: {
          compareMethod: ">=",
          value: 0,
        },
        dynamicLocale: false,
        enemyEquipmentExclusive: [],
        enemyEquipmentInclusive: [],
        enemyHealthEffects: [],
        id: generateMongoIdFromSeed("conditionId" + index),
        resetOnSessionEnd: false,
        savageRole: [],
        target: "Any",
        value: 1,
        weapon: [],
        weaponCaliber: [],
        weaponModsExclusive: [],
        weaponModsInclusive: [],
      },
    ],
    id: generateMongoIdFromSeed("counterId" + index),
  },
  doNotResetIfCounterCompleted: false,
  dynamicLocale: false,
  globalQuestCounterId: "",
  id: generateMongoIdFromSeed("questId" + index),
  index: 0,
  isNecessary: false,
  isResetOnConditionFailed: false,
  oneSessionOnly: false,
  parentId: "",
  type: "Elimination",
  value: 5,
  visibilityConditions: [],
});

export const cloneDeep = (objectToClone: any) =>
  JSON.parse(JSON.stringify(objectToClone));

export const getKillQuestForGunsmith = (count: number): IQuestCondition => {
  const totalBots = Math.round(
    config.baseKillCountQuantity + count * config.killCountModifier
  );

  const killQuest: IQuestCondition = defaultKillQuest(count);

  killQuest.value = totalBots;
  return killQuest;
};

const numbers = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);

export const getNumbersFromName = (str: string) => {
  if (str === "Gunsmith - Old Friends Request") return 27;
  return Number(
    str
      .split("")
      .filter((val) => numbers.has(val))
      .join("")
  );
};
