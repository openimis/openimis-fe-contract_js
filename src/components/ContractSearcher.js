import React, { Component, Fragment } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessage, formatMessageWithValues, Searcher, formatDateFromISO, withTooltip } from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchContracts } from "../actions"
import { IconButton } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import { DEFAULT_PAGE_SIZE, RIGHT_POLICYHOLDERCONTRACT_APPROVE, RIGHT_POLICYHOLDERCONTRACT_UPDATE, ROWS_PER_PAGE_OPTIONS } from "../constants"
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

    headers = () => {
        const { rights } = this.props;
        let result = [
            "contract.code",
            "contract.state",
            "contract.amount",
            "contract.datePaymentDue",
            "contract.dateValidFrom",
            "contract.dateValidTo",
            "contract.amendment"
        ];
        if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) {
            result.push("contract.emptyLabel");
        }
        return result;
    }

    itemFormatters = () => {
        const { intl, modulesManager, rights, contractPageLink } = this.props;
        let result = [
            contract => !!contract.code ? contract.code : "",
            contract => !!contract.state
                ? <ContractStatePicker
                    module="contract"
                    withLabel={false}
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
        if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) || rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)) {
            result.push(
                contract => !this.isDeletedFilterEnabled(contract) && withTooltip(
                    <div>
                        <IconButton
                            href={contractPageLink(contract)}
                            onClick={e => e.stopPropagation() && onDoubleClick(contract)}>
                            <EditIcon />
                        </IconButton>
                    </div>,
                    formatMessage(intl, "contract", "editButton.tooltip")
                )
            );
        }
        return result;
    }

    isDeletedFilterEnabled = contract => contract.isDeleted;

    isOnDoubleClickEnabled = contract => !this.isDeletedFilterEnabled(contract);

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
        const { intl, fetchingContracts, fetchedContracts, errorContracts, contracts,
            contractsPageInfo, contractsTotalCount, onDoubleClick } = this.props;
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
                    onDoubleClick={contract => this.isOnDoubleClickEnabled(contract) && onDoubleClick(contract)}
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
