import 'dotenv/config';
import express from 'express'

import { main } from './main'

const app = express();

app.get('/chainId/:chainId/txHash/:txHash', async (req, res) => {
  try {
    const data = await main(req.params.txHash, req.params.chainId)
    res.send(data)
  } catch (e) {
    res.status(500)
  }
});

app.listen(process.env.PORT, () =>
  console.log(`HRTX app listening on port ${process.env.PORT}!`),
);

app.use(express.static('public'))
