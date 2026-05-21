export default function StatusBadge({ status }) {
  if (status === 'present') return (
    <span className="badge-present">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
      Present
    </span>
  );
  if (status === 'late') return (
    <span className="badge-late">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
      Late
    </span>
  );
  return (
    <span className="badge-absent">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
      Absent
    </span>
  );
}
