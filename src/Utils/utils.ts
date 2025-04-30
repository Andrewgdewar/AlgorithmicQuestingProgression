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
  console.log(directory);
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

export const getNewMongoId = () => {
  const newId =
    ((new Date().getTime() / 1000) | 0).toString(16) +
    "xxxxxxxxxxxxxxxx"
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase();

  return newId;
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
        id: conditionList[index],
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
    id: counterList[index],
  },
  doNotResetIfCounterCompleted: false,
  dynamicLocale: false,
  globalQuestCounterId: "",
  id: questList[index],
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
    config.baseQuantity + count * config.countMultiplier
  );

  const killQuest: IQuestCondition = defaultKillQuest(count);

  killQuest.value = totalBots;
  return killQuest;
};

const numbers = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);

export const getNumbersFromString = (str: string) => {
  return Number(
    str
      .split("")
      .filter((val) => numbers.has(val))
      .join("")
  );
};

const conditionList = [
  "67a8d5cf026c13afe113d4f2",
  "67a8d5cfd8464312e58882fa",
  "67a8d5cf0fdc12da51eb49ed",
  "67a8d5cf72fb5c820707efd7",
  "67a8d5cffb5fda4cf9f04cad",
  "67a8d5cf3253e29c116593e6",
  "67a8d5cfb717f2a33f934c49",
  "67a8d5cf7aa8a5f2769bf66f",
  "67a8d5cf510a1fc4b0e2ee1c",
  "67a8d5cf72857eccaf49aa5d",
  "67a8d5cf7460020c7afb2d63",
  "67a8d5cf682ed1ad25141475",
  "67a8d5cfae8165747281a7ff",
  "67a8d5cfd6fdff1fad6586ae",
  "67a8d5cf54efff8c4f93320b",
  "67a8d5cf94fa7189ec55644e",
  "67a8d5cf66214367e1c0a7dc",
  "67a8d5cf00cf3c0db79d93af",
  "67a8d5cf0a8e81f805ebf4eb",
  "67a8d5cf68f0393196fc24ec",
  "67a8d5cfde4ffa47867233d9",
  "67a8d5cf17309c119c8a2883",
  "67a8d5cfe920dd49a569f038",
  "67a8d5cfd253bbc3da2e1b65",
  "67a8d5cfb33fdb18924e6746",
  "67a8d5cf796daad7b3be188a",
  "67a8d5cf37814bc0945185af",
  "67a8d5cfde1d3c9960555576",
  "67a8d5cfdd6ad06db49aa19d",
  "67a8d5cf87d998b3b0919162",
  "67a8d5cf0ead3f0aa815abad",
  "67a8d5cf3780adfb1d6df279",
  "67a8d5cf5b00fe5954b7973a",
  "67a8d5cffe342504f170500c",
  "67a8d5cfda064a6d3d4fa9d9",
  "67a8d5cfb844c0845f9b5fd1",
  "67a8d5cf42fff8536dd67788",
  "67a8d5cfda04eaafb12acb41",
  "67a8d5cf70eaf069e1e6bdc8",
  "67a8d5cf44444acb134e2fe3",
  "67a8d5cf0a2495e234755d91",
  "67a8d5cf7358f4309de83bc2",
  "67a8d5cfd0ec175b2fce0c11",
  "67a8d5cf273a288702d35e60",
  "67a8d5cffc97a59b4bdf2945",
  "67a8d5cfa2ab5158490930ee",
  "67a8d5cf0c98b2bd7b762675",
  "67a8d5cfd35d0963908bfbf7",
  "67a8d5cf1eab7c8aa4491487",
  "67a8d5cf5f4e829f5aa7ab35",
];

