import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import {
    withModulesManager,
    formatMessage,
    formatMessageWithValues,
    Searcher,
    PublishedComponent,
    decodeId,
    withTooltip,
    coreConfirm,
    Contributions
} from "@openimis/fe-core";
import { fetchContractDetails, deleteContractDetails } from "../actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import {
    DEFAULT_PAGE_SIZE,
    ROWS_PER_PAGE_OPTIONS,
    CONTRACTDETAILS_CALCULATION_CONTRIBUTION_KEY,
    CONTRACTDETAILS_CLASSNAME,
    RIGHT_POLICYHOLDERCONTRACT_UPDATE,
    RIGHT_POLICYHOLDERCONTRACT_APPROVE,
    RIGHT_PORTALPOLICYHOLDERCONTRACT_UPDATE,
    RIGHT_PORTALPOLICYHOLDERCONTRACT_SUBMIT,
    RIGHT_PORTALPOLICYHOLDERCONTRACT_AMEND
} from "../constants";
import ContractDetailsFilter from "../components/ContractDetailsFilter";
import UpdateContractDetailsDialog from "../dialogs/UpdateContractDetailsDialog";

const DEFAULT_ORDER_BY = "insuree";

class ContractDetailsSearcher extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toDelete: null,
            deleted: [],
            queryParams: null
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.toDelete !== this.state.toDelete) {
            this.setState(state => ({ deleted: state.deleted.concat(state.toDelete) }));
        } else if (prevState.deleted !== this.state.deleted || prevProps.reset !== this.props.reset) {
            this.refetch();
        }
    }

    fetch = params => this.props.fetchContractDetails(this.props.modulesManager, params);

    refetch = () => this.fetch(this.state.queryParams);

    filtersToQueryParams = state => {
        let params = Object.keys(state.filters)
            .filter(f => !!state.filters[f]['filter'])
            .map(f => state.filters[f]['filter']);
        if (!state.beforeCursor && !state.afterCursor) {
        params.push(`first: ${state.pageSize}`);
        }
        if (!state.filters.hasOwnProperty('isDeleted')) {
            params.push("isDeleted: false");
        }
        if (!!state.afterCursor) {
            params.push(`after: "${state.afterCursor}"`);
            params.push(`first: ${state.pageSize}`);
        }
        if (!!state.beforeCursor) {
            params.push(`before: "${state.beforeCursor}"`);
            params.push(`last: ${state.pageSize}`);
        }
        if (!!state.orderBy) {
            params.push(`orderBy: ["${state.orderBy}"]`);
        }
        this.setState({ queryParams: params });
        return params;
    }

    headers = () => {
        const { rights } = this.props;
        const result = [
            "contract.insuree",
            "contract.contributionPlanBundle",
            "contract.calculation"
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
            result.push("contract.emptyLabel");
        }
        return result;
    }


    itemFormatters = () => {
        const { intl, rights, contract, isActionEnabled, onSave, setConfirmedAction } = this.props;
        const result = [
            contractDetails => !!contractDetails.insuree
                ? <PublishedComponent
                    pubRef="policyHolder.PolicyHolderInsureePicker"
                    value={contractDetails.insuree}
                    withLabel={false}
                    policyHolderId={contract?.policyHolder?.id}
                    readOnly/>
                : "",
            contractDetails => !!contractDetails.contributionPlanBundle
                ? <PublishedComponent
                    pubRef="policyHolder.PolicyHolderContributionPlanBundlePicker"
                    value={contractDetails.contributionPlanBundle}
                    withLabel={false}
                    policyHolderId={contract?.policyHolder?.id}
                    readOnly/>
                : "",
            contractDetails => !!contractDetails.jsonExt
                ? <Contributions
                    contributionKey={CONTRACTDETAILS_CALCULATION_CONTRIBUTION_KEY}
                    intl={intl}
                    className={CONTRACTDETAILS_CLASSNAME}
                    entity={contractDetails}
                    value={contractDetails.jsonExt}
                    readOnly/>
                : ""
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
                contractDetails => (
                    <UpdateContractDetailsDialog
                        contract={contract}
                        contractDetails={contractDetails}
                        onSave={onSave}
                        disabled={this.state.deleted.includes(contractDetails.id) || !isActionEnabled}
                        setConfirmedAction={setConfirmedAction}
                    />
                )
            );
            result.push(
                contractDetails => withTooltip(
                    <div>
                        <IconButton
                            onClick={() => this.onDelete(contractDetails)}
                            disabled={this.state.deleted.includes(contractDetails.id) || !isActionEnabled}>
                            <DeleteIcon/>
                        </IconButton>
                    </div>,
                    formatMessage(intl, "contract", "deleteButton.tooltip")
                )
            )
        }
        return result;
    }

    onDelete = contractDetails => {
        const { intl, contract, coreConfirm, deleteContractDetails, setConfirmedAction } = this.props;
        let confirm = () => coreConfirm(
            formatMessageWithValues(
                intl,
                "contract",
                "contractDetails.deleteContractDetails.confirm.message",
                {
                    insuree: decodeId(contractDetails.insuree.id),
                    contributionPlanBundle: contractDetails.contributionPlanBundle.code
                }),
            formatMessage(intl, "contract", "deleteContract.confirm.message")
        );
        let confirmedAction = () => {
            deleteContractDetails(
                contractDetails,
                formatMessageWithValues(
                    intl,
                    "contract",
                    "DeleteContractDetails.mutationLabel",
                    {
                        insuree: decodeId(contractDetails.insuree.id),
                        contributionPlanBundle: contractDetails.contributionPlanBundle.code,
                        contract: contract.code
                    }
                )
            );
            this.setState({ toDelete: contractDetails.id });
        }
        setConfirmedAction(confirm, confirmedAction);
    }

    isRowDisabled = (_, contractDetails) => this.state.deleted.includes(contractDetails.id);

    sorts = () => {
        return [
            ['insuree', true],
            ['contributionPlanBundle', true],
            null
        ]
    }

    defaultFilters = () => {
        return {
            contract_Id: {
                value: decodeId(this.props.contract.id),
                filter: `contract_Id: "${decodeId(this.props.contract.id)}"`
            }
        };
    }

    render() {
        const { intl, fetchingContractDetails, fetchedContractDetails, errorContractDetails, 
            contractDetails, contractDetailsPageInfo, contractDetailsTotalCount } = this.props;
        return (
            <Fragment>
                <Searcher
                    module="contract"
                    FilterPane={ContractDetailsFilter}
                    fetch={this.fetch}
                    items={contractDetails}
                    itemsPageInfo={contractDetailsPageInfo}
                    fetchingItems={fetchingContractDetails}
                    fetchedItems={fetchedContractDetails}
                    errorItems={errorContractDetails}
                    tableTitle={formatMessageWithValues(intl, "contract", "contractDetails.searcher.title", { contractDetailsTotalCount })}
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    filtersToQueryParams={this.filtersToQueryParams}
                    sorts={this.sorts}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    defaultPageSize={DEFAULT_PAGE_SIZE}
                    defaultOrderBy={DEFAULT_ORDER_BY}
                    rowLocked={this.isRowDisabled}
                    rowDisabled={this.isRowDisabled}
                    defaultFilters={this.defaultFilters()}
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    fetchingContractDetails: state.contract.fetchingContractDetails,
    fetchedContractDetails: state.contract.fetchedContractDetails,
    errorContractDetails: state.contract.errorContractDetails,
    contractDetails: state.contract.contractDetails,
    contractDetailsPageInfo: state.contract.contractDetailsPageInfo,
    contractDetailsTotalCount: state.contract.contractDetailsTotalCount
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchContractDetails, deleteContractDetails, coreConfirm }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContractDetailsSearcher)));
