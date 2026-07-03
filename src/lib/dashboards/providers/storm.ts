import { BoxesIcon, ShieldIcon, UsersIcon } from "@/components/icons";
import { CORE_WIDGET_CATEGORIES } from "../categories";
import { registerModuleDashboard } from "./module";

const C = CORE_WIDGET_CATEGORIES;

registerModuleDashboard({
  id: "storm",
  categories: [C.OPERATIONS, C.SAFETY],
  widgets: [
    {
      id: "active-events",
      title: "Active storm events",
      categoryId: C.OPERATIONS.id,
      icon: ShieldIcon,
      emptyMessage: "Storm event tracking connects when the Storm module launches.",
    },
    {
      id: "crews-deployed",
      title: "Crews deployed",
      categoryId: C.OPERATIONS.id,
      icon: UsersIcon,
      emptyMessage: "Crew deployment data connects with the Storm module.",
    },
    {
      id: "damage-assessments",
      title: "Damage assessments",
      categoryId: C.OPERATIONS.id,
      icon: BoxesIcon,
      emptyMessage: "Assessment intake begins with the Storm module.",
    },
    {
      id: "safety-incidents",
      title: "Safety incidents",
      categoryId: C.SAFETY.id,
      icon: ShieldIcon,
      emptyMessage: "Incident reporting arrives with the Storm module.",
    },
  ],
});
