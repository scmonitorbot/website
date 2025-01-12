import axios from "axios"
import BigNumber from "bignumber.js"

export class BaseExchangeService {
  /**
   * Returns the Uniswap pair data base on the the exchange data.
   *
   * @param {string} pairId Uniswap pair id- address of the `UniswapV2Pair`
   * contract.
   * @return {Object} Uniswap pair data.
   */
  getUniswapPairData = async (pairId) => {
    return await this._getUniswapPairData(pairId)
  }

  /**
   * Returns the current KEEP token price in USD based on the exchange data.
   *
   * @return {BigNumber} KEEP token price in USD.
   */
  getKeepTokenPriceInUSD = async () => {
    return await this._getKeepTokenPriceInUSD()
  }

  /**
   * Returns the current BTC price in USD based on the exchange data.
   *
   * @return {BigNumber} BTC price in USD.
   */
  getBTCPriceInUSD = async () => {
    return await this._getBTCPriceInUSD()
  }
}

export class UniswapExchangeService extends BaseExchangeService {
  UNISWAP_API_URL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"

  _getUniswapPairData = async (pairId) => {
    const response = await axios.post(this.UNISWAP_API_URL, {
      query: `query pairquery {
            pair(id: "${pairId}") {
                token0 {
                    symbol,
                    derivedETH,
                },
                token1 {
                    symbol,
                    derivedETH,
                },
                reserve0,
                reserve1,
                reserveETH,
                reserveUSD,
                token0Price,
                token1Price,
                totalSupply,
            }
        }`,
    })

    if (response.data && response.data.errors) {
      const error = new Error(
        "Failed fetching data from Uniswap V2 subgraph API."
      )
      error.errors = response.data.errors
      throw error
    }

    return response.data.data.pair
  }

  _getTokenPriceInUSD = async (address) => {
    const pairData = await this._getUniswapPairData(address)
    const ethPrice = new BigNumber(pairData.reserveUSD).div(pairData.reserveETH)

    return ethPrice.multipliedBy(pairData.token0.derivedETH)
  }

  /**
   * Returns the current KEEP token price in USD based on the KEEP/ETH Uniswap
   * v2 pool.
   *
   * @return {BigNumber} KEEP token price in USD.
   */
  _getKeepTokenPriceInUSD = async () => {
    return await this._getTokenPriceInUSD(
      "0xe6f19dab7d43317344282f803f8e8d240708174a"
    )
  }

  /**
   * Returns the current BTC price in USD based on the TBTC/ETH Uniswap v2 pool.
   *
   * @return {BigNumber} BTC price in USD.
   */
  _getBTCPriceInUSD = async () => {
    return await this._getTokenPriceInUSD(
      "0x854056fd40c1b52037166285b2e54fee774d33f6"
    )
  }
}
