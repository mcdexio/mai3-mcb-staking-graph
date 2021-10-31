import {
  Redeem as RedeemEvent,
  Stake as StakeEvent
} from "../generated/MCBStaking/MCBStaking"
import { Account } from "../generated/schema"
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let BI_18 = BigInt.fromI32(18)

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function convertToDecimal(amount: BigInt, decimals: BigInt): BigDecimal {
  if (decimals == ZERO_BI) {
    return amount.toBigDecimal()
  }
  return amount.toBigDecimal().div(exponentToBigDecimal(decimals))
}

export function fetchAccount(address: Address): Account {
  let account = Account.load(address.toHexString())
  if (account === null) {
    account = new Account(address.toHexString())
    account.balance = ZERO_BD
    account.save()
  }
  return account as Account
}


export function handleRedeem(event: RedeemEvent): void {
  let account = fetchAccount(event.params.account)
  account.balance -= convertToDecimal(event.params.redeemed, BI_18)
  account.save()
}

export function handleStake(event: StakeEvent): void {
  let account = fetchAccount(event.params.account)
  account.balance = convertToDecimal(event.params.totalStaked, BI_18)
  account.save()
}
