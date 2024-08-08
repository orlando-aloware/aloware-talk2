## :ticket: Jira Ticket
[ticket | (description)](url)

## :heavy_equals_sign: Counterpart

[Talk PR](url)

## :package: Packages
- Updated package A
- Added package B

## :lady_beetle: Sentry Issues Fixed
1. Sentry error #1
   https://sentry.io/organizations/aloware/issues/2442400041/?project=282209&query=is%3Aunresolved&sort=date&statsPeriod=14d
2. Sentry error #2
   https://sentry.io/organizations/aloware/issues/2222104379/?project=282209&query=is%3Aunresolved&sort=freq&statsPeriod=14d

## :memo:  Changes
**Change 1:**
- What has changed?

Add links and screenshots here

<hr>

**Change 2:**
- What has changed?

Add links and screenshots here

## :white_check_mark: Pull Request Review Checklist

- [ ] Variables have been given sensible, meaningful names. Try to check if full variable names are used instead of short forms.
- [ ] Code is DRY (Don't Repeat Yourself). (But make sure where this is applied, the two things are actually the same!)
- [ ] No values have been hard-coded where they should be drawn from constant files (frontend) or Models (backend).
- [ ] Comments are present where appropriate and provide useful information, not just stating what the code is obviously doing.
- [ ] Error handling is performed appropriately where things might fail.
- [ ] If component modifications are present, check all the instances that this component is used and make sure everything looks good and works as expected.
- [ ] If a generally used method is changed, check and make sure it doesn't break other apps and clients.
- [ ] Don't assume the code works - ask for a demo and test it yourself!
