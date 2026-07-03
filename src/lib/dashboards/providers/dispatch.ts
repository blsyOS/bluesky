import { BoxesIcon, ScrollIcon, UsersIcon } from "@/components/icons";
import { CORE_WIDGET_CATEGORIES } from "../categories";
import { registerModuleDashboard } from "./module";

const C = CORE_WIDGET_CATEGORIES;

registerModuleDashboard({
  id: "dispatch",
  categories: [C.OPERATIONS],
  widgets: [
    {
      id: "unassigned-work",
      title: "Unassigned work",
      categoryId: C.OPERATIONS.id,
      icon: ScrollIcon,
      emptyMessage: "Work queue connects when the Dispatch module launches.",
    },
    {
      id: "scheduled-today",
      title: "Scheduled today",
      categoryId: C.OPERATIONS.id,
      icon: BoxesIcon,
      emptyMessage: "Scheduling data connects with the Dispatch module.",
    },
    {
      id: "en-route",
      title: "En route",
      categoryId: C.OPERATIONS.id,
      icon: UsersIcon,
      emptyMessage: "Live crew routing connects with the Dispatch module.",
    },
    {
      id: "completed-today",
      title: "Completed today",
      categoryId: C.OPERATIONS.id,
      icon: BoxesIcon,
      emptyMessage: "Completion tracking begins with the Dispatch module.",
    },
  ],
});
