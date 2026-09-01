import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseCircle, Printer } from 'iconsax-react';
import { useGetPerfumeReceiptQuery } from '@/redux/api/perfume-store/orders.api';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  width: 90%;
  max-width: 450px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1A1A1A;
  color: white;
`;

const Title = styled.h3`
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-weight: 500;
  letter-spacing: 1px;
`;

const Content = styled.div`
  padding: 32px;
  max-height: 70vh;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
`;

const ReceiptPrintArea = styled.div`
  /* Normal styles for modal content */
`;

const GlobalPrintStyle = styled.div`
  display: none;
  @media print {
    display: block;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 99999;
  }
`;

const PrintStyle = () => (
  <style>{`
    @media print {
      body * {
        visibility: hidden !important;
      }
      .print-area, .print-area * {
        visibility: visible !important;
      }
      .print-area {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 80mm !important;
        margin: 0 !important;
        padding: 10px !important;
        background: white !important;
        color: black !important;
      }
      @page {
        margin: 0;
        size: auto;
      }
    }
  `}</style>
);

const StoreName = styled.h2`
  text-align: center;
  margin: 0 0 8px;
  font-family: 'Playfair Display', serif;
`;

const Divider = styled.div`
  border-top: 1px dashed #CCC;
  margin: 16px 0;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Footer = styled.div`
  padding: 16px 24px;
  display: flex;
  gap: 12px;
  border-top: 1px solid #E5E7EB;
  background: #FAFAFA;
`;

const Button = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border: ${props => props.primary ? 'none' : '1px solid #1A1A1A'};
  background: ${props => props.primary ? '#D4AF37' : 'transparent'};
  color: ${props => props.primary ? '#1A1A1A' : '#1A1A1A'};
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

interface ReceiptModalProps {
  order: any;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { data: receipt, isLoading } = useGetPerfumeReceiptQuery(
    { storeId: order.storeId, orderId: order.id },
    { skip: !order }
  );
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PrintStyle />
      <AnimatePresence>
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Header>
              <Title>Order Receipt</Title>
              <CloseCircle size="24" color="#FFFFFF" cursor="pointer" onClick={onClose} />
            </Header>
          
          <Content>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Generating receipt...</div>
            ) : receipt ? (
              <ReceiptPrintArea ref={printRef} className="print-area">
                <StoreName>{receipt.storeName}</StoreName>
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginBottom: '16px' }}>
                  {new Date(receipt.date).toLocaleString()}
                </div>
                
                <Row><span>Order ID:</span> <span>{receipt.orderId.substring(0, 8).toUpperCase()}</span></Row>
                <Row><span>Client:</span> <span>{receipt.clientName}</span></Row>
                <Row><span>Payment:</span> <span>{receipt.paymentMethod}</span></Row>
                
                <Divider />
                
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>ITEMS</div>
                {receipt.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{item.brand}</div>
                    <Row style={{ marginTop: '4px' }}>
                      <span>{item.quantity} x ₦{item.unitPrice.toLocaleString()}</span>
                      <span>₦{item.totalPrice.toLocaleString()}</span>
                    </Row>
                  </div>
                ))}
                
                <Divider />
                
                <Row style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  <span>TOTAL</span>
                  <span>₦{receipt.totalAmount.toLocaleString()}</span>
                </Row>
                
                <Divider />
                
                <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '24px', fontStyle: 'italic' }}>
                  {receipt.message}
                </div>
              </ReceiptPrintArea>
            ) : (
              <div style={{ textAlign: 'center', color: '#EF4444' }}>Failed to load receipt</div>
            )}
          </Content>
          
          <Footer>
            <Button onClick={onClose}>Close</Button>
            <Button primary onClick={handlePrint} disabled={isLoading || !receipt}>
              <Printer size="20" /> Print Receipt
            </Button>
          </Footer>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
    </>
  );
};

export default ReceiptModal;
