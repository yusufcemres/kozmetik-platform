interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export default function StatCard({ label, value, icon, color = 'bg-primary' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
      <div className={`${color} text-white w-12 h-12 rounded-lg flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
