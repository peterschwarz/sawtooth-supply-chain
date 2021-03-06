/**
 * Copyright 2017 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ----------------------------------------------------------------------------
 */
'use strict'

const { signer, BatchEncoder } = require('sawtooth-sdk')
const { TransactionHeader, TransactionList } = require('sawtooth-sdk/protobuf')
const { BadRequest } = require('../api/errors')
const config = require('../system/config')

const PRIVATE_KEY = config.PRIVATE_KEY

const batcher = new BatchEncoder(PRIVATE_KEY)
const publicKey = signer.getPublicKey(PRIVATE_KEY)
console.log(`Batch signer initialized with the public key "${publicKey}"`)

const getPublicKey = () => publicKey

const batch = txnList => {
  const txns = TransactionList.decode(txnList).transactions
  const headers = txns.map(txn => TransactionHeader.decode(txn.header))

  headers.forEach(header => {
    if (header.batcherPubkey !== publicKey) {
      throw new BadRequest(`Transactions must use batcherPubkey: ${publicKey}`)
    }
  })

  return batcher.create(txns)
}

module.exports = {
  getPublicKey,
  batch
}
