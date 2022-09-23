# HRTX

This repo contains the PoC of the API for generating Human readable descriptions for provided transaction data.

[_ethBerlin Hackaton winner of the Even the Odds track_](https://devfolio.co/projects/hrtx-9ae6)

## Goal

The idea is to make blockchain accessible for everyone. You don't need to understand coding or math, to be able to interact with blockchain Dapps and to know what logic is running underneath. Even on a new Smart contracts, that don't have a propper documentation yet, you should be able to understand a high-level concept of what the code is about to do.

## How

With the help of GPT-3 models and our owns in the future, we are capable of translating and summarizing the programming code into human's text. By parsing transaction data, we are able to know what interaction with the SC is going to happen, and, when the AI can describe us the programming code, we can describe the user what will happen (or happend) on the onchain layer.

## Use cases

There could be plenty of different use-cases for the such API, for example:

- The extension in the browser (or a module in the crypto wallet) that informs the user about the transaction they are about to execute
- Generation of the docs and descriptions in your Dapp
- SCAM check
- Learning tool for Smart Contracts

## Try this PoC yourself

set the `.env` file by `.env.example` and then run:

```shell
  npm i
  ts-node index.ts
```

The endpoint is:

- GET `/chainId/:chainId/txHash/:txHash`

and on the output you will get the descriptions of the SC method you are executing in txHash

---

To try this PoC API with some demo frontend, you can open `localhost:{port}/index.html`

## Contacts

For now, I am working on this myself, so if you would like to connect and discuss how we can collaborate, i would happy to hear you 🌞 

- _Telegram_: [@evzhen](https://t.me/evzhen)
- _Twitter_: [@evzhen_n](https://twitter.com/evzhen_n)
