import { cn } from '@/lib/utils';
import { getColorHex } from './ColorSelector';

interface ColorIndicatorsProps {
  colors: string[];
  maxShow?: number;
  size?: 'xs' | 'sm';
  className?: string;
}

const ColorIndicators = ({
  colors,
  maxShow = 4,
  size = 'xs',
  className
}: ColorIndicatorsProps) => {
  if (!colors || colors.length === 0) return null;

  const displayColors = colors.slice(0, maxShow);
  const remainingCount = colors.length - maxShow;

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4'
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {displayColors.map((color, index) => {
        const hexColor = getColorHex(color);
        return (
          <span
            key={color}
            title={color}
            className={cn(
              sizeClasses[size],
              'rounded-full border border-border/50',
              hexColor === '#FFFFFF' && 'border-muted-foreground/30'
            )}
            style={{ 
              backgroundColor: hexColor,
              marginRight: index > 0 ? '-4px' : '0',
              zIndex: displayColors.length - index
            }}
          />
        );
      })}
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground mr-1">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

export default ColorIndicators;
