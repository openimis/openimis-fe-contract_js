import React, { Component, Fragment } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessageWithValues, Searcher, formatDateFromISO } from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchContracts } from "../actions"
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from "../constants"
import ContractFilter from "./ContractFilter";
import ContractStatePicker from "../pickers/ContractStatePicker";

class ContractSearcher extends Component {
    fetch = params => this.props.fetchContracts(this.props.modulesManager, params);

    filtersToQueryParams = state => {
        let params = Object.keys(state.filters)
            .filter(f => !!state.filters[f]['filter'])
            .map(f => state.filters[f]['filter']);
        params.push(`first: ${state.pageSize}`);
        if (!state.filters.hasOwnProperty('isDeleted')) {
            params.push("isDeleted: false");
        }
        if (!!state.afterCursor) {
            params.push(`after: "${state.afterCursor}"`);
        }
        if (!!state.beforeCursor) {
            params.push(`before: "${state.beforeCursor}"`);
        }
        if (!!state.orderBy) {
            params.push(`orderBy: ["${state.orderBy}"]`);
        }
        return params;
    }

    headers = () => [
        "contract.code",
        "contract.state",
        "contract.amount",
        "contract.datePaymentDue",
        "contract.dateValidFrom",
        "contract.dateValidTo",
        "contract.amendment"
    ]

    itemFormatters = () => {
        const { intl, modulesManager } = this.props;
        let result = [
            contract => !!contract.code ? contract.code : "",
            contract => !!contract.state
                ? <ContractStatePicker
                    module="contract"
                    label="state"
                    value={contract.state}
                    readOnly />
                : "",
            contract => contract.amountDue !== null
                ? contract.amountDue
                : contract.amountRectified !== null
                    ? contract.amountRectified
                    : contract.amountNotified !== null
                        ? contract.amountNotified
                        : "",
            contract => !!contract.datePaymentDue
                ? formatDateFromISO(modulesManager, intl, contract.datePaymentDue)
                : "",
            contract => !!contract.dateValidFrom
                ? formatDateFromISO(modulesManager, intl, contract.dateValidFrom)
                : "",
            contract => !!contract.dateValidTo
                ? formatDateFromISO(modulesManager, intl, contract.dateValidTo)
                : "",
            contract => contract.amendment !== null ? contract.amendment : "",
        ];
        return result;
    }

    sorts = () => [
        ['code', true],
        ['state', true],
        null,
        ['datePaymentDue', true],
        ['dateValidFrom', true],
        ['dateValidTo', true],
        ['amendment', true],
    ];

    render() {
        const { intl, fetchingContracts, fetchedContracts, errorContracts, contracts, contractsPageInfo, contractsTotalCount } = this.props;
        return (
            <Fragment>
                <Searcher
                    module="contact"
                    FilterPane={ContractFilter}
                    fetch={this.fetch}
                    items={contracts}
                    itemsPageInfo={contractsPageInfo}
                    fetchingItems={fetchingContracts}
                    fetchedItems={fetchedContracts}
                    errorItems={errorContracts}
                    tableTitle={formatMessageWithValues(intl, "contract", "contracts.searcher.results.title", { contractsTotalCount })}
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    filtersToQueryParams={this.filtersToQueryParams}
                    sorts={this.sorts}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    defaultPageSize={DEFAULT_PAGE_SIZE}
                    defaultOrderBy="code"
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    fetchingContracts: state.contract.fetchingContracts,
    fetchedContracts: state.contract.fetchedContracts,
    errorContracts: state.contract.errorContracts,
    contracts: state.contract.contracts,
    contractsPageInfo: state.contract.contractsPageInfo,
    contractsTotalCount: state.contract.contractsTotalCount
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContracts }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContractSearcher)));
