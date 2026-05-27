import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import MobileReportFlow from "./MobileReportFlow";
import { PDF_TEMPLATE_PATH, REPORT_DATA } from "../constants/config";
import PDFService from "../services/PDFService";

// --- Mocks ---------------------------------------------------------------

let settingsValue;
vi.mock("../../hooks/useSettings", () => ({
  useSettings: () => settingsValue,
}));

vi.mock("../services/PDFService", () => ({
  default: {
    fillTemplate: vi.fn(),
    printPDF: vi.fn(),
  },
}));

// --- Helpers -------------------------------------------------------------

const renderFlow = (props = {}) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <MobileReportFlow {...props} />
    </ThemeProvider>,
  );

const getFindingTextareas = () =>
  screen.queryAllByPlaceholderText("Enter finding...");

const clickCategory = (name) => fireEvent.click(screen.getByText(name));

beforeEach(() => {
  settingsValue = { showCardFindings: false, easyNavigationButtons: false };
  PDFService.fillTemplate.mockReset();
  PDFService.printPDF.mockReset();
  PDFService.fillTemplate.mockResolvedValue(new Uint8Array([1, 2, 3]));
  PDFService.printPDF.mockResolvedValue(undefined);
});

// --- Tests ---------------------------------------------------------------

describe("MobileReportFlow", () => {
  it("renders a card for every category in REPORT_DATA", () => {
    renderFlow();
    Object.values(REPORT_DATA).forEach((cat) => {
      expect(screen.getByText(cat.name)).toBeInTheDocument();
    });
  });

  it("selecting a category advances to step 1 and seeds findings from REPORT_DATA", () => {
    renderFlow();
    clickCategory(REPORT_DATA.breast.name);

    expect(screen.getByText("Edit Findings")).toBeInTheDocument();
    const textareas = getFindingTextareas();
    expect(textareas).toHaveLength(REPORT_DATA.breast.findings.length);
    expect(textareas[0]).toHaveValue(REPORT_DATA.breast.findings[0]);
  });

  it("disables Next button on step 0 until a category is selected", () => {
    renderFlow();
    const nextBtn = screen.getByRole("button", { name: /Next/ });
    expect(nextBtn).toBeDisabled();
  });

  it("in list mode, editing a finding to whitespace removes it from the list", () => {
    renderFlow();
    clickCategory(REPORT_DATA.breast.name);

    const original = REPORT_DATA.breast.findings.length;
    const removedText = REPORT_DATA.breast.findings[0];
    fireEvent.change(getFindingTextareas()[0], { target: { value: "   " } });

    expect(getFindingTextareas()).toHaveLength(original - 1);
    expect(screen.queryByDisplayValue(removedText)).not.toBeInTheDocument();
  });

  it("in card mode, clearing a finding in card mode removes it entirely", () => {
    settingsValue = { showCardFindings: true, easyNavigationButtons: false };
    renderFlow();
    clickCategory(REPORT_DATA.breast.name);

    const firstText = REPORT_DATA.breast.findings[0];
    expect(screen.getByDisplayValue(firstText)).toBeInTheDocument();

    fireEvent.change(
      screen.getByDisplayValue(firstText),
      { target: { value: "" } },
    );

    // Finding removed, next finding now shown in its place (card view shows one at a time)
    expect(screen.queryByDisplayValue(firstText)).not.toBeInTheDocument();
    expect(getFindingTextareas()).toHaveLength(1);
  });

  it("Add Finding appends a new empty finding row", () => {
    renderFlow();
    clickCategory(REPORT_DATA.breast.name);

    const before = getFindingTextareas().length;
    fireEvent.click(screen.getByText("+ Add Finding"));

    const after = getFindingTextareas();
    expect(after).toHaveLength(before + 1);
    expect(after[after.length - 1]).toHaveValue("");
  });

  it("Print does nothing when there are no findings", async () => {
    renderFlow();
    clickCategory(REPORT_DATA.breast.name);

    // Clear every finding so the list becomes empty
    for (const finding of REPORT_DATA.breast.findings) {
      const ta = screen.getByDisplayValue(finding);
      fireEvent.change(ta, { target: { value: "" } });
    }
    expect(getFindingTextareas()).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    const printBtn = screen.getByRole("button", { name: /Print Report/ });
    expect(printBtn).toBeDisabled();
    fireEvent.click(printBtn);

    expect(PDFService.fillTemplate).not.toHaveBeenCalled();
    expect(PDFService.printPDF).not.toHaveBeenCalled();
  });

  it("Print calls PDFService with the correct payload", async () => {
    const user = userEvent.setup();
    renderFlow();
    clickCategory(REPORT_DATA.breast.name);

    const patientInput = screen.getByLabelText(/Patient Name/);
    await user.type(patientInput, "Jane");

    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    fireEvent.click(screen.getByRole("button", { name: /Print Report/ }));

    await vi.waitFor(() => {
      expect(PDFService.fillTemplate).toHaveBeenCalledTimes(1);
    });

    expect(PDFService.fillTemplate).toHaveBeenCalledWith(PDF_TEMPLATE_PATH, [
      {
        category: REPORT_DATA.breast.name,
        findings: REPORT_DATA.breast.findings,
        patientName: "Jane",
      },
    ]);

    await vi.waitFor(() => {
      expect(PDFService.printPDF).toHaveBeenCalledTimes(1);
    });
    expect(PDFService.printPDF.mock.calls[0][0]).toBeInstanceOf(Uint8Array);
  });

  it("Print surfaces an error Snackbar when PDFService throws", async () => {
    PDFService.fillTemplate.mockRejectedValueOnce(new Error("boom"));
    // Silence the console.error inside the catch block
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderFlow();
    clickCategory(REPORT_DATA.breast.name);
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    fireEvent.click(screen.getByRole("button", { name: /Print Report/ }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("boom");

    // Button text resets from "Printing..." back to "Print Report"
    await vi.waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Print Report/ }),
      ).toBeInTheDocument();
    });

    errSpy.mockRestore();
  });

  it("removing the last finding in card view clamps currentFindingIndex", () => {
    settingsValue = { showCardFindings: true, easyNavigationButtons: false };
    renderFlow();
    clickCategory(REPORT_DATA.breast.name);

    const total = REPORT_DATA.breast.findings.length;

    // Navigate to the last finding via the card-view forward arrow
    // (the only non-disabled button without text in this state)
    const forwardBtn = document.querySelector(".mobile-nav-btn-forward");
    for (let i = 0; i < total - 1; i += 1) {
      fireEvent.click(forwardBtn);
    }
    expect(
      screen.getByText(`Finding ${total} of ${total}`),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Remove finding"));

    expect(
      screen.getByText(`Finding ${total - 1} of ${total - 1}`),
    ).toBeInTheDocument();
  });

  it("clicking the Settings icon invokes onOpenSettings prop", () => {
    const onOpenSettings = vi.fn();
    renderFlow({ onOpenSettings });

    fireEvent.click(screen.getByLabelText("Settings"));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
