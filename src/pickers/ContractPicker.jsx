import React, { useEffect } from "react";
import { FormattedMessage, SelectInput, decodeId } from "@openimis/fe-core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchPickerContracts } from "../actions";

const ContractPicker = ({
    value,
    onChange,
    required = false,
    withNull = false,
    nullLabel = null,
    withLabel = true,
    readOnly = false,
    withDeleted = false,
    fetchPickerContracts,
    contracts
}) => {
    useEffect(() => fetchPickerContracts(withDeleted ? [] : ["isDeleted: false"]), []);

    const options = [
        ...contracts.map(contract => ({
            value: contract,
            label: contract.code
        }))
    ];

    if (withNull) {
        options.unshift({
            value: null,
            label: nullLabel || <FormattedMessage module="contract" id="contract.emptyLabel" />
        })
    }

    return (
        <SelectInput
            module="contract"
            label={withLabel ? "contract" : null}
            required={required}
            options={options}
            value={!!value ? value : null}
            onChange={onChange}
            readOnly={readOnly}
        />
    )
}

const mapStateToProps = (state) => ({
    contracts: state.contract.contracts.map(({ id: encodedId, ...other }) => ({
        id: decodeId(encodedId),
        ...other,
    })),
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchPickerContracts }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ContractPicker);
