#!/bin/bash

export gitUrl=${gitUrl}

git clone $gitUrl /user/app/output

exec node index.js
