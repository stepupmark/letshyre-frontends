import React, { useState, useRef, useEffect } from "react";
import { toast } from "@/lib/toast";
import { useTranslation } from "react-i18next";
import {
  useTeamMembers,
  useAddTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
} from "@/features/employer/hooks/useTeam";

import { TeamCard } from "@/features/employer/components/teams/TeamCard";
import { TeamMemberModal } from "@/features/employer/components/teams/TeamMemberModal";
import { TeamSkeleton } from "@/features/employer/components/teams/TeamSkeleton";
import { EmptyTeamState } from "@/features/employer/components/teams/EmptyTeamState";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

// Carousel arrow; visibility is driven by the opacity/pointer-events toggles
// below, not by `hidden`.
const SLIDER_ARROW_CLASS =
  "absolute top-1/2 z-20 size-13.5 -translate-y-1/2 rounded-full border-neutral-300 bg-card text-2xl font-extrabold text-brand-600 shadow-lg transition-all hover:bg-bg-subtle hover:text-brand-700 hover:shadow-xl hover:scale-110";

export function Team() {
  const { t } = useTranslation("employer");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Queries & Mutations
  const { data: teamMembers, isLoading, isError } = useTeamMembers();
  const { mutate: addMember, isPending: isAdding } = useAddTeamMember();
  const { mutate: updateMember, isPending: isUpdating } = useUpdateTeamMember();
  const { mutate: deleteMember } = useDeleteTeamMember();

  // Scroll visibility effect
  useEffect(() => {
    // Coalesce to one measurement per frame — scrollWidth/clientWidth are layout
    // reads, and the arrows can only change once per painted frame anyway.
    let frame = null;

    const measure = () => {
      frame = null;
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        setShowLeftArrow(scrollLeft > 0);
        // Using Math.ceil to avoid floating point precision issues at the end of scroll
        setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
      }
    };

    const handleScroll = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", handleScroll, { passive: true });
      // Check initial state once data loads
      measure();
    }

    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (slider) slider.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [teamMembers]);

  // Handlers
  const handleOpenAddModal = () => {
    setMemberToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setMemberToEdit(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMemberToEdit(null);
  };

  const addTeamMember = (formData) => {
    if (memberToEdit) {
      updateMember(
        { id: memberToEdit.id, data: formData },
        {
          onSuccess: (res) => {
            if (res.success) {
              handleCloseModal();
              toast.success(t("team.toasts.memberUpdated"));
            } else toast.error(res.message || t("team.toasts.updateFailed"));
          },
          onError: (err) => {
            const res = err.response?.data;
            const msg =
              res?.data && Object.keys(res.data).length > 0
                ? Object.values(res.data).flat().join(", ")
                : res?.message || t("team.toasts.updateFailed");
            toast.error(msg);
          },
        },
      );
    } else {
      const newMemberData = { ...formData, title: "Recruiter" };
      addMember(newMemberData, {
        onSuccess: (res) => {
          if (res.success) {
            handleCloseModal();
            toast.success(t("team.toasts.memberAdded"));
          } else {
            const msg =
              res?.data && Object.keys(res.data).length > 0
                ? Object.values(res.data).flat().join(", ")
                : res.message || t("team.toasts.addFailed");
            toast.error(msg);
          }
        },
        onError: (err) => {
          const res = err.response?.data;
          const msg =
            res?.data && Object.keys(res.data).length > 0
              ? Object.values(res.data).flat().join(", ")
              : res?.message || t("team.toasts.addFailed");
          toast.error(msg);
        },
      });
    }
  };

  const handleToggleStatus = (member) => {
    const newStatus = member.status === "Active" ? "Hold" : "Active";
    updateMember(
      { id: member.id, data: { status: newStatus } },
      {
        onSuccess: () =>
          toast.success(
            t("team.toasts.statusUpdated", {
              status: t(`team.status.${newStatus.toLowerCase()}`),
            }),
          ),
        onError: (err) => {
          const res = err.response?.data;
          const msg = res?.message || t("team.toasts.toggleFailed");
          toast.error(msg);
        },
      },
    );
  };

  const handleDelete = (member) => {
    if (window.confirm(t("team.confirmRemove", { name: member.full_name }))) {
      deleteMember(member.id, {
        onSuccess: () => toast.success(t("team.toasts.memberRemoved")),
        onError: (err) => {
          const res = err.response?.data;
          const msg = res?.message || t("team.toasts.removeFailed");
          toast.error(msg);
        },
      });
    }
  };

  const getScrollAmount = () => {
    if (sliderRef.current) {
      // On mobile devices (<= 768px), scroll by exactly the container's width (one card)
      if (window.innerWidth <= 768) {
        return sliderRef.current.clientWidth;
      }
      return 300; // Default for larger screens
    }
    return 300;
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -getScrollAmount(),
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: getScrollAmount(),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden rounded-lg bg-card py-10 before:absolute before:inset-x-0 before:top-0 before:z-0 before:h-70 before:bg-linear-to-b before:from-white before:to-brand-400 before:shadow-lg before:content-[''] max-md:before:h-80">
      <div className="relative z-1 px-6 text-center">
        <h2 className="mt-0 mb-2 text-2xl font-black text-brand-600">{t("team.heading")}</h2>
        <p className="mt-0 mb-1.25 text-sm font-medium text-neutral-500">
          {t("team.subtitle")}
        </p>
        <Button
          className="h-auto rounded-sm bg-text-main px-8 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-text-main hover:shadow-lg max-sm:px-4.5 max-sm:py-2.5"
          onClick={handleOpenAddModal}
        >
          {t("team.addMember")}
        </Button>
      </div>

      {isError && (
        <div className="mb-4 text-center text-danger">
          {t("team.errorLoad")}
        </div>
      )}

      {isLoading ? (
        <div className="relative z-1 flex items-center px-15 max-md:px-10">
          <div className="scrollbar-none mt-7.5 flex w-full snap-x snap-mandatory gap-5.75 overflow-x-auto scroll-smooth rounded-[10px] p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <TeamSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : teamMembers && teamMembers.length > 0 ? (
        <div className="relative z-1 flex items-center px-15 max-md:px-10">
          <Button
            variant="outline"
            className={cn(
              SLIDER_ARROW_CLASS,
              "start-4",
              showLeftArrow
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
            onClick={scrollLeft}
            aria-label={t("team.scrollLeft")}
          >
            ❮
          </Button>

          <div className="scrollbar-none mt-7.5 flex w-full snap-x snap-mandatory gap-5.75 overflow-x-auto scroll-smooth rounded-[10px] p-2" ref={sliderRef}>
            {teamMembers.map((member, index) => (
              <TeamCard
                key={member.id}
                member={member}
                index={index}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          <Button
            variant="outline"
            className={cn(
              SLIDER_ARROW_CLASS,
              "end-4",
              showRightArrow
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
            onClick={scrollRight}
            aria-label={t("team.scrollRight")}
          >
            ❯
          </Button>
        </div>
      ) : (
        <EmptyTeamState onAdd={handleOpenAddModal} />
      )}

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={addTeamMember}
        memberToEdit={memberToEdit}
        isPending={isAdding || isUpdating}
      />
    </div>
  );
}
