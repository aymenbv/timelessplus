import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from '@/hooks/useOrders';

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
  TrendingUp,
  Menu,
  X,
  Eye,
  Calendar,
  MapPin,
  Phone,
  User,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ProductFormModal from '@/components/admin/ProductFormModal';
import ReviewFormModal from '@/components/admin/ReviewFormModal';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { isVideoUrl } from '@/lib/mediaUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'reviews'>('overview');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const hasRedirected = useRef(false);
  
  // Orders search and filter state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>('all');

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
    // Prevent multiple redirects
    if (hasRedirected.current) return;
    
    // Only redirect after auth is fully loaded
    if (!authLoading && (!user || !isAdmin)) {
      hasRedirected.current = true;
      navigate('/admin', { replace: true });
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
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default:
        return 'bg-muted text-muted-foreground';
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
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  const navItems = [
    { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
    { id: 'orders', label: 'الطلبات', icon: ShoppingBag, badge: pendingOrders },
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'reviews', label: 'التقييمات', icon: MessageSquare },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 right-0 left-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-display text-xl text-primary">Timeless</h1>
        <button
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed right-0 top-0 h-full w-72 bg-card border-l border-border/50 z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-2xl text-primary">Timeless</h1>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="mr-auto bg-destructive text-destructive-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed right-0 top-0 h-full w-72 bg-card/50 backdrop-blur-xl border-l border-border/50 p-6 flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="font-display text-primary text-lg">T</span>
          </div>
          <h1 className="font-display text-2xl text-primary">Timeless</h1>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="mr-auto bg-destructive text-destructive-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-border/50 pt-4 mt-4">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">مدير</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-72 pt-20 lg:pt-8 pb-8 px-4 lg:px-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-display text-3xl lg:text-4xl">مرحباً بك 👋</h2>
                <p className="text-muted-foreground mt-2">إليك نظرة عامة على متجرك</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 lg:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-emerald-500" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-muted-foreground text-sm">إجمالي الإيرادات</p>
                  <p className="font-display text-xl lg:text-2xl text-foreground mt-1">{formatPrice(totalRevenue)}</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-5 lg:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">إجمالي الطلبات</p>
                  <p className="font-display text-xl lg:text-2xl text-foreground mt-1">{orders.length}</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-5 lg:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">قيد الانتظار</p>
                  <p className="font-display text-xl lg:text-2xl text-foreground mt-1">{pendingOrders}</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-5 lg:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">المنتجات</p>
                  <p className="font-display text-xl lg:text-2xl text-foreground mt-1">{products.length}</p>
                </motion.div>
              </div>

              {/* Recent Orders */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl">آخر الطلبات</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-sm text-primary hover:underline"
                  >
                    عرض الكل
                  </button>
                </div>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">لا توجد طلبات</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.phone}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-primary">{formatPrice(order.total)}</p>
                          <span className={`inline-block text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl">الطلبات</h2>
                  <p className="text-muted-foreground mt-1">{orders.length} طلب إجمالي</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-sm">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    {pendingOrders} قيد الانتظار
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {confirmedOrders} مؤكد
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-full text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    {shippedOrders} تم الشحن
                  </span>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ابحث باسم العميل أو رقم الطلب..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-card/50 border border-border/50 rounded-xl pr-12 pl-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value as typeof orderStatusFilter)}
                  className="bg-card/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary cursor-pointer min-w-[150px]"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                </select>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .filter((order) => {
                      const matchesSearch = orderSearch === '' || 
                        order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        order.id.toLowerCase().includes(orderSearch.toLowerCase());
                      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{order.customerName}</h3>
                              <span className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono">#{order.id.slice(0, 8)}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                {order.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {order.wilaya}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: ar })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mr-16 lg:mr-0">
                          <div className="text-left">
                            <p className="text-sm text-muted-foreground">المجموع</p>
                            <p className="font-display text-lg text-primary">{formatPrice(order.total)}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as 'pending' | 'confirmed' | 'shipped' | 'delivered')
                              }
                              className="bg-secondary border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">مؤكد</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="delivered">تم التوصيل</option>
                            </select>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2.5 bg-secondary hover:bg-primary/10 rounded-xl transition-colors"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
                                  try {
                                    await deleteOrder.mutateAsync(order.id);
                                    toast.success('تم حذف الطلب');
                                  } catch {
                                    toast.error('فشل حذف الطلب');
                                  }
                                }
                              }}
                              className="p-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl">المنتجات</h2>
                  <p className="text-muted-foreground mt-1">{products.length} منتج</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="btn-luxury flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  إضافة منتج
                </button>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">لا توجد منتجات</p>
                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    className="btn-luxury-outline"
                  >
                    إضافة أول منتج
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all"
                    >
                      <div className="relative aspect-square overflow-hidden bg-secondary">
                        {isVideoUrl(product.image || '') ? (
                          <video
                            src={product.image || ''}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            muted
                            loop
                            autoPlay
                            playsInline
                          />
                        ) : (
                          <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingProduct(product);
                                setIsProductModalOpen(true);
                              }}
                              className="flex-1 bg-white/90 text-background py-2.5 rounded-xl text-sm font-medium hover:bg-white transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Edit className="w-4 h-4" />
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
                              className="p-2.5 bg-destructive/90 text-destructive-foreground rounded-xl hover:bg-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand}</p>
                          {product.isFeatured && (
                            <Star className="w-4 h-4 fill-primary text-primary" />
                          )}
                        </div>
                        <h3 className="font-display text-lg mt-1 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center justify-between mt-3">
                          <p className="font-semibold text-primary">{formatPrice(product.price)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${product.inStock ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {product.inStock ? 'متوفر' : 'غير متوفر'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl">التقييمات</h2>
                  <p className="text-muted-foreground mt-1">{reviews.length} تقييم</p>
                </div>
                <button 
                  onClick={() => setIsReviewModalOpen(true)}
                  className="btn-luxury flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  إضافة تقييم
                </button>
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">لا توجد تقييمات</p>
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="btn-luxury-outline"
                  >
                    إضافة أول تقييم
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {reviews.map((review: any, index: number) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {review.reviewer_image ? (
                          <img
                            src={review.reviewer_image}
                            alt={review.user_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold">{review.user_name}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {review.products?.name} - {review.products?.brand}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
                                  deleteReview(review.id);
                                }
                              }}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-2">{renderStars(review.rating)}</div>
                          <p className="text-muted-foreground text-sm mt-3 line-clamp-3">{review.comment}</p>
                          <p className="text-xs text-muted-foreground/60 mt-3">
                            {format(new Date(review.created_at), 'dd MMM yyyy', { locale: ar })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedOrder.customerName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">الولاية</p>
                  <p className="font-medium">{selectedOrder.wilaya}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">البلدية</p>
                  <p className="font-medium">{selectedOrder.commune || '-'}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">طريقة الدفع</p>
                  <p className="font-medium">{selectedOrder.paymentMethod === 'cod' ? 'عند الاستلام' : 'بطاقة'}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">التاريخ</p>
                  <p className="font-medium">{format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy')}</p>
                </div>
              </div>

              <div className="p-4 bg-secondary/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2">المنتجات</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span>{item.productName} × {item.quantity}</span>
                      <span className="text-primary">{formatPrice(item.productPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl">
                <span className="font-semibold">المجموع</span>
                <span className="font-display text-xl text-primary">{formatPrice(selectedOrder.total)}</span>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value as any);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }}
                  className="flex-1 bg-secondary border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                </select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default AdminDashboard;
