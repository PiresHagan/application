import React, { useState } from 'react';
import {
    Box,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPayorModal from './AddPayorModal';

function PayorSection({ payors = [], onChange, coverageOwners = [], applicationNumber }) {
    const [showAddPayorModal, setShowAddPayorModal] = useState(false);
    const [currentPayorRowId, setCurrentPayorRowId] = useState(null);
    const [editingPayor, setEditingPayor] = useState(null);
    const [storedPayors, setStoredPayors] = useState([]);

    const formatPayorInfo = (payor) => {
        if (!payor) return '';
        if (payor.companyName) return payor.companyName;
        return `${payor.firstName || ''} ${payor.lastName || ''}`;
    };

    const handleAddPayorClick = (rowId) => {
        setCurrentPayorRowId(rowId);
        setEditingPayor(null);
        setShowAddPayorModal(true);
    };

    const handleEditPayor = (payor, rowId) => {
        if (!payor) return;
        setCurrentPayorRowId(rowId);
        setEditingPayor(payor);
        setShowAddPayorModal(true);
    };

    const handleSavePayor = (payor) => {
        if (!payor) return;

        const updatedPayors = [...storedPayors];
        const existingIndex = updatedPayors.findIndex(p => p && payor && p.id === payor.id);

        if (existingIndex >= 0) {
            updatedPayors[existingIndex] = payor;
        } else {
            updatedPayors.push(payor);
        }

        setStoredPayors(updatedPayors);

        const updatedRows = payors.map(row =>
            row && row.id === currentPayorRowId
                ? { ...row, payorId: payor.id }
                : row
        );

        onChange(updatedRows);
    };

    const handleAddPayor = () => {
        const newId = payors.length > 0
            ? Math.max(...payors.filter(p => p).map(p => p.id)) + 1
            : 1;

        const newAllocation = 100 / (payors.length + 1);
        const updatedPayors = payors.map(row => ({
            ...row,
            allocation: parseFloat(newAllocation.toFixed(2))
        }));

        onChange([
            ...updatedPayors,
            { id: newId, payorId: '', allocation: parseFloat(newAllocation.toFixed(2)) }
        ]);
    };

    const handleRemovePayor = (id) => {
        if (payors.length <= 1) {
            return;
        }

        const updatedPayors = payors.filter(row => row && row.id !== id);

        const newAllocation = 100 / updatedPayors.length;
        const distributedPayors = updatedPayors.map(row => ({
            ...row,
            allocation: parseFloat(newAllocation.toFixed(2))
        }));

        onChange(distributedPayors);
    };

    const handleAllocationChange = (id, value) => {
        const numValue = parseFloat(value) || 0;

        const updatedPayors = payors.map(row =>
            row && row.id === id ? { ...row, allocation: numValue } : row
        );

        onChange(updatedPayors);
    };

    const getPayorOptions = () => {
        const options = [];

        coverageOwners.filter(owner => owner.ownerType === '01').forEach(owner => {
            options.push({
                value: `owner-${owner.id}`,
                label: `${owner.firstName} ${owner.lastName} (Owner)`
            });
        });

        return options;
    };

    const renderPayorRow = (row) => {
        if (!row) return null;

        const selectedPayor = storedPayors.find(p => p && row && p.id === row.payorId);
        const payorOptions = getPayorOptions();

        return (
            <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }} key={`payor-${row.id}`}>
                <Grid item xs={12} md={8}>
                    <FormControl fullWidth>
                        <InputLabel>Payor</InputLabel>
                        <Select
                            value={row.payorId || ''}
                            onChange={() => { }}
                            label="Payor"
                            renderValue={() => {
                                if (selectedPayor) {
                                    return formatPayorInfo(selectedPayor);
                                }

                                if (row.payorId && row.payorId.startsWith('owner-')) {
                                    const ownerId = row.payorId.split('-')[1];
                                    const owner = coverageOwners.find(o => o.id.toString() === ownerId);
                                    if (owner) {
                                        return `${owner.firstName} ${owner.lastName} (Owner)`;
                                    }
                                }

                                return 'Select';
                            }}
                        >
                            <MenuItem value="" disabled>Select</MenuItem>

                            {payorOptions.map(option => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                    onClick={() => handleAllocationChange(row.id, option.value)}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}

                            <MenuItem
                                value="add_new"
                                onClick={() => handleAddPayorClick(row.id)}
                            >
                                Add New Payor
                            </MenuItem>

                            {selectedPayor && (
                                <MenuItem
                                    value="edit_existing"
                                    onClick={() => handleEditPayor(selectedPayor, row.id)}
                                >
                                    Edit {formatPayorInfo(selectedPayor)}
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        label="Allocation %"
                        type="number"
                        value={row.allocation || 0}
                        onChange={(e) => handleAllocationChange(row.id, e.target.value)}
                        InputProps={{
                            endAdornment: '%',
                        }}
                    />
                </Grid>

                <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                        color="primary"
                        onClick={handleAddPayor}
                    >
                        <AddIcon />
                    </IconButton>

                    {payors.length > 1 && (
                        <IconButton
                            color="error"
                            onClick={() => handleRemovePayor(row.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    )}
                </Grid>
            </Grid>
        );
    };

    return (
        <Box>
            {payors.filter(row => row).map(row => renderPayorRow(row))}

            <AddPayorModal
                open={showAddPayorModal}
                onClose={() => {
                    setShowAddPayorModal(false);
                    setCurrentPayorRowId(null);
                    setEditingPayor(null);
                }}
                onSave={handleSavePayor}
                payors={storedPayors}
                editingPayor={editingPayor}
                applicationNumber={applicationNumber}
            />
        </Box>
    );
}

export default PayorSection; 