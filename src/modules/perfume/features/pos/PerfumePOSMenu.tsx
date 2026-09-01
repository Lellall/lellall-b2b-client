import React, { useState, useMemo } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetPerfumeInventoryItemsQuery } from '@/redux/api/perfume-store/inventory.api';
import { useCreatePerfumeOrderMutation } from '@/redux/api/perfume-store/orders.api';
import { ShoppingCart, Add, Minus, TickCircle, SearchNormal1, FilterSearch } from 'iconsax-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReceiptModal from './ReceiptModal';
import { toast } from 'react-toastify';

const perfumeTheme = {
  colors: {
    primary: '#121212', 
    secondary: '#D4AF37', 
    secondaryLight: '#F3E5AB',
    background: '#FAFAFA', 
    surface: '#FFFFFF',
    text: '#1F2937',
    textLight: '#9CA3AF',
    border: '#E5E7EB',
    danger: '#EF4444'
  }
};

const POSContainer = styled.div`
  display: flex;
  height: calc(100vh - 100px);
  gap: 24px;
  background-color: ${props => props.theme.colors.background};
`;

const CatalogSection = styled.div`
  flex: 2.5;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 24px;
  padding: 8px 16px;
  width: 300px;
  transition: all 0.3s;
  
  &:focus-within {
    border-color: ${props => props.theme.colors.secondary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.secondaryLight};
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  margin-left: 8px;
  font-size: 14px;
`;

const FilterScroller = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 12px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }
`;

const FilterChip = styled.div<{ active?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.background};
  color: ${props => props.active ? props.theme.colors.secondary : props.theme.colors.text};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
`;

const ProductGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  overflow-y: auto;
  padding: 20px 4px;
  flex: 1;
`;

const getLiquidColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('oud') || n.includes('wood') || n.includes('musk')) return 'linear-gradient(135deg, #d4a373, #8a5a19)';
  if (n.includes('rose') || n.includes('floral') || n.includes('blossom')) return 'linear-gradient(135deg, #ffb6c1, #e67e98)';
  if (n.includes('fresh') || n.includes('aqua') || n.includes('blue')) return 'linear-gradient(135deg, #a8e6cf, #3b8d99)';
  if (n.includes('vanilla') || n.includes('sweet')) return 'linear-gradient(135deg, #f5e3b5, #e9c46a)';
  if (n.includes('night') || n.includes('noir') || n.includes('dark')) return 'linear-gradient(135deg, #7b2cbf, #3c096c)';
  return 'linear-gradient(135deg, #f0e6d2, #d4af37)'; 
};

const BottleContainer = styled(motion.div)<{ outOfStock?: boolean }>`
  position: relative;
  width: 100%;
  height: 290px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  cursor: ${props => props.outOfStock ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.outOfStock ? 0.5 : 1};
  padding-bottom: 20px;
`;

const BottleCap = styled.div`
  width: 38px;
  height: 28px;
  background: linear-gradient(to right, #c5a059, #f3e5ab, #c5a059);
  border-radius: 4px 4px 0 0;
  position: relative;
  z-index: 2;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.1);
  
  &::before {
    content: '';
    position: absolute;
    bottom: -4px;
    left: -4px;
    right: -4px;
    height: 6px;
    background: linear-gradient(to right, #a67c00, #d4af37, #a67c00);
    border-radius: 2px;
  }
`;

const BottleNeck = styled.div`
  width: 20px;
  height: 12px;
  background: rgba(255, 255, 255, 0.7);
  border-left: 2px solid rgba(255,255,255,0.9);
  border-right: 2px solid rgba(255,255,255,0.9);
  z-index: 1;
  position: relative;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.1);
`;

const BottleBody = styled.div<{ liquidBg: string }>`
  width: 140px;
  height: 180px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 40px 40px 8px 8px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-top: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    inset 0 0 15px rgba(255, 255, 255, 0.6),
    inset -8px -8px 20px rgba(0, 0, 0, 0.05),
    0 15px 30px rgba(0,0,0,0.08);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70%;
    background: ${props => props.liquidBg};
    border-radius: 0 0 6px 6px;
    opacity: 0.85;
    z-index: 0;
    transition: all 0.3s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 5%;
    left: 12%;
    width: 25%;
    height: 85%;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
    border-radius: 50%;
    transform: skewX(-12deg);
    z-index: 2;
    pointer-events: none;
  }
  
  ${BottleContainer}:hover &::before {
    height: 73%;
    opacity: 0.95;
  }
