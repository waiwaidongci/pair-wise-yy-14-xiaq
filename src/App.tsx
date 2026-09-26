import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import { ALL, STORAGE_KEY, emptyDraft, seedRecords } from "./constants";
import { loadRecords, saveRecords } from "./storage";
import { downloadCsv } from "./csv";
import { createId, nowStamp } from "./utils";
import type { ComponentDraft, ComponentRecord, Filters } from "./types";
import { ToastHost, type ToastItem, type ToastTone } from "./components/Toast";
import { MetricBar } from "./components/MetricBar";
import { FilterBar } from "./components/FilterBar";
import { ComponentForm } from "./components/ComponentForm";
import { RecordList } from "./components/RecordList";

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

export default function App() {
  // 首次渲染使用样例占位，挂载后立即读本机存储，避免 SSR/首帧不一致
  const [records, setRecords] = useState<ComponentRecord[]>(seedRecords);
  const [filters, setFilters] = useState<Filters>({
    building: ALL,
    jointType: ALL,
  });
  const [draft, setDraft] = useState<ComponentDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  // 数据变化即写本机，下次打开接着查
  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const pushToast = (message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const buildings = useMemo(
    () => uniqueSorted(records.map((r) => r.building)),
    [records]
  );
  const jointTypes = useMemo(
    () => uniqueSorted(records.map((r) => r.jointType)),
    [records]
  );

  const filtered = useMemo(() => {
    return records
      .filter(
        (r) =>
          (filters.building === ALL || r.building === filters.building) &&
          (filters.jointType === ALL || r.jointType === filters.jointType)
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [records, filters]);

  const metrics = useMemo(() => {
    const damaged = new Set(
      records
        .filter((r) => r.damage.trim() !== "")
        .map((r) => `${r.id}:${r.damage}`)
    );
    return {
      total: records.length,
      damageCount: damaged.size,
      jointTypeCount: new Set(records.map((r) => r.jointType)).size,
      pendingCount: records.filter((r) => r.status === "pending").length,
    };
  }, [records]);

  const editingRecord = editingId
    ? records.find((r) => r.id === editingId) ?? null
    : null;
  // 原记录修缮建议已确定：编辑时禁止退回“待补”，防止已填建议被覆盖
  const adviceLocked = editingRecord?.status === "confirmed";

  const patchDraft = (patch: Partial<ComponentDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const startCreate = () => {
    setEditingId(null);
    setDraft({
      ...emptyDraft,
      // 当前正按某栋建筑筛选时，新增默认带上该建筑，减少现场录入
      building: filters.building === ALL ? "" : filters.building,
      jointType: filters.jointType === ALL ? "" : filters.jointType,
    });
  };

  const startEdit = (record: ComponentRecord) => {
    setEditingId(record.id);
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = record;
    setDraft(rest);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const findDuplicate = (
    building: string,
    code: string,
    excludeId?: string | null
  ) =>
    records.find(
      (r) =>
        r.id !== excludeId &&
        normalize(r.building) === normalize(building) &&
        normalize(r.code) === normalize(code)
    );

  /** 表单保存；返回错误文案或 null（成功） */
  const handleSubmit = (): string | null => {
    // 同一建筑内构件编号重复时不另建：提示已有资料并打开原记录
    const duplicate = findDuplicate(draft.building, draft.code, editingId);
    if (duplicate) {
      startEdit(duplicate);
      pushToast(
        `「${duplicate.building}」已存在构件编号 ${duplicate.code}，已打开原有资料，未另建新记录。`,
        "warn"
      );
      return null;
    }

    // 双保险：即使界面状态被篡改，也不让已确定的建议退回待补
    if (editingRecord && editingRecord.status === "confirmed" && draft.status === "pending") {
      return "已有确定的修缮建议，不能改回待补，原有内容已保留。";
    }
    if (adviceLocked && !draft.repairAdvice.trim()) {
      return "已有确定的修缮建议不能清空，原有内容已保留。";
    }

    const stamp = nowStamp();
    const cleanDraft: ComponentDraft = {
      ...draft,
      building: draft.building.trim(),
      code: draft.code.trim(),
      woodSpecies: draft.woodSpecies.trim(),
      jointType: draft.jointType.trim(),
      section: draft.section.trim(),
      damage: draft.damage.trim(),
      deformation: draft.deformation.trim(),
      // 待补状态下建议一律为空；已确定时保存实际内容
      repairAdvice: draft.status === "pending" ? "" : draft.repairAdvice.trim(),
    };

    if (editingId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, ...cleanDraft, updatedAt: stamp }
            : r
        )
      );
      pushToast(`构件 ${cleanDraft.code} 的修改已保存到本机。`);
      setEditingId(null);
      setDraft(emptyDraft);
    } else {
      const record: ComponentRecord = {
        ...cleanDraft,
        id: createId(),
        createdAt: stamp,
        updatedAt: stamp,
      };
      setRecords((prev) => [record, ...prev]);
      pushToast(
        cleanDraft.status === "pending"
          ? `构件 ${record.code} 已登记，修缮建议标记为待补。`
          : `构件 ${record.code} 已登记。`
      );
      setDraft({
        ...emptyDraft,
        building: cleanDraft.building,
      });
    }
    return null;
  };

  const handleRemove = (record: ComponentRecord) => {
    const ok = window.confirm(
      `确认移除「${record.building}」的构件 ${record.code}？\n该操作只影响本机数据，移除后不可恢复。`
    );
    if (!ok) return;
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
    if (editingId === record.id) cancelEdit();
    pushToast(`构件 ${record.code} 已移除。`);
  };

  const handleExport = () => {
    if (filtered.length === 0) return;
    downloadCsv(filtered);
    const parts = [
      filters.building !== ALL ? filters.building : null,
      filters.jointType !== ALL ? filters.jointType : null,
    ].filter(Boolean);
    pushToast(
      `已导出 ${filtered.length} 条记录${
        parts.length ? `（${parts.join(" / ")}）` : ""
      }，表格内容与当前清单一致。`
    );
  };

  return (
    <main className="app">
      <ToastHost toasts={toasts} />

      <section className="hero">
        <p>木结构榫卯构件测绘 · 现场工作台</p>
        <h1>榫卯构件登记</h1>
        <span>
          现场录入、修改、移除构件资料，记录保存在本机浏览器（localStorage，键
          <code>{STORAGE_KEY}</code>），下次打开自动恢复，无需回办公室补录。
          同一建筑内构件编号不可重复。
        </span>
        <div className="hero-actions">
          <button type="button" className="primary" onClick={startCreate}>
            ＋ 新增构件
          </button>
        </div>
      </section>

      <MetricBar
        total={metrics.total}
        damageCount={metrics.damageCount}
        jointTypeCount={metrics.jointTypeCount}
        pendingCount={metrics.pendingCount}
      />

      <FilterBar
        filters={filters}
        buildings={buildings}
        jointTypes={jointTypes}
        resultCount={filtered.length}
        totalCount={records.length}
        onChange={setFilters}
        onExport={handleExport}
      />

      <section className="workspace">
        <ComponentForm
          draft={draft}
          editingId={editingId}
          adviceLocked={adviceLocked}
          buildingOptions={buildings}
          onChange={patchDraft}
          onSubmit={handleSubmit}
          onCancelEdit={cancelEdit}
        />
      </section>

      <RecordList
        records={filtered}
        editingId={editingId}
        onEdit={startEdit}
        onRemove={handleRemove}
      />
    </main>
  );
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "zh-Hans-CN")
  );
}
