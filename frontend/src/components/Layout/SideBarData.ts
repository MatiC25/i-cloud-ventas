import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconShoppingCartDollar
} from "@tabler/icons-react"

export const SideBarData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navGroups: [
    {
      title: "Operativa",
      items: [
        {
          title: "Nueva Venta",
          url: "nueva-venta",
          icon: IconShoppingCartDollar,
        },
        {
          title: "Dashboard",
          url: "dashboard",
          icon: IconDashboard,
        },
        {
          title: "Tareas Compartidas",
          url: "tasks",
          icon: IconListDetails,
        }
      ]
    },
    {
      title: "Analitica",
      items: [
        {
          title: "Estadísticas",
          url: "estadisticas",
          icon: IconChartBar,
        },
        {
          title: "Últimas Ventas",
          url: "ultimas-ventas",
          icon: IconListDetails,
        },
        {
          title: "Historial Total",
          url: "historial",
          icon: IconReport,
        }
      ]
    },
    {
      title: "Admin",
      items: [
        
      ]
    }
  ],
  navSecondary: [
    {
      title: "Configuracion",
      url: "advanced",
      icon: IconSettings,
    }
  ]
}
