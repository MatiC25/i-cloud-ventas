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
          title: "Dashboard",
          url: "dashboard",
          icon: IconDashboard,
        },
        {
          title: "Nueva Venta",
          url: "nueva-venta-minimalista",
          icon: IconShoppingCartDollar,
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
          title: "Historial",
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
    // {
    //   title: "Configuracion",
    //   url: "",
    //   icon: IconSettings,
    // }
  ]
}
