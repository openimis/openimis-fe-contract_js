import React from "react"
import messages_en from "./translations/en.json";
import messages_fr from "./translations/fr.json";
import reducer from "./reducer";
import ContractsPage from "./pages/ContractsPage";
import ContractPage from "./pages/ContractPage"
import { FormattedMessage } from "@openimis/fe-core";
import ReceiptIcon from "@material-ui/icons/Receipt";
import { RIGHT_POLICYHOLDERCONTRACT_SEARCH } from "./constants";
import { ContractDetailsTabLabel, ContractDetailsTabPanel } from "./components/ContractDetailsTab";
import {
    PolicyHolderContractsTabLabel,
    PolicyHolderContractsTabPanel
} from "./components/PolicyHolderContractsTab";
import {
    ContractContributionDetailsTabLabel,
    ContractContributionDetailsTabPanel
} from "./components/ContractContributionDetailsTab";
import { ContractPaymentsTabLabel, ContractPaymentsTabPanel } from "./components/ContractPaymentsTab";
import { ContractInsureePolicyTabLabel, ContractInsureePolicyTabPanel } from "./components/ContractInsureePolicyTab";

const ROUTE_CONTRACTS = "contracts";
const ROUTE_CONTRACT = "contracts/contract";

const DEFAULT_CONFIG = {
    "translations": [
        { key: "en", messages: messages_en },
        { key: "fr", messages: messages_fr }
    ],
    "reducers": [{ key: 'contract', reducer }],
    "refs": [
        { key: "contract.route.contracts", ref: ROUTE_CONTRACTS },
        { key: "contract.route.contract", ref: ROUTE_CONTRACT }
    ],
    "core.Router": [
        { path: ROUTE_CONTRACTS, component: ContractsPage },
        { path: ROUTE_CONTRACT  + "/:contract_id?", component: ContractPage }
    ],
    "insuree.MainMenu": [
        {
            text: <FormattedMessage module="contract" id="menu.contracts" />,
            icon: <ReceiptIcon />,
            route: "/" + ROUTE_CONTRACTS,
            filter: rights => rights.includes(RIGHT_POLICYHOLDERCONTRACT_SEARCH)
        }
    ],
    "contract.TabPanel.label": [
        ContractDetailsTabLabel,
        ContractContributionDetailsTabLabel,
        ContractPaymentsTabLabel,
        ContractInsureePolicyTabLabel,
    ],
    "contract.TabPanel.panel": [
        ContractDetailsTabPanel,
        ContractContributionDetailsTabPanel,
        ContractPaymentsTabPanel,
        ContractInsureePolicyTabPanel,
    ],
    "policyHolder.TabPanel.label": [PolicyHolderContractsTabLabel],
    "policyHolder.TabPanel.panel": [PolicyHolderContractsTabPanel]
}

export const ContractModule = (cfg) => {
    return { ...DEFAULT_CONFIG, ...cfg };
}
