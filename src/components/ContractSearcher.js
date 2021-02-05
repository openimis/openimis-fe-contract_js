import React, { Component, Fragment } from "react"
import { injectIntl } from 'react-intl';
import { withModulesManager, formatMessage, formatMessageWithValues, Searcher, formatDateFromISO,
    withTooltip, coreConfirm, journalize } from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchContracts, deleteContract } from "../actions"
import { IconButton } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, RIGHT_POLICYHOLDERCONTRACT_APPROVE,
    RIGHT_POLICYHOLDERCONTRACT_UPDATE, RIGHT_POLICYHOLDERCONTRACT_DELETE } from "../constants"
import ContractFilter from "./ContractFilter";
import ContractStatePicker from "../pickers/ContractStatePicker";

class ContractSearcher extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toDelete: null,
            deleted: []
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState(state => ({ deleted: state.deleted.concat(state.toDelete) }));
        } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        }
    }

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
        if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_DELETE)) {
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
                            onClick={e => e.stopPropagation() && onDoubleClick(contract)}
                            disabled={this.state.deleted.includes(contract.id)}>
                            <EditIcon/>
                        </IconButton>
                    </div>,
                    formatMessage(intl, "contract", "editButton.tooltip")
                )
            );
        }
        if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_DELETE)) {
            result.push(
                contract => !this.isDeletedFilterEnabled(contract) && withTooltip(
                    <div>
                        <IconButton
                            onClick={() => this.onDelete(contract)}
                            disabled={this.state.deleted.includes(contract.id)}>
                            <DeleteIcon/>
                        </IconButton>
                    </div>,
                    formatMessage(intl, "contract", "deleteButton.tooltip")
                )
            );
        }
        return result;
    }

    onDelete = contract => {
        const { intl, coreConfirm, deleteContract } = this.props;
        let confirm = () => coreConfirm(
            formatMessageWithValues(intl, "contract", "deleteContract.confirm.title", { label: contract.code }),
            formatMessageWithValues(intl, "contract", "deleteContract.confirm.message", { label: contract.code })
        );
        let confirmedAction = () => {
            deleteContract(
                contract,
                formatMessageWithValues(
                    intl,
                    "contract",
                    "DeleteContract.mutationLabel",
                    { label: contract.code }
                )
            );
            this.setState({ toDelete: contract.id });
        }
        this.setState(
            { confirmedAction },
            confirm
        )
    }

    isDeletedFilterEnabled = contract => contract.isDeleted;

    isRowDisabled = (_, contract) => this.state.deleted.includes(contract.id) && !this.isDeletedFilterEnabled(contract);

    isOnDoubleClickEnabled = contract => !this.state.deleted.includes(contract.id) && !this.isDeletedFilterEnabled(contract);

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
                    rowDisabled={this.isRowDisabled}
                    rowLocked={this.isRowDisabled}
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
    contractsTotalCount: state.contract.contractsTotalCount,
    confirmed: state.core.confirmed,
    submittingMutation: state.contract.submittingMutation,
    mutation: state.contract.mutation
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContracts, deleteContract, coreConfirm, journalize }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContractSearcher)));
