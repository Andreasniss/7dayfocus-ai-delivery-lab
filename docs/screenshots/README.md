# App screenshots

Captured on 6 September 2026 from the installed Pixel 8 Pro app running Android 17. The APK's application sources are recorded at `4220b266154275cd1d7d552b1c1af2b0b5595801`; see the [P11 evidence ledger](../ai-dlc/changes/P11-android-personal-install/evidence.md) for its SHA-256 and device checks.

| Capture | What is shown |
| --- | --- |
| [`android-day.png`](android-day.png) | Day view with a fictional priority and Work/Life tasks, plus the explicit Android export limitation |
| [`android-proposal.png`](android-proposal.png) | The initial fixture proposal to move Map onboarding flow from Sunday to Saturday, before approval |

Both PNGs are genuine, unedited WebView viewport captures (1008 by 2079 pixels), not generated mockups. They exclude Android's system bars; the native safe-area regression test and physical-screen observation, not these app-only images, establish the status-bar fix. Display scaling in Markdown or the website does not change the capture.

Reproduce with [`examples/demo-week.json`](../../examples/demo-week.json) through the normal Import flow. The example has 15 fictional tasks for 6-12 September 2026. Select Day view for the first capture. Restore the example, open the fixture assistant, generate a proposal, and scroll the review and approval controls into view for the second. Do not approve before capturing. The Today selection depends on the current date.

No personal tasks, credentials, device identifiers, raw diagnostics, or private recovery copies are included. The website reuses these exact files. These images demonstrate specific observed screens, not universal Android compatibility, accessibility conformance, or live-model quality.
