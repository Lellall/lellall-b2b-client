const fs = require('fs');

const files = [
  'src/modules/perfume/features/bottles/BottleStoragePage.tsx',
  'src/modules/perfume/features/pos/PerfumePOSMenu.tsx',
  'src/modules/perfume/features/menu/LoungeMenuPage.tsx',
  'src/modules/perfume/features/members/members.tsx'
];

const replacements = {
  'useGetInventoryItemsQuery': 'useGetPerfumeInventoryItemsQuery',
  'useAddInventoryItemMutation': 'useAddPerfumeInventoryItemMutation',
  'useRestockInventoryItemMutation': 'useRestockPerfumeInventoryItemMutation',
  'useUpdateInventoryItemMutation': 'useUpdatePerfumeInventoryItemMutation',
  'useDeleteStoreInventoryItemMutation': 'useDeletePerfumeInventoryItemMutation',

  'useGetClientsQuery': 'useGetPerfumeClientsQuery',
  'useRegisterClientMutation': 'useRegisterPerfumeClientMutation',
  'useGetClientByIdQuery': 'useGetPerfumeClientByIdQuery',
  'useUpdateClientMutation': 'useUpdatePerfumeClientMutation',
  'useSendRecommendationMutation': 'useSendPerfumeRecommendationMutation',

  'useCreateOrderMutation': 'useCreatePerfumeOrderMutation',
  'useGetOrdersQuery': 'useGetPerfumeOrdersQuery'
};

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [oldHook, newHook] of Object.entries(replacements)) {
      content = content.replace(new RegExp(oldHook, 'g'), newHook);
    }
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
