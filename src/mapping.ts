import { Bridge, Deposit, ProposalEvent } from '../generated/phala-chainbridge/Bridge'
import { Erc20AssetHandler } from '../generated/phala-chainbridge/Erc20AssetHandler'
import { DepositRecord, Proposal } from '../generated/schema'

enum ProposalStatus {
    Inactive,
    Active,
    Passed,
    Executed,
    Cancelled,
}

function getProposalStatusString(status: ProposalStatus): string {
    switch (status) {
        case ProposalStatus.Active:
            return 'Active'
        case ProposalStatus.Cancelled:
            return 'Cancelled'
        case ProposalStatus.Executed:
            return 'Executed'
        case ProposalStatus.Inactive:
            return 'Inactive'
        case ProposalStatus.Passed:
            return 'Passed'
        default:
            return 'Inactive'
    }
}

export function handleDepositEvent(event: Deposit): void {
    let deposit = new DepositRecord(event.transaction.hash.toHex() + '-' + event.transactionLogIndex.toString())
    deposit.destinationChainId = event.params.destinationChainID
    deposit.nonce = event.params.depositNonce
    deposit.resourceId = event.params.resourceID
    deposit.transaction = event.transaction.hash
    deposit.save()

    let bridge = Bridge.bind(event.address)
    let handlerAddress = bridge.try__resourceIDToHandlerAddress(event.params.resourceID)

    if (handlerAddress.reverted) {
        return
    }

    let handler = Erc20AssetHandler.bind(handlerAddress.value)
    let record = handler.getDepositRecord(event.params.depositNonce, event.params.destinationChainID)
    deposit.amount = record._amount
    deposit.depositor = record._depositer
    deposit.destinationRecipient = record._destinationRecipientAddress
    deposit.save()
}

export function handleProposalEvent(event: ProposalEvent): void {
    let originChainId = event.params.originChainID
    let record = new Proposal(originChainId.toString() + '-' + event.params.depositNonce.toString())

    record.depositNonce = event.params.depositNonce
    record.originChainId = event.params.originChainID
    record.resourceId = event.params.resourceID
    record.status = getProposalStatusString(event.params.status)

    if (event.params.status === ProposalStatus.Executed) {
        record.executedAt = event.transaction.hash
    }

    record.save()
}
