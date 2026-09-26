import type { ComponentRecord, RecordDraft } from "../types";
import { JOINT_TYPES, REPAIR_PROGRESS_OPTIONS } from "../types";
import { formatTime } from "../csv";

interface Props {
  draft: RecordDraft;
  editingRecord: ComponentRecord | null;
  formError: string | null;
  duplicate: ComponentRecord | null;
  onDraftChange: (patch: Partial<RecordDraft>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onOpenDuplicate: () => void;
}

export function ComponentForm({
  draft,
  editingRecord,
  formError,
  duplicate,
  onDraftChange,
  onSubmit,
  onCancel,
  onOpenDuplicate,
}: Props) {
  const isEdit = editingRecord !== null;
  const suggestionEmpty = draft.repairSuggestion.trim() === "";
  const textareaDisabled = draft.suggestionPending;

  return (
    <section className="panel form-panel" aria-label="构件登记表单">
      <div className="heading">
        <div>
          <p>{isEdit ? "修改登记" : "新增登记"}</p>
          <h2>{isEdit ? `编辑 · ${editingRecord.componentNo}` : "构件登记"}</h2>
        </div>
      </div>

      {isEdit && (
        <div className="edit-banner" role="status">
          正在编辑「{editingRecord.building} / {editingRecord.componentNo}
          」，建筑与编号已锁定；最近更新 {formatTime(editingRecord.updatedAt)}
        </div>
      )}

      {duplicate && (
        <div className="alert" role="alert">
          <strong>未重复新建。</strong>
          <p>
            「{duplicate.building}」下已存在编号「{duplicate.componentNo}
            」的构件资料（{duplicate.woodType || "木材未录"} · 最近更新{" "}
            {formatTime(duplicate.updatedAt)}）。
          </p>
          <button type="button" className="alert-action" onClick={onOpenDuplicate}>
            打开原记录
          </button>
        </div>
      )}

      {formError && (
        <div className="form-error" role="alert">
          {formError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="field-grid">
          <label>
            <span>建筑名称 *</span>
            <input
              value={draft.building}
              disabled={isEdit}
              placeholder="如：大成殿"
              onChange={(e) => onDraftChange({ building: e.target.value })}
            />
          </label>
          <label>
            <span>构件编号 *</span>
            <input
              value={draft.componentNo}
              disabled={isEdit}
              placeholder="如：梁架A-03"
              onChange={(e) => onDraftChange({ componentNo: e.target.value })}
            />
          </label>
          <label>
            <span>木材种类</span>
            <input
              value={draft.woodType}
              placeholder="如：杉木"
              onChange={(e) => onDraftChange({ woodType: e.target.value })}
            />
          </label>
          <label>
            <span>榫卯类型</span>
            <input
              list="joint-type-options"
              value={draft.jointType}
              placeholder="选择或输入"
              onChange={(e) => onDraftChange({ jointType: e.target.value })}
            />
            <datalist id="joint-type-options">
              {JOINT_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>
          <label>
            <span>截面尺寸</span>
            <input
              value={draft.sectionSize}
              placeholder="如：180x240mm"
              onChange={(e) => onDraftChange({ sectionSize: e.target.value })}
            />
          </label>
          <label>
            <span>修缮进度</span>
            <select
              value={draft.repairProgress}
              onChange={(e) =>
                onDraftChange({
                  repairProgress: e.target
                    .value as RecordDraft["repairProgress"],
                })
              }
            >
              {REPAIR_PROGRESS_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="span-2">
            <span>病害位置</span>
            <input
              value={draft.diseaseLocation}
              placeholder="如：梁端榫头处"
              onChange={(e) =>
                onDraftChange({ diseaseLocation: e.target.value })
              }
            />
          </label>
          <label className="span-2">
            <span>变形情况</span>
            <input
              value={draft.deformation}
              placeholder="如：端部开裂，裂缝长约120mm"
              onChange={(e) => onDraftChange({ deformation: e.target.value })}
            />
          </label>
          <label className="span-2">
            <span>修缮建议</span>
            <textarea
              rows={3}
              value={draft.repairSuggestion}
              disabled={textareaDisabled}
              placeholder={
                draft.suggestionPending
                  ? "已标记为待补，保存后建议内容为空"
                  : "未确定可暂不填写，保存后自动标为待补"
              }
              onChange={(e) =>
                onDraftChange({ repairSuggestion: e.target.value })
              }
            />
          </label>
          <div className="span-2 suggestion-row">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={draft.suggestionPending}
                disabled={isEdit && editingRecord.repairSuggestion.trim() !== ""}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onDraftChange({ suggestionPending: checked });
                  // 取消待补时聚焦输入框，方便直接补录
                  if (!checked) {
                    requestAnimationFrame(() => {
                      const el =
                        e.target.form?.querySelector<HTMLTextAreaElement>(
                          "textarea"
                        );
                      el?.focus();
                    });
                  }
                }}
              />
              <span>修缮建议尚未确定，先标为「待补」</span>
            </label>
            {isEdit && editingRecord.repairSuggestion.trim() !== "" && (
              <small className="hint">
                该记录已填写修缮建议，内容不会被清空或改为待补。
              </small>
            )}
            {!isEdit && suggestionEmpty && !draft.suggestionPending && (
              <small className="hint">未填写建议，保存后自动标为「待补」。</small>
            )}
            {draft.suggestionPending && !suggestionEmpty && (
              <small className="hint">
                勾选待补后，已填的建议内容暂不保存，可取消勾选继续填写。
              </small>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary">
            {isEdit ? "保存修改" : "保存登记"}
          </button>
          <button type="button" onClick={onCancel}>
            {isEdit ? "取消编辑" : "清空"}
          </button>
        </div>
      </form>
    </section>
  );
}
