import React, { Component, Fragment } from "react";
import { Form, withModulesManager, formatMessage, formatMessageWithValues, journalize } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ContractHeadPanel from "./ContractHeadPanel";

class ContractForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contract: {}
        };
    }

    componentDidMount() {
        document.title = formatMessageWithValues(this.props.intl, "contract", "page.title", this.titleParams());
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
        }
    }

    isMandatoryFieldsEmpty = () => {
        const { contract } = this.state;
        if (!!contract.code && !!contract.dateValidFrom && !!contract.dateValidTo) {
            return false;
        }
        return true;
    }

    canSave = () => !this.isMandatoryFieldsEmpty();

    save = contract => this.props.save(contract);

    onEditedChanged = contract => this.setState({ contract })

    titleParams = () => this.props.titleParams(this.state.contract);

    render() {
        const { intl, back } = this.props;
        return (
            <Fragment>
                <Form
                    module="contract"
                    title="contract.page.title"
                    titleParams={this.titleParams()}
                    edited={this.state.contract}
                    back={back}
                    canSave={this.canSave}
                    save={this.save}
                    onEditedChanged={this.onEditedChanged}
                    HeadPanel={ContractHeadPanel}
                    mandatoryFieldsEmpty={this.isMandatoryFieldsEmpty()}
                    saveTooltip={formatMessage(intl, "contract", `saveButton.tooltip.${this.canSave() ? 'enabled' : 'disabled'}`)}
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    submittingMutation: state.contract.submittingMutation,
    mutation: state.contract.mutation
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ journalize }, dispatch);
};

export default withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(ContractForm)));
