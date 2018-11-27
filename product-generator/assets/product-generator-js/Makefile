.DEFAULT_GOAL = help

.PHONY: lint test compile clean

bin        := $(shell npm bin)
babel      := $(bin)/babel
eslint     := $(bin)/eslint
mocha      := $(bin)/mocha

help:
	@echo ""
	@echo "AVAILABLE TASKS"
	@echo ""
	@echo "  compile ................ Compiles the project."
	@echo "  clean .................. Removes build artifacts."
	@echo "  test ................... Runs the tests for the project."
	@echo "  lint ................... Lints all source files."
	@echo ""

lint:
	$(eslint) $(SRC_DIRS)

test: compile
	./bin/test.sh

compile:
	$(bin)/cross-env BABEL_ENV=commonjs $(babel) src --out-dir dist

browserify: compile
	$(bin)/browserify dist/main.js -o bundle.js

clean:
	rm -r -f dist