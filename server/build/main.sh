#!/bin/bash

export GITURL="$GITURL"

git clone "$GITURL" /user/app/output

exec node index.js
