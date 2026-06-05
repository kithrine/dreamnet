import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "@/components/ui/ConfirmModal";

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  title: "Delete this dream?",
  message: "This action cannot be undone.",
};

describe("ConfirmModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when isOpen is false", () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Delete this dream?")).not.toBeInTheDocument();
  });

  it("renders the title and message when isOpen is true", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("Delete this dream?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("renders the default confirm label 'Delete'", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders a custom confirmLabel when provided", () => {
    render(<ConfirmModal {...defaultProps} confirmLabel="Remove" />);
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("calls onClose when the Cancel button is clicked", async () => {
    const onClose = jest.fn();
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const onConfirm = jest.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons when isPending is true", () => {
    render(<ConfirmModal {...defaultProps} isPending={true} />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  });

  it("shows 'Deleting…' on the confirm button when isPending is true", () => {
    render(<ConfirmModal {...defaultProps} isPending={true} />);
    expect(screen.getByRole("button", { name: "Deleting…" })).toBeInTheDocument();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = jest.fn();
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);
    // The backdrop is the absolute-positioned div behind the panel
    const backdrop = document.querySelector(".absolute.inset-0") as HTMLElement;
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
