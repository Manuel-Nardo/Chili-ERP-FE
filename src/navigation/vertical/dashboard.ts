export default [
  {
    title: 'Catálogos',
    icon: { icon: 'tabler-database' },
    children: [
      {
        title: 'Impuestos',
        to: 'catalogs-taxes',
      },
      {
        title: 'Productos',
        to: 'dashboards-crm',
      },
      {
        title: 'Sucursales',
        to: 'dashboards-ecommerce',
      },
    ],
  },
  {
    title: 'Configuración',
    icon: { icon: 'tabler-settings' },
    children: [
      {
        title: 'User',
        icon: { icon: 'tabler-user' },
        children: [
          { title: 'List', to: 'apps-user-list' },
          { title: 'View', to: { name: 'apps-user-view-id', params: { id: 21 } } },
        ],
      },
      {
        title: 'Roles & Permissions',
        icon: { icon: 'tabler-lock' },
        children: [
          { title: 'Roles', to: 'apps-roles' },
          { title: 'Permissions', to: 'apps-permissions' },
        ],
      },
    ],
  },
]
