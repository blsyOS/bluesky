import {
  ChartBarIcon,
  DashboardIcon,
  StormIcon,
  TruckIcon,
} from "@/components/icons";
import { productRegistry } from "../registry";

/**
 * BlueSky Storm — storm response operations. No Contacts (exclusive to
 * Locate); a leaner module set.
 */
productRegistry.register({
  id: "storm",
  name: "BlueSky Storm",
  icon: StormIcon,
  defaultLanding: "/dashboard/storm",
  featureFlags: {},
  sidebar: [
    {
      label: "Workspace",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard/storm",
          icon: DashboardIcon,
          exact: true,
        },
      ],
    },
    {
      label: "Modules",
      items: [
        { label: "Storm", href: "/dashboard/storm", icon: StormIcon },
        { label: "Fleet", href: "/dashboard/fleet", icon: TruckIcon },
        { label: "Reports", href: "/reports", icon: ChartBarIcon },
      ],
    },
  ],
});
