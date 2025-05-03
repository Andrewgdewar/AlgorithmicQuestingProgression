import { IReward } from "@spt/models/eft/common/tables/IReward";
import { RewardType } from "@spt/models/enums/RewardType";
import { generateMongoIdFromSeed } from "../Utils/utils";
import { unlockAssortWeightFactorZeroToOne } from "../../config/QuestConfigs/questAdjustments.json";
import { IQuest, IQuestCondition } from "@spt/models/eft/common/tables/IQuest";
import { Money } from "@spt/models/enums/Money";
import { Traders } from "@spt/models/enums/Traders";

export const TraderCurrencies: Record<Traders, Money> = {
  [Traders.PRAPOR]: Money.ROUBLES,
  [Traders.THERAPIST]: Money.ROUBLES,
  [Traders.FENCE]: Money.ROUBLES,
  [Traders.SKIER]: Money.ROUBLES,
  [Traders.PEACEKEEPER]: Money.DOLLARS,
  [Traders.MECHANIC]: Money.ROUBLES,
  [Traders.RAGMAN]: Money.ROUBLES,
  [Traders.JAEGER]: Money.ROUBLES,
  [Traders.LIGHTHOUSEKEEPER]: Money.ROUBLES,
  [Traders.REF]: Money.GP,
  [Traders.BTR]: Money.ROUBLES,
};

export const MoneyIDConverter: Record<string, string> = {
  "5449016a4bdc2d6f028b456f": "ROUBLES",
  "569668774bdc2da2298b4568": "EUROS",
  "5696686a4bdc2da3298b456a": "DOLLARS",
  "5d235b4d86f7742e017bc88a": "GP",
};

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
  }
};

interface assortData {
  name: string;
  tpl: string;
  level: number;
  QuestName?: string;
}

export const assignQuestNamesWithWeight = (
  questNames: string[],
  assortData: assortData[]
): assortData[] => {
  let weightFactor = unlockAssortWeightFactorZeroToOne;
  if (weightFactor < 0 || weightFactor > 1) {
    throw new Error("Weight factor must be between 0 and 1");
  }

  const totalQuests = questNames.length;
  const totalAssortData = assortData.length;

  // This is to handle smoothing for peacekeeper, he has .91 average (more unlocks then quests)
  // if (totalQuests / totalAssortData < 1) {
  //   console.log(questNames[0]);
  //   weightFactor = (totalQuests / totalAssortData + weightFactor) / 2;
  // }

  for (let i = 0; i < totalAssortData; i++) {
    const normalizedPosition = (i / (totalAssortData - 1)) * weightFactor;

    const skewedPosition = Math.round(normalizedPosition * totalQuests);

    assortData[i].QuestName = questNames[skewedPosition];
  }

  return assortData;
};

/**
 * Converts an amount from one Tarkov currency to another using static exchange rates.
 * @param amount The amount to convert.
 * @param fromCurrency The source currency (from Money enum).
 * @param toCurrency The target currency (from Money enum).
 * @returns The converted amount, rounded to the nearest whole number.
 * @throws Error if invalid currencies or unsupported conversions are provided.
 */
export function convertMoney(
  amount: number,
  fromCurrency: Money,
  toCurrency: Money
): number {
  // Validate input
  if (amount < 0) {
    throw new Error("Amount cannot be negative.");
  }
  if (
    !Object.values(Money).includes(fromCurrency) ||
    !Object.values(Money).includes(toCurrency)
  ) {
    throw new Error("Invalid currency provided.");
  }
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Static exchange rates (Roubles as base currency)
  const exchangeRates: { [key: string]: number } = {
    [Money.ROUBLES]: 1,
    [Money.DOLLARS]: 160, // ~160 Roubles per Dollar
    [Money.EUROS]: 180, // ~180 Roubles per Euro
    [Money.GP]: 20000, // ~170,000 Roubles per GP coin (Bitcoin)
  };

  // Convert to Roubles first, then to target currency
  const amountInRoubles = amount * exchangeRates[fromCurrency];
  const result = amountInRoubles / exchangeRates[toCurrency];

  // Round to the nearest whole number
  return Math.round(result);
}