`;

const BottleLabel = styled.div`
  background: #FFFFFF;
  width: 82%;
  padding: 14px 8px;
  border-radius: 2px;
  position: relative;
  z-index: 3;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '';
    position: absolute;
    top: 4px; left: 4px; right: 4px; bottom: 4px;
    border: 1px solid rgba(212, 175, 55, 0.3);
    pointer-events: none;
  }
`;

const BottleBrand = styled.div`
  font-size: 8px;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 2.5px;
`;

const BottleName = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
`;

const BottlePrice = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #d4af37;
`;

const OutOfStockBadge = styled.div`
  position: absolute;
  top: 10px;
  right: -10px;
  background: #EF4444;
  color: white;
  font-size: 9px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
  transform: rotate(15deg);
  z-index: 5;
`;

const AddToBagHint = styled.div`
  position: absolute;
  bottom: -10px;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  
  ${BottleContainer}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CartSection = styled.div`
  flex: 1;
  min-width: 350px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const CartHeader = styled.div`
  padding: 24px;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${props => props.theme.colors.surface};
`;

const CartTitle = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors.secondary};
`;

const CartItems = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CartItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ItemInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme.colors.surface};
  padding: 4px;
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
  width: 120px;
`;

const ControlButton = styled(motion.button)<{ danger?: boolean }>`
  background: ${props => props.danger ? '#FEE2E2' : props.theme.colors.background};
  border: none;
  color: ${props => props.danger ? props.theme.colors.danger : props.theme.colors.primary};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
`;

const CartSummary = styled.div`
  padding: 24px;
  background: ${props => props.theme.colors.background};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: ${props => props.theme.colors.text};
  
  &.total {
    font-size: 24px;
    font-weight: 600;
    color: ${props => props.theme.colors.primary};
    border-top: 1px dashed ${props => props.theme.colors.border};
    padding-top: 16px;
    margin-top: 8px;
  }
