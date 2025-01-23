//import { Badge } from "@/components/ui/badge";

const products = [
  { id: 1, name: "Maggi", price: "₦430", o_stock: "43 Packets", c_stock: "12 Packets", q_used: "6", status: "in-stock" },
  { id: 2, name: "Bru", price: "₦257", o_stock: "22 Packets", c_stock: "8 Packets", q_used: "12", status: "out-of-stock" },
  { id: 3, name: "Red Bull", price: "₦405", o_stock: "36 Packets", c_stock: "15 Packets", q_used: "2", status: "in-stock" },
  { id: 4, name: "Bourn Vita", price: "₦502", o_stock: "14 Packets", c_stock: "6 Packets", q_used: "6", status: "out-of-stock" },
  { id: 5, name: "Horlicks", price: "₦530", o_stock: "5 Packets", c_stock: "5 Packets", q_used: "1", status: "in-stock" },
];

const ProductsTable = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "out-of-stock":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "low-stock":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Products
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              O/Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              C/Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Q/used
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Availability
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.price}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.o_stock}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.c_stock}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.q_used}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={getStatusColor(product.status)}>
                {product.status.replace("-", " ")}
                </div>
                {/* <Badge className={getStatusColor(product.status)}>
                  {product.status.replace("-", " ")}
                </Badge> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-6 py-4 border-t flex justify-between items-center">
        <button className="text-sm text-gray-700 font-medium">Previous</button>
        <span className="text-sm text-gray-600">Page 1 of 10</span>
        <button className="text-sm text-gray-700 font-medium">Next</button>
      </div>
    </div>
  );
};

export default ProductsTable;