import React from "react";

type PageHeaderProps = {
  title: string;
  action?: React.ReactNode;
  description?: string;
};

export default function PageHeader({
  title,
  action,
  description,
}: PageHeaderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {title}
        </h1>
        {action}
      </div>

      {description && (
        <p className="text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}
