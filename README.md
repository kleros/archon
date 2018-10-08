# Archon

<p align="center">
  <a href="https://badge.fury.io/js/eth-archon"><img src="https://badge.fury.io/js/eth-archon.svg" alt="NPM Version"></a>
  <a href="https://travis-ci.org/kleros/eth-archon"><img src="https://travis-ci.org/kleros/eth-archon.svg?branch=master" alt="Build Status"></a>
  <a href="https://david-dm.org/kleros/eth-archon"><img src="https://david-dm.org/kleros/eth-archon.svg" alt="Dependencies"></a>
  <a href="https://david-dm.org/kleros/eth-archon?type=dev"><img src="https://david-dm.org/kleros/eth-archon/dev-status.svg" alt="Dev Dependencies"></a>
  <a href="https://github.com/facebook/jest"><img src="https://img.shields.io/badge/tested_with-jest-99424f.svg" alt="Tested with Jest"></a>
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="JavaScript Style Guide"></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with Prettier"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly"></a>
</p>

> Archon provides functionality for Arbitrator and Arbitrable Ethereum smart contracts as defined in ERC 792.


## Documentation

See full documentation at https://archon.readthedocs.io/en/latest/index.html

## Installation

```
npm install eth-archon
```

## Basic Usage

```
var Archon = require('eth-archon');

var archon = new Archon('ws://some.local-or-remote.node:8546');

> archon.arbitrator
> archon.arbitrable
> archon.utils
> archon.version
```

## Test

```sh
yarn ganache
yarn test
```

## Build

```sh
yarn run build
```
