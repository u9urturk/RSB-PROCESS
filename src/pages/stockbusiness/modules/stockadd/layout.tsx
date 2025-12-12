import React, { useState, useEffect } from 'react';
import { X, Check, Package, Warehouse, ShoppingCart, AlertCircle, ChevronRight } from 'lucide-react';
import { ProductStatus } from '../../apis/productApi';
import ProductStep from './steps/ProductStep';
import InventoryStep from './steps/InventoryStep';
import SubInventoryStep from './steps/SubInventoryStep';

// Step Types
export interface ProductStepData {
  isExisting: boolean;
  productId?: string;
  barcode?: string;
  name: string;
  description?: string;
  note?: string;
  imageUrls?: string[];
  status: ProductStatus;
  categoryId: string;
  stockTypeId: string;
  baseUnitId: string;
}

export interface InventoryStepData {
  isExisting: boolean;
  inventoryId?: string;
  productId: string;
  minStockLevel: number;
  maxStockLevel: number;
  lastCountedAt?: string;
  expirationDate?: string;
  desc?: string;
}

export interface SubInventoryStepData {
  inventoryId: string;
  warehouseId: string;
  supplierId?: string;
  quantity: number;
  unitPrice: number;
  expirationDate?: string;
  desc?: string;
}

interface StockAddLayoutProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: {
    product: ProductStepData;
    inventory: InventoryStepData;
    subInventory: SubInventoryStepData;
  }) => Promise<void>;
}

enum StepEnum {
  PRODUCT = 1,
  INVENTORY = 2,
  SUBINVENTORY = 3
}

const StockAddLayout: React.FC<StockAddLayoutProps> = ({ open, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<StepEnum>(StepEnum.PRODUCT);
  const [loading, setLoading] = useState(false);
  
  // Step Data
  const [productData, setProductData] = useState<ProductStepData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryStepData | null>(null);
  const [subInventoryData, setSubInventoryData] = useState<SubInventoryStepData | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep(StepEnum.PRODUCT);
      setProductData(null);
      setInventoryData(null);
      setSubInventoryData(null);
    }
  }, [open]);

  const handleProductComplete = (data: ProductStepData) => {
    setProductData(data);
    setCurrentStep(StepEnum.INVENTORY);
  };

  const handleInventoryComplete = (data: InventoryStepData) => {
    setInventoryData(data);
    setCurrentStep(StepEnum.SUBINVENTORY);
  };

  const handleSubInventoryComplete = async (data: SubInventoryStepData) => {
    setSubInventoryData(data);
    setLoading(true);
    
    try {
        console.log('Finalizing stock add with data:', {
          product: productData,
          inventory: inventoryData,
          subInventory: data
        });
      if (productData && inventoryData) {
        await onComplete({
          product: productData,
          inventory: inventoryData,
          subInventory: data
        });
        onClose();
      }
    } catch (error) {
      console.error('Stock add error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === StepEnum.INVENTORY) {
      setCurrentStep(StepEnum.PRODUCT);
      setInventoryData(null);
    } else if (currentStep === StepEnum.SUBINVENTORY) {
      setCurrentStep(StepEnum.INVENTORY);
      setSubInventoryData(null);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Ürün Bilgileri',
      icon: <Package size={20} />,
      description: 'Ürün seçimi veya yeni ürün tanımlama',
      active: currentStep === StepEnum.PRODUCT,
      completed: productData !== null
    },
    {
      number: 2,
      title: 'Envanter Ayarları',
      icon: <Warehouse size={20} />,
      description: 'Stok seviyeleri ve envanter bilgileri',
      active: currentStep === StepEnum.INVENTORY,
      completed: inventoryData !== null
    },
    {
      number: 3,
      title: 'Parti/Lot Kaydı',
      icon: <ShoppingCart size={20} />,
      description: 'Depo, tedarikçi ve miktar bilgileri',
      active: currentStep === StepEnum.SUBINVENTORY,
      completed: subInventoryData !== null
    }
  ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Yeni Stok Kaydı</h2>
              <p className="text-orange-100 text-sm">
                3 adımlı kayıt süreci ile sisteme yeni stok ekleyin
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div
                  className={`
                    bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 transition-all
                    ${step.active ? 'border-white shadow-lg' : 'border-white/20'}
                    ${step.completed && !step.active ? 'border-green-400 bg-green-400/20' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold
                        ${step.completed ? 'bg-green-400 text-white' : 'bg-white/20 text-white'}
                      `}
                    >
                      {step.completed ? <Check size={20} /> : step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm mb-1">{step.title}</div>
                      <div className="text-xs text-white/80 line-clamp-2">{step.description}</div>
                    </div>
                  </div>
                </div>
                
                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 translate-x-1/2 z-10">
                    <ChevronRight size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-800">
              {currentStep === StepEnum.PRODUCT && (
                <>
                  <strong>Ürün Aşaması:</strong> Barkod ile ürün arayın. Eğer ürün sistemde kayıtlı ise 
                  bilgileri görüntülenecek ve onaylamanız yeterli olacaktır. Ürün sistemde yoksa yeni 
                  ürün bilgilerini girin.
                </>
              )}
              {currentStep === StepEnum.INVENTORY && (
                <>
                  <strong>Envanter Aşaması:</strong> {productData?.isExisting 
                    ? 'Ürün sistemde kayıtlı olduğu için envanter bilgileri de mevcut. Bilgileri kontrol edin ve onaylayın.'
                    : 'Yeni ürün için envanter ayarlarını yapın. Minimum ve maksimum stok seviyelerini belirleyin.'
                  }
                </>
              )}
              {currentStep === StepEnum.SUBINVENTORY && (
                <>
                  <strong>Parti/Lot Aşaması:</strong> Son adımda depo, tedarikçi ve miktar bilgilerini girin. 
                  Bu bilgiler her stok girişinde farklı olabilir.
                </>
              )}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === StepEnum.PRODUCT && (
            <ProductStep
              onComplete={handleProductComplete}
              initialData={productData}
            />
          )}

          {currentStep === StepEnum.INVENTORY && productData && (
            <InventoryStep
              productData={productData}
              onComplete={handleInventoryComplete}
              onBack={handleBack}
              initialData={inventoryData}
            />
          )}

          {currentStep === StepEnum.SUBINVENTORY && inventoryData && (
            <SubInventoryStep
              inventoryData={inventoryData}
              onComplete={handleSubInventoryComplete}
              onBack={handleBack}
              initialData={subInventoryData}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAddLayout;
