import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormSelect } from "@/components/common/FormSelect";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  ACTIONS,
  BTN_PRIMARY,
  FIELD,
  FIELD_ERROR,
  FIELD_LABEL,
  FORM_GRID,
  FORM_GROUP,
  TEXTAREA,
} from "./onboardingFields";
import { BIcon } from "@/components/icons/BootstrapIcons";
import { searchCities } from "@/features/employee/services/citySearch.service";

const VALID_TICK = "ms-1.5 text-success";

const multiplication = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const permutation = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function validAadhaar(a) {
  if (!/^\d{12}$/.test(a)) return false;
  if (/^(\d)\1+$/.test(a)) return false;
  let c = 0;
  const digits = a.split("").reverse().map(Number);
  for (let i = 0; i < digits.length; i++) {
    c = multiplication[c][permutation[i % 8][digits[i]]];
  }
  return c === 0;
}

const validateAge = (dob) => {
  if (!dob) return false;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 18;
};

function StepIdentity({ onNext }) {
  const { t } = useTranslation("employeeOnboarding");
  const {
    register,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext();

  const [citySuggestions, setCitySuggestions] = useState([]);

  const location = watch("location");
  const aadhaar = watch("aadhar_number");
  const gender = watch("gender");
  const dob = watch("dob");
  const address = watch("address");

  useEffect(() => {
    if (!location || location.length < 2) return;
    const controller = new AbortController();
    const delay = setTimeout(async () => {
      try {
        const cities = await searchCities(location, {
          signal: controller.signal,
        });
        setCitySuggestions(cities);
      } catch {
        // City suggestions are best-effort; leave the field usable on failure.
      }
    }, 400);
    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [location]);

  const handleAadhaarChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 12) return;
    v = v.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join("-")
    );
    setValue("aadhar_number", v, { shouldValidate: true });
  };

  const handleContinue = async () => {
    const isValid = await trigger([
      "gender",
      "dob",
      "location",
      "address",
      "aadhar_number",
    ]);
    if (!isValid) return;
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={FORM_GRID}>
        <div className={FORM_GROUP}>
          <label className={FIELD_LABEL}>
            {t("identity.genderLabel")}
            {gender && !errors.gender && (
              <BIcon name="check-circle-fill" className={VALID_TICK} />
            )}
          </label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: t("identity.genderRequired") }}
            render={({ field }) => (
              <FormSelect
                size="auto"
                className={FIELD}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t("identity.genderPlaceholder")}
                aria-invalid={!!errors.gender}
                options={[
                  { value: "Male", label: t("identity.genderOptions.male") },
                  { value: "Female", label: t("identity.genderOptions.female") },
                  { value: "Other", label: t("identity.genderOptions.other") },
                ]}
              />
            )}
          />
          {errors.gender && <p className={FIELD_ERROR}>{errors.gender.message}</p>}
        </div>

        <div className={FORM_GROUP}>
          <label className={FIELD_LABEL}>
            {t("identity.dobLabel")}
            {dob && validateAge(dob) && !errors.dob && (
              <BIcon name="check-circle-fill" className={VALID_TICK} />
            )}
          </label>
          <input
            type="date"
            className={FIELD}
            max={new Date().toISOString().split("T")[0]}
            {...register("dob", {
              required: t("identity.dobRequired"),
              validate: (val) => validateAge(val) || t("identity.dobMinAge"),
            })}
          />
          {errors.dob && <p className={FIELD_ERROR}>{errors.dob.message}</p>}
        </div>

        <div className={`${FORM_GROUP} relative`}>
          <label className={FIELD_LABEL}>
            {t("identity.locationLabel")}
            {location && !errors.location && (
              <BIcon name="check-circle-fill" className={VALID_TICK} />
            )}
          </label>
          <input
            className={FIELD}
            placeholder={t("identity.locationPlaceholder")}
            {...register("location", { required: t("identity.locationRequired") })}
          />
          {location && location.length >= 2 && citySuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-50 w-full overflow-y-auto rounded-sm border border-border bg-card shadow-md">
              {citySuggestions.map((city, i) => (
                <div
                  key={i}
                  className="cursor-pointer px-4 py-2.5 text-sm hover:bg-neutral-100"
                  onClick={() => {
                    setValue("location", `${city.city}, ${city.country}`, {
                      shouldValidate: true,
                    });
                    setCitySuggestions([]);
                  }}
                >
                  {city.city}, {city.country}
                </div>
              ))}
            </div>
          )}
          {errors.location && <p className={FIELD_ERROR}>{errors.location.message}</p>}
        </div>

        <div className={FORM_GROUP}>
          <label className={FIELD_LABEL}>
            {t("identity.aadhaarLabel")}
            {aadhaar &&
              aadhaar.replace(/\D/g, "").length === 12 &&
              validAadhaar(aadhaar.replace(/\D/g, "")) &&
              !errors.aadhar_number && (
                <BIcon name="check-circle-fill" className={VALID_TICK} />
              )}
          </label>
          <input
            className={FIELD}
            placeholder={t("identity.aadhaarPlaceholder")}
            value={aadhaar}
            onChange={handleAadhaarChange}
          />
          <input
            type="hidden"
            {...register("aadhar_number", {
              required: t("identity.aadhaarRequired"),
              validate: (val) => {
                const raw = val.replace(/\D/g, "");
                if (raw.length !== 12 || !validAadhaar(raw)) {
                  return t("identity.aadhaarInvalid");
                }
                return true;
              },
            })}
          />
          {errors.aadhar_number && (
            <p className={FIELD_ERROR}>{errors.aadhar_number.message}</p>
          )}
        </div>
      </div>

      <div className={FORM_GROUP}>
        <label className={FIELD_LABEL}>
          {t("identity.addressLabel")}
          {address && address.length >= 10 && !errors.address && (
            <BIcon name="check-circle-fill" className={VALID_TICK} />
          )}
        </label>
        <textarea
          className={TEXTAREA}
          placeholder={t("identity.addressPlaceholder")}
          {...register("address", {
            required: t("identity.addressRequired"),
            minLength: { value: 10, message: t("identity.addressMinLength") },
          })}
        />
        {errors.address && <p className={FIELD_ERROR}>{errors.address.message}</p>}
      </div>

      <div className={ACTIONS}>
        <Button className={BTN_PRIMARY} onClick={handleContinue}>
          {t("continue")} <BIcon name="arrow-right" />
        </Button>
      </div>
    </motion.div>
  );
}

export default StepIdentity;
