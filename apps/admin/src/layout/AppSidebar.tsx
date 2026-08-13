import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { ChevronDownIcon, HorizontaLDots } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
  sidebarMenuConfig,
  type SidebarNavItem,
} from "../router/sidebarConfig";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [subMenuHeights, setSubMenuHeights] = useState<Record<number, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Check if a path is the current active path (ignores trailing slashes)
  const isActive = useCallback(
    (path: string) =>
      location.pathname.replace(/\/$/, "") === path.replace(/\/$/, ""),
    [location.pathname],
  );

  // Check if any sub-item of a nav group matches the current path
  const isGroupActive = useCallback(
    (item: SidebarNavItem) =>
      item.subItems?.some(
        (sub) =>
          location.pathname === sub.path ||
          location.pathname.startsWith(sub.path + "/"),
      ) ?? false,
    [location.pathname],
  );

  // Auto-expand the group whose sub-item is active on pathname change
  useEffect(() => {
    const activeIdx = sidebarMenuConfig.findIndex((item) =>
      item.subItems?.some((sub) => location.pathname.startsWith(sub.path)),
    );
    setOpenIndex(activeIdx === -1 ? null : activeIdx);
  }, [location.pathname]);

  // Recalculate accordion height when open index changes
  useEffect(() => {
    if (openIndex !== null && subMenuRefs.current[openIndex]) {
      setSubMenuHeights((prev) => ({
        ...prev,
        [openIndex]: subMenuRefs.current[openIndex]?.scrollHeight ?? 0,
      }));
    }
  }, [openIndex]);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const sidebarVisible = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link to="/dashboard" className="no-underline">
          {sidebarVisible ? (
            <div className="flex items-center gap-2.5">
              <img
                src="/letshyre.png"
                alt="logo"
                className="object-contain w-auto h-10"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
              <span className="text-base font-extrabold leading-none text-white">
                L
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          {/* Section label */}
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
          >
            {sidebarVisible ? "Menu" : <HorizontaLDots className="size-6" />}
          </h2>

          <ul className="flex flex-col gap-4">
            {sidebarMenuConfig.map((item, index) => {
              const Icon = item.icon;
              const isOpen = openIndex === index;
              const groupActive = isGroupActive(item);

              return (
                <li key={item.name}>
                  {/* ── Leaf link ─────────────────────────────────── */}
                  {!item.subItems && item.path ? (
                    <Link
                      to={item.path}
                      className={`menu-item group ${
                        isActive(item.path)
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          isActive(item.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        <Icon />
                      </span>
                      {sidebarVisible && (
                        <span className="menu-item-text">{item.name}</span>
                      )}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleAccordion(index)}
                        className={`menu-item group menu-item-inactive cursor-pointer ${
                          !isExpanded && !isHovered
                            ? "lg:justify-center"
                            : "lg:justify-start"
                        }`}
                      >
                        <span className="menu-item-icon-size menu-item-icon-inactive">
                          <Icon />
                        </span>
                        {sidebarVisible && (
                          <>
                            <span className="menu-item-text">{item.name}</span>
                            <ChevronDownIcon
                              className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                isOpen ? "rotate-180 text-brand-500" : ""
                              }`}
                            />
                          </>
                        )}
                      </button>

                      {sidebarVisible && (
                        <div
                          ref={(el) => {
                            subMenuRefs.current[index] = el;
                          }}
                          className="overflow-hidden transition-all duration-300"
                          style={{
                            height: isOpen
                              ? `${subMenuHeights[index] ?? 0}px`
                              : "0px",
                          }}
                        >
                          <ul className="mt-2 space-y-1 ml-9">
                            {item.subItems!.map((sub) => (
                              <li key={sub.path}>
                                <Link
                                  to={sub.path}
                                  className={`menu-dropdown-item ${
                                    isActive(sub.path)
                                      ? "menu-dropdown-item-active"
                                      : "menu-dropdown-item-inactive"
                                  }`}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
