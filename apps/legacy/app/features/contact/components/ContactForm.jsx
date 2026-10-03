import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { makeContactSchema } from "@/features/contact/schemas/contact.schema";
import { useContactMutation } from "@/features/contact/hooks/useContact";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { useAppLocale } from "@/i18n/appLocale";

const CONTACT_SUBMIT =
  "h-auto w-full gap-2.5 rounded-md bg-linear-135 from-text-main to-text-body px-6 py-4 text-base font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:from-text-body hover:to-neutral-700 hover:shadow-lg disabled:translate-y-0 disabled:bg-neutral-400 disabled:bg-none disabled:shadow-none motion-reduce:hover:translate-y-0";

// Floating label via `peer`: the label is the input's next sibling, so
// peer-focus / peer-[:not(:placeholder-shown)] drive it without CSS. Inputs must
// keep placeholder=" " — that's what :placeholder-shown tests against.
const FIELD_BASE =
  "peer box-border w-full rounded-md border border-border bg-bg-subtle px-4 pt-6 pb-2 text-base text-text-main transition-all duration-300 focus:border-brand-600 focus:bg-bg-card focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

const FIELD_LABEL =
  "pointer-events-none absolute top-4 start-4 origin-top-left text-base font-medium text-neutral-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-brand-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:text-brand-600 peer-[:not(:placeholder-shown):not(:focus)]:text-neutral-500";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BIcon } from "@/components/icons/BootstrapIcons";

// One floating-label field. FormControl before FormLabel so the label is the
// input's next sibling (peer needs that); `block` cancels FormItem's grid gap.
function ContactField({ name, label, isValid, children }) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="relative mb-6 block">
          <FormControl>{children(field)}</FormControl>
          <FormLabel className={FIELD_LABEL}>{label}</FormLabel>
          {isValid && (
            <BIcon
              name="check-circle-fill"
              className="absolute top-4 end-4 animate-in text-[1.1rem] text-success duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] fade-in zoom-in-50"
            />
          )}
          <FormMessage className="mt-1.5 block text-[0.85rem] font-medium text-danger" />
        </FormItem>
      )}
    />
  );
}

export function ContactForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useTranslation("contact");
  const { locale: lang } = useAppLocale();

  const schema = useMemo(() => makeContactSchema(t), [t]);
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange", // live validation
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const {
    formState: { errors, dirtyFields },
  } = form;

  const { mutate: submitContact, isPending } = useContactMutation();

  const onSubmit = (data) => {
    submitContact(data, {
      onSuccess: () => {
        setIsSuccess(true);
        form.reset();
      },
    });
  };

  const isFieldValid = (fieldName) => {
    // valid = dirty and error-free
    return dirtyFields[fieldName] && !errors[fieldName];
  };

  return (
    <motion.div
      className="relative rounded-xl border border-neutral-100 bg-bg-card p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] max-md:p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <Form {...form} key="form">
            <motion.form
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="mb-8">
                <h2 className="mb-2 text-2xl font-extrabold tracking-[-0.02em] text-text-main">
                  {t("form.title")}
                </h2>
                <p className="text-[0.95rem] leading-[1.5] text-neutral-500">
                  {t("form.subtitle")}
                </p>
              </div>

              <ContactField
                name="name"
                label={t("form.fields.name")}
                isValid={isFieldValid("name")}
              >
                {(field) => (
                  <input
                    {...field}
                    type="text"
                    autoComplete="name"
                    placeholder=" "
                    className={FIELD_BASE}
                    disabled={isPending}
                  />
                )}
              </ContactField>

              <ContactField
                name="email"
                label={t("form.fields.email")}
                isValid={isFieldValid("email")}
              >
                {(field) => (
                  <input
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder=" "
                    className={FIELD_BASE}
                    disabled={isPending}
                  />
                )}
              </ContactField>

              <ContactField
                name="subject"
                label={t("form.fields.subject")}
                isValid={isFieldValid("subject")}
              >
                {(field) => (
                  <input
                    {...field}
                    type="text"
                    placeholder=" "
                    className={FIELD_BASE}
                    disabled={isPending}
                  />
                )}
              </ContactField>

              <ContactField
                name="message"
                label={t("form.fields.message")}
                isValid={isFieldValid("message")}
              >
                {(field) => (
                  <textarea
                    {...field}
                    placeholder=" "
                    className={`${FIELD_BASE} min-h-20 resize-y`}
                    disabled={isPending}
                  />
                )}
              </ContactField>

              <div className="mb-5 text-start text-[0.85rem] leading-[1.5] text-neutral-500">
                <p>
                  <Trans
                    t={t}
                    i18nKey="form.privacy"
                    components={{
                      pp: (
                        <Link
                          to={localePath(lang, "/policy")}
                          className="font-semibold text-brand-600 underline transition-all duration-200"
                        />
                      ),
                    }}
                  />
                </p>
              </div>

              <Button
                type="submit"
                className={CONTACT_SUBMIT}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
                    {t("form.sending")}
                  </>
                ) : (
                  t("form.submit")
                )}
              </Button>
            </motion.form>
          </Form>
        ) : (
          <motion.div
            key="success"
            role="status"
            aria-live="polite"
            className="flex h-full min-h-[400px] flex-col items-center justify-center px-5 py-10 text-center"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-bg">
              <BIcon name="check" className="text-[2.5rem] text-success" />
            </div>
            <h2 className="mb-3 text-[1.75rem] font-extrabold text-text-main">
              {t("form.successTitle")}
            </h2>
            <p className="max-w-[320px] text-[1.05rem] leading-[1.6] text-neutral-500">
              {t("form.successBody")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
