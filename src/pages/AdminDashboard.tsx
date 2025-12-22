import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import {
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  LogOut,
  Plus,
  Trash2,
  Loader2,
  Edit,
  Star,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ProductFormModal from '@/components/admin/ProductFormModal';
import ReviewFormModal from '@/components/admin/ReviewFormModal';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'reviews'>('overview');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(name, brand)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('تم حذف التقييم');
    } catch {
      toast.error('فشل حذف التقييم');
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast.success('تم تسجيل الخروج');
    navigate('/admin');
  };

  const handleStatusChange = async (orderId: string, status: 'pending' | 'confirmed' | 'shipped' | 'delivered') => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success('تم تحديث حالة الطلب');
    } catch {
      toast.error('فشل تحديث حالة الطلب');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ').format(price) + ' دج';
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'confirmed':
        return 'text-blue-500';
      case 'shipped':
        return 'text-purple-500';
      case 'delivered':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'confirmed':
        return 'مؤكد';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التوصيل';
      default:
        return status;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 h-full w-64 bg-card border-l border-border/50 p-6 flex flex-col">
        <h1 className="font-display text-2xl text-primary mb-8">Timeless</h1>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            الطلبات
            {pendingOrders > 0 && (
              <span className="mr-auto bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                {pendingOrders}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'products' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
            }`}
          >
            <Package className="w-5 h-5" />
            المنتجات
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'reviews' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            التقييمات
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </aside>

      {/* Main Content */}
      <main className="mr-64 p-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <h2 className="font-display text-3xl">نظرة عامة</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card border border-border/50 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">إجمالي الإيرادات</p>
                    <p className="font-display text-2xl text-foreground">{formatPrice(totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">إجمالي الطلبات</p>
                    <p className="font-display text-2xl text-foreground">{orders.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">طلبات قيد الانتظار</p>
                    <p className="font-display text-2xl text-foreground">{pendingOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">التقييمات</p>
                    <p className="font-display text-2xl text-foreground">{reviews.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="font-display text-3xl">الطلبات</h2>

            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground">لا توجد طلبات حتى الآن</p>
            ) : (
              <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-right px-6 py-4 text-sm font-medium">رقم الطلب</th>
                      <th className="text-right px-6 py-4 text-sm font-medium">العميل</th>
                      <th className="text-right px-6 py-4 text-sm font-medium">المجموع</th>
                      <th className="text-right px-6 py-4 text-sm font-medium">الحالة</th>
                      <th className="text-right px-6 py-4 text-sm font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-border/50">
                        <td className="px-6 py-4 text-sm">{order.id.slice(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p>{order.customerName}</p>
                            <p className="text-muted-foreground text-xs">{order.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as 'pending' | 'confirmed' | 'shipped' | 'delivered')
                            }
                            className="bg-background border border-border rounded px-3 py-1 text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="confirmed">مؤكد</option>
                            <option value="shipped">تم الشحن</option>
                            <option value="delivered">تم التوصيل</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl">المنتجات</h2>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="btn-luxury flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة منتج
              </button>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-card border border-border/50 rounded-lg overflow-hidden"
                  >
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-muted-foreground text-sm">{product.brand}</p>
                      <h3 className="font-display text-lg mt-1">{product.name}</h3>
                      <p className="text-primary font-semibold mt-2">{formatPrice(product.price)}</p>
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductModalOpen(true);
                          }}
                          className="flex-1 btn-luxury-outline text-xs py-2 flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          تعديل
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                              try {
                                await deleteProduct.mutateAsync(product.id);
                                toast.success('تم حذف المنتج');
                              } catch {
                                toast.error('فشل حذف المنتج');
                              }
                            }
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl">التقييمات</h2>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="btn-luxury flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة تقييم
              </button>
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-muted-foreground">لا توجد تقييمات حتى الآن</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="bg-card border border-border/50 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {review.reviewer_image ? (
                          <img
                            src={review.reviewer_image}
                            alt={review.user_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-bold text-lg">
                              {review.user_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{review.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'd MMMM yyyy', { locale: ar })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
                            deleteReview(review.id);
                          }
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        {review.products?.brand} - {review.products?.name}
                      </p>
                      {renderStars(Number(review.rating))}
                      <p className="mt-3 text-sm">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
          }}
        />

        <ReviewFormModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
          }}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
