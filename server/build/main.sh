#!/bin/bash

export GITURL="$GITURL"

git clone "$GITURL" /usr/app/output

exec node index.js
