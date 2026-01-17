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

interface NavItem {
  title: string;
  url: string;
  icon: any; // Puedes usar React.ElementType si quieres ser más estricto
  requiresAdmin?: boolean; // <--- El signo '?' lo hace opcional
}

interface SideBarDataType {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  navGroups: {
    title: string;
    items: NavItem[];
  }[];
  navSecondary: NavItem[];
}

export const SideBarData: SideBarDataType = {
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
        {
          title: "Admin",
          url: "admin-panel",
          icon: IconSettings,
          requiresAdmin: true
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: "Configuracion",
      url: "configuracion",
      icon: IconSettings,
      requiresAdmin: true
    }
  ]
}
