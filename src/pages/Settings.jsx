import React, { useState } from 'react';

const InventoryForm = () => {
  const mockProducts = [
    {
      id: 1,
      name: 'Paracetamol',
      big_unit: 'box',
      small_unit: 'pcs',
      conversion_rate: 100,
    },
    {
      id: 2,
      name: 'Vitamin C',
      big_unit: null,
      small_unit: 'capsule',
      conversion_rate: null,
    },
  ];

  const [productId, setProductId] = useState('');
  const [bigQty, setBigQty] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [stock, setStock] = useState([]);
  const [showBigAmount, setShowBigAmount] = useState(false);
  const [bigUnit, setBigUnit] = useState('');
  const [smallUnit, setSmallUnit] = useState('');

  const selectedProduct = mockProducts.find(p => p.id === parseInt(productId));

  const handleAdd = () => {
    const product = selectedProduct;
    if (!product) return;

    const conversionRate = product.conversion_rate || 1;
    const totalSmall = parseInt(quantity || 0) + parseInt(bigQty || 0) * conversionRate;
    const totalCost = parseFloat(cost || 0) * totalSmall - parseFloat(discount || 0);

    const newItem = {
      productId: product.id,
      name: product.name,
      smallQty: totalSmall,
      small_unit: product.small_unit,
      big_unit: product.big_unit,
      cost: parseFloat(cost || 0),
      price: parseFloat(price || 0),
      discount: parseFloat(discount || 0),
      totalCost,
      bigUnit,
      smallUnit,
    };

    setStock([...stock, newItem]);

    // Clear form
    setProductId('');
    setBigQty('');
    setQuantity('');
    setCost('');
    setPrice('');
    setDiscount('');
    setBigUnit('');
    setSmallUnit('');
    setShowBigAmount(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Inventory Entry</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Product</label>
          <select
            className="w-full p-2 border rounded"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Select a product</option>
            {mockProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Small Unit (e.g. pcs, capsule)</label>
          <input
            className="w-full p-2 border rounded"
            type="text"
            value={smallUnit}
            onChange={(e) => setSmallUnit(e.target.value)}
            placeholder="e.g. pcs"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Big Unit (e.g. box)</label>
          <input
            className="w-full p-2 border rounded"
            type="text"
            value={bigUnit}
            onChange={(e) => setBigUnit(e.target.value)}
            placeholder="e.g. box"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={showBigAmount}
            onChange={() => setShowBigAmount(!showBigAmount)}
          />
          <label className="text-sm">Add Big Quantity (e.g. box)</label>
        </div>

        {showBigAmount && (
          <div>
            <label className="text-sm font-medium">
              Big Quantity ({selectedProduct?.big_unit || bigUnit || 'N/A'})
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={bigQty}
              onChange={(e) => setBigQty(e.target.value)}
              placeholder={`e.g. 1 ${selectedProduct?.big_unit || bigUnit}`}
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium">
            Small Quantity ({selectedProduct?.small_unit || smallUnit || 'unit'})
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={`e.g. 20 ${selectedProduct?.small_unit || smallUnit}`}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Cost per Unit</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="e.g. 5.00"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Price per Unit</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 10.00"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Discount</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="e.g. 2.00"
          />
        </div>

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Inventory List</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Cost</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Discount</th>
              <th className="p-2 border">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((s, i) => (
              <tr key={i}>
                <td className="p-2 border">{s.name}</td>
                <td className="p-2 border">
                  {Math.floor(s.smallQty / (selectedProduct?.conversion_rate || 1))} {s.big_unit || '-'} +
                  {s.smallQty % (selectedProduct?.conversion_rate || 1)} {s.small_unit}
                </td>
                <td className="p-2 border">₱ {s.cost.toFixed(2)}</td>
                <td className="p-2 border">₱ {s.price.toFixed(2)}</td>
                <td className="p-2 border">₱ {s.discount.toFixed(2)}</td>
                <td className="p-2 border">₱ {s.totalCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryForm;
