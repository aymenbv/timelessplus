import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

// قاموس الألوان - ربط الأسماء العربية بأكواد الألوان
export const colorMap: Record<string, string> = {
  'أسود': '#000000',
  'أبيض': '#FFFFFF',
  'ذهبي': '#D4AF37',
  'فضي': '#C0C0C0',
  'بني': '#8B4513',
  'أزرق': '#1E40AF',
  'أزرق فاتح': '#60A5FA',
  'أزرق داكن': '#1E3A5F',
  'أحمر': '#DC2626',
  'أخضر': '#16A34A',
  'رمادي': '#6B7280',
  'بيج': '#F5F5DC',
  'برتقالي': '#EA580C',
  'وردي': '#EC4899',
  'بنفسجي': '#7C3AED',
  'روز جولد': '#B76E79',
  'نحاسي': '#B87333',
  'كحلي': '#000080',
  // English fallbacks
  'black': '#000000',
  'white': '#FFFFFF',
  'gold': '#D4AF37',
  'silver': '#C0C0C0',
  'brown': '#8B4513',
  'blue': '#1E40AF',
  'red': '#DC2626',
  'green': '#16A34A',
  'gray': '#6B7280',
  'rose gold': '#B76E79',
};

// دالة للحصول على لون HEX من الاسم
export const getColorHex = (colorName: string): string => {
  const normalizedName = colorName.toLowerCase().trim();
  
  // إذا كان الاسم موجود في القاموس
  if (colorMap[colorName]) return colorMap[colorName];
  if (colorMap[normalizedName]) return colorMap[normalizedName];
  
  // إذا كان بالفعل كود لون
  if (colorName.startsWith('#')) return colorName;
  
  // لون افتراضي
  return '#6B7280';
};

// دالة لتحديد إذا كان اللون فاتح (لتحديد لون الأيقونة)
const isLightColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ColorSelector = ({
  colors,
  selectedColor,
  onColorSelect,
  size = 'md',
  showLabel = true,
  className
}: ColorSelectorProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const checkSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (!colors || colors.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">اللون</span>
          {selectedColor && (
            <span className="text-sm text-muted-foreground">{selectedColor}</span>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const hexColor = getColorHex(color);
          const isSelected = selectedColor === color;
          const isLight = isLightColor(hexColor);
          
          return (
            <button
              key={color}
              type="button"
              onClick={() => onColorSelect(color)}
              title={color}
              className={cn(
                sizeClasses[size],
                'rounded-full transition-all duration-200 flex items-center justify-center',
                'border-2 hover:scale-110',
                isSelected 
                  ? 'border-primary ring-2 ring-primary/30 scale-110' 
                  : 'border-border hover:border-primary/50',
                hexColor === '#FFFFFF' && 'border-muted-foreground/30'
              )}
              style={{ backgroundColor: hexColor }}
            >
              {isSelected && (
                <Check 
                  className={cn(
                    checkSizeClasses[size],
                    isLight ? 'text-foreground' : 'text-white'
                  )} 
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;
