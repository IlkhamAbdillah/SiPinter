export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="mt-5 border border-dashed border-slate-300 bg-white px-6 py-10 text-center"><h2 className="font-medium">{title}</h2><p className="mt-2 text-sm text-slate-600">{description}</p></div>;
}