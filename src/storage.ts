import type { ComponentRecord } from "./types";

const STORAGE_KEY = "mortise-survey-records-v1";
const SEED_FLAG_KEY = "mortise-survey-seeded-v1";

/** 首次打开时的示例记录，可正常修改或移除 */
const SEED_RECORDS: Array<
  Omit<ComponentRecord, "id" | "createdAt" | "updatedAt">
> = [
  {
    building: "大成殿",
    componentNo: "梁架A-03",
    woodType: "杉木",
    jointType: "透榫",
    sectionSize: "180x240mm",
    diseaseLocation: "梁端榫头处",
    deformation: "端部开裂，裂缝长约120mm",
    repairSuggestion: "裂缝灌注环氧树脂并加铁箍",
    suggestionPending: false,
    repairProgress: "未开始",
  },
  {
    building: "大成殿",
    componentNo: "柱网C-12",
    woodType: "楠木",
    jointType: "管脚榫",
    sectionSize: "Φ320mm",
    diseaseLocation: "柱脚",
    deformation: "柱脚糟朽，深度约40mm",
    repairSuggestion: "",
    suggestionPending: true,
    repairProgress: "未开始",
  },
  {
    building: "文昌阁",
    componentNo: "斗拱D-07",
    woodType: "松木",
    jointType: "半榫",
    sectionSize: "120x90mm",
    diseaseLocation: "拱眼壁侧",
    deformation: "轻微变形",
    repairSuggestion: "继续监测，暂不处理",
    suggestionPending: false,
    repairProgress: "修缮中",
  },
];

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function newRecordId(): string {
  return createId();
}

export function loadRecords(): ComponentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as ComponentRecord[];
      if (Array.isArray(parsed)) return parsed;
    }
    // 首次使用：写入示例数据，之后完全以本机数据为准
    if (!localStorage.getItem(SEED_FLAG_KEY)) {
      const now = Date.now();
      const seeded = SEED_RECORDS.map((r, i) => ({
        ...r,
        id: createId(),
        createdAt: now - (SEED_RECORDS.length - i) * 60_000,
        updatedAt: now - (SEED_RECORDS.length - i) * 60_000,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      localStorage.setItem(SEED_FLAG_KEY, "1");
      return seeded;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveRecords(records: ComponentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 存储失败（如隐私模式）时保持内存数据，不打断操作
  }
}
