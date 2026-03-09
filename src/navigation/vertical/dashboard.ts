export default [
  {
    title: 'Catálogos',
    icon: { icon: 'tabler-database' },
    children: [
      {
        title: 'Clientes',
        icon: { icon: 'tabler-building-store' },
        children: [
          {title: 'Zonas', to: 'catalogs-zones'},
          {title: 'Tipos Clientes', to: 'catalogs-client-types'},
          {title: 'Clientes', to: 'catalogs-customers'},
        ]
      },

      {
        title: 'Pedidos',
        icon: { icon: 'tabler-receipt' },
        children: [
          {title: 'Tipos Pedidos', to: 'catalogs-order-types'},
          {title: 'Horarios Default',to: 'catalogs-order-type-schedules'},
          {title: 'Asignación por Sucursal', to: 'catalogs-order-type-assignments'},
          {title: 'Horarios Personalizados',to : 'catalogs-order-type-assignment-schedules'}
        ]
      },

      {
        title: 'Productos',
        icon: { icon: 'tabler-package' },
        children: [
          {title: 'Impuestos', to: 'catalogs-taxes'},
          {title: 'Productos', to: 'catalogs-client-types'}
        ]
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
