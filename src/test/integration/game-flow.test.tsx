import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import App from "@/App";
import { GameProvider } from "@/context/GameContext";
import { TutorialProvider } from "@/context/TutorialContext";

// Silence sounds during tests
vi.mock("@/hooks/use-sounds", () => ({
  useSounds: () => ({
    playSound: () => {},
  }),
}));

// Provide a minimal supabase mock to avoid any accidental calls during tests
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    channel: () => ({
      on: () => ({
        on: () => ({
          on: () => ({
            on: () => ({
              subscribe: () => ({ status: "SUBSCRIBED" }),
            }),
          }),
        }),
      }),
      send: () => {},
      unsubscribe: () => {},
    }),
    removeChannel: () => {},
  },
}));

function renderApp(initialRoute: string = "/") {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <GameProvider>
        <TutorialProvider>
          <App />
        </TutorialProvider>
      </GameProvider>
    </MemoryRouter>,
  );
  return { user, ...utils };
}

describe("Router and Game Flow Integration", () => {
  it('renders landing page at "/" and navigates to lobby on enter', async () => {
    const { user } = renderApp("/");

    // Landing content should be visible
    const enterButton = await screen.findByRole("button", {
      name: /enter the dream/i,
    });
    expect(enterButton).toBeInTheDocument();

    // Navigate to lobby
    await user.click(enterButton);

    // Expect lobby menu choices
    expect(
      await screen.findByRole("button", { name: /online multiplayer/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /local hot-seat/i }),
    ).toBeInTheDocument();
  });

  it("starts a local hot-seat game from lobby and navigates to the gameboard", async () => {
    const { user } = renderApp("/");

    // Go from landing to lobby
    const enterButton = await screen.findByRole("button", {
      name: /enter the dream/i,
    });
    await user.click(enterButton);

    // Choose hot-seat mode
    const hotseatBtn = await screen.findByRole("button", {
      name: /local hot-seat/i,
    });
    await user.click(hotseatBtn);

    // Fill names
    const player1Input = await screen.findByLabelText(/player 1 name/i);
    const player2Input = await screen.findByLabelText(/player 2 name/i);

    await user.type(player1Input, "Alice");
    await user.type(player2Input, "Bob");

    // Start game
    const startButton = await screen.findByRole("button", {
      name: /start game/i,
    });
    await user.click(startButton);

    // After starting hotseat, the gamePhase becomes 'peeking' and App redirects to /game.
    // Assert gameboard-specific UI appears (e.g., "Action Log" panel)
    await waitFor(async () => {
      expect(await screen.findByText(/action log/i)).toBeInTheDocument();
    });
  });

  it('unknown route redirects to landing ("/")', async () => {
    renderApp("/this-route-does-not-exist");

    // Fallback route redirects to "/" where landing is shown
    const enterButton = await screen.findByRole("button", {
      name: /enter the dream/i,
    });
    expect(enterButton).toBeInTheDocument();
  });
});
