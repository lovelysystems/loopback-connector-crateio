## TESTS

TESTER = ./node_modules/.bin/mocha
OPTS = --growl
TESTS = test/crate.*.js

debug:
	$(TESTER) --debug-brk $(OPTS) $(TESTS)

test:
	$(TESTER) $(OPTS) $(TESTS)
test-verbose:
	$(TESTER) $(OPTS) --reporter spec $(TESTS)
testing:
	$(TESTER) $(OPTS) --watch $(TESTS)

.PHONY: debug test docs coverage
