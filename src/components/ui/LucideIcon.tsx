import { icons } from 'lucide-react';

interface LucideIconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export function LucideIcon({ name, size = 16, className = '', strokeWidth = 2, style }: LucideIconProps) {
  // Convert kebab-case to PascalCase for lucide lookup
  const pascalName = name
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as keyof typeof icons;

  const Icon = icons[pascalName];
  if (!Icon) {
    // Fallback to a tag icon
    const Fallback = icons['Tag'];
    return <Fallback size={size} className={className} strokeWidth={strokeWidth} style={style} />;
  }
  return <Icon size={size} className={className} strokeWidth={strokeWidth} style={style} />;
}
