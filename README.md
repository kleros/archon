# Archon

> Archon provides functionality for Arbitrator and Arbitrable Ethereum smart contracts as defined in ERC 792 and ERC 1497.

## Documentation

See full documentation at https://archon.readthedocs.io/en/latest/index.html

## Installation

```
npm install @kleros/archon
```

## Basic Usage

```
var Archon = require('@kleros/archon');

var archon = new Archon('wss://some.local-or-remote.node:8546');

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

## Update Docs

The documentation is based on Sphinx. Install Sphinx with your global python or in a virtualenv
```
pip install sphinx
```


1) Update `.rst` files in /docs


2) Run to generate new docs bundle
```
cd docs && make html
```

3) View changes
```
open ./docs/_build/html/index.html
```

4) Push changes
