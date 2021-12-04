import { ethers } from 'ethers';

const cyberjsBuilder = require('@cipherdogs/cyberjs/builder');
const cyberjsCodec = require('@cipherdogs/cyberjs/codec');
const axios = require('axios');
import { getSettings } from '../services/backgroundGateway';
import { Settings } from '../backgroundServices/types';

export class CyberD {
  static async getBalance(address) {
    const settings = await getSettings([Settings.StorageCyberAddress]);
    const node = settings[Settings.StorageCyberAddress];
    return axios({
      method: 'get',
      url: `${node}/account?address="${address}"`,
    }).then(response => (response.data.result ? response.data.result.account.coins[0].amount : 0));
  }

  static async getGigaBalance(address) {
    return this.getBalance(address).then(cyb => {
      return ethers.utils.formatUnits(cyb, 9);
    });
  }

  static async getBandwidth(address) {
    const settings = await getSettings([Settings.StorageCyberAddress]);
    const node = settings[Settings.StorageCyberAddress];
    return axios({
      method: 'get',
      url: `${node}/account_bandwidth?address="${address}"`,
    }).then(response => (response.data.result ? { remained: response.data.result.remained, maxValue: response.data.result.max_value } : { error: 'unknown' }));
  }

  static async getStatus() {
    const settings = await getSettings([Settings.StorageCyberAddress]);
    const node = settings[Settings.StorageCyberAddress];
    return axios({
      method: 'get',
      url: `${node}/status`,
    }).then(response => response.data.result);
  }

  static async search(keywordHash) {
    const settings = await getSettings([Settings.StorageCyberAddress]);
    const node = settings[Settings.StorageCyberAddress];
    return axios({
      method: 'get',
      url: `${node}/search?cid=%22${keywordHash}%22&page=0&perPage=10`,
    }).then(response => (response.data.result ? response.data.result.cids : []));
  }

  static async getNetworkId() {
    return this.getStatus().then(data => data.node_info.network);
  }

  static async link(txOptions, keywordHash, contentHash) {
    const settings = await getSettings([Settings.StorageCyberAddress]);
    const node = settings[Settings.StorageCyberAddress];
    const chainId = await this.getNetworkId();
    const addressInfo = await axios({
      method: 'get',
      url: `${node}/account?address="${txOptions.address}"`,
    });

    if (!addressInfo.data.result) {
      return console.error('error: addressInfo.data.result undefined');
    }
    const account = addressInfo.data.result.account;
    if (!account) {
      return console.error('error: addressInfo.data.result.account undefined');
    }

    const acc = {
      address: account.address,
      chain_id: chainId,
      account_number: parseInt(account.account_number, 10),
      sequence: parseInt(account.sequence, 10),
    };

    const sendRequest = {
      acc,
      fromCid: keywordHash,
      toCid: contentHash,
      type: 'link',
    };

    const txRequest = cyberjsBuilder.buildAndSignTxRequest(sendRequest, txOptions.privateKey, chainId);
    const signedSendHex = cyberjsCodec.hex.stringToHex(JSON.stringify(txRequest));

    // let websocket = new WebSocket('ws://earth.cybernode.ai:34657/websocket');
    // websocket.onmessage = function(msg) {
    //   console.log('onmessage', msg);
    // };
    // websocket.send(
    //   JSON.stringify({
    //     method: 'subscribe',
    //     params: ["tm.event='NewBlockHeader'"],
    //     id: '1',
    //     jsonrpc: '2.0',
    //   })
    // );

    return axios({
      method: 'get',
      url: `${node}/submit_signed_link?data="${signedSendHex}"`,
    })
      .then(res => {
        if (!res.data) {
          throw new Error('Empty data');
        }
        if (res.data.error) {
          throw res.data.error;
        }
        return res.data;
      })
      .catch(error => {
        console.error('Link error', error);
        throw error;
      });
  }

  static async transfer(txOptions, addressTo, gAmount) {
    const settings = await getSettings([Settings.StorageCyberAddress]);
    const node = settings[Settings.StorageCyberAddress];
    const chainId = await this.getNetworkId();
    const addressInfo = await axios({
      method: 'get',
      url: `${node}/account?address="${txOptions.address}"`,
    });

    if (!addressInfo.data.result) {
      return console.error('error: addressInfo.data.result undefined');
    }
    const account = addressInfo.data.result.account;
    if (!account) {
      return console.error('error: addressInfo.data.result.account undefined');
    }

    const acc = {
      address: account.address,
      chain_id: chainId,
      account_number: parseInt(account.account_number, 10),
      sequence: parseInt(account.sequence, 10),
    };

    const amount = parseFloat(gAmount) * 10 ** 9;

    const sendRequest = {
      acc,
      amount,
      from: account.address,
      // to: cyberjsCodec.bech32.toBech32(cyberjsConstants.CyberdNetConfig.PREFIX_BECH32_ACCADDR, addressTo),
      to: addressTo,
      type: 'send',
    };

    const txRequest = cyberjsBuilder.buildAndSignTxRequest(sendRequest, txOptions.privateKey, chainId);
    const signedSendHex = cyberjsCodec.hex.stringToHex(JSON.stringify(txRequest));

    return axios({
      method: 'get',
      url: `${node}/submit_signed_send?data="${signedSendHex}"`,
    })
      .then(res => {
        if (!res.data) {
          throw new Error('Empty data');
        }
        if (res.data.error) {
          throw res.data.error;
        }
        return res.data;
      })
      .catch(error => {
        console.error('Transfer error', error);
        throw error;
      });
  }
}
