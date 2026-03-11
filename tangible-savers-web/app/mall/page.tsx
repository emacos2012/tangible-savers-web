'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import { Product, CartItem, Order } from '@/lib/types';
import { initiatePiPayment } from '@/lib/piPayments';
import Link from 'next/link';

// Sample products for demo (defined outside component)
const sampleProductsData: Product[] = [
  { id: 'p1', name: 'Organic Rice 5kg', description: 'Premium organic rice from local farms', price: 15, category: 'groceries', stock: 50, sellerId: 'seller1' },
  { id: 'p2', name: 'Fresh Vegetables Bundle', description: 'Fresh seasonal vegetables', price: 8, category: 'groceries', stock: 30, sellerId: 'seller1' },
  { id: 'p3', name: 'Cooking Oil 2L', description: 'Pure sunflower cooking oil', price: 12, category: 'groceries', stock: 45, sellerId: 'seller1' },
  { id: 'p4', name: 'Sugar 1kg', description: 'Fine crystal sugar', price: 5, category: 'groceries', stock: 60, sellerId: 'seller1' },
  { id: 'p5', name: 'Smartphone X12', description: 'Latest model smartphone with great features', price: 350, category: 'electronics', stock: 15, sellerId: 'seller2' },
  { id: 'p6', name: 'Wireless Earbuds', description: 'High quality wireless earbuds with noise cancellation', price: 45, category: 'electronics', stock: 40, sellerId: 'seller2' },
  { id: 'p7', name: 'Portable Charger', description: '20000mAh power bank', price: 25, category: 'electronics', stock: 35, sellerId: 'seller2' },
  { id: 'p8', name: 'Smart Watch', description: 'Fitness tracker with heart rate monitor', price: 80, category: 'electronics', stock: 20, sellerId: 'seller2' },
  { id: 'p9', name: 'Bedsheet Set', description: 'Queen size bedsheet with pillow covers', price: 30, category: 'home_goods', stock: 25, sellerId: 'seller3' },
  { id: 'p10', name: 'Kitchen Utensils Set', description: 'Complete kitchen utensils for cooking', price: 40, category: 'home_goods', stock: 18, sellerId: 'seller3' },
  { id: 'p11', name: 'Wall Clock', description: 'Modern decorative wall clock', price: 18, category: 'home_goods', stock: 30, sellerId: 'seller3' },
  { id: 'p12', name: 'LED Lamp', description: 'Energy saving LED desk lamp', price: 22, category: 'home_goods', stock: 28, sellerId: 'seller3' },
];

const ShoppingMallPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('groceries');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const categories = [
    { id: 'groceries', name: '🛒 Groceries' },
    { id: 'electronics', name: '📱 Electronics' },
    { id: 'home_goods', name: '🏠 Home Goods' },
  ];

  // Memoize sample products to keep reference stable
  const sampleProducts = useMemo(() => sampleProductsData, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from Firestore for category:', selectedCategory);
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('category', '==', selectedCategory));
        const productsSnap = await getDocs(q);
        
        console.log('Products query result:', productsSnap.size, 'documents');
        
        if (productsSnap.empty) {
          console.log('No products in Firestore, using sample data');
          const filteredProducts = sampleProducts.filter(p => p.category === selectedCategory);
          setProducts(filteredProducts);
        } else {
          const productsData = productsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as Product));
          setProducts(productsData);
        }
      } catch (error: unknown) {
        console.error('Error fetching products:', error);
        if (error instanceof Error && (error.message.includes('permission') || error.message.includes('Permission'))) {
          console.warn('Firestore permission error - using sample data. Check Firestore rules.');
        }
        const filteredProducts = sampleProducts.filter(p => p.category === selectedCategory);
        setProducts(filteredProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sampleProducts]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          quantity: 1,
          price: product.price,
        },
      ]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      setPaymentLoading(true);

      const ordersRef = collection(db, 'orders');
      const orderDoc = await addDoc(ordersRef, {
        userId: user.uid,
        items: cart,
        totalAmount: parseFloat(getCartTotal()),
        currency: 'Pi',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Order);

      const { paymentId } = await initiatePiPayment(
        user.uid,
        parseFloat(getCartTotal()),
        orderDoc.id,
        'Mall Purchase'
      );

      setCart([]);
      alert(`Payment initiated! Order ID: ${orderDoc.id}`);
      setShowCart(false);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <button className="mb-6 bg-[#FFD700] text-[#1A237E] hover:bg-[#FFC700] px-4 py-2 rounded font-semibold transition">
              ← Back to Home
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-[#1A237E] dark:text-[#FFD700] mb-2">Shopping Mall</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Browse and purchase from our exclusive marketplace</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-[#1A237E] text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="h-48 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-[#FFD700]">{product.price} Pi</span>
                          <span className="text-sm text-gray-500">
                            Stock: {product.stock}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className={`w-full py-2 rounded font-semibold transition ${
                            product.stock > 0
                              ? 'bg-[#1A237E] text-white hover:bg-[#283593]'
                              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No products in this category</p>
                )}
              </div>
            )}
          </div>

          <div
            className={`${
              showCart ? 'block' : 'hidden'
            } lg:block lg:col-span-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 h-fit sticky top-4`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A237E] dark:text-[#FFD700]">🛒 Cart</h2>
              <span className="bg-[#FFD700] text-[#1A237E] px-2 py-1 rounded text-sm font-bold">
                {cart.length}
              </span>
            </div>

            {cart.length > 0 ? (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="bg-white dark:bg-gray-800 p-3 rounded flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {getProductName(item.productId)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.quantity} x {item.price} Pi
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 dark:border-gray-700 pt-3 mb-4">
                  <p className="text-lg font-bold text-[#1A237E] dark:text-[#FFD700]">
                    Total: {getCartTotal()} Pi
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={paymentLoading}
                  className="w-full bg-[#FFD700] text-[#1A237E] hover:bg-[#FFC700] py-3 rounded font-bold transition disabled:opacity-50"
                >
                  {paymentLoading ? 'Processing...' : 'Checkout with Pi'}
                </button>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">Cart is empty</p>
            )}
          </div>

          <button
            onClick={() => setShowCart(!showCart)}
            className="lg:hidden fixed bottom-20 right-4 bg-[#FFD700] text-[#1A237E] p-4 rounded-full shadow-lg font-bold"
          >
            🛒 {cart.length}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingMallPage;

