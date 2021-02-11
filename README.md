# openIMIS Frontend Contract module
This repository holds the files of the openIMIS Frontend Contract reference module.
It is dedicated to be deployed as a module of [openimis-fe_js](https://github.com/openimis/openimis-fe_js).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## Main Menu Contributions
None

## Other Contributions
* `core.Router`: registering `contracts`, `contracts/contract` route in openIMIS client-side router
* `insuree.MainMenu`:
    
    **Contracts** (`menu.contracts` translation key)

## Available Contribution Points
* `contract.TabPanel.label` ability to extend Contract tab panel with a label
* `contract.TabPanel.panel` ability to extend Contract tab panel with a panel displayed on click on an appropriate label

## Published Components
None

## Dispatched Redux Actions
* `CONTRACT_CONTRACTS_{REQ|RESP|ERR}`, fetching Contracts (as triggered by the searcher)
* `CONTRACT_CONTRACT_{REQ|RESP|ERR}`, fetching Contract
* `CONTRACT_CONTRACTDETAILS_{REQ|RESP|ERR}`, fetching Contract Details (as triggered by the searcher)
* `CONTRACT_MUTATION_{REQ|ERR}`, sending a mutation
* `CONTRACT_CREATE_CONTRACT_RESP`, receiving a result of create Contract mutation
* `CONTRACT_UPDATE_CONTRACT_RESP`, receiving a result of update Contract mutation
* `CONTRACT_DELETE_CONTRACT_RESP`, receiving a result of delete Contract mutation
* `CONTRACT_CREATE_CONTRACTDETAILS_RESP`, receiving a result of create Contract Details mutation
* `CONTRACT_UPDATE_CONTRACTDETAILS_RESP`, receiving a result of update Contract Details mutation

## Other Modules Listened Redux Actions
None

## Other Modules Redux State Bindings
* `state.core.user`, to access user info (rights,...)
* `state.policyHolder`, retrieving Policy Holder to fetch corresponding Policy Holder Contribution Plan Bundles and Policy Holder Insurees

## Configurations Options
* `contractFilter.contractStateOptions`: options for ContractStatePicker component (Default:
    ```json
    [{
        "value": "1",
        "label": {
            "fr": "Demande d'information",
            "en": "Request for information"
        }
    }, {
        "value": "2",
        "label": {
            "fr": "Brouillon",
            "en": "Draft"
        }
    }, {
        "value": "3",
        "label": {
            "fr": "Offre",
            "en": "Offer"
        }
    }, {
        "value": "4",
        "label": {
            "fr": "En negociation",
            "en": "Negotiable"
        }
    }, {
        "value": "5",
        "label": {
            "fr": "Apprové",
            "en": "Executable"
        }
    }, {
        "value": "6",
        "label": {
            "fr": "Addendum",
            "en": "Addendum"
        }
    }, {
        "value": "7",
        "label": {
            "fr": "En cours",
            "en": "Effective"
        }
    }, {
        "value": "8",
        "label": {
            "fr": "Appliqué",
            "en": "Executed"
        }
    }, {
        "value": "9",
        "label": {
            "fr": "Suspendu",
            "en": "Disputed"
        }
    }, {
        "value": "10",
        "label": {
            "fr": "Terminé",
            "en": "Terminated"
        }
    }, {
        "value": "11",
        "label": {
            "fr": "Révision demandé",
            "en": "Counter"
        }
    }]
    ```
)
