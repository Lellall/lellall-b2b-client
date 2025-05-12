import { StyledButton } from '@/components/button/button-lellall';
import SearchBar from '@/components/search-bar/search-bar';
import StatusDropdown from '@/components/ui/drop-down-btn';
import Table from '@/components/ui/table';
import { useGetAllSupplyRequestQuery } from '@/redux/api/inventory/inventory.api';
import { theme } from '@/theme/theme';
import { Add, Eye, Filter, More } from 'iconsax-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Operation = () => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const navigation = useNavigate();
  const { data, isLoading } = useGetAllSupplyRequestQuery({ subdomain: 'yax' });
  console.log(data, 'supplyRequests');

  if (isLoading) {
    return <div>loading..</div>;
  }

  const columns = [
    { key: 'productName', label: 'Product Name', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'requestMethod', label: 'Request Method', sortable: true },
    {
      key: 'restaurant.name',
      label: 'Restaurant',
      sortable: true,
      render: (_, row) => <div className="flex gap-2">{row.restaurant?.name ?? '—'}</div>,
    },
    {
      key: 'createdAt',
      label: 'Date Created',
      sortable: true,
      render: (_, row) => {
        const date = new Date(row.createdAt);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
  ];

  // Handle row click to navigate to /data.id
  const handleRowClick = (row: Record<string, any>) => {
    navigation(`/operations/${row.id}`);
  };

  return (
    <div>
      <div className="flex mb-5 justify-between">
        <div className="flex">
          <SearchBar
            placeholder="Search orders"
            width="300px"
            height="42px"
            border="1px solid #fff"
            borderRadius="10px"
            backgroundColor="#ffffff"
            shadow={false}
            fontSize="11px"
            color="#444"
            inputPadding="10px"
            placeholderColor="#bbb"
            iconColor="#ccc"
            iconSize={15}
          />
          <div className="ml-4">
            <StyledButton
              style={{ padding: '19px 15px', fontWeight: 300 }}
              background="#fff"
              color="#000"
              width="130px"
              variant="outline"
            >
              <Filter size="32" color="#000" /> Filter
            </StyledButton>
          </div>
        </div>
        <StyledButton
          style={{ padding: '19px 15px', fontWeight: 300 }}
          background={theme.colors.active}
          color="#fff"
          width="130px"
          variant="outline"
        >
          <Add size="32" color="#fff" /> Create Order
        </StyledButton>
      </div>

      <div className="mt-10">
        <Table
          selectable
          bordered
          columns={columns}
          data={data}
          onRowClick={handleRowClick} // Pass the row click handler
          actions={(row, index) => (
            <div className="relative flex items-center gap-2">
              <button
                className="text-blue-500 ml-2"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents event bubbling to row click
                  setOpenDropdown(openDropdown === index ? null : index);
                }}
              >
                <More size="18" color={theme.colors.active} />
              </button>
              {openDropdown === index && (
                <div className="absolute top-5 right-2 bg-white shadow-md rounded-md p-2 z-10 w-24">
                  <button
                    className="flex block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => navigation(`/${row.id}`)}
                  >
                    <div className="mt-1 mr-1">
                      <Eye size="15" color={theme.colors.active} />
                    </div>
                    view
                  </button>
                </div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default Operation;