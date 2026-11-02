---
name: test-driven-development
description: Implement and change software behavior using Kent Beck’s Canon TDD workflow. Language and framework agnostic.
---

# Test-Driven Development

Use small, test-driven steps to build confidence in behavior and design. Take responsibility for quality; following a process alone does not establish correctness.

## Workflow

### 1. List scenarios

Before coding, list expected behavioral variants and existing behavior that must remain intact. Keep implementation decisions out of this analysis.

Maintain this list as you learn.

### 2. Write one test

Turn exactly one scenario into an automated test with setup, invocation, and meaningful assertions.

Use this step to design how the behavior is invoked. Defer internal design decisions.

Do not turn the whole list into executable tests upfront.

### 3. Make it pass

Observe the expected failure, then change production code until the new test and previous tests pass.

Keep refactoring separate. Add newly discovered scenarios to the list rather than implementing them immediately. Mark the completed scenario off.

Never remove valid assertions or copy computed output into expectations merely to obtain green.

### 4. Optionally refactor

While tests pass, improve implementation design where useful for the current work.

Avoid premature abstraction. Duplication provides evidence, not an automatic instruction to extract.

### 5. Repeat

Choose another scenario and repeat until the list is empty.

## Practical guidance

- Inspect existing code, conventions, and test commands first.
- Choose concrete examples with independently reasoned expectations.
- Test observable outcomes through stable boundaries.
- Prefer deterministic tests and the fastest meaningful feedback loop.
- For regressions, first reproduce the defect in a failing test.
- Adjust step size to uncertainty.
- Use a specific implementation, a straightforward general solution,
  or additional contrasting examples according to your confidence.
- Treat difficult test setup as a reason to examine responsibilities
  and dependencies.
- If a test passes immediately, investigate whether the behavior already
  exists or the test misses its intended target.

## Completion and reporting

Verify the requested behavior and relevant regression checks.

Report what changed, which checks ran, and any unresolved limitations.
If execution was unavailable, explicitly state that the red–green cycle
was not verified.

Supplementary testing advice here supports the workflow; it does not
mandate a language, framework, test-double strategy, or coverage target.
