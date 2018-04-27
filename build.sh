#!/bin/bash

cd "$(dirname "$0")"
rm -fr build
mkdir build

cp README.md build/

cd server
yarn
cp -r . ../build/

cd ../client
yarn
yarn build

cp -r build ../build/src/public
