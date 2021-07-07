import { Deposit } from '../generated/chainbridge/Bridge'
import { DepositNonce } from '../generated/schema'

export function handleDeposit(event: Deposit): void {
    let deposit = new DepositNonce(event.transaction.hash.toHex())
    deposit.address = event.address
    deposit.nonce = event.params.depositNonce
    deposit.transaction = event.transaction.hash
    deposit.save()
}
