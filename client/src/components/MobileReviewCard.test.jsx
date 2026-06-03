import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import MobileReviewCard from "./MobileReviewCard";
import { REPORT_DATA } from "../constants/config";

// --- Helpers -------------------------------------------------------------

const theme = createTheme();

const defaultFindings = REPORT_DATA.breast.findings.map((text, i) => ({
  id: `test-${i}`,
  text,
}));

const renderCard = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <MobileReviewCard
        findings={defaultFindings}
        categoryData={REPORT_DATA.breast}
        patientName=""
        editableReviewFindings={false}
        onFindingsChange={vi.fn()}
        onPrint={vi.fn()}
        printing={false}
        isDark={false}
        theme={theme}
        onGoHome={vi.fn()}
        {...props}
      />
    </ThemeProvider>,
  );

// --- Tests ---------------------------------------------------------------

describe("MobileReviewCard", () => {
  // 1
  it("renders findings list in static mode", () => {
    renderCard({ editableReviewFindings: false });
    expect(screen.getByText("FINDINGS:")).toBeInTheDocument();
    defaultFindings.forEach((f) => {
      expect(screen.getByText(f.text)).toBeInTheDocument();
    });
  });

  // 2
  it("renders findings as editable cards", () => {
    renderCard({ editableReviewFindings: true });
    expect(screen.queryByText("FINDINGS:")).not.toBeInTheDocument();
    const cards = screen.getAllByLabelText("Finding options");
    expect(cards).toHaveLength(defaultFindings.length);
  });

  // 3
  it("+ button opens edit modal with empty textarea", async () => {
    const user = userEvent.setup();
    const onFindingsChange = vi.fn();
    renderCard({ editableReviewFindings: true, onFindingsChange });

    await user.click(screen.getByLabelText("Add finding"));

    expect(onFindingsChange).toHaveBeenCalledTimes(1);
    const newFindings = onFindingsChange.mock.calls[0][0];
    expect(newFindings).toHaveLength(defaultFindings.length + 1);
    expect(newFindings[newFindings.length - 1].text).toBe("");
  });

  // 4
  it("kebab menu shows Edit and Delete options", async () => {
    const user = userEvent.setup();
    renderCard({ editableReviewFindings: true });

    const menus = screen.getAllByLabelText("Finding options");
    await user.click(menus[0]);

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  // 5
  it("delete from menu removes finding", async () => {
    const user = userEvent.setup();
    const onFindingsChange = vi.fn();
    renderCard({ editableReviewFindings: true, onFindingsChange });

    const menus = screen.getAllByLabelText("Finding options");
    await user.click(menus[0]);
    await user.click(screen.getByText("Delete"));

    expect(onFindingsChange).toHaveBeenCalledTimes(1);
    expect(onFindingsChange.mock.calls[0][0]).toHaveLength(
      defaultFindings.length - 1,
    );
  });

  // 6
  it("edit from menu opens modal with finding text", async () => {
    const user = userEvent.setup();
    renderCard({ editableReviewFindings: true });

    const menus = screen.getAllByLabelText("Finding options");
    await user.click(menus[0]);
    await user.click(screen.getByText("Edit"));

    expect(screen.getByText("Edit Finding")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(defaultFindings[0].text),
    ).toBeInTheDocument();
  });

  // 7
  it("typing in modal and saving updates finding", async () => {
    const user = userEvent.setup();
    const onFindingsChange = vi.fn();
    renderCard({ editableReviewFindings: true, onFindingsChange });

    const menus = screen.getAllByLabelText("Finding options");
    await user.click(menus[0]);
    await user.click(screen.getByText("Edit"));

    const textarea = screen.getByDisplayValue(defaultFindings[0].text);
    await user.clear(textarea);
    await user.type(textarea, "Updated finding");

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onFindingsChange).toHaveBeenCalledTimes(1);
    const updated = onFindingsChange.mock.calls[0][0];
    expect(updated[0].text).toBe("Updated finding");
  });

  // 8
  it("cancel edit with changes prompts discard dialog", async () => {
    const user = userEvent.setup();
    renderCard({ editableReviewFindings: true });

    const menus = screen.getAllByLabelText("Finding options");
    await user.click(menus[0]);
    await user.click(screen.getByText("Edit"));

    const textarea = screen.getByDisplayValue(defaultFindings[0].text);
    await user.type(textarea, " extra");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
  });

  // 9
  it("discard reverts finding text", async () => {
    const user = userEvent.setup();
    const onFindingsChange = vi.fn();
    renderCard({ editableReviewFindings: true, onFindingsChange });

    const menus = screen.getAllByLabelText("Finding options");
    await user.click(menus[0]);
    await user.click(screen.getByText("Edit"));

    const textarea = screen.getByDisplayValue(defaultFindings[0].text);
    await user.type(textarea, " extra");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await user.click(screen.getByText("Discard"));

    expect(onFindingsChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();
    });
  });

  // 10
  it("save in discard dialog keeps changes", async () => {
    const user = userEvent.setup();
    const onFindingsChange = vi.fn();
    renderCard({ editableReviewFindings: true, onFindingsChange });

    const menus = screen.getAllByLabelText("Finding options");
    await user.click(menus[0]);
    await user.click(screen.getByText("Edit"));

    const textarea = screen.getByDisplayValue(defaultFindings[0].text);
    await user.type(textarea, " extra");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onFindingsChange).toHaveBeenCalledTimes(1);
    const updated = onFindingsChange.mock.calls[0][0];
    expect(updated[0].text).toBe(defaultFindings[0].text + " extra");
  });

  // 11
  it("empty finding is auto-removed on commit", async () => {
    const user = userEvent.setup();
    const onFindingsChange = vi.fn();
    renderCard({ editableReviewFindings: true, onFindingsChange });

    const menus = screen.getAllByLabelText("Finding options");
    await user.click(menus[0]);
    await user.click(screen.getByText("Edit"));

    const textarea = screen.getByDisplayValue(defaultFindings[0].text);
    await user.clear(textarea);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onFindingsChange).toHaveBeenCalledTimes(1);
    const updated = onFindingsChange.mock.calls[0][0];
    expect(updated.find((f) => f.id === defaultFindings[0].id)).toBeUndefined();
  });

  // 12
  it("print button disabled when no findings", () => {
    renderCard({
      editableReviewFindings: true,
      findings: [],
    });
    expect(screen.getByRole("button", { name: /Print Report/ })).toBeDisabled();
  });
});
