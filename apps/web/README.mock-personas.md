# Mock Demo Personas

Alter can run in a mock persona mode for demos.

Available profiles:

- `Busy Professional`: meeting-heavy week with overload risk and `COPILOT` autonomy.
- `Student`: class + study schedule with `OBSERVER` autonomy.
- `Parent`: fragmented family logistics with `ADVISOR` autonomy.
- `Retiree`: calmer routine with `AUTONOMOUS` autonomy.

How it works:

- The active profile is stored in the `alter-mock-profile` cookie.
- The dashboard page, suggestions page, and the related API routes all honor that cookie.
- Generated mock suggestions are ephemeral. Accept/Decline works in-session, but a refresh resets the profile back to its catalog data.

Visibility:

- The persona switcher is shown automatically in development.
- To expose it outside development, set `NEXT_PUBLIC_ENABLE_MOCK_PROFILES=true`.
