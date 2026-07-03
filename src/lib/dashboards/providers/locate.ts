import { BoxesIcon, ScrollIcon, UsersIcon } from "@/components/icons";
import { CORE_WIDGET_CATEGORIES } from "../categories";
import { registerModuleDashboard } from "./module";

const C = CORE_WIDGET_CATEGORIES;

registerModuleDashboard({
  id: "locate",
  categories: [C.OPERATIONS, C.QUALITY],
  widgets: [
    {
      id: "active-tickets",
      title: "Active tickets",
      categoryId: C.OPERATIONS.id,
      icon: ScrollIcon,
      accentKey: "LOCATE_OS",
      emptyMessage: "811 ticket data connects when the Locate module launches.",
    },
    {
      id: "overdue-locates",
      title: "Overdue locates",
      categoryId: C.OPERATIONS.id,
      icon: BoxesIcon,
      accentKey: "LOCATE_OS",
      emptyMessage: "Due-date tracking begins with the Locate module.",
    },
    {
      id: "locators-on-duty",
      title: "Locators on duty",
      categoryId: C.OPERATIONS.id,
      icon: UsersIcon,
      accentKey: "LOCATE_OS",
      emptyMessage: "Field status connects with the Locate module.",
    },
    {
      id: "positive-response",
      title: "Positive response",
      categoryId: C.QUALITY.id,
      icon: ScrollIcon,
      accentKey: "LOCATE_OS",
      emptyMessage: "Response compliance reporting arrives with the Locate module.",
    },
  ],
});
