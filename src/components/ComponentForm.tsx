import { useEffect, useState } from "react";
import { JOINT_TYPES, WOOD_SPECIES } from "../constants";
import type { ComponentDraft } from "../types";

interface Props {
  draft: ComponentDraft;
  /** 正在编辑的记录 id；null 表示新增模式 */
  editingId: string | null;
  /** 编辑的原记录修缮建议已确定：可修改建议内容，但不能退回“待补”或清空 */
  adviceLocked: boolean;
  buildingOptions: string[];
  onChange: (patch: Partial<ComponentDraft>) => void;
  /** 返回错误提示；返回 null 表示保存成功 */
  onSubmit: () => string | null;
  onCancelEdit: () => void;
}

function Field({
  label,
  required,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`field${wide ? " field-wide" : ""}`}>
      <span>
        {label}
        {required && <em className="req">*</em>}
      </span>
      {children}
    </label>
  );
}

export function ComponentForm({
  draft,
  editingId,
  adviceLocked,
  buildingOptions,
  onChange,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const isPending = draft.status === "pending";

  // 切换记录或模式时清掉上一次的校验提示
  useEffect(() => {
    setError(null);
  }, [editingId]);

  const handleSubmit = () => {
    const required: Array<[keyof ComponentDraft, string]> = [
      ["building", "建筑名称"],
      ["code", "构件编号"],
      ["jointType", "榫卯类型"],
    ];
    for (const [key, name] of required) {
      if (!String(draft[key]).trim()) {
        setError(`请填写${name}`);
        return;
      }
    }
    if (adviceLocked && !draft.repairAdvice.trim()) {
      setError("该构件已有确定的修缮建议，不能清空；如需修改请直接更新建议内容。");
      return;
    }
    if (isPending && draft.repairAdvice.trim() !== "") {
      setError("标记为“待补”时修缮建议应为空，请先清空建议内容或取消“待补”标记");
      return;
    }
    if (!isPending && !draft.repairAdvice.trim()) {
      setError("修缮建议未确定时，请勾选“建议暂缺，标为待补”后保存");
      return;
    }
    setError(onSubmit());
  };

  return (
    <section className="panel form-panel">
      <div className="heading">
        <div>
          <p>{editingId ? "修改记录" : "现场登记"}</p>
          <h2>{editingId ? `编辑 ${draft.code || "构件"}` : "新增构件"}</h2>
        </div>
        {editingId && (
          <button type="button" onClick={onCancelEdit}>
            放弃修改 / 回到新增
          </button>
        )}
      </div>

      <div className="field-grid">
        <Field label="建筑名称" required>
          <input
            list="building-options"
            value={draft.building}
            placeholder="如：大雄宝殿"
            onChange={(e) => onChange({ building: e.target.value })}
          />
          <datalist id="building-options">
            {buildingOptions.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </Field>

        <Field label="构件编号" required>
          <input
            value={draft.code}
            placeholder="如：梁架A-03"
            onChange={(e) => onChange({ code: e.target.value })}
          />
        </Field>

        <Field label="木材种类">
          <input
            list="wood-options"
            value={draft.woodSpecies}
            placeholder="如：楠木"
            onChange={(e) => onChange({ woodSpecies: e.target.value })}
          />
          <datalist id="wood-options">
            {WOOD_SPECIES.map((w) => (
              <option key={w} value={w} />
            ))}
          </datalist>
        </Field>

        <Field label="榫卯类型" required>
          <input
            list="joint-options"
            value={draft.jointType}
            placeholder="选择或输入榫卯类型"
            onChange={(e) => onChange({ jointType: e.target.value })}
          />
          <datalist id="joint-options">
            {JOINT_TYPES.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>

        <Field label="截面尺寸">
          <input
            value={draft.section}
            placeholder="如：180×240mm"
            onChange={(e) => onChange({ section: e.target.value })}
          />
        </Field>

        <Field label="变形情况">
          <input
            value={draft.deformation}
            placeholder="如：轻微倾斜、未见明显变形"
            onChange={(e) => onChange({ deformation: e.target.value })}
          />
        </Field>

        <Field label="病害位置" wide>
          <textarea
            rows={2}
            value={draft.damage}
            placeholder="如：梁端榫头端部开裂，裂缝长约120mm"
            onChange={(e) => onChange({ damage: e.target.value })}
          />
        </Field>

        <Field label="修缮建议" wide>
          <textarea
            rows={3}
            value={draft.repairAdvice}
            disabled={isPending}
            placeholder={
              isPending ? "该构件修缮建议暂缺，已标记为“待补”" : "填写修缮建议"
            }
            onChange={(e) => onChange({ repairAdvice: e.target.value })}
          />
        </Field>

        <label className={`check-row${adviceLocked ? " is-locked" : ""}`}>
          <input
            type="checkbox"
            checked={isPending}
            disabled={adviceLocked}
            onChange={(e) =>
              onChange({ status: e.target.checked ? "pending" : "confirmed" })
            }
          />
          <span>
            建议暂缺，先保存并标为<strong>待补</strong>
            {adviceLocked && (
              <small className="lock-hint">
                该构件已有确定的修缮建议，不能改回待补；如需调整请直接修改建议内容。
              </small>
            )}
          </span>
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="primary" onClick={handleSubmit}>
          {editingId ? "保存修改" : "保存构件"}
        </button>
        <span className="save-hint">记录仅保存在本机浏览器，下次打开自动恢复</span>
      </div>
    </section>
  );
}
