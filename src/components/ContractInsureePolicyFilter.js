import React, { Component } from "react"
import { PublishedComponent } from "@openimis/fe-core";
import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";

const styles = theme => ({
    form: {
        padding: 0
    },
    item: {
        padding: theme.spacing(1)
    }
});

class ContractInsureePolicyFilter extends Component {
    render() {
        const { classes, filters, onChangeFilters } = this.props;
        return (
            <Grid container className={classes.form}>
                <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                        pubRef="insuree.InsureePicker"
                        value={!!filters["insuree_ChfId"] ? filters["insuree_ChfId"].value : null}
                        onChange={v => onChangeFilters([{
                            id: "insuree_ChfId",
                            value: v,
                            filter: `insuree_ChfId: "${!!v && !!v.chfId ? v.chfId : null}"`
                        }])}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default withTheme(withStyles(styles)((ContractInsureePolicyFilter)));
