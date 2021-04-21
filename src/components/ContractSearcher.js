import React, { Component, Fragment } from "react"
import { injectIntl } from 'react-intl';
import {
    withModulesManager,
    formatMessage,
    formatMessageWithValues,
    Searcher,
    formatDateFromISO,
    withTooltip,
    coreConfirm,
    journalize,
    decodeId
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
    fetchContracts,
    fetchContractsForBulkActions,
    deleteContract,
    approveContractBulk,
    counterContractBulk
} from "../actions";
import { IconButton } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    DEFAULT_PAGE_SIZE,
    ROWS_PER_PAGE_OPTIONS,
    RIGHT_POLICYHOLDERCONTRACT_APPROVE,
    RIGHT_POLICYHOLDERCONTRACT_UPDATE,
    RIGHT_POLICYHOLDERCONTRACT_DELETE,
    APPROVABLE_STATES,
    RIGHT_PORTALPOLICYHOLDERCONTRACT_UPDATE,
    RIGHT_PORTALPOLICYHOLDERCONTRACT_SUBMIT,
    RIGHT_PORTALPOLICYHOLDERCONTRACT_AMEND
} from "../constants";
import ContractFilter from "./ContractFilter";
import ContractStatePicker from "../pickers/ContractStatePicker";

class ContractSearcher extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toDelete: null,
            deleted: [],
            queryParams: null,
            pageQueryParams: null,
            reset: 0
        }
        this.approvableStates = props.modulesManager.getConf("fe-contract", "contractForm.approvable", APPROVABLE_STATES);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState(state => ({ deleted: state.deleted.concat(state.toDelete), reset: state.reset + 1 }));
        } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        } else if (prevState.reset !== this.state.reset) {
            this.refetch();
            this.props.fetchContractsForBulkActions(this.state.queryParams)
        } else if (prevState.queryParams !== this.state.queryParams) {
            this.props.fetchContractsForBulkActions(this.state.queryParams)
        }
    }

    fetch = params => this.props.fetchContracts(this.props.modulesManager, params);

    refetch = () => this.fetch(this.state.pageQueryParams);

    filtersToQueryParams = state => {
        const params = Object.keys(state.filters)
            .filter(f => !!state.filters[f]['filter'])
            .map(f => state.filters[f]['filter']);
        const queryParams = [...params];
        params.push(`first: ${state.pageSize}`);
        if (!!state.afterCursor) {
            params.push(`after: "${state.afterCursor}"`);
        }
        if (!!state.beforeCursor) {
            params.push(`before: "${state.beforeCursor}"`);
        }
        if (!!state.orderBy) {
            params.push(`orderBy: ["${state.orderBy}"]`);
        }
        this.setState({ queryParams, pageQueryParams: params });
        return params;
    }

    headers = () => {
        const { rights } = this.props;
        const result = [
            "contract.code",
            "contract.state",
            "contract.amount",
            "contract.datePaymentDue",
            "contract.dateValidFrom",
            "contract.dateValidTo",
            "contract.amendment"
        ];
        if (
            [
                RIGHT_POLICYHOLDERCONTRACT_UPDATE,
                RIGHT_POLICYHOLDERCONTRACT_APPROVE,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_UPDATE,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_SUBMIT,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_AMEND
            ].some(right => rights.includes(right))
        ) {
            result.push("contract.emptyLabel");
        }
        if (rights.includes(RIGHT_POLICYHOLDERCONTRACT_DELETE)) {
            result.push("contract.emptyLabel");
        }
        return result;
    }

    itemFormatters = () => {
        const { intl, modulesManager, rights, contractUpdatePageUrl } = this.props;
        const result = [
            contract => !!contract.code ? contract.code : "",
            contract => !!contract.state
                ? <ContractStatePicker
                    module="contract"
                    withLabel={false}
                    value={contract.state}
                    readOnly />
                : "",
            contract => !!contract.amount ? contract.amount : "",
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
        if (
            [
                RIGHT_POLICYHOLDERCONTRACT_UPDATE,
                RIGHT_POLICYHOLDERCONTRACT_APPROVE,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_UPDATE,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_SUBMIT,
                RIGHT_PORTALPOLICYHOLDERCONTRACT_AMEND
            ].some(right => rights.includes(right))
        ) {
            result.push(
                contract => !this.isDeletedFilterEnabled(contract) && withTooltip(
                    <div>
                        <IconButton
                            href={contractUpdatePageUrl(contract)}
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
        const confirm = () => coreConfirm(
            formatMessageWithValues(intl, "contract", "deleteContract.confirm.title", { label: contract.code }),
            formatMessage(intl, "contract", "deleteContract.confirm.message")
        );
        const confirmedAction = () => {
            deleteContract(
                contract,
                formatMessageWithValues(intl, "contract", "DeleteContract.mutationLabel", { label: contract.code })
            );
            this.setState({ toDelete: contract.id });
        }
        this.setState({ confirmedAction }, confirm);
    }

    isDeletedFilterEnabled = contract => contract.isDeleted;

    isRowDisabled = (_, contract) => this.state.deleted.includes(contract.id) && !this.isDeletedFilterEnabled(contract);

    isOnDoubleClickEnabled = contract => !this.state.deleted.includes(contract.id) && !this.isDeletedFilterEnabled(contract);

    rowIdentifier = contract => contract.id;

    isBulkActionOnSelectedEnabled = selection => !!selection && selection.length > 0
        && !!selection.filter(contract => this.approvableStates.includes(contract.state)).length;

    isBulkActionOnAllEnabled = selection => !!selection && selection.length === 0
        && !!this.props.contractsBulk.filter(contract => this.approvableStates.includes(contract.state)).length;

    approveBulk = selection => this.bulkAction(selection, this.props.approveContractBulk, "approveContractBulk");

    counterBulk = selection => this.bulkAction(selection, this.props.counterContractBulk, "counterContractBulk");

    bulkAction = (selection, action, label) => {
        const { intl, contractsBulk, coreConfirm } = this.props;
        const contracts = selection.length > 0 ? selection : contractsBulk;
        const approvableContracts = contracts.filter(contract => this.approvableStates.includes(contract.state));
        if (approvableContracts.length > 0) {
            const confirm = () => coreConfirm(
                formatMessage(intl, "contract", `${label}.confirm.title`),
                contracts.length !== approvableContracts.length
                    ? formatMessageWithValues(
                        intl,
                        "contract",
                        `${label}.confirm.message.unapprovableNotEmpty`,
                        { approvableContracts: approvableContracts.length, contracts: contracts.length }
                    ) : formatMessageWithValues(
                        intl,
                        "contract",
                        `${label}.confirm.message.unapprovableEmpty`, { contracts: approvableContracts.length }
                    )
            );
            const confirmedAction = () => action(
                approvableContracts,
                formatMessageWithValues(intl, "contract", `${label}.mutationLabel`, { count: approvableContracts.length }),
                approvableContracts.map(contract => contract.code)
            );
            this.setState({ confirmedAction }, confirm);
        }
    }

    actions = () => this.props.rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)
        ? [
            { label: "contract.approveSelected", enabled: this.isBulkActionOnSelectedEnabled, action: this.approveBulk },
            { label: "contract.approveAll", enabled: this.isBulkActionOnAllEnabled, action: this.approveBulk },
            { label: "contract.counterSelected", enabled: this.isBulkActionOnSelectedEnabled, action: this.counterBulk },
            { label: "contract.counterAll", enabled: this.isBulkActionOnAllEnabled, action: this.counterBulk }
        ] : [];

    sorts = () => [
        ['code', true],
        ['state', true],
        ['amount', true],
        ['datePaymentDue', true],
        ['dateValidFrom', true],
        ['dateValidTo', true],
        ['amendment', true]
    ];

    defaultFilters = () => {
        const filters = {
            isDeleted: {
                value: false,
                filter: "isDeleted: false"
            },
            applyDefaultValidityFilter: {
                value: true,
                filter: "applyDefaultValidityFilter: true"
            }
        };
        if (!!this.props.policyHolder) {
            filters.policyHolder_Id = {
                value: decodeId(this.props.policyHolder.id),
                filter: `policyHolder_Id: "${decodeId(this.props.policyHolder.id)}"`
            }
        }
        return filters;
    };

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
                    withSelection={!!this.props.policyHolder ? null : "multiple"}
                    rowIdentifier={this.rowIdentifier}
                    selectionMessage="contract.contracts.selection.count"
                    actions={this.actions()}
                    defaultFilters={this.defaultFilters()}
                    FilterExt={this.props.policyHolder}
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
    mutation: state.contract.mutation,
    contractsBulk: state.contract.contractsBulk
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContracts, fetchContractsForBulkActions, deleteContract, approveContractBulk,
        counterContractBulk, coreConfirm, journalize }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContractSearcher)));
