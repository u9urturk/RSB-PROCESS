import React, { useState, useEffect } from 'react';
import { X, Check, Package, Warehouse, ShoppingCart, AlertCircle, ChevronRight } from 'lucide-react';
import { ProductStatus } from '../../apis/productApi';
import { QuickAddInventoryDto } from '../../apis/inventoryApi';
import { useInventory } from '../../provider/InventoryProvider';
import ProductStep from './steps/ProductStep';
import InventoryStep from './steps/InventoryStep';
import SubInventoryStep from './steps/SubInventoryStep';

// Step Types - Bu interface'ler QuickAddInventoryDto ile uyumlu hale getirildi
export interface ProductStepData {
  isExisting: boolean;
  productId?: string;
  productName: string;
  categoryId?: string;
  baseUnitId?: string;
  productDescription?: string;
  note?: string;
  imageUrls?: string[];
  status?: ProductStatus;
  barcode?: string;
  inventoryId?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  totalStock?: number;
}

export interface InventoryStepData {
  inventoryId?: string;
  minStockLevel: number;
  maxStockLevel: number;
  inventoryDesc?: string;
  lastCountedAt?: string;
  stockTypeId?: string;
  barcode?: string;
  totalQuantity?: number;
}

export interface SubInventoryStepData {
  warehouseId: string;
  supplierId: string;
  quantity: number;
  unitPrice: number;
  expirationDate?: string;
  subInventoryDesc?: string;
  barcode: string;

}

interface StockAddLayoutProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (response: any) => void; // Quick Add response'u döner
}

enum StepEnum {
  PRODUCT = 1,
  INVENTORY = 2,
  SUBINVENTORY = 3
}

const StockAddLayout: React.FC<StockAddLayoutProps> = ({ open, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<StepEnum>(StepEnum.PRODUCT);
  const [loading, setLoading] = useState(false);
  const { quickAddInventory } = useInventory();

  // Step Data
  const [productData, setProductData] = useState<ProductStepData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryStepData | null>(null);
  const [subInventoryData, setSubInventoryData] = useState<SubInventoryStepData | null>(null);
  const [barcode, setBarcode] = useState<string>("");


  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep(StepEnum.PRODUCT);
      setProductData(null);
      setInventoryData(null);
      setSubInventoryData(null);
    }
  }, [open]);

  const handleProductComplete = (data: ProductStepData | null, existingInventory: InventoryStepData | null,
    skipToSubInventory?: boolean, productId?: string | null) => {
    console.log('Product step completed:', data);
    setProductData(data);
    if (skipToSubInventory) {
      // Inventory için varsayılan değerler
      setInventoryData({
        inventoryId: existingInventory?.inventoryId || '',
        minStockLevel: existingInventory?.minStockLevel || 10,
        maxStockLevel: existingInventory?.maxStockLevel || 100,
        totalQuantity: existingInventory?.totalQuantity || 0,
        inventoryDesc: '',
        stockTypeId: '',
        barcode: data?.barcode || ''
      });
      setCurrentStep(StepEnum.SUBINVENTORY);
    } else if (skipToSubInventory && productId) {
      setCurrentStep(StepEnum.SUBINVENTORY);
    } else {
      setCurrentStep(StepEnum.INVENTORY);
    }
  };

  const handleInventoryComplete = (data: InventoryStepData) => {
    console.log('Inventory step completed:', data);
    setInventoryData(data);
    setCurrentStep(StepEnum.SUBINVENTORY);
  };

  const handleSubInventoryComplete = async (data: SubInventoryStepData) => {
    console.log('SubInventory step completed:', data);
    setSubInventoryData(data);
    setLoading(true);

    try {
      if (productData && inventoryData) {
        // QuickAddInventoryDto format'ına dönüştür
        const quickAddData: QuickAddInventoryDto = {
          // Product Information
          productName: productData.productName,
          categoryId: productData.categoryId,
          baseUnitId: productData.baseUnitId,
          stockTypeId: inventoryData.stockTypeId,
          productDescription: productData.productDescription,
          barcode: barcode,

          // Inventory Settings
          minStockLevel: inventoryData.minStockLevel,
          maxStockLevel: inventoryData.maxStockLevel,
          inventoryDesc: inventoryData.inventoryDesc,

          // Batch Information (SubInventory)
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          supplierId: data.supplierId,
          warehouseId: data.warehouseId,
          expirationDate: data.expirationDate,
          subInventoryDesc: data.subInventoryDesc,

        };

        console.log('Quick Add request data:', quickAddData);

        // Quick Add API çağrısı
        const response = await quickAddInventory(quickAddData);

        console.log('Quick Add response:', response);

        // Başarılı response callback
        if (onComplete) {
          onComplete(response);
        }

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
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                disabled={loading}
              >
                <X size={24} />
              </button>
            </div>
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

          {currentStep === StepEnum.SUBINVENTORY && inventoryData && productData && (
            <SubInventoryStep
              productData={productData}
              inventoryData={inventoryData}
              onComplete={handleSubInventoryComplete}
              onBack={handleBack}
              initialData={subInventoryData}
              loading={loading}
              newSubInventory={productData.isExisting}
              handleClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAddLayout;
