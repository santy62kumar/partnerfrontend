import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@components/ui/button';

const BOMTreeNode = ({ node, depth = 0, selectedProducts, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-3 hover:bg-secondary rounded-lg transition-colors ${depth === 0 ? 'bg-primary/5 font-semibold' : ''
          }`}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={isExpanded ? `Collapse ${node.product_name}` : `Expand ${node.product_name}`}
          onClick={toggleExpand}
          className={`shrink-0 ${!hasChildren ? 'invisible' : ''}`}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>

        <span className="flex-1 text-sm">
          {node.product_name}
          {node.cabinet_position && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Position: {node.cabinet_position})
            </span>
          )}
        </span>

        <input
          type="checkbox"
          checked={selectedProducts.has(node.product_name)}
          onChange={(event) => onToggle(node, event.target.checked)}
          className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
          aria-label={`Select ${node.product_name}`}
        />
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child, index) => (
            <BOMTreeNode
              key={`${child.product_name}-${index}`}
              node={child}
              depth={depth + 1}
              selectedProducts={selectedProducts}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BOMTreeNode;
