interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          + {action.label}
        </button>
      )}
    </div>
  );
}