`;

const CheckoutButton = styled(motion.button)`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.secondary};
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PerfumePOSMenu: React.FC = () => {
  const { user } = useSelector(selectAuth);
  const { data: inventory } = useGetPerfumeInventoryItemsQuery(user?.perfumeStoreId || '', { skip: !user?.perfumeStoreId });
  const [createOrder, { isLoading: isCreating }] = useCreatePerfumeOrderMutation();
  
  const [cart, setCart] = useState<any[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');

  const PAYMENT_OPTIONS = [
    { value: 'CASH', label: 'Cash' },
    { value: 'TRANSFER', label: 'Transfer' },
    { value: 'CARD', label: 'Card' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'DELIVERY', label: 'Delivery' },
  ];

  const categories = useMemo(() => {
    if (!inventory) return ['All'];
    const cats = new Set<string>();
    inventory.forEach((item: any) => {
      if (item.category) cats.add(item.category);
    });
    return ['All', ...Array.from(cats)];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter((item: any) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, activeCategory]);

  const addToCart = (product: any) => {
    if (product.currentStock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          toast.warning(`Only ${product.currentStock} in stock`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ < 1) return item;
        if (delta > 0 && newQ > item.currentStock) {
          toast.warning(`Only ${item.currentStock} in stock`);
          return item;
        }
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const payload = {
        storeId: user?.perfumeStoreId,
        totalAmount: total,
        paymentMethod,
        items: cart.map(item => ({
          inventoryItemId: item.id,
          quantity: item.quantity,
          unitPrice: item.cost,
        }))
      };

      const result = await createOrder(payload).unwrap();
      toast.success("Transaction completed successfully");
      setReceiptOrder({ ...result, paymentMethod });
      setCart([]);
    } catch (e) {
      toast.error("Failed to process transaction");
    }
  };

  return (
    <ThemeProvider theme={perfumeTheme}>
      <POSContainer>
        <CatalogSection>
          <HeaderRow>
            <SectionTitle>Boutique Collections</SectionTitle>
            <SearchContainer>
              <SearchNormal1 size="18" color={perfumeTheme.colors.textLight} />
              <SearchInput 
                placeholder="Search fragrances, brands..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
          </HeaderRow>

          <FilterScroller>
            {categories.map(cat => (
              <FilterChip 
                key={cat} 
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'All' && <FilterSearch size="16" />}
                {cat}
              </FilterChip>
            ))}
          </FilterScroller>

          <ProductGrid layout>
            <AnimatePresence>
              {filteredInventory.map((item: any) => (
                <BottleContainer 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={item.currentStock > 0 ? { y: -8 } : {}}
                  onClick={() => addToCart(item)}
                  outOfStock={item.currentStock <= 0}
                >
                  <BottleCap />
                  <BottleNeck />
                  <BottleBody liquidBg={getLiquidColor(item.name)}>
                    <BottleLabel>
                      <BottleBrand>{item.brand}</BottleBrand>
                      <BottleName>{item.name}</BottleName>
                      <BottlePrice>₦{item.cost.toLocaleString()}</BottlePrice>
                    </BottleLabel>
                  </BottleBody>
                  
                  {item.currentStock <= 0 && (
                    <OutOfStockBadge>SOLD OUT</OutOfStockBadge>
                  )}
                  {item.currentStock > 0 && (
                    <AddToBagHint>+ Add to Bag</AddToBagHint>
                  )}
                </BottleContainer>
              ))}
            </AnimatePresence>
            
            {filteredInventory.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: perfumeTheme.colors.textLight }}>
                No fragrances match your criteria.
              </div>
            )}
          </ProductGrid>
        </CatalogSection>

        <CartSection>
          <CartHeader>
            <CartTitle>
              <ShoppingCart size="24" variant="Bold" />
              Current Order
            </CartTitle>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '16px', fontSize: '14px' }}>
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </div>
          </CartHeader>
          
          <CartItems>
            <AnimatePresence>
              {cart.map(item => (
                <CartItem 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ItemInfo>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: perfumeTheme.colors.primary }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: perfumeTheme.colors.textLight }}>{item.brand}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: perfumeTheme.colors.secondary }}>
                      ₦{(item.cost * item.quantity).toLocaleString()}
                    </div>
                  </ItemInfo>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <QuantityControl>
                      <ControlButton whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size="16" />
                      </ControlButton>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.quantity}</span>
                      <ControlButton whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(item.id, 1)}>
                        <Add size="16" />
                      </ControlButton>
                    </QuantityControl>
                    
                    <ControlButton danger whileTap={{ scale: 0.9 }} onClick={() => removeFromCart(item.id)}>
                      <Minus size="18" variant="Bold" />
                    </ControlButton>
                  </div>
                </CartItem>
              ))}
            </AnimatePresence>
            
            {cart.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: perfumeTheme.colors.textLight, gap: '16px' }}
              >
                <ShoppingCart size="48" opacity="0.2" />
                <span>Your bag is empty</span>
              </motion.div>
            )}
          </CartItems>
          
          <CartSummary>
            <SummaryRow>
              <span>Subtotal</span>
              <span>₦{total.toLocaleString()}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Tax (0%)</span>
              <span>₦0</span>
            </SummaryRow>
            <SummaryRow className="total">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </SummaryRow>

            {/* Payment Type Selector */}
            <div style={{ marginTop: '16px', marginBottom: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: perfumeTheme.colors.textLight, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Payment Method
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {PAYMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: `1.5px solid ${paymentMethod === opt.value ? perfumeTheme.colors.secondary : perfumeTheme.colors.border}`,
                      background: paymentMethod === opt.value ? perfumeTheme.colors.secondary : 'transparent',
                      color: paymentMethod === opt.value ? '#fff' : perfumeTheme.colors.text,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <CheckoutButton 
              whileHover={cart.length > 0 && !isCreating ? { scale: 1.02 } : {}}
              whileTap={cart.length > 0 && !isCreating ? { scale: 0.98 } : {}}
              onClick={handleCheckout} 
              disabled={cart.length === 0 || isCreating}
            >
              <TickCircle size="20" variant="Bold" />
              {isCreating ? 'Processing...' : 'Complete Order'}
            </CheckoutButton>
          </CartSummary>
        </CartSection>

        {receiptOrder && (
          <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
        )}
      </POSContainer>
    </ThemeProvider>
  );
};

export default PerfumePOSMenu;
