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
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigate();
  const { data, isLoading } = useGetAllSupplyRequestQuery({ subdomain: 'beta' });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Prepare table data from grouped structure
  const tableData = data?.flatMap((dateGroup) =>
    dateGroup.restaurants.map((restaurant, restaurantIndex) => {
      const statuses = restaurant.items.map((item) => item.status);
      const uniqueStatuses = [...new Set(statuses)];
      const statusSummary =
        uniqueStatuses.length === 1 ? uniqueStatuses[0] : 'Mixed';

      return {
        id: `${dateGroup.date}-${restaurant.restaurant.id}-${restaurantIndex}`, // Unique ID for row
        date: dateGroup.date,
        restaurantName: restaurant.restaurant.name,
        restaurantId: restaurant.restaurant.id,
        itemCount: restaurant.items.length,
        status: statusSummary,
        items: restaurant.items, // For navigation to details
      };
    })
  ) || [];

  // Filter data based on search query
  const filteredData = tableData.filter(
    (row) =>
      row.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.date.includes(searchQuery) ||
      row.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'date',
      label: 'Date Placed',
      sortable: true,
      render: (_, row) => row.date,
    },
    // {
    //   key: 'restaurantName',
    //   label: 'Restaurant',
    //   sortable: true,
    // },
    {
      key: 'itemCount',
      label: 'Count of Items',
      sortable: true,
      render: (_, row) => row.itemCount,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, row) => row.status,
    },
  ];

  // Handle row click to navigate to detailed view
  const handleRowClick = (row: Record<string, any>) => {
    navigation(`/operations/${row.date}/${row.restaurantId}`);
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
        {filteredData.length > 0 ? (
          <Table
            selectable
            bordered
            columns={columns}
            data={filteredData}
            onRowClick={handleRowClick}
            actions={(row, index) => (
              <div className="relative flex items-center gap-2">
                <button
                  className="text-blue-500 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === index ? null : index);
                  }}
                >
                  <More size="18" color={theme.colors.active} />
                </button>
                {openDropdown === index && (
                  <div className="absolute top-5 right-2 bg-white shadow-md rounded-md p-2 z-10 w-24">
                    <button
                      className="flex block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => navigation(`/operations/${row.date}/${row.restaurantId}`)}
                    >
                      <div className="mt-1 mr-1">
                        <Eye size="15" color={theme.colors.active} />
                      </div>
                      View
                    </button>
                  </div>
                )}
              </div>
            )}
          />
        ) : (
          <div>No supply requests found.</div>
        )}
      </div>
    </div>
  );
};

export default Operation;