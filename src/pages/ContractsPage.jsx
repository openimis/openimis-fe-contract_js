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
import { useTheme, styled } from "@mui/material/styles";
import { connect } from "react-redux";
import {
  RIGHT_POLICYHOLDERCONTRACT_SEARCH,
  RIGHT_POLICYHOLDERCONTRACT_CREATE,
  RIGHT_POLICYHOLDERCONTRACT_UPDATE,
  RIGHT_POLICYHOLDERCONTRACT_APPROVE,
  CONTRACT_ROUTE_CONTRACT,
  MODULE_NAME,
} from "../constants";
import ContractSearcher from "../components/ContractSearcher";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const StyledDiv = styled("div")(({ theme }) => ({
  ...theme.page ?? {},
  '& .fab': theme.fab ?? {},
}));

class ContractsPage extends Component {
  onAdd = () =>
    historyPush(
      this.props.modulesManager,
      this.props.history,
      CONTRACT_ROUTE_CONTRACT
    );

  contractUpdatePageUrl = (contract) =>
    `${this.props.modulesManager.getRef(CONTRACT_ROUTE_CONTRACT)}${
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
        CONTRACT_ROUTE_CONTRACT,
        [decodeId(contract.id)],
        newTab
      );
    }
  };

  componentDidMount = () => {
    const { module } = this.props;
    if (module !== MODULE_NAME) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { intl, rights } = this.props;
    return (
      rights.includes(RIGHT_POLICYHOLDERCONTRACT_SEARCH) && (
        <StyledDiv className="page">
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
              <div className="fab">
                <Fab color="primary" onClick={this.onAdd}>
                  <AddIcon />
                </Fab>
              </div>,
              formatMessage(intl, "contract", "createButton.tooltip")
            )}
        </StyledDiv>
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

export { StyledDiv };
export { ContractsPage };
export default withModulesManager(
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(ContractsPage)
  )
);
