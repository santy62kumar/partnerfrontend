import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';

const BOMTreeNode = ({ node, depth = 0, onAddToBucket }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const hasChildren = node.children && node.children.length > 0;
  
  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };
  
  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors ${
          depth === 0 ? 'bg-[#3D1D1C]/50 font-semibold' : ''
        }`}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {/* Expand/Collapse Icon */}
        <button
          onClick={toggleExpand}
          className={`flex-shrink-0 ${!hasChildren ? 'invisible' : ''}`}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
        
        {/* Product Name */}
        <span className="flex-1 text-sm">
          {node.product_name}
          {node.cabinet_position && (
            <span className="ml-2 text-xs text-gray-500">
              (Position: {node.cabinet_position})
            </span>
          )}
        </span>
        
        {/* Add to Bucket Button */}
        <button
          onClick={() => onAddToBucket(node)}
          className="flex-shrink-0 p-1.5 text-[#3D1D1C] hover:bg-[#3D1D1C]/10 rounded transition-colors"
          title="Add to bucket"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child, index) => (
            <BOMTreeNode
              key={`${child.product_name}-${index}`}
              node={child}
              depth={depth + 1}
              onAddToBucket={onAddToBucket}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BOMTreeNode;