import {
  Redeem as RedeemEvent,
  Stake as StakeEvent
} from "../generated/MCBStaking/MCBStaking"
import { User } from "../generated/schema"
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

export function fetchUser(address: Address): User {
  let user = User.load(address.toHexString())
  if (user === null) {
    user = new User(address.toHexString())
    user.balance = ZERO_BD
    user.save()
  }
  return user as User
}


export function handleRedeem(event: RedeemEvent): void {
  let user = fetchUser(event.params.account)
  user.balance -= convertToDecimal(event.params.redeemed, BI_18)
  user.save()
}

export function handleStake(event: StakeEvent): void {
  let user = fetchUser(event.params.account)
  user.balance = convertToDecimal(event.params.totalStaked, BI_18)
  user.save()
}
