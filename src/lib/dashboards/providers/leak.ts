import { BoxesIcon, ScrollIcon } from "@/components/icons";
import { CORE_WIDGET_CATEGORIES } from "../categories";
import { registerModuleDashboard } from "./module";

const C = CORE_WIDGET_CATEGORIES;

registerModuleDashboard({
  id: "leak",
  categories: [C.OPERATIONS, C.QUALITY],
  widgets: [
    {
      id: "open-surveys",
      title: "Open surveys",
      categoryId: C.OPERATIONS.id,
      icon: ScrollIcon,
      accentKey: "LEAK_OS",
      emptyMessage: "Survey data connects when the Leak module launches.",
    },
    {
      id: "leaks-identified",
      title: "Leaks identified",
      categoryId: C.OPERATIONS.id,
      icon: BoxesIcon,
      accentKey: "LEAK_OS",
      emptyMessage: "Detection results connect with the Leak module.",
    },
    {
      id: "miles-surveyed",
      title: "Miles surveyed",
      categoryId: C.OPERATIONS.id,
      icon: BoxesIcon,
      accentKey: "LEAK_OS",
      emptyMessage: "Coverage metrics begin with the Leak module.",
    },
    {
      id: "recheck-rate",
      title: "Recheck rate",
      categoryId: C.QUALITY.id,
      icon: ScrollIcon,
      accentKey: "LEAK_OS",
      emptyMessage: "Quality metrics arrive with the Leak module.",
    },
  ],
});
