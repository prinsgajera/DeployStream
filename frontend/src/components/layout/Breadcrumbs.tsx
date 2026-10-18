import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex items-center gap-1.5 flex-wrap text-xs font-mono text-zinc-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="rounded transition-all duration-200 hover:text-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className={isLast ? "text-zinc-200 font-semibold truncate" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
          </li>
        );
      })}
    </ol>
  </nav>
);
