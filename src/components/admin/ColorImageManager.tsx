import { useState } from 'react';
import { X, Upload, Plus, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getColorHex, isLightColor } from '@/components/ColorSelector';
import { toast } from 'sonner';

interface ColorImageManagerProps {
  colors: string[];
  colorImages: Record<string, string[]>;
  onColorImagesChange: (colorImages: Record<string, string[]>) => void;
}

const ColorImageManager = ({ colors, colorImages, onColorImagesChange }: ColorImageManagerProps) => {
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '');
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `color-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !selectedColor) return;

    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        newUrls.push(url);
      }

      const currentImages = colorImages[selectedColor] || [];
      onColorImagesChange({
        ...colorImages,
        [selectedColor]: [...currentImages, ...newUrls]
      });
      toast.success(`تم رفع ${files.length} صورة للون ${selectedColor}`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('حدث خطأ أثناء رفع الصور');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (color: string, imageIndex: number) => {
    const currentImages = colorImages[color] || [];
    const newImages = currentImages.filter((_, i) => i !== imageIndex);
    
    if (newImages.length === 0) {
      const newColorImages = { ...colorImages };
      delete newColorImages[color];
      onColorImagesChange(newColorImages);
    } else {
      onColorImagesChange({
        ...colorImages,
        [color]: newImages
      });
    }
  };

  if (colors.length === 0) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground text-sm">
        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        أضف ألواناً أولاً لربط الصور بها
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">ربط الصور بالألوان</label>
      
      {/* Color Tabs */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const hasImages = (colorImages[color] || []).length > 0;
          const hex = getColorHex(color);
          const isLight = isLightColor(hex);
          
          return (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                selectedColor === color
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span
                className="w-5 h-5 rounded-full border border-border/50"
                style={{ backgroundColor: hex }}
              />
              <span className="text-sm">{color}</span>
              {hasImages && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {colorImages[color].length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Color Images */}
      {selectedColor && (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full border border-border/50"
                style={{ backgroundColor: getColorHex(selectedColor) }}
              />
              صور اللون: {selectedColor}
            </p>
            <span className="text-xs text-muted-foreground">
              {(colorImages[selectedColor] || []).length} صورة
            </span>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-4 gap-3">
            {(colorImages[selectedColor] || []).map((img, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={img}
                  alt={`${selectedColor} - ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(selectedColor, index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1 rounded">
                    رئيسية
                  </span>
                )}
              </div>
            ))}

            {/* Upload Button */}
            <label className={`aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">إضافة</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            الصورة الأولى ستظهر عند اختيار هذا اللون
          </p>
        </div>
      )}

      {/* Summary */}
      {Object.keys(colorImages).length > 0 && (
        <div className="p-3 bg-primary/5 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">ملخص الصور المرتبطة:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(colorImages).map(([color, images]) => (
              <span
                key={color}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-background rounded-full text-xs"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                {color}: {images.length} صورة
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorImageManager;
