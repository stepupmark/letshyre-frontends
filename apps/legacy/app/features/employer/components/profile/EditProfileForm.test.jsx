import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { EditProfileForm } from "./EditProfileForm";

const industries = { data: [] };
vi.mock("@/hooks/useIndustries", () => ({ useIndustries: () => ({ data: industries.data }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key }) }));

const LIST = [
  { value: "it", label: "IT / Software Development" },
  { value: "health", label: "Healthcare" },
];
const kyc = {
  company_industry: "IT / Software Development",
  official_email: "hr@acme.com",
  company_address: "Hyderabad",
};

const renderForm = (props = {}) =>
  render(
    <EditProfileForm
      profile={{}}
      kyc={kyc}
      onCancel={vi.fn()}
      updateKycMutation={{ mutate: vi.fn(), isPending: false }}
      {...props}
    />,
  );

const industryTrigger = () => screen.getAllByRole("combobox").at(-1);
const settle = () => act(async () => {});

beforeEach(() => {
  industries.data = [];
});

describe("EditProfileForm", () => {
  it("shows the saved industry when the list is already loaded", async () => {
    industries.data = LIST;
    renderForm();
    await settle();
    expect(industryTrigger()).toHaveTextContent("IT / Software Development");
  });

  it("shows the saved industry when the list arrives later", async () => {
    const view = renderForm();
    await settle();
    industries.data = LIST;
    view.rerender(
      <EditProfileForm
        profile={{}}
        kyc={kyc}
        onCancel={vi.fn()}
        updateKycMutation={{ mutate: vi.fn(), isPending: false }}
      />,
    );
    await settle();
    expect(industryTrigger()).toHaveTextContent("IT / Software Development");
  });

  it("keeps the industry when the profile refetches", async () => {
    industries.data = LIST;
    const view = renderForm();
    await settle();
    view.rerender(
      <EditProfileForm
        profile={{}}
        kyc={{ ...kyc }}
        onCancel={vi.fn()}
        updateKycMutation={{ mutate: vi.fn(), isPending: false }}
      />,
    );
    await settle();
    expect(industryTrigger()).toHaveTextContent("IT / Software Development");
  });

  it("no longer asks for company size", async () => {
    renderForm();
    await settle();
    expect(screen.queryByText("profile.edit.companySize")).not.toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
  });
});
