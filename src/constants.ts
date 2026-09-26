import type { ComponentDraft, ComponentRecord } from "./types";

/** 筛选下拉里的“全部”选项值 */
export const ALL = "__ALL__";

/** 常见榫卯类型，供输入时联想，也可手填其他类型 */
export const JOINT_TYPES = ["燕尾榫", "透榫", "半榫", "箍头榫"];

/** 常见木材种类，供输入时联想 */
export const WOOD_SPECIES = ["楠木", "松木", "杉木", "柏木", "榆木", "樟木"];

export const STORAGE_KEY = "hxyfront-62013-records-v1";

export const emptyDraft: ComponentDraft = {
  building: "",
  code: "",
  woodSpecies: "",
  jointType: "",
  section: "",
  damage: "",
  deformation: "",
  repairAdvice: "",
  status: "pending",
};

/** 首次打开（本机还没有任何数据）时展示的样例，可随时修改或删除 */
export const seedRecords: ComponentRecord[] = [
  {
    id: "seed-0001",
    building: "大雄宝殿",
    code: "梁架A-03",
    woodSpecies: "松木",
    jointType: "透榫",
    section: "180×240mm",
    damage: "梁端榫头端部开裂，裂缝长约120mm",
    deformation: "未见明显变形",
    repairAdvice: "",
    status: "pending",
    createdAt: "2026-09-20 09:30",
    updatedAt: "2026-09-20 09:30",
  },
  {
    id: "seed-0002",
    building: "大雄宝殿",
    code: "柱网C-12",
    woodSpecies: "楠木",
    jointType: "管脚榫",
    section: "柱径320mm",
    damage: "柱脚糟朽，深约40mm",
    deformation: "柱身轻微倾斜",
    repairAdvice: "建议局部墩接，墩接高度不超过柱高1/4",
    status: "confirmed",
    createdAt: "2026-09-20 10:05",
    updatedAt: "2026-09-22 15:40",
  },
  {
    id: "seed-0003",
    building: "观音阁",
    code: "斗拱D-07",
    woodSpecies: "柏木",
    jointType: "半榫",
    section: "120×160mm",
    damage: "卯口边缘轻微磨损",
    deformation: "轻微变形",
    repairAdvice: "暂不干预，继续监测变形发展",
    status: "confirmed",
    createdAt: "2026-09-21 14:10",
    updatedAt: "2026-09-21 14:10",
  },
];
