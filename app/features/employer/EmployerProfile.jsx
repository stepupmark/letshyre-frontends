import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGetEmployerProfile, useUpdateKyc } from "@/features/employer/hooks/useEmployerProfile";
import { ProfileSkeleton } from "@/features/employer/components/profile/ProfileSkeleton";
import { ProfileBanner } from "@/features/employer/components/profile/ProfileBanner";
import { PrimaryDetails } from "@/features/employer/components/profile/PrimaryDetails";
import { CompanyDetails } from "@/features/employer/components/profile/CompanyDetails";
import { DocumentLinks } from "@/features/employer/components/profile/DocumentLinks";
import { EditProfileForm } from "@/features/employer/components/profile/EditProfileForm";
import { ErrorState } from "@/features/employer/components/states/ErrorState";
import { LoadingRegion } from "@/features/employer/components/states/LoadingRegion";
import { useQueryFailure } from "@/features/employer/hooks/useQueryFailure";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { getStoredUser } from "@/lib/getUser";

export function EmployerProfile() {
  const { t } = useTranslation("employer");
  const [editProfile, setEditProfile] = useState(false);
  /* EditProfileForm owns the cancel flow, so Escape routes through the same
     `onCancel` the form's own button calls rather than closing behind it. */
  const editModalRef = useDialogA11y(editProfile, () => setEditProfile(false));
  const [loggedUser, setLoggedUser] = useState(null);

  const profileQuery = useGetEmployerProfile();
  const { data: profileData, isPending, error } = profileQuery;
  const { failed, retry, retrying } = useQueryFailure(profileQuery);
  const updateKycMutation = useUpdateKyc();

  useEffect(() => {
    // getStoredUser reads localStorage, which isn't available during SSR —
    // this has to run client-side, post-mount.
    const user = getStoredUser();
    if (Object.keys(user).length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoggedUser(user);
    }
  }, []);

  if (isPending && !failed) {
    return (
      <LoadingRegion className="mx-auto max-w-350 gap-8 text-text-main">
        <ProfileSkeleton />
      </LoadingRegion>
    );
  }

  if (failed) {
    return (
      <div className="mx-auto max-w-350">
        <ErrorState error={error} onRetry={retry} retrying={retrying} headingLevel={1} />
      </div>
    );
  }

  const profile = profileData || {};
  const kyc = profileData?.kyc || {};
  const stats = {
    openJobs: profileData?.open_jobs_posted || 0,
    totalJobs: profileData?.total_jobs_posted || 0,
  };

  return (
    <div className="mx-auto flex max-w-350 flex-col gap-8 text-text-main">
      <ProfileBanner
        companyName={kyc?.company_name || loggedUser?.company_name}
        stats={stats}
        onEditClick={() => setEditProfile(true)}
      />
      <PrimaryDetails 
        profile={profile}
        kyc={kyc}
        loggedUser={loggedUser}
      />
      <CompanyDetails 
        kyc={kyc}
      />
      <DocumentLinks 
        kyc={kyc}
      />

      {editProfile && (
        <div className="fixed inset-0 z-1000 flex h-screen w-screen items-center justify-center overflow-y-auto bg-text-main/60 p-8 backdrop-blur-[4px]">
          <div
            ref={editModalRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("profile.editDialogAria")}
            tabIndex={-1}
            className="relative w-full max-w-312.5 bg-transparent animate-in fade-in slide-in-from-bottom-5 duration-300 ease-out"
          >
            <EditProfileForm 
              profile={profile}
              kyc={kyc}
              onCancel={() => setEditProfile(false)}
              updateKycMutation={updateKycMutation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
