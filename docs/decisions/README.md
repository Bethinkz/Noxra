# Architecture decision records

Lightweight ADRs for decisions that shaped Noxra and would be expensive to
reverse.

## What gets an ADR

A decision belongs here when it meets at least one of:

- It constrains how every future component is written.
- Reversing it would require changing many files or breaking consumers.
- It is surprising, and someone will otherwise try to "fix" it.
- It rejects an obvious alternative for a reason worth remembering.

Implementation choices do not get ADRs. Neither does anything a code comment
can carry.

## Format

Context → Decision → Consequences → Alternatives rejected. Short. An ADR that
needs a table of contents is a design doc wearing the wrong hat.

Records are immutable once merged. To change a decision, add a new record that
supersedes the old one and mark the old one superseded — the point is the trail,
not the current state.

## Index

| #                                                    | Decision                                              | Status   |
| ---------------------------------------------------- | ----------------------------------------------------- | -------- |
| [0001](0001-styling-architecture.md)                 | Global token-driven CSS, no view encapsulation        | Accepted |
| [0002](0002-entry-point-strategy.md)                 | Single entry point, structured for splitting later    | Accepted |
| [0003](0003-angular-dependency-policy.md)            | Minimal dependencies, public Angular APIs only        | Accepted |
| [0004](0004-aria-and-cdk-strategy.md)                | Platform → Angular Aria → CDK, in that order          | Accepted |
| [0005](0005-testing-strategy.md)                     | Vitest, behaviour-level tests, contract checks in CI  | Accepted |
| [0006](0006-forms-integration.md)                    | Angular forms integration via CSS, with no dependency | Accepted |
| [0007](0007-directive-first-components.md)           | Components are directives on native elements          | Accepted |
| [0008](0008-motion-packaging-and-release-cadence.md) | Motion stays in the core package, on one version      | Accepted |
