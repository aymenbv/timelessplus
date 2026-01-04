import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, CartItem } from '@/types';

interface OrderWithItems {
  id: string;
  customer_name: string;
  phone: string;
  wilaya: string;
  payment_method: 'cod' | 'card';
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  created_at: string;
  referral_code: string | null;
  order_items: {
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    selected_color: string | null;
  }[];
}

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            product_price,
            quantity,
            selected_color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data as OrderWithItems[]).map((order) => ({
        id: order.id,
        customerName: order.customer_name,
        phone: order.phone,
        wilaya: order.wilaya,
        paymentMethod: order.payment_method,
        total: Number(order.total),
        status: order.status,
        createdAt: new Date(order.created_at),
        referralCode: order.referral_code || undefined,
        items: order.order_items.map((item) => ({
          product: {
            id: item.id,
            name: item.product_name,
            brand: '',
            price: Number(item.product_price),
            image: '',
            category: 'men' as const,
            movement: 'automatic' as const,
            material: 'metal' as const,
            description: '',
            inStock: true,
          },
          quantity: item.quantity,
          selectedColor: item.selected_color || undefined,
        })),
      }));
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerName,
      phone,
      wilaya,
      commune,
      paymentMethod,
      total,
      items,
      referralCode,
    }: {
      customerName: string;
      phone: string;
      wilaya: string;
      commune: string;
      paymentMethod: 'cod' | 'card';
      total: number;
      items: CartItem[];
      referralCode?: string;
    }) => {
      // Generate order ID on frontend to avoid needing SELECT after INSERT
      const orderId = crypto.randomUUID();

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_name: customerName,
          phone,
          wilaya,
          commune,
          payment_method: paymentMethod,
          total,
          status: 'pending',
          referral_code: referralCode || null,
        });

      if (orderError) throw orderError;

      // Helper to check if string is valid UUID
      const isValidUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: isValidUUID(item.product.id) ? item.product.id : null,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        selected_color: item.selectedColor || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { id: orderId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
