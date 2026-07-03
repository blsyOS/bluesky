import { DashboardIcon } from "@/components/icons";
import { productRegistry } from "../registry";

/**
 * The platform context — BlueSky OS itself. Minimal workspace; the value is
 * the operational command center plus global Administration.
 */
productRegistry.register({
  id: "platform",
  name: "BlueSky OS",
  icon: DashboardIcon,
  defaultLanding: "/dashboard",
  featureFlags: {},
  sidebar: [
    {
      label: "Workspace",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: DashboardIcon, exact: true },
      ],
    },
  ],
});
