import { cn } from '@/lib/utils';
import { getColorHex } from './ColorSelector';

interface ColorIndicatorsProps {
  colors: string[];
  colorImages?: Record<string, string[]>;
  maxShow?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const ColorIndicators = ({
  colors,
  colorImages,
  maxShow = 4,
  size = 'xs',
  className
}: ColorIndicatorsProps) => {
  if (!colors || colors.length === 0) return null;

  const displayColors = colors.slice(0, maxShow);
  const remainingCount = colors.length - maxShow;

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  const indicatorSizeClasses = {
    xs: 'w-1.5 h-1.5 -top-0.5 -right-0.5',
    sm: 'w-2 h-2 -top-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 -top-1 -right-1'
  };

  // Check if a color has associated images
  const hasImages = (color: string): boolean => {
    return !!(colorImages && colorImages[color] && colorImages[color].length > 0);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {displayColors.map((color, index) => {
        const hexColor = getColorHex(color);
        const hasColorImages = hasImages(color);
        
        return (
          <div
            key={color}
            className="relative"
            title={color}
            style={{ 
              marginRight: index > 0 ? '-4px' : '0',
              zIndex: displayColors.length - index
            }}
          >
            <span
              className={cn(
                sizeClasses[size],
                'block rounded-full border border-border/50',
                hexColor === '#FFFFFF' && 'border-muted-foreground/30'
              )}
              style={{ backgroundColor: hexColor }}
            />
            {/* Visual indicator for colors with images */}
            {hasColorImages && (
              <span
                className={cn(
                  'absolute rounded-full bg-primary border border-background',
                  indicatorSizeClasses[size]
                )}
                title="صور متوفرة لهذا اللون"
              />
            )}
          </div>
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
