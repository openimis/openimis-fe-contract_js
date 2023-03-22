import React, { Component } from "react";
import { bindActionCreators } from "redux";
import {
  Helmet,
  withModulesManager,
  formatMessage,
  withTooltip,
  historyPush,
  decodeId,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import {
  RIGHT_POLICYHOLDERCONTRACT_SEARCH,
  RIGHT_POLICYHOLDERCONTRACT_CREATE,
  RIGHT_POLICYHOLDERCONTRACT_UPDATE,
  RIGHT_POLICYHOLDERCONTRACT_APPROVE,
} from "../constants";
import ContractSearcher from "../components/ContractSearcher";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class ContractsPage extends Component {
  onAdd = () =>
    historyPush(
      this.props.modulesManager,
      this.props.history,
      "contract.route.contract"
    );

  contractUpdatePageUrl = (contract) =>
    `${this.props.modulesManager.getRef("contract.route.contract")}${
      "/" + decodeId(contract.id)
    }`;

  onDoubleClick = (contract, newTab = false) => {
    const { rights, modulesManager, history } = this.props;
    if (
      rights.includes(RIGHT_POLICYHOLDERCONTRACT_UPDATE) ||
      rights.includes(RIGHT_POLICYHOLDERCONTRACT_APPROVE)
    ) {
      historyPush(
        modulesManager,
        history,
        "contract.route.contract",
        [decodeId(contract.id)],
        newTab
      );
    }
  };

  componentDidMount = () => {
    const moduleName = "contact";
    const { module } = this.props;
    if (module !== moduleName) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { intl, classes, rights } = this.props;
    return (
      rights.includes(RIGHT_POLICYHOLDERCONTRACT_SEARCH) && (
        <div className={classes.page}>
          <Helmet
            title={formatMessage(
              this.props.intl,
              "contract",
              "contracts.page.title"
            )}
          />
          <ContractSearcher
            onDoubleClick={this.onDoubleClick}
            contractUpdatePageUrl={this.contractUpdatePageUrl}
            rights={rights}
          />
          {rights.includes(RIGHT_POLICYHOLDERCONTRACT_CREATE) &&
            withTooltip(
              <div className={classes.fab}>
                <Fab color="primary" onClick={this.onAdd}>
                  <AddIcon />
                </Fab>
              </div>,
              formatMessage(intl, "contract", "createButton.tooltip")
            )}
        </div>
      )
    );
  }
}

const mapStateToProps = (state) => ({
  rights:
    !!state.core && !!state.core.user && !!state.core.user.i_user
      ? state.core.user.i_user.rights
      : [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export default withModulesManager(
  injectIntl(
    withTheme(
      withStyles(styles)(
        connect(mapStateToProps, mapDispatchToProps)(ContractsPage)
      )
    )
  )
);
