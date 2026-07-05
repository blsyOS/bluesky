/**
 * Registers every built-in product navigation config. Importing this module
 * (from the client shell) wires the registry once. Future products add
 * their own side-effect import here or in their entry.
 */
import "./configs/platform";
import "./configs/locate";
import "./configs/storm";
import "./configs/leak";

export { productRegistry, resolveSidebar } from "./registry";
export {
  ORG_SECTION,
  PLATFORM_SECTION,
  adminSectionsFor,
  type AdminAccess,
} from "./admin-nav";
export const DEFAULT_PRODUCT_ID = "platform";
export const PRODUCT_COOKIE = "bsky_product";
