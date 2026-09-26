import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import type { ComponentRecord, RecordDraft } from "./types";
import {
  EMPTY_DRAFT,
  JOINT_TYPES,
  draftFromRecord,
  findDuplicate,
} from "./types";
import { loadRecords, newRecordId, saveRecords } from "./storage";
import { exportRecordsCsv } from "./csv";
import { ComponentForm } from "./components/ComponentForm";
import { RecordTable } from "./components/RecordTable";

function App() {
  const [records, setRecords] = useState<ComponentRecord[]>(() => loadRecords());
  const [draft, setDraft] = useState<RecordDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<ComponentRecord | null>(null);
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterJoint, setFilterJoint] = useState("");
  const [keyword, setKeyword] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 任何变更立即写入本机，下次打开接着查
  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const editingRecord = editingId
    ? records.find((r) => r.id === editingId) ?? null
    : null;

  const buildings = useMemo(
    () => [...new Set(records.map((r) => r.building))].sort(),
    [records]
  );

  const jointOptions = useMemo(() => {
    const known = JOINT_TYPES as readonly string[];
    const extra = [...new Set(records.map((r) => r.jointType.trim()))].filter(
      (t) => t !== "" && !known.includes(t)
    );
    return [...known, ...extra];
  }, [records]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return records
      .filter((r) => !filterBuilding || r.building === filterBuilding)
      .filter((r) => !filterJoint || r.jointType === filterJoint)
      .filter(
        (r) =>
          !kw ||
          [
            r.building,
            r.componentNo,
            r.woodType,
            r.diseaseLocation,
            r.deformation,
            r.repairSuggestion,
          ].some((v) => v.toLowerCase().includes(kw))
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [records, filterBuilding, filterJoint, keyword]);

  const metrics = useMemo(
    () => [
      { label: "构件数量", value: records.length },
      {
        label: "病害点",
        value: records.filter((r) => r.diseaseLocation.trim() !== "").length,
      },
      {
        label: "榫卯类型",
        value: new Set(
          records.map((r) => r.jointType.trim()).filter(Boolean)
        ).size,
      },
      {
        label: "待修缮",
        value: records.filter((r) => r.repairProgress !== "已完成").length,
      },
    ],
    [records]
  );

  const updateDraft = (patch: Partial<RecordDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setFormError(null);
    // 改了建筑或编号，之前的查重提示即失效
    if (patch.building !== undefined || patch.componentNo !== undefined) {
      setDuplicate(null);
    }
  };

  const resetForm = (keepBuilding = "") => {
    setDraft({ ...EMPTY_DRAFT, building: keepBuilding });
    setEditingId(null);
    setFormError(null);
    setDuplicate(null);
  };

  const startEdit = (record: ComponentRecord) => {
    setEditingId(record.id);
    setDraft(draftFromRecord(record));
    setFormError(null);
    setDuplicate(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = () => {
    const building = draft.building.trim();
    const componentNo = draft.componentNo.trim();
    if (!building || !componentNo) {
      setFormError("请填写建筑名称和构件编号。");
      return;
    }

    const text = draft.repairSuggestion.trim();
    const pending = draft.suggestionPending || text === "";
    const suggestion = pending ? "" : text;

    if (editingRecord) {
      // 已填写的修缮建议不被后续编辑覆盖：不允许清空或改回待补
      if (editingRecord.repairSuggestion.trim() !== "" && suggestion === "") {
        setFormError(
          "该记录已填写修缮建议，不能清空或改为待补；如需调整请直接修改建议内容。"
        );
        return;
      }
      setRecords((rs) =>
        rs.map((r) =>
          r.id === editingRecord.id
            ? {
                ...r,
                woodType: draft.woodType.trim(),
                jointType: draft.jointType.trim(),
                sectionSize: draft.sectionSize.trim(),
                diseaseLocation: draft.diseaseLocation.trim(),
                deformation: draft.deformation.trim(),
                repairSuggestion: suggestion,
                suggestionPending: pending,
                repairProgress: draft.repairProgress,
                updatedAt: Date.now(),
              }
            : r
        )
      );
      showToast(`已保存「${editingRecord.componentNo}」的修改`);
      resetForm();
      return;
    }

    // 同一建筑内构件编号重复时不另建，提示并引导打开原记录
    const dup = findDuplicate(records, building, componentNo);
    if (dup) {
      setDuplicate(dup);
      return;
    }

    const now = Date.now();
    const record: ComponentRecord = {
      id: newRecordId(),
      building,
      componentNo,
      woodType: draft.woodType.trim(),
      jointType: draft.jointType.trim(),
      sectionSize: draft.sectionSize.trim(),
      diseaseLocation: draft.diseaseLocation.trim(),
      deformation: draft.deformation.trim(),
      repairSuggestion: suggestion,
      suggestionPending: pending,
      repairProgress: draft.repairProgress,
      createdAt: now,
      updatedAt: now,
    };
    setRecords((rs) => [record, ...rs]);
    showToast(`已登记构件「${componentNo}」`);
    // 现场常连续登记同一栋建筑，保留建筑名称
    resetForm(building);
  };

  const handleDelete = (record: ComponentRecord) => {
    if (
      !window.confirm(
        `确定移除构件「${record.componentNo}」（${record.building}）吗？\n移除后不可恢复。`
      )
    ) {
      return;
    }
    setRecords((rs) => rs.filter((r) => r.id !== record.id));
    if (editingId === record.id) resetForm();
    showToast(`已移除「${record.componentNo}」`);
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast("当前筛选结果为空，没有可导出的记录");
      return;
    }
    exportRecordsCsv(filtered);
    showToast(`已按当前筛选导出 ${filtered.length} 条记录`);
  };

  return (
    <main className="app">
      <section className="hero">
        <p>木结构榫卯构件测绘 · 登记工作台</p>
        <h1>榫卯构件登记</h1>
        <span>
          现场登记、修改与移除构件记录，数据保存在本机浏览器，下次打开可继续勘查。
          清单支持按建筑与榫卯类型筛选，导出的表格与当前筛选结果一致。
        </span>
      </section>

      <section className="metrics">
        {metrics.map((m) => (
          <article key={m.label}>
            <small>{m.label}</small>
            <strong>{m.value}</strong>
          </article>
        ))}
      </section>

      <div className="workspace">
        <div ref={formRef} className="form-anchor">
          <ComponentForm
            draft={draft}
            editingRecord={editingRecord}
            formError={formError}
            duplicate={duplicate}
            onDraftChange={updateDraft}
            onSubmit={handleSubmit}
            onCancel={() => resetForm()}
            onOpenDuplicate={() => duplicate && startEdit(duplicate)}
          />
        </div>

        <section className="panel list-panel">
          <div className="heading">
            <div>
              <p>构件清单</p>
              <h2>
                当前 {filtered.length} 条
                {(filterBuilding || filterJoint || keyword) &&
                  `（共 ${records.length} 条）`}
              </h2>
            </div>
            <button
              type="button"
              className="primary"
              onClick={handleExport}
              disabled={filtered.length === 0}
            >
              导出CSV（{filtered.length}）
            </button>
          </div>

          <div className="filters">
            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              aria-label="按建筑筛选"
            >
              <option value="">全部建筑</option>
              {buildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={filterJoint}
              onChange={(e) => setFilterJoint(e.target.value)}
              aria-label="按榫卯类型筛选"
            >
              <option value="">全部榫卯类型</option>
              {jointOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              value={keyword}
              placeholder="搜索编号 / 病害 / 建议…"
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="关键词搜索"
            />
            {(filterBuilding || filterJoint || keyword) && (
              <button
                type="button"
                onClick={() => {
                  setFilterBuilding("");
                  setFilterJoint("");
                  setKeyword("");
                }}
              >
                清空筛选
              </button>
            )}
          </div>

          <RecordTable
            records={filtered}
            totalCount={records.length}
            editingId={editingId}
            onEdit={startEdit}
            onDelete={handleDelete}
          />
        </section>
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}

export default App;
