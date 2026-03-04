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
        title: 'Usuarios',
        icon: { icon: 'tabler-user' },                  
        to: 'apps-users',
      },
      {
        title: 'Roles y Permisos',
        icon: { icon: 'tabler-lock' },
        children: [
          { title: 'Roles', to: 'apps-roles' },
          { title: 'Permissions', to: 'apps-permissions' },
        ],
      },
    ],
  },
]
