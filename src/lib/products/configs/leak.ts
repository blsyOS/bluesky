import {
  ChartBarIcon,
  DashboardIcon,
  DropletIcon,
  TruckIcon,
} from "@/components/icons";
import { productRegistry } from "../registry";

/**
 * BlueSky Leak — leak survey and detection operations. No Contacts
 * (exclusive to Locate); a leaner module set.
 */
productRegistry.register({
  id: "leak",
  name: "BlueSky Leak",
  icon: DropletIcon,
  accentKey: "LEAK_OS",
  defaultLanding: "/dashboard/leak",
  featureFlags: {},
  sidebar: [
    {
      label: "Workspace",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard/leak",
          icon: DashboardIcon,
          exact: true,
        },
      ],
    },
    {
      label: "Modules",
      items: [
        { label: "Leak", href: "/dashboard/leak", icon: DropletIcon },
        { label: "Fleet", href: "/dashboard/fleet", icon: TruckIcon },
        { label: "Reports", href: "/reports", icon: ChartBarIcon },
      ],
    },
  ],
});
