import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Deposit, ProposalEvent } from '../generated/phala-chainbridge/Bridge'
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

    let contract = Erc20AssetHandler.bind(Address.fromString('0xDf2E83f33dB8A9CcF3a00FCe18C3F509b974353D'))
    let record = contract.getDepositRecord(event.params.depositNonce, event.params.destinationChainID)
    deposit.amount = record._amount
    deposit.depositor = record._depositer
    deposit.destinationRecipient = record._destinationRecipientAddress
    deposit.save()
}

export function handleProposalEvent(event: ProposalEvent): void {
    let record = new Proposal(
        // TODO: i32 to BigInt to string might be the wrong path?
        BigInt.fromI32(event.params.originChainID).toString() + '-' + event.params.depositNonce.toString()
    )

    record.depositNonce = event.params.depositNonce
    record.originChainId = event.params.originChainID
    record.resourceId = event.params.resourceID
    record.status = getProposalStatusString(event.params.status)

    if (event.params.status === ProposalStatus.Executed) {
        record.executedAt = event.transaction.hash
    }

    record.save()
}
