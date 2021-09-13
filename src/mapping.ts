import { Bridge, Deposit, ProposalEvent } from '../generated/phala-chainbridge/Bridge'
import { Erc20AssetHandler } from '../generated/phala-chainbridge/Erc20AssetHandler'
import { DepositRecord, ProposalExecuted, ProposalPassed } from '../generated/schema'

enum ProposalStatus {
    Inactive,
    Active,
    Passed,
    Executed,
    Cancelled,
}

export function handleDepositEvent(event: Deposit): void {
    let deposit = new DepositRecord(event.transaction.hash.toHex() + '-' + event.transactionLogIndex.toString())
    deposit.destinationChainId = event.params.destinationChainID
    deposit.nonce = event.params.depositNonce
    deposit.resourceId = event.params.resourceID
    deposit.transaction = event.transaction.hash
    deposit.save()

    let bridge = Bridge.bind(event.address)
    let handlerAddress = bridge._resourceIDToHandlerAddress(event.params.resourceID)
    let handler = Erc20AssetHandler.bind(handlerAddress)

    let record = handler.getDepositRecord(event.params.depositNonce, event.params.destinationChainID)
    deposit.amount = record._amount
    deposit.depositor = record._depositer
    deposit.destinationRecipient = record._destinationRecipientAddress
    deposit.save()
}

export function handleProposalEvent(event: ProposalEvent): void {
    let depositNonce = event.params.depositNonce
    let originChainId = event.params.originChainID
    let resourceId = event.params.resourceID

    if (event.params.status === ProposalStatus.Executed) {
        let record = new ProposalExecuted(originChainId.toString() + '-' + depositNonce.toString())
        record.depositNonce = depositNonce
        record.executedAt = event.transaction.hash
        record.originChainId = originChainId
        record.resourceId = resourceId
        record.save()
    }

    if (event.params.status === ProposalStatus.Passed) {
        let record = new ProposalPassed(originChainId.toString() + '-' + depositNonce.toString())
        record.depositNonce = depositNonce
        record.originChainId = originChainId
        record.resourceId = resourceId
        record.save()
    }
}
