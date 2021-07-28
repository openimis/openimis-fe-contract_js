import React, { Component } from "react";
import { withModulesManager, PublishedComponent, formatMessage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";

class ContractStatePicker extends Component {
    constructor(props) {
        super(props);
        this.activityCodeOptions = props.modulesManager.getConf("fe-contract", "contractFilter.contractStateOptions",
            [{
                "value": "1",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.requestForInformation"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.requestForInformation")
                }
            }, {
                "value": "2",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.draft"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.draft")
                }
            }, {
                "value": "3",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.offer"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.offer")
                }
            }, {
                "value": "4",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.negotiable"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.negotiable")
                }
            }, {
                "value": "5",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.executable"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.executable")
                }
            }, {
                "value": "6",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.addendum"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.addendum")
                }
            }, {
                "value": "7",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.effective"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.effective")
                }
            }, {
                "value": "8",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.executed"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.executed")
                }
            }, {
                "value": "9",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.disputed"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.disputed")
                }
            }, {
                "value": "10",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.terminated"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.terminated")
                }
            }, {
                "value": "11",
                "label": {
                    "fr": formatMessage(props.intl, "contract", "ContractStatePicker.counter"),
                    "en": formatMessage(props.intl, "contract", "ContractStatePicker.counter")
                }
            }]
        );
    }

    render() {
        return (
            <PublishedComponent
                pubRef="policyHolder.ConfigBasedPicker"
                configOptions={this.activityCodeOptions}
                {...this.props}
            />
        )
    }
}

export default withModulesManager(injectIntl(ContractStatePicker));
