import React, { Component } from "react"
import { PublishedComponent } from "@openimis/fe-core";
import { Grid } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";

const StyledGrid = styled(Grid)(({ theme }) => ({
    '& .form': {
        padding: 0
    },
    '& .item': {
        padding: theme.spacing(1)
    }
}));

class ContractInsureePolicyFilter extends Component {
    render() {
        const { filters, onChangeFilters } = this.props;
        return (
            <StyledGrid container className="form">
                <StyledGrid size={3} className="item">
                    <PublishedComponent
                        pubRef="insuree.InsureePicker"
                        value={!!filters["insuree_ChfId"] ? filters["insuree_ChfId"].value : null}
                        onChange={v => onChangeFilters([{
                            id: "insuree_ChfId",
                            value: v,
                            filter: `insuree_ChfId: "${!!v && !!v.chfId ? v.chfId : null}"`
                        }])}
                    />
                </StyledGrid>
            </StyledGrid>
        )
    }
}

export default ContractInsureePolicyFilter;
