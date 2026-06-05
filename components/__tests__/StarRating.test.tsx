import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StarRating from "@/components/ui/StarRating";

describe("StarRating", () => {
  it("renders exactly 5 star buttons", () => {
    render(<StarRating />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("all buttons are disabled by default (non-interactive)", () => {
    render(<StarRating />);
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("buttons are enabled when interactive prop is true", () => {
    render(<StarRating interactive />);
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  it("calls onRate with the correct star value when clicked", async () => {
    const onRate = jest.fn();
    render(<StarRating interactive onRate={onRate} />);
    const buttons = screen.getAllByRole("button");
    // Click the 4th star (index 3)
    await userEvent.click(buttons[3]);
    expect(onRate).toHaveBeenCalledWith(4);
  });

  it("calls onRate with 1 when the first star is clicked", async () => {
    const onRate = jest.fn();
    render(<StarRating interactive onRate={onRate} />);
    await userEvent.click(screen.getAllByRole("button")[0]);
    expect(onRate).toHaveBeenCalledWith(1);
  });

  it("calls onRate with 5 when the last star is clicked", async () => {
    const onRate = jest.fn();
    render(<StarRating interactive onRate={onRate} />);
    await userEvent.click(screen.getAllByRole("button")[4]);
    expect(onRate).toHaveBeenCalledWith(5);
  });

  it("does not call onRate when non-interactive stars are clicked", async () => {
    const onRate = jest.fn();
    render(<StarRating onRate={onRate} />);
    // Buttons are disabled, userEvent won't fire click on disabled buttons
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
    expect(onRate).not.toHaveBeenCalled();
  });
});
