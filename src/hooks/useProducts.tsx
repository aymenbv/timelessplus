import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: Number(p.price),
        image: p.image || '',
        galleryImages: p.gallery_images || [],
        category: p.category as Product['category'],
        movement: p.movement as Product['movement'],
        material: p.material as Product['material'],
        description: p.description || '',
        colors: p.colors || [],
        inStock: p.in_stock ?? true,
        isFeatured: p.is_featured ?? false,
      }));
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
