import { memo } from 'react';
import { CheckCircle2, Circle, Star, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { togglePacked } from '../../db/hooks';
import { LucideIcon } from '../ui/LucideIcon';
import { isRestricted } from '../../lib/carryOnRules';
import type { PackingItem } from '../../db/models';

interface ItemRowProps {
  item: PackingItem;
  isFlight: boolean;
  unusedNames: Set<string>;
  onEdit: () => void;
  onDelete: () => void;
  isMustPack?: boolean;
}

export const ItemRow = memo(function ItemRow({
  item, isFlight, unusedNames, onEdit, onDelete, isMustPack,
}: ItemRowProps) {
  const restricted = isFlight && isRestricted(item.name);
  const unused = unusedNames.has(item.name.toLowerCase());

  return (
    <div className="flex items-center gap-3" style={{ padding: 'var(--card-px)' }}>
      <button onClick={() => { togglePacked(item.id, !item.isPacked).catch(() => {}); }} className="p-1 -m-1">
        {item.isPacked
          ? <CheckCircle2 size={22} className="text-[var(--salmon)]" />
          : <Circle size={22} className="text-[var(--lavender)] opacity-40" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium ${item.isPacked ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
          {item.name}
        </p>
        {item.quantity > 1 && (
          <p className="text-[12px] text-[var(--text-secondary)]">&times;{item.quantity}</p>
        )}
        {unused && (
          <p className="text-[12px] text-[var(--salmon)] cursor-help" title="Based on your feedback from a previous trip">Not used last trip</p>
        )}
        {restricted && (
          <p className="text-[12px] font-medium text-[var(--salmon)] flex items-center gap-1">
            <LucideIcon name="plane" size={11} /> Check-in bag only
          </p>
        )}
      </div>
      {isMustPack && (
        <AlertCircle size={14} className="text-[var(--lavender)] shrink-0" />
      )}
      {!isMustPack && item.isMustPack && (
        <Star size={11} className="text-[var(--lavender)] shrink-0" fill="var(--lavender)" />
      )}
      <button onClick={onEdit} aria-label={`Edit ${item.name}`} className="p-2.5 -m-1 rounded-full hover:bg-[var(--border)]">
        <Pencil size={15} className="text-[var(--text-secondary)]" />
      </button>
      <button onClick={onDelete} aria-label={`Delete ${item.name}`} className="p-2.5 -m-1 rounded-full hover:bg-[var(--border)]">
        <Trash2 size={15} className="text-[var(--destructive)]" />
      </button>
    </div>
  );
}, (prev, next) =>
  prev.item.id === next.item.id &&
  prev.item.isPacked === next.item.isPacked &&
  prev.item.name === next.item.name &&
  prev.item.quantity === next.item.quantity &&
  prev.item.isMustPack === next.item.isMustPack &&
  prev.item.category === next.item.category &&
  prev.isFlight === next.isFlight &&
  prev.unusedNames === next.unusedNames &&
  prev.isMustPack === next.isMustPack
);
