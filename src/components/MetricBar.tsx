interface Props {
  total: number;
  damageCount: number;
  jointTypeCount: number;
  pendingCount: number;
}

export function MetricBar({ total, damageCount, jointTypeCount, pendingCount }: Props) {
  const items = [
    { label: "构件数量", value: total },
    { label: "病害点", value: damageCount },
    { label: "榫卯类型", value: jointTypeCount },
    { label: "待补修缮建议", value: pendingCount },
  ];
  return (
    <section className="metrics">
      {items.map((m) => (
        <article key={m.label}>
          <small>{m.label}</small>
          <strong>{m.value}</strong>
        </article>
      ))}
    </section>
  );
}
