# PM Agent - Setup Checklist

The golden path, in order. Each item maps to a step in the How-To. Plan on about
half a day for a first working version.

## 1. Write the brain (~30 min)
- [ ] Create a folder in your shared drive, e.g. /agents/project-manager/.
- [ ] Copy skill.md into it.
- [ ] Replace every {{PLACEHOLDER}}: agent name, company, roster + ids, channels, Tracker link, signature emoji, keyword, timezone.
- [ ] Delete any workflow you do not want on day one.
- Done when: a teammate can open the file from their own login.

## 2. Give it a home in your team chat (~45 min, the tricky one)
- [ ] Create an app in your chat platform's developer settings.
- [ ] Grant it: read channel history, read reactions, post messages, send DMs.
- [ ] Turn on event notifications for new messages and emoji reactions.
- [ ] Install to the workspace and invite it to the one channel it should watch.
- [ ] Copy its access token somewhere safe.
- Wall: permissions + event subscriptions. If it can post but not react to your emoji, check the events connection.
- Done when: the app shows in your channel and you can DM it.

## 3. Put it on a schedule (~45 min)
- [ ] Create a job per moment: standup (10am), hourly read (11am-5pm), check-in (5pm), Monday cleanup.
- [ ] Store secrets as environment variables in your host: the chat token, and a key to read the shared drive. Never in code.
- [ ] Point every job at the brain file so it runs the latest instructions.
- [ ] Trigger one job by hand to confirm it can post.
- Wall: secrets / env vars. A silent failure at a set time is almost always a missing or expired token.
- Done when: a hand-triggered standup posts in your channel.

## 4. Choose the board (~20 min)
- [ ] Pick where tasks live (Slack List, GitHub Projects, Notion, ClickUp, Monday, Trello, Asana, Linear, Airtable, Planner/Loop).
- [ ] Recreate the columns from skill.md: Item, Type, Priority, Owner, Status, Link.
- [ ] Put the board link into {{TRACKER_LINK}}.
- Done when: replying "#1 done" in a thread flips the matching row to done on the next read.

## 5. Test with one channel for 30 days (ongoing)
- [ ] Point it at a single channel with 2-3 willing people.
- [ ] Live with the 10am standup and 5pm nudge for a week.
- [ ] Fix mistakes by editing one line in the brain file, not by rebuilding.
- [ ] Only then add the next channel, then the next agent.
- Note: after editing the brain, give the drive a minute to sync. Log changes in change-log.md.
- Done when: after a week, people reply to the standup without being chased and the board reflects reality.

## Once it is trusted (optional)
- [ ] Add a watchdog job that confirms each run returned success and alerts if not.
- [ ] Turn on usage/cost telemetry so agent health sits with your other monitoring.
- [ ] Add the next agent using the same brain-file pattern.
