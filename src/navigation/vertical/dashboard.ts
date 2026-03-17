export default [
  {
    title: 'Catálogos',
    icon: { icon: 'tabler-database' },
    children: [
      {
        title: 'Clientes',
        icon: { icon: 'tabler-building-store' },
        children: [
          {title: 'Series', to: 'catalogs-tipos-serie'},
          {title: 'Zonas', to: 'catalogs-zones'},
          {title: 'Tipos Clientes', to: 'catalogs-client-types'},
          {title: 'Clientes', to: 'catalogs-customers'},
          {title: 'Series x Cliente', to: 'catalogs-series-sucursal'},
        ]
      },

      {
        title: 'Pedidos',
        icon: { icon: 'tabler-receipt' },
        children: [
          {title: 'Tipos Pedidos', to: 'catalogs-order-types'},
          {title: 'Horarios Default',to: 'catalogs-order-type-schedules'},
          {title: 'Asignación por Sucursal', to: 'catalogs-order-type-assignments'}          
        ]
      },

      {
        title: 'Productos',
        icon: { icon: 'tabler-package' },
        children: [
          {title: 'Unidades', to: 'catalogs-unidades'},
          {title: 'Impuestos', to: 'catalogs-impuestos'},
          {title: 'Lineas', to: 'catalogs-lineas'},
          {title: 'Productos', to: 'catalogs-productos'}
        ]
      },
    ],
  },
  {
    title: 'Pedidos',
    icon: { icon: 'tabler-shopping-cart' },
    children: [
      {
        title: 'Nuevo pedido',
        to: 'pedidos-pedidos',
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