const counterList = [
  "67a8d5e9650f60d168dc5ad4",
  "67a8d5e9465ee0670747f7a6",
  "67a8d5e926041c46ed3d184b",
  "67a8d5e9b4664b506bf20e25",
  "67a8d5e92585a6d5b55b8487",
  "67a8d5e920f363c629965094",
  "67a8d5e9817866803d6e4c80",
  "67a8d5e979bfd2595b6ea317",
  "67a8d5e916e18fb37e6c3611",
  "67a8d5e9e7393198a7565ff1",
  "67a8d5e9b22277254360f21a",
  "67a8d5e9b0ffa1f29ee5a336",
  "67a8d5e91ff3754afac8f35b",
  "67a8d5e91dc1a5f3c0553232",
  "67a8d5e95544441306f23b42",
  "67a8d5e99db63656a11bfa4c",
  "67a8d5e93f9662872bf05cb3",
  "67a8d5e9874896c21d1e49d0",
  "67a8d5e9fad09375320116c3",
  "67a8d5e96816760085b3d38b",
  "67a8d5e93e345e5b134ec79d",
  "67a8d5e9b3b928e9b0aebd88",
  "67a8d5e9a9927a52dc9c54a7",
  "67a8d5e9a678d5c1053f593b",
  "67a8d5e9252d3c60f533cda4",
  "67a8d5e966cac7f16e371305",
  "67a8d5e95474c62403ecd865",
  "67a8d5e9264a0bba5bdb7c82",
  "67a8d5e9309dfb428a754994",
  "67a8d5e9517bbd86d735d8eb",
  "67a8d5e9d3581eebbab55133",
  "67a8d5e9216071d66b1f4f4e",
  "67a8d5e9c92f9a4afbf67ccc",
  "67a8d5e98b12acc2098ca076",
  "67a8d5e995610bc6361d495e",
  "67a8d5e909b998094095ceff",
  "67a8d5e979357656e28432c6",
  "67a8d5e902dc7920a3059f28",
  "67a8d5e97b591ce5df56a0c8",
  "67a8d5e90017cc34eca8580b",
  "67a8d5e943c76ce0849545aa",
  "67a8d5e9734fe441cb0a409d",
  "67a8d5e9a5145c131e1b054d",
  "67a8d5e9de163365da9787a8",
  "67a8d5e9558ea22f8aecb64f",
  "67a8d5e95eae2bd265668864",
  "67a8d5e9476a71f39552c466",
  "67a8d5e934d6ad40f6aa3965",
  "67a8d5e9c442e76c742cc524",
  "67a8d5e9d8553bff8f0bf15c",
];

const questList = [
  "67a8d60dbf4d2521d81fcaff",
  "67a8d60d04e48d169c6846d2",
  "67a8d60df8f45d8d2e7ad051",
  "67a8d60d5b2e1eaac18f33ff",
  "67a8d60d69b521aa7d75e63e",
  "67a8d60d8a77872d37ab0ce9",
  "67a8d60d761612b2bb0d3adf",
  "67a8d60d42ca2456d087f194",
  "67a8d60d86e60705ba3e8c54",
  "67a8d60d6a6eed482dbbb2a8",
  "67a8d60d6dded3ca23197c8e",
  "67a8d60d64a4d5af8df924b7",
  "67a8d60d620b8a4b8a80f814",
  "67a8d60d150ceec4168b09c6",
  "67a8d60da99cfb22bebfc0db",
  "67a8d60d00c2f3cb69bf1ee4",
  "67a8d60da9c0179f2ebf1831",
  "67a8d60d56cf13e2b3550329",
  "67a8d60d45a9cace3684bc39",
  "67a8d60d2e0172aa3ab68183",
  "67a8d60daddb5d19636e8f22",
  "67a8d60d810bc441da94fb77",
  "67a8d60d31080deeaf54f4c6",
  "67a8d60d0a155ec08ba4d408",
  "67a8d60d7958e2a1abed257d",
  "67a8d60d3bf3dd9b53e764ab",
  "67a8d60d9540878b094a101a",
  "67a8d60d8d08de8140998e08",
  "67a8d60d709297c9ef322903",
  "67a8d60d557d644e5f53994d",
  "67a8d60d256956384af44ff2",
  "67a8d60d64e3fdfdc3f2561e",
  "67a8d60df3ea60799edcb4f4",
  "67a8d60d4c9deb9c2719637a",
  "67a8d60d68fe237848cc1183",
  "67a8d60d207db02d79f087e2",
  "67a8d60d77417383056d6bf6",
  "67a8d60d0617bff23df4ce39",
  "67a8d60d99b330af54d30101",
  "67a8d60d532bbed9ae08862d",
  "67a8d60d118e6201999bd3b9",
  "67a8d60d55902c664231a6f5",
  "67a8d60df2a070c8f3dcded3",
  "67a8d60d8aa64089ba9a6511",
  "67a8d60dd1f49fcc1dd2e8f5",
  "67a8d60d84b342beded69b32",
  "67a8d60dfe0a607fe1afa048",
  "67a8d60d7e237adf50fc43d9",
  "67a8d60de9e23fd8041da0d8",
  "67a8d60d44222f1475cfbb01",
];
