SRC=./test/*.js

ISTANBUL=./node_modules/.bin/istanbul
_MOCHA=./node_modules/.bin/_mocha
MOCHA=./node_modules/.bin/mocha

test:
		@NODE_ENV=test \
		$(MOCHA) $(SRC)
cover:
		@NODE_ENV=test \
		$(ISTANBUL) cover \
		$(_MOCHA) $(SRC)

.PHONY:test cover
