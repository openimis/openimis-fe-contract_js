import React, { Component } from "react";
import { PublishedComponent, decodeId } from "@openimis/fe-core";
import { RIGHT_PAYMENT_SEARCH, RIGHT_PORTALPAYMENT_SEARCH } from "../constants"

class ContractPaymentsTabLabel extends Component {
    render() {
        return (
            [RIGHT_PAYMENT_SEARCH, RIGHT_PORTALPAYMENT_SEARCH].some((right) => this.props.rights.includes(right)) && (
                <PublishedComponent
                    pubRef="payment.PaymentsTab.label"
                    {...this.props}
                />
            )
        );
    }
}

class ContractPaymentsTabPanel extends Component {
    additionalFilter = () => {
        const filter = {
            contract: decodeId(this.props.contract.id)
        };
        return JSON.stringify(filter);
    }

    render() {
        return (
            [RIGHT_PAYMENT_SEARCH, RIGHT_PORTALPAYMENT_SEARCH].some((right) => this.props.rights.includes(right)) &&
            !!this.props.contract.id && (
                <PublishedComponent
                    pubRef="payment.PaymentsTab.panel"
                    additionalFilter={this.additionalFilter()}
                    {...this.props}
                />
            )
        );
    }
}

export {
    ContractPaymentsTabLabel,
    ContractPaymentsTabPanel
}
