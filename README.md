# Introduction

The mock ui is the frontend for the protocol server that provides UI for seller and buyer to execute the transactions.

# Repository Structure

- src/
- public/
- .env
- .env-sample-buyer
- .env-sample-seller
- .env-sample-both
- Readme

# Change Log

    This is the version 0.0.1 of the mock ui

# Contribution

Contributions can be made using the following branching structure:

```
    Branches: master -> Integ -> feat/fix/feature
```

# Dependency

- Buyer mock engine
- Protocol server

# Pre-requisite

- git
- npm

# How to run - local

- Clone the repo [https://github.com/ONDC-Official/buyer-mock-engine]

```
git clone https://github.com/ONDC-Official/buyer-mock-engine
```

- Checkout to master branch

```
git checkout master
```

- Install dependencies

```
npm i
```

- Create a .env file with the provided .env-sample file
- Run the application

```
npm start
```
