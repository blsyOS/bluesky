import {
  ChartBarIcon,
  ContactIcon,
  DashboardIcon,
  DropletIcon,
  MapPinIcon,
  RouteIcon,
  StormIcon,
  TruckIcon,
} from "@/components/icons";
import { productRegistry } from "../registry";

/**
 * BlueSky Locate — the flagship locating product. Contacts is exclusive to
 * this product (guarded by the "contacts" feature flag, only enabled here).
 */
productRegistry.register({
  id: "locate",
  name: "BlueSky Locate",
  icon: MapPinIcon,
  accentKey: "LOCATE_OS",
  defaultLanding: "/dashboard/locate",
  featureFlags: { contacts: true },
  sidebar: [
    {
      label: "Workspace",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard/locate",
          icon: DashboardIcon,
          exact: true,
        },
      ],
    },
    {
      label: "Modules",
      items: [
        { label: "Locate", href: "/locate", icon: MapPinIcon },
        { label: "Storm", href: "/dashboard/storm", icon: StormIcon },
        { label: "Leak", href: "/dashboard/leak", icon: DropletIcon },
        { label: "Dispatch", href: "/dashboard/dispatch", icon: RouteIcon },
        { label: "Fleet", href: "/dashboard/fleet", icon: TruckIcon },
        {
          label: "Contacts",
          href: "/contacts",
          icon: ContactIcon,
          featureFlag: "contacts",
        },
        { label: "Reports", href: "/reports", icon: ChartBarIcon },
      ],
    },
  ],
});
